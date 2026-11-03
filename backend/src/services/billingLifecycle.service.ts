import type { Paddle } from '@paddle/paddle-node-sdk';
import { z } from 'zod';
import { prisma } from '../prisma/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { getPaddleCatalog, getPaddleClient, requireBillingActivation, configuredPlanForPrice } from '../config/paddle.js';
import { PLAN_DEFINITIONS } from './subscription.service.js';
import { writeAuditLog } from './auditLog.service.js';
import type { VerificationActor } from './verification-v2/authorization.service.js';
import type { VerificationTransaction } from './verification-v2/transaction.js';

type Db = typeof prisma;
type Deps = { db?: Db; provider?: () => Pick<Paddle, 'customers' | 'prices' | 'products' | 'transactions' | 'customerPortalSessions'> };
const unavailable = () => new ApiError(503, 'Billing is unavailable. Please try again later.');
const conflict = (message: string) => new ApiError(409, message);
const checkoutInput = z.object({ plan: z.enum(['STARTER', 'PRO', 'ADVANCED']), interval: z.enum(['month', 'year']) }).strict();
async function ownerAccount(actor: VerificationActor, db: Pick<Db, 'manager'> | VerificationTransaction) {
    if (actor.role !== 'ADMIN') throw new ApiError(403, 'Company owner access required');
    const owner = await db.manager.findFirst({ where: { id: actor.id, companyId: actor.companyId, role: 'ADMIN', isActive: true },
        select: { id: true, name: true, email: true, emailVerifiedAt: true, company: true } });
    if (!owner) throw new ApiError(403, 'Active company owner required');
    return owner;
}
function activated() { try { requireBillingActivation(); } catch { throw unavailable(); } }
function provider(deps: Deps) { try { return (deps.provider ?? getPaddleClient)(); } catch { throw unavailable(); } }
async function callProvider<T>(call: () => Promise<T>) {
    try { return await call(); } catch { throw unavailable(); }
}
const date = (value: string) => {
    const result = new Date(value); if (!Number.isFinite(+result)) throw unavailable(); return result;
};

export async function getBillingLifecycle(actor: VerificationActor, deps: Deps = {}) {
    const db = deps.db ?? prisma, owner = await ownerAccount(actor, db), company = owner.company;
    let enabled = false; try { requireBillingActivation(); enabled = true; } catch { /* Safe unavailable boundary. */ }
    const subscription = company.billingSubscriptionId && company.billingCustomerId ? await db.paddleSubscription.findFirst({
        where: { id: company.billingSubscriptionId, companyId: company.id, customerId: company.billingCustomerId },
    }) : null;
    const catalogPlan = subscription ? configuredPlanForPrice(subscription.priceId) : undefined;
    const reservation = await db.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId,
        action: { in: ['CUSTOMER_CREATE_RESERVED', 'CHECKOUT_RESERVED'] } }, orderBy: { id: 'desc' } });
    const ready = reservation ? await db.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId,
        action: reservation.action.replace('_RESERVED', '_READY'), newValue: { path: ['reservationId'], equals: reservation.id } } }) : null;
    const reconciliationRequired = !!reservation && !ready;
    return {
        company: { id: company.id, name: company.name, plan: company.plan, operationalStatus: company.operationalStatus },
        usage: { locations: await db.location.count({ where: { companyId: company.id, isActive: true } }),
            staff: await db.staff.count({ where: { companyId: company.id, isActive: true } }), managers: await db.manager.count({ where: { companyId: company.id, isActive: true } }) },
        limits: PLAN_DEFINITIONS[company.plan].limits,
        subscription: subscription ? { status: subscription.status, plan: catalogPlan ?? null, catalogQualified: !!catalogPlan,
            periodStart: subscription.currentBillingPeriodStart, periodEnd: subscription.currentBillingPeriodEnd,
            scheduledChangeAction: subscription.scheduledChangeAction, scheduledChangeAt: subscription.scheduledChangeAt,
            lastEventAt: subscription.lastEventAt } : null,
        reconciliationRequired,
        billingConfigured: enabled, ownerVerified: !!owner.emailVerifiedAt,
        providerState: subscription ? 'MIRRORED' : company.billingCustomerId ? 'AWAITING_PROVIDER' : 'NOT_LINKED',
        portalAvailable: enabled && !!company.billingCustomerId,
        checkoutAvailable: enabled && !reconciliationRequired && !!owner.emailVerifiedAt && company.isActive && company.operationalStatus === 'ACTIVE' && !company.billingSubscriptionId,
    };
}

