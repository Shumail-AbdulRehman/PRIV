import type { Paddle } from '@paddle/paddle-node-sdk';
import { z } from 'zod';
import { prisma } from '../prisma/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { getPaddleCatalog, getPaddleClient, requireBillingActivation, configuredEntryForPrice, getPaddleCheckoutUrl } from '../config/paddle.js';
import { PLAN_DEFINITIONS } from './subscription.service.js';
import { writeAuditLog } from './auditLog.service.js';
import { readAccountState, evaluateAccountAccess } from './accountAccess.service.js';
import type { BillingLifecycleDto, BillingCatalogEntryDto, BillingCheckoutDto, BillingCheckoutResume } from '../types/billingLifecycle.js';
import type { VerificationActor } from './verification-v2/authorization.service.js';
import type { VerificationTransaction } from './verification-v2/transaction.js';

type Db = typeof prisma;
type Deps = { now?: () => Date; db?: Db; provider?: () => Pick<Paddle, 'customers' | 'prices' | 'products' | 'transactions' | 'customerPortalSessions'> };
const unavailable = () => new ApiError(503, 'Billing is unavailable. Please try again later.');
const conflict = (message: string) => new ApiError(409, message);
const checkoutInput = z.object({ plan: z.enum(['STARTER', 'PRO', 'ADVANCED']), interval: z.enum(['month', 'year']) }).strict();
async function ownerAccount(actor: VerificationActor, db: Pick<Db, 'manager'> | VerificationTransaction) {
    if (actor.role !== 'ADMIN') throw new ApiError(403, 'Company owner access required');
    const owner = await db.manager.findFirst({ where: { id: actor.id, companyId: actor.companyId, role: 'ADMIN', isActive: true },
        select: { id: true, name: true, email: true, emailVerifiedAt: true, company: true } });
    if (!owner || owner.company.id !== actor.companyId) throw new ApiError(403, 'Active company owner required');
    return owner;
}
// Sandbox onboarding deliberately skips email verification; live checkout still requires it.
const verificationSatisfied = (owner: { emailVerifiedAt: Date | null }) => process.env.PADDLE_ENVIRONMENT === 'sandbox' || !!owner.emailVerifiedAt;
function activated() { try { requireBillingActivation(); } catch { throw unavailable(); } }
function provider(deps: Deps) { try { return (deps.provider ?? getPaddleClient)(); } catch { throw unavailable(); } }
async function callProvider<T>(call: () => Promise<T>) {
    try { return await call(); } catch { throw unavailable(); }
}
const date = (value: string) => {
    const result = new Date(value); if (!Number.isFinite(+result)) throw unavailable(); return result;
};

type CheckoutInspection = { kind: 'resume'; selection: BillingCheckoutResume } | { kind: 'none' | 'canceled' | 'pending' };
type AuditFact = { id: number; newValue: unknown };
type BillingCompany = { id: number; billingCustomerId: string | null; billingSubscriptionId: string | null };
const objectFact = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const auditWhere = (companyId: number) => ({ companyId, entityType: 'BILLING_OPERATION', entityId: companyId });

// READY proves preparation; a transaction mirror, when present, must still be
// same-tenant and reopenable. A missing READY is never guessed from local time.
async function inspectCheckout(prior: AuditFact | null, ready: AuditFact | null, company: BillingCompany, db: Pick<Db, 'paddleTransaction'>): Promise<CheckoutInspection> {
    if (!prior) return { kind: 'none' };
    const saved = objectFact(ready?.newValue), requested = objectFact(prior.newValue);
    const entry = typeof requested.priceId === 'string' ? configuredEntryForPrice(requested.priceId) : undefined;
    if (!ready || saved.reservationId !== prior.id || typeof saved.transactionId !== 'string' || !/^txn_[a-z0-9]{26}$/.test(saved.transactionId) ||
        !company.billingCustomerId || !entry || entry.plan !== requested.plan || entry.interval !== requested.interval) return { kind: 'pending' };
    // Look up by ID before checking linkage: a foreign row is not an absent mirror.
    const known = await db.paddleTransaction.findFirst({ where: { id: saved.transactionId } });
    if (saved.customerId != null && saved.customerId !== company.billingCustomerId) return { kind: 'pending' };
    if (known && (known.id !== saved.transactionId || known.companyId !== company.id || known.customerId !== company.billingCustomerId)) return { kind: 'pending' };
    if (known?.subscriptionId) {
        // Signed fulfillment has moved this exact tenant/customer transaction to
        // the company's canonical subscription. It is no longer a draft hold;
        // subscription policy owns access and linkage already forbids repurchase.
        return { kind: known.subscriptionId === company.billingSubscriptionId ? 'none' : 'pending' };
    }
    if (known?.status === 'canceled') return { kind: 'canceled' };
    if (known && !['draft', 'ready'].includes(known.status)) return { kind: 'pending' };
    if (!known && (saved.confirmedByProvider === true || saved.customerId !== company.billingCustomerId)) return { kind: 'pending' };
    return { kind: 'resume', selection: { plan: entry.plan, interval: entry.interval, transactionId: saved.transactionId } };
}

