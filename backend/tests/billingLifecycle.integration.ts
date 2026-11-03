import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { EventEntity } from '@paddle/paddle-node-sdk';
import { assertIsolatedMediaDatabase } from '../src/services/attendanceMediaTransition.service.js';
const url = process.env.BILLING_LIFECYCLE_TEST_DATABASE_URL;
assertIsolatedMediaDatabase(url, process.env.NODE_ENV); process.env.DATABASE_URL = url;
process.env.PADDLE_ENVIRONMENT = 'sandbox';
const priceId = 'pri_00000000000000000000000001', otherPriceId = 'pri_00000000000000000000000002';
process.env.PADDLE_PRICE_CATALOG_JSON = JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }, { plan: 'PRO', interval: 'month', priceId: otherPriceId }]);
process.env.PADDLE_BILLING_ENABLED = 'true'; process.env.PADDLE_API_KEY = 'isolated-non-network-credential-fixture-000000';
process.env.PADDLE_CHECKOUT_URL = 'https://workspace.example.invalid/choose-plan';
const { prisma } = await import('../src/prisma/prisma.js');
const { registerCompany } = await import('../src/services/companyRegistration.service.js');
const { processPaddleEvent, companyHasPaidAccess } = await import('../src/services/paddleFulfillment.service.js');
const { createBillingCheckout } = await import('../src/services/billingLifecycle.service.js');
const suffix = randomUUID(), now = new Date();
const providerId = (prefix: string) => `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 26)}`;
const customerId = providerId('ctm'), subscriptionId = providerId('sub');
const subscription = (id: string, customer: string, status: string, at: Date, price = priceId) => ({ id, customerId: customer, status,
    items: [{ recurring: true, price: { id: price, productId: 'pro_00000000000000000000000001' } }],
    currentBillingPeriod: ['paused', 'canceled'].includes(status) ? null : { startsAt: new Date(+now - 3600000).toISOString(), endsAt: new Date(+now + 3600000).toISOString() },
    createdAt: now.toISOString(), updatedAt: at.toISOString(), canceledAt: status === 'canceled' ? at.toISOString() : null, pausedAt: null, scheduledChange: null, customData: {} });