export async function createBillingPortal(actor: VerificationActor, raw: unknown, deps: Deps = {}) {
    if (!z.object({}).strict().safeParse(raw ?? {}).success) throw new ApiError(400, 'Invalid billing request');
    const db = deps.db ?? prisma, owner = await ownerAccount(actor, db); activated();
    if (!owner.company.billingCustomerId) throw conflict('No billing account is linked to this company.');
    const customer = await db.paddleCustomer.findFirst({ where: { id: owner.company.billingCustomerId, companyId: actor.companyId } });
    if (!customer) throw conflict('Billing details are awaiting synchronization.');
    const subscriptions = await db.paddleSubscription.findMany({ where: { customerId: customer.id, companyId: actor.companyId }, select: { id: true }, orderBy: { lastEventAt: 'desc' }, take: 25 });
    const session = await callProvider(() => provider(deps).customerPortalSessions.create(customer.id, subscriptions.map(sub => sub.id)));
    if (session.customerId !== customer.id) throw unavailable();
    let url: URL;
    try { url = new URL(session.urls.general.overview); } catch { throw unavailable(); }
    if (url.protocol !== 'https:' || url.username || url.password || !['customer-portal.paddle.com', 'sandbox-customer-portal.paddle.com'].includes(url.hostname)) throw unavailable();
    // Temporary bearer URL is returned only once, never persisted or logged.
    return { url: url.toString() };
}

export async function getBillingCatalog(actor: VerificationActor, deps: Deps = {}) {
    await ownerAccount(actor, deps.db ?? prisma); activated();
    const paddle = provider(deps);
    return Promise.all(getPaddleCatalog().map(async entry => {
        const price = await callProvider(() => paddle.prices.get(entry.priceId));
        const product = await callProvider(() => paddle.products.get(price.productId));
        if (price.id !== entry.priceId || product.id !== price.productId || price.status !== 'active' || product.status !== 'active' ||
            price.billingCycle?.interval !== entry.interval || price.billingCycle.frequency !== 1) throw unavailable();
        return { ...entry, productId: product.id, amount: price.unitPrice.amount, currencyCode: price.unitPrice.currencyCode,
            trialPeriod: price.trialPeriod ? { interval: price.trialPeriod.interval, frequency: price.trialPeriod.frequency } : null };
    }));
}