async function customerReconciliationPending(company: BillingCompany, db: Pick<Db, 'auditLog'>): Promise<boolean> {
    const reservation = await db.auditLog.findFirst({ where: { ...auditWhere(company.id), action: 'CUSTOMER_CREATE_RESERVED' }, orderBy: { id: 'desc' } });
    if (!reservation) return false;
    const ready = await db.auditLog.findFirst({ where: { ...auditWhere(company.id), action: 'CUSTOMER_CREATE_READY', newValue: { path: ['reservationId'], equals: reservation.id } } });
    const saved = objectFact(ready?.newValue);
    return !ready || saved.reservationId !== reservation.id || !company.billingCustomerId || saved.customerId !== company.billingCustomerId;
}

export async function getBillingLifecycle(actor: VerificationActor, deps: Deps = {}): Promise<BillingLifecycleDto> {
    const db = deps.db ?? prisma, owner = await ownerAccount(actor, db);
    const account = await readAccountState(actor.companyId, db), company = account.company;
    if (company.id !== actor.companyId) throw new ApiError(403, 'Company owner access required');
    let enabled = false; try { requireBillingActivation(); enabled = true; } catch { /* Sanitized capability only. */ }
    let checkoutConfigured = false; try { getPaddleCheckoutUrl(); checkoutConfigured = true; } catch { /* Catalog reads remain available. */ }
    const rawSubscription = company.billingSubscriptionId && company.billingCustomerId
        ? await db.paddleSubscription.findFirst({ where: { id: company.billingSubscriptionId, companyId: company.id, customerId: company.billingCustomerId } }) : null;
    const subscription = rawSubscription && rawSubscription.id === company.billingSubscriptionId && rawSubscription.companyId === company.id && rawSubscription.customerId === company.billingCustomerId ? rawSubscription : null;
    const entry = subscription ? configuredEntryForPrice(subscription.priceId) : undefined;
    const customer = company.billingCustomerId ? await db.paddleCustomer.findFirst({ where: { id: company.billingCustomerId, companyId: company.id } }) : null;
    const customerLinked = !!customer && customer.id === company.billingCustomerId && customer.companyId === company.id;
    let reconciliationRequired = !!company.billingCustomerId && !customerLinked;
    reconciliationRequired ||= await customerReconciliationPending(company, db);
    const reservation = await db.auditLog.findFirst({ where: { ...auditWhere(company.id), action: 'CHECKOUT_RESERVED' }, orderBy: { id: 'desc' } });
    const ready = reservation ? await db.auditLog.findFirst({ where: { ...auditWhere(company.id), action: 'CHECKOUT_READY', newValue: { path: ['reservationId'], equals: reservation.id } } }) : null;
    const checkout = await inspectCheckout(reservation, ready, company, db);
    reconciliationRequired ||= checkout.kind === 'pending';
    let workspaceAccessAllowed = false;
    try {
        // Evaluate the same correlated facts returned below, not an earlier subscription read.
        evaluateAccountAccess({ company, subscription: entry?.plan === company.plan ? subscription : null }, actor.role, 'START_WORK', deps.now?.() ?? new Date());
        workspaceAccessAllowed = true;
    } catch (error) {
        if (!(error instanceof ApiError) || error.statusCode !== 403) throw error;
    }
    const checkoutReadiness = !company.isActive || company.operationalStatus !== 'ACTIVE' ? 'COMPANY_RESTRICTED'
        : !enabled || !checkoutConfigured ? 'BILLING_DISABLED'
        : !verificationSatisfied(owner) ? 'OWNER_VERIFICATION_REQUIRED'
        : company.billingSubscriptionId ? 'LINKED_SUBSCRIPTION'
        : reconciliationRequired ? 'RECONCILIATION_PENDING' : 'READY';
    const iso = (value: Date | null) => value instanceof Date && Number.isFinite(+value) ? value.toISOString() : null;
    return {
        company: { id: company.id, name: owner.company.name, plan: company.plan, isActive: company.isActive, operationalStatus: company.operationalStatus },
        usage: { locations: await db.location.count({ where: { companyId: company.id, isActive: true } }),
            staff: await db.staff.count({ where: { companyId: company.id, isActive: true } }), managers: await db.manager.count({ where: { companyId: company.id, isActive: true } }) },
        limits: PLAN_DEFINITIONS[company.plan].limits,
        subscription: subscription ? { status: subscription.status, plan: entry?.plan ?? null, catalogQualified: entry?.plan === company.plan,
            priceId: subscription.priceId, interval: entry?.interval ?? null,
            periodStart: iso(subscription.currentBillingPeriodStart), periodEnd: iso(subscription.currentBillingPeriodEnd),
            scheduledChangeAction: subscription.scheduledChangeAction, scheduledChangeAt: iso(subscription.scheduledChangeAt),
            lastEventAt: subscription.lastEventAt.toISOString() } : null,
        workspaceAccessAllowed, checkoutReadiness,
        checkoutResume: checkoutReadiness === 'READY' && checkout.kind === 'resume' ? checkout.selection : null,
        reconciliationRequired,
        billingConfigured: enabled, ownerVerified: !!owner.emailVerifiedAt,
        billingEnvironment: enabled ? process.env.PADDLE_ENVIRONMENT as 'sandbox' | 'production' : null,
        onboardingRequired: !company.billingSubscriptionId || subscription?.status === 'unknown',
        providerState: subscription ? 'MIRRORED' : company.billingCustomerId ? 'AWAITING_PROVIDER' : 'NOT_LINKED',
        portalAvailable: enabled && customerLinked,
        checkoutAvailable: checkoutReadiness === 'READY',
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

export async function getBillingCatalog(actor: VerificationActor, deps: Deps = {}): Promise<BillingCatalogEntryDto[]> {
    await ownerAccount(actor, deps.db ?? prisma); activated();
    const paddle = provider(deps);
    return Promise.all(getPaddleCatalog().map(async entry => {
        const price = await callProvider(() => paddle.prices.get(entry.priceId));
        const product = await callProvider(() => paddle.products.get(price.productId));
        if (price.id !== entry.priceId || product.id !== price.productId || price.status !== 'active' || product.status !== 'active' ||
            price.billingCycle?.interval !== entry.interval || price.billingCycle.frequency !== 1 ||
            typeof price.unitPrice?.amount !== 'string' || !/^\d+$/.test(price.unitPrice.amount) || !/^[A-Z]{3}$/.test(price.unitPrice?.currencyCode ?? '') ||
            (price.trialPeriod && (!['day', 'week', 'month', 'year'].includes(price.trialPeriod.interval) || !Number.isSafeInteger(price.trialPeriod.frequency) || price.trialPeriod.frequency < 1 ||
                (price.trialPeriod.requiresPaymentMethod != null && typeof price.trialPeriod.requiresPaymentMethod !== 'boolean')))) throw unavailable();
        return { ...entry, productId: product.id, amount: price.unitPrice.amount, currencyCode: price.unitPrice.currencyCode,
            trialPeriod: price.trialPeriod ? { interval: price.trialPeriod.interval, frequency: price.trialPeriod.frequency, requiresPaymentMethod: price.trialPeriod.requiresPaymentMethod ?? null } : null };
    }));
}

// Paddle does not promise arbitrary client idempotency keys. Persist reservation
// before requesting a provider draft; an uncertain result is held, never retried
// as a second purchase. This is request safety around Paddle, not local billing.
async function reserve(actor: VerificationActor, action: 'CUSTOMER_CREATE' | 'CHECKOUT', details: object, db: Db) {
    return db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${actor.companyId} FOR UPDATE`;
        const owner = await ownerAccount(actor, tx);
        if (!verificationSatisfied(owner) || !owner.company.isActive || owner.company.operationalStatus !== 'ACTIVE') throw new ApiError(403, 'Verified active company access required');
        if (action === 'CUSTOMER_CREATE' && owner.company.billingCustomerId) return { existingCustomerId: owner.company.billingCustomerId };
        if (owner.company.billingSubscriptionId && action === 'CHECKOUT') throw conflict('Use the billing portal to manage the linked subscription.');
        if (action === 'CHECKOUT' && await customerReconciliationPending(owner.company, tx)) throw conflict('Billing account provisioning needs reconciliation.');
        const prior = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: `${action}_RESERVED` }, orderBy: { id: 'desc' } });
        if (prior) {
            const ready = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId,
                action: `${action}_READY`, newValue: { path: ['reservationId'], equals: prior.id } }, orderBy: { id: 'desc' } });
            if (action === 'CHECKOUT') {
                const checkout = await inspectCheckout(prior, ready, owner.company, tx);
                if (checkout.kind === 'resume') return { ready: checkout.selection };
                if (checkout.kind !== 'canceled') throw conflict('The previous billing request needs reconciliation before another can begin.');
                // Only a same-tenant provider-confirmed canceled draft may be replaced.
            } else throw conflict('Billing account provisioning needs reconciliation.');
        }
        const reservation = await writeAuditLog({ companyId: actor.companyId, actorType: 'ADMIN', actorId: actor.id, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: `${action}_RESERVED`, newValue: details }, tx);
        return { reservationId: reservation.id };
    });
}

export async function createBillingCheckout(actor: VerificationActor, raw: unknown, deps: Deps = {}): Promise<BillingCheckoutDto> {
    const parsed = checkoutInput.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'Choose an available plan and billing interval');
    const db = deps.db ?? prisma, owner = await ownerAccount(actor, db); activated();
    if (!verificationSatisfied(owner)) throw new ApiError(403, 'Verify your account email before starting checkout');
    if (!owner.company.isActive || owner.company.operationalStatus !== 'ACTIVE') throw new ApiError(403, 'Company operations are suspended');
    if (owner.company.billingSubscriptionId) throw conflict('Use the billing portal to manage the linked subscription.');
    let checkout: URL;
    try { checkout = getPaddleCheckoutUrl(); } catch { throw unavailable(); }
    const catalog = await getBillingCatalog(actor, deps), selected = catalog.find(entry => entry.plan === parsed.data.plan && entry.interval === parsed.data.interval);
    if (!selected || (process.env.PADDLE_ENVIRONMENT === 'sandbox' && selected.trialPeriod && selected.trialPeriod.requiresPaymentMethod !== true)) throw unavailable();
    const paddle = provider(deps);
    let customerId = owner.company.billingCustomerId;
    if (customerId) {
        const customer = await db.paddleCustomer.findFirst({ where: { id: customerId, companyId: actor.companyId } });
        if (!customer || customer.id !== customerId || customer.companyId !== actor.companyId) throw conflict('Billing details are awaiting synchronization.');
    }
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
        const saved = reservation.ready;
        if (saved.plan !== selected.plan || saved.interval !== selected.interval) throw conflict('Resolve the existing checkout before changing plans.');
        return { transactionId: saved.transactionId, reused: true };
    }
    const transaction = await callProvider(() => paddle.transactions.create({ status: 'draft', collectionMode: 'automatic', customerId,
        items: [{ priceId: selected.priceId, quantity: 1 }], checkout: { url: checkout.toString() }, customData: { checkoutReservationId: reservation.reservationId! } }));
    if (transaction.customerId !== customerId || !/^txn_[a-z0-9]{26}$/.test(transaction.id) || transaction.status !== 'draft') throw unavailable();
    await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${actor.companyId} FOR UPDATE`;
        const fresh = await ownerAccount(actor, tx);
        if (fresh.company.billingCustomerId !== customerId) throw conflict('Billing linkage changed; reconciliation is required.');
        const existing = await tx.auditLog.findFirst({ where: { companyId: actor.companyId, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: 'CHECKOUT_READY', newValue: { path: ['reservationId'], equals: reservation.reservationId } } });
        if (existing && (existing.newValue as Record<string, unknown> | null)?.transactionId !== transaction.id) throw conflict('Billing checkout correlation requires review.');
        if (!existing) await writeAuditLog({ companyId: actor.companyId, actorType: 'ADMIN', actorId: actor.id, entityType: 'BILLING_OPERATION', entityId: actor.companyId, action: 'CHECKOUT_READY', newValue: { reservationId: reservation.reservationId, transactionId: transaction.id, customerId } }, tx);
    });
    return { transactionId: transaction.id, reused: false };
}