function event(type: string, data: object, at = now, id = providerId('evt')) {
    return { eventId: id, eventType: type, occurredAt: at.toISOString(), data } as unknown as EventEntity;
}
try {
    const owner = await registerCompany({ name: 'Synthetic billing owner', companyName: 'Synthetic billing fixture', email: `${suffix}-owner@example.invalid`, password: 'synthetic-owner-password' });
    const other = await registerCompany({ name: 'Other synthetic owner', companyName: 'Other isolated company', email: `${suffix}-other@example.invalid`, password: 'synthetic-owner-password' });
    await prisma.company.update({ where: { id: owner.companyId }, data: { billingCustomerId: customerId } });
    const customer = event('customer.created', { id: customerId, email: `${suffix}-other@example.invalid`, name: 'Provider fixture', status: 'active', locale: 'en', createdAt: now.toISOString(), updatedAt: now.toISOString(), customData: { companyId: other.companyId } });
    await processPaddleEvent(customer);
    assert.equal((await prisma.paddleCustomer.findUniqueOrThrow({ where: { id: customerId } })).companyId, owner.companyId, 'customData and email never override canonical customer ownership');
    const signedFixture = event('subscription.updated', subscription(subscriptionId, customerId, 'active', now));
    const duplicate = await Promise.all([processPaddleEvent(signedFixture), processPaddleEvent(signedFixture)]);
    assert.equal(duplicate.filter(result => result.duplicate).length, 1);
    assert.equal(await prisma.paddleWebhookEvent.count({ where: { id: signedFixture.eventId } }), 1);
    assert.equal(await companyHasPaidAccess(owner.companyId), true);
    const old = new Date(+now - 60000);
    await processPaddleEvent(event('subscription.canceled', subscription(subscriptionId, customerId, 'canceled', old), old));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: subscriptionId } })).status, 'active');
    const impostorId = providerId('ctm');
    await processPaddleEvent(event('customer.created', { id: impostorId, email: `${suffix}-other@example.invalid`, name: 'Unlinked fixture', status: 'active', locale: 'en', createdAt: now.toISOString(), updatedAt: now.toISOString(), customData: { companyId: other.companyId } }));
    assert.equal((await prisma.paddleCustomer.findUniqueOrThrow({ where: { id: impostorId } })).companyId, null);
    assert.equal((await prisma.company.findUniqueOrThrow({ where: { id: other.companyId } })).billingCustomerId, null);
    // An early completed transaction creates only an unknown placeholder. Earlier
    // subscription.created must still replace it with real subscription facts.
    const placeholderId = providerId('sub');
    await processPaddleEvent(event('transaction.completed', { id: providerId('txn'), customerId, subscriptionId: placeholderId, status: 'completed', currencyCode: 'USD', invoiceNumber: null,
        createdAt: now.toISOString(), updatedAt: new Date(+now + 2000).toISOString(), items: [{ price: { id: priceId, productId: 'pro_00000000000000000000000001' } }], customData: { companyId: other.companyId }, details: { totals: { grandTotal: '1234' } } }, new Date(+now + 2000)));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: placeholderId } })).status, 'unknown');
    await processPaddleEvent(event('subscription.created', subscription(placeholderId, customerId, 'active', new Date(+now + 1000)), new Date(+now + 1000)));
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: placeholderId } })).status, 'active');
    const before = await prisma.company.findUniqueOrThrow({ where: { id: owner.companyId } });
    const failed = event('subscription.updated', subscription(subscriptionId, customerId, 'active', new Date(+now + 3000), otherPriceId), new Date(+now + 3000));
    const failingDb = { $transaction: (run: (tx: unknown) => unknown) => prisma.$transaction(async tx => run(new Proxy(tx, {
        get(target, property) {
            if (property === 'paddleWebhookEvent') return { ...target.paddleWebhookEvent, create: async () => { throw new Error('isolated marker failure'); } };
            const value = Reflect.get(target, property); return typeof value === 'function' ? value.bind(target) : value;
        },
    }))) } as unknown as NonNullable<Parameters<typeof processPaddleEvent>[1]>;
    await assert.rejects(processPaddleEvent(failed, failingDb), /isolated marker failure/);
    assert.deepEqual(await prisma.company.findUniqueOrThrow({ where: { id: owner.companyId } }), before);
    assert.equal(await prisma.paddleWebhookEvent.count({ where: { id: failed.eventId } }), 0);
    assert.equal((await prisma.paddleSubscription.findUniqueOrThrow({ where: { id: subscriptionId } })).priceId, priceId);
    // Unknown catalog pricing cannot grant capacity or access; no fallback to Company.ACTIVE.
    await prisma.paddleSubscription.updateMany({ where: { companyId: owner.companyId }, data: { priceId: 'pri_99999999999999999999999999' } });
    assert.equal(await companyHasPaidAccess(owner.companyId), false);
    // Concurrent application checkout requests use the real company lock and
    // audit reservation, with a no-network provider seam returning only a draft.
    await prisma.manager.update({ where: { id: other.id }, data: { emailVerifiedAt: now } });
    const checkoutCustomer = providerId('ctm');
    await prisma.company.update({ where: { id: other.companyId }, data: { billingCustomerId: checkoutCustomer } });
    await prisma.paddleCustomer.create({ data: { id: checkoutCustomer, companyId: other.companyId, status: 'active', paddleUpdatedAt: now, lastEventAt: now } });
    let creates = 0;
    const draftId = providerId('txn');
    const provider = () => ({ prices: { get: async (requestedPrice: string) => ({ id: requestedPrice, productId: 'pro_fixture', status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null }) },
        products: { get: async () => ({ id: 'pro_fixture', status: 'active' }) }, transactions: { create: async () => { creates++; return { id: draftId, customerId: checkoutCustomer }; } } }) as unknown as ReturnType<NonNullable<NonNullable<Parameters<typeof createBillingCheckout>[2]>['provider']>>;
    const checkouts = await Promise.allSettled([createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider }), createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider })]);
    assert.equal(creates, 1);
    assert(checkouts.some(result => result.status === 'fulfilled'));
    assert.equal((await createBillingCheckout(other, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider })).transactionId, draftId);
    assert.equal(creates, 1);
    const uncertain = await registerCompany({ name: 'Synthetic uncertain owner', companyName: 'Synthetic recovery fixture', email: `${suffix}-uncertain@example.invalid`, password: 'synthetic-owner-password' });
    const uncertainCustomer = providerId('ctm'), uncertainDraft = providerId('txn');
    await prisma.manager.update({ where: { id: uncertain.id }, data: { emailVerifiedAt: now } });
    await prisma.company.update({ where: { id: uncertain.companyId }, data: { billingCustomerId: uncertainCustomer } });
    await prisma.paddleCustomer.create({ data: { id: uncertainCustomer, companyId: uncertain.companyId, status: 'active', paddleUpdatedAt: now, lastEventAt: now } });
    let uncertainCreates = 0;
    const uncertainProvider = () => ({ ...provider(), transactions: { create: async () => { uncertainCreates++; throw new Error('Synthetic lost provider response'); } } }) as unknown as ReturnType<typeof provider>;
    await assert.rejects(createBillingCheckout(uncertain, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider: uncertainProvider }));
    const pending = await prisma.auditLog.findFirstOrThrow({ where: { companyId: uncertain.companyId, action: 'CHECKOUT_RESERVED' }, orderBy: { id: 'desc' } });
    await processPaddleEvent(event('transaction.created', { id: uncertainDraft, customerId: uncertainCustomer, subscriptionId: null, status: 'draft', currencyCode: 'USD', invoiceNumber: null,
        createdAt: now.toISOString(), updatedAt: now.toISOString(), items: [{ quantity: 1, price: { id: priceId, productId: 'pro_fixture' } }], customData: { checkoutReservationId: pending.id } }));
    assert.equal((await createBillingCheckout(uncertain, { plan: 'STARTER', interval: 'month' }, { db: prisma, provider: uncertainProvider })).transactionId, uncertainDraft);
    assert.equal(uncertainCreates, 1, 'provider callback reconciles a lost response without another creation');
    console.log('PASS isolated billing: atomic dedup/rollback, ordered canonical customer ownership, untrusted email/customData denied, early transaction placeholder convergence, unqualified catalog denied and concurrent checkout one provider draft. Provider is a no-network fixture; sandbox remains required.');
} finally { await prisma.$disconnect(); }