// Paddle does not promise arbitrary client idempotency keys. Persist reservation
// before requesting a provider draft; an uncertain result is held, never retried
// as a second purchase. This is request safety around Paddle, not local billing.
async function reserve(actor: VerificationActor, action: 'CUSTOMER_CREATE' | 'CHECKOUT', details: object, db: Db) {
    return db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${actor.companyId} FOR UPDATE`;
        const owner = await ownerAccount(actor, tx);
        if (!owner.emailVerifiedAt || !owner.company.isActive || owner.company.operationalStatus !== 'ACTIVE') throw new ApiError(403, 'Verified active company access required');
        if (action === 'CUSTOMER_CREATE' && owner.company.billingCustomerId) return { existingCustomerId: owner.company.billingCustomerId };
        if (owner.company.billingSubscriptionId && action === 'CHECKOUT') throw conflict('Use the billing portal to manage the linked subscription.');
        const prior = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: `${action}_RESERVED` }, orderBy: { id: 'desc' } });
        if (prior) {
            const ready = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId,
                action: `${action}_READY`, newValue: { path: ['reservationId'], equals: prior.id } }, orderBy: { id: 'desc' } });
            if (ready) {
                const saved = ready.newValue as Record<string, unknown>;
                const known = action === 'CHECKOUT' && typeof saved.transactionId === 'string' ? await tx.paddleTransaction.findFirst({ where: { id: saved.transactionId, companyId: actor.companyId, customerId: owner.company.billingCustomerId } }) : null;
                if (known && ['paid', 'completed', 'billed', 'past_due'].includes(known.status)) throw conflict('Payment is awaiting provider synchronization. Do not start another checkout.');
                if (known?.status !== 'canceled') return { ready: ready.newValue, prior: prior.newValue };
                // A provider-confirmed canceled draft may be replaced; no local expiry guesses.
            } else throw conflict('The previous billing request needs reconciliation before another can begin.');
        }
        const reservation = await writeAuditLog({ companyId: actor.companyId, actorType: 'ADMIN', actorId: actor.id, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: `${action}_RESERVED`, newValue: details }, tx);
        return { reservationId: reservation.id };
    });
}

export async function createBillingCheckout(actor: VerificationActor, raw: unknown, deps: Deps = {}) {
    const parsed = checkoutInput.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'Choose an available plan and billing interval');
    const db = deps.db ?? prisma, owner = await ownerAccount(actor, db); activated();
    if (!owner.emailVerifiedAt) throw new ApiError(403, 'Verify your account email before starting checkout');
    if (!owner.company.isActive || owner.company.operationalStatus !== 'ACTIVE') throw new ApiError(403, 'Company operations are suspended');
    if (owner.company.billingSubscriptionId) throw conflict('Use the billing portal to manage the linked subscription.');
    let checkout: URL;
    try { checkout = new URL(process.env.PADDLE_CHECKOUT_URL ?? ''); } catch { throw unavailable(); }
    if (checkout.protocol !== 'https:' || checkout.username || checkout.password || checkout.hash || checkout.search) throw unavailable();
    const catalog = await getBillingCatalog(actor, deps), selected = catalog.find(entry => entry.plan === parsed.data.plan && entry.interval === parsed.data.interval);
    if (!selected) throw unavailable();
    const paddle = provider(deps);
    let customerId = owner.company.billingCustomerId;
    if (customerId && !await db.paddleCustomer.findFirst({ where: { id: customerId, companyId: actor.companyId } })) throw conflict('Billing details are awaiting synchronization.');
    if (!customerId) {
        const reservation = await reserve(actor, 'CUSTOMER_CREATE', {}, db);
        if (reservation.existingCustomerId) customerId = reservation.existingCustomerId;
        else {
            if (!reservation.reservationId) throw conflict('Billing account provisioning needs reconciliation.');
            const customer = await callProvider(() => paddle.customers.create({ email: owner.email, name: owner.name }));
            if (!/^ctm_[a-z0-9]{26}$/.test(customer.id)) throw unavailable();
            await db.$transaction(async tx => {
                await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${actor.companyId} FOR UPDATE`;
                const fresh = await ownerAccount(actor, tx);
                if (fresh.company.billingCustomerId && fresh.company.billingCustomerId !== customer.id) throw conflict('Billing linkage changed; reconciliation is required.');
                const mirrored = await tx.paddleCustomer.findUnique({ where: { id: customer.id } });
                if (mirrored?.companyId && mirrored.companyId !== actor.companyId) throw conflict('Billing customer linkage requires review.');
                await tx.paddleCustomer.upsert({ where: { id: customer.id }, create: { id: customer.id, companyId: actor.companyId, email: customer.email, name: customer.name, status: customer.status,
                    paddleUpdatedAt: date(customer.updatedAt), lastEventAt: date(customer.updatedAt), paddleCreatedAt: date(customer.createdAt) }, update: { companyId: actor.companyId } });
                await tx.company.update({ where: { id: actor.companyId }, data: { billingCustomerId: customer.id } });
                await writeAuditLog({ companyId: actor.companyId, actorType: 'ADMIN', actorId: actor.id, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: 'CUSTOMER_CREATE_READY', newValue: { reservationId: reservation.reservationId, customerId: customer.id } }, tx);
            });
            customerId = customer.id;
        }
    }
    const reservation = await reserve(actor, 'CHECKOUT', { plan: selected.plan, interval: selected.interval, priceId: selected.priceId }, db);
    if (reservation.ready) {
        const saved = reservation.ready as Record<string, unknown>, prior = reservation.prior as Record<string, unknown>;
        if (prior.priceId !== selected.priceId || typeof saved.transactionId !== 'string') throw conflict('Resolve the existing checkout before changing plans.');
        return { transactionId: saved.transactionId, reused: true };
    }
    const transaction = await callProvider(() => paddle.transactions.create({ status: 'draft', collectionMode: 'automatic', customerId,
        items: [{ priceId: selected.priceId, quantity: 1 }], checkout: { url: checkout.toString() }, customData: { checkoutReservationId: reservation.reservationId! } }));
    if (transaction.customerId !== customerId || !/^txn_[a-z0-9]{26}$/.test(transaction.id)) throw unavailable();
    await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${actor.companyId} FOR UPDATE`;
        const fresh = await ownerAccount(actor, tx);
        if (fresh.company.billingCustomerId !== customerId) throw conflict('Billing linkage changed; reconciliation is required.');
        const existing = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: 'CHECKOUT_READY', newValue: { path: ['reservationId'], equals: reservation.reservationId } } });
        if (existing && (existing.newValue as Record<string, unknown> | null)?.transactionId !== transaction.id) throw conflict('Billing checkout correlation requires review.');
        if (!existing) await writeAuditLog({ companyId: actor.companyId, actorType: 'ADMIN', actorId: actor.id, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: 'CHECKOUT_READY', newValue: { reservationId: reservation.reservationId, transactionId: transaction.id } }, tx);
    });
    return { transactionId: transaction.id, reused: false };
}
