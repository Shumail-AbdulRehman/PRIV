import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { once } from 'node:events';
import subscriptionRouter from '../routes/subscription.route.js';
import { Environment, Paddle } from '@paddle/paddle-node-sdk';
const m = vi.hoisted(() => ({
  owner: vi.fn(), company: vi.fn(), customer: vi.fn(), subscription: vi.fn(), subscriptions: vi.fn(), count: vi.fn(), auditFind: vi.fn(), auditCreate: vi.fn(), lock: vi.fn(), customerUpsert: vi.fn(), companyUpdate: vi.fn(), transaction: vi.fn(),
  priceGet: vi.fn(), productGet: vi.fn(), customerCreate: vi.fn(), transactionCreate: vi.fn(), portalCreate: vi.fn(),
}));
vi.mock('../prisma/prisma.js', () => ({ prisma: {} }));
import { getPaddleCatalog, configuredPlanForPrice, requireBillingActivation, getPaddleWebhookSecret } from '../config/paddle.js';
import { createBillingCheckout, createBillingPortal, getBillingCatalog, getBillingLifecycle } from './billingLifecycle.service.js';
const priceId = 'pri_00000000000000000000000001', customerId = 'ctm_00000000000000000000000001', transactionId = 'txn_00000000000000000000000001', productId = 'pro_00000000000000000000000001';
const actor = { id: 1, role: 'ADMIN' as const, companyId: 42 };
const company = { id: 42, name: 'Synthetic company', isActive: true, operationalStatus: 'ACTIVE', plan: 'STARTER', billingCustomerId: customerId, billingSubscriptionId: null };
const owner = { id: 1, email: 'owner@example.invalid', name: 'Synthetic owner', emailVerifiedAt: new Date(), company };
const dbObject = { manager: { findFirst: m.owner, count: m.count }, company: { findUnique: m.company, update: m.companyUpdate }, paddleCustomer: { findFirst: m.customer, findUnique: m.customer, upsert: m.customerUpsert },
  paddleTransaction: { findFirst: m.transaction }, paddleSubscription: { findFirst: m.subscription, findMany: m.subscriptions }, location: { count: m.count }, staff: { count: m.count }, auditLog: { findFirst: m.auditFind, create: m.auditCreate }, $queryRaw: m.lock,
  $transaction: async (run: (tx: unknown) => unknown) => run(dbObject) };
// Tests use explicit provider/DB seams, never credentials or an external Paddle request.
const deps = { db: dbObject as unknown as NonNullable<Parameters<typeof createBillingCheckout>[2]>['db'], provider: () => ({ prices: { get: m.priceGet }, products: { get: m.productGet }, customers: { create: m.customerCreate }, transactions: { create: m.transactionCreate }, customerPortalSessions: { create: m.portalCreate } }) as unknown as ReturnType<NonNullable<NonNullable<Parameters<typeof createBillingCheckout>[2]>['provider']>> };
const request = { plan: 'STARTER', interval: 'month' };
function qualifiedSubscription() {
  return { id: 'sub_fixture', companyId: 42, customerId, priceId, status: 'active',
    currentBillingPeriodStart: new Date('2026-11-01T00:00:00Z'), currentBillingPeriodEnd: new Date('2026-12-01T00:00:00Z'),
    canceledAt: null, pausedAt: null, scheduledChangeAction: null, scheduledChangeAt: null, lastEventAt: new Date('2026-11-01T00:00:00Z') };
}
function checkoutAudit(requested: object = { plan: 'STARTER', interval: 'month', priceId }, saved: object | null = { reservationId: 10, transactionId, customerId }) {
  m.auditFind.mockImplementation(async ({ where }: { where: { action: string } }) => {
    if (where.action === 'CHECKOUT_RESERVED') return { id: 10, newValue: requested };
    if (where.action === 'CHECKOUT_READY') return saved ? { id: 11, newValue: saved } : null;
    return null;
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('PADDLE_ENVIRONMENT', 'sandbox'); vi.stubEnv('PADDLE_BILLING_ENABLED', 'true'); vi.stubEnv('PADDLE_API_KEY', 'isolated-credential-fixture-000000000000000');
  vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }])); vi.stubEnv('PADDLE_CHECKOUT_URL', 'https://workspace.example.invalid/choose-plan');
  m.company.mockResolvedValue({ ...company }); m.owner.mockResolvedValue({ ...owner, company: { ...company } }); m.customer.mockResolvedValue({ id: customerId, companyId: 42 }); m.subscription.mockResolvedValue(null); m.subscriptions.mockResolvedValue([]); m.count.mockResolvedValue(1);
  m.priceGet.mockResolvedValue({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null });
  m.productGet.mockResolvedValue({ id: productId, status: 'active' }); m.transactionCreate.mockResolvedValue({ id: transactionId, customerId, status: 'draft' });
  m.portalCreate.mockResolvedValue({ customerId, urls: { general: { overview: 'https://sandbox-customer-portal.paddle.com/cpl_fixture?token=temporary-fixture' } } });
  m.auditFind.mockResolvedValue(null); m.auditCreate.mockResolvedValue({ id: 10 });
  m.customerCreate.mockResolvedValue({ id: customerId, email: owner.email, name: owner.name, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
});
afterEach(() => vi.unstubAllEnvs());
describe('explicit qualified catalog and activation', () => {
  it.each(['', 'short', 'your_placeholder_webhook_secret_123456789'])('does not accept absent/weak/placeholder webhook verification secret', value => {
    vi.stubEnv('PADDLE_WEBHOOK_SECRET', value); expect(() => getPaddleWebhookSecret()).toThrow();
  });
  it('has no built-in prices, trial length or production environment default', () => {
    expect(getPaddleCatalog()).toEqual([{ plan: 'STARTER', interval: 'month', priceId }]);
    expect(configuredPlanForPrice('pri_unknown')).toBeUndefined();
    expect(configuredPlanForPrice(priceId)).toBe('STARTER');
  });
  it.each(['PADDLE_ENVIRONMENT', 'PADDLE_PRICE_CATALOG_JSON', 'PADDLE_API_KEY', 'PADDLE_BILLING_ENABLED'])('requires %s before activation', key => {
    vi.stubEnv(key, ''); expect(() => requireBillingActivation()).toThrow();
  });
  it.each(['null', '[]', '{}', 'bad', '[{"plan":"FREE","interval":"month","priceId":"bad"}]',
    JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }, { plan: 'PRO', interval: 'month', priceId }]),
    JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId, amount: 'invented' }])])('rejects unavailable, duplicate or unapproved catalog %s', value => {
    vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', value); expect(() => getPaddleCatalog()).toThrow(); expect(configuredPlanForPrice(priceId)).toBeUndefined();
  });
  it('shows safe metadata without exposing provider URLs, credentials or pretending billing is configured', async () => {
    vi.stubEnv('PADDLE_BILLING_ENABLED', 'false');
    const result = await getBillingLifecycle(actor, deps);
    expect(result.billingConfigured).toBe(false); expect(result.checkoutAvailable).toBe(false); expect(result.portalAvailable).toBe(false);
    expect(JSON.stringify(result)).not.toContain('credential-fixture'); expect(JSON.stringify(result)).not.toContain('password');
    expect(m.priceGet).not.toHaveBeenCalled();
  });
  it('retains owner recovery facts for a legacy inactive company while denying checkout before provider access', async () => {
    m.company.mockResolvedValue({ ...company, isActive: false });
    m.owner.mockResolvedValue({ ...owner, company: { ...company, isActive: false, operationalStatus: 'ACTIVE' } });
    const result = await getBillingLifecycle(actor, deps);
    expect(result.company).toMatchObject({ id: actor.companyId, isActive: false, operationalStatus: 'ACTIVE' });
    expect(result.checkoutAvailable).toBe(false);
    expect(result.portalAvailable).toBe(true);
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 403, message: 'Company operations are suspended' });
    expect(m.priceGet).not.toHaveBeenCalled();
    expect(m.customerCreate).not.toHaveBeenCalled();
    expect(m.transactionCreate).not.toHaveBeenCalled();
    expect(m.auditCreate).not.toHaveBeenCalled();
  });
  it('shows an unresolved request as unavailable rather than offering a duplicate checkout', async () => {
    checkoutAudit(undefined, null);
    const result = await getBillingLifecycle(actor, deps);
    expect(result.reconciliationRequired).toBe(true); expect(result.checkoutAvailable).toBe(false);
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('does not treat an early transaction placeholder as completed onboarding', async () => {
    m.company.mockResolvedValue({ ...company, billingSubscriptionId: 'sub_fixture' });
    m.owner.mockResolvedValue({ ...owner, company: { ...company, billingSubscriptionId: 'sub_fixture' } });
    m.subscription.mockResolvedValue({ ...qualifiedSubscription(), status: 'unknown' });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ providerState: 'MIRRORED', onboardingRequired: true, checkoutAvailable: false });
    m.subscription.mockResolvedValue({ ...qualifiedSubscription(), status: 'trialing' });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ onboardingRequired: false });
  });
  it('reads actual provider amount/currency/trial facts without local price arithmetic', async () => {
    m.priceGet.mockResolvedValueOnce({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '0', currencyCode: 'PKR' }, trialPeriod: { interval: 'day', frequency: 5 } });
    expect(await getBillingCatalog(actor, deps)).toEqual([{ plan: 'STARTER', interval: 'month', priceId, productId, amount: '0', currencyCode: 'PKR', trialPeriod: { interval: 'day', frequency: 5, requiresPaymentMethod: null } }]);
  });
  it('rejects a provider price with the wrong status/cycle/product', async () => {
    m.productGet.mockResolvedValueOnce({ id: productId, status: 'archived' });
    await expect(getBillingCatalog(actor, deps)).rejects.toMatchObject({ statusCode: 503 });
    m.priceGet.mockResolvedValueOnce({ id: priceId, productId, status: 'active', billingCycle: { interval: 'year', frequency: 1 } });
    await expect(getBillingCatalog(actor, deps)).rejects.toMatchObject({ statusCode: 503 });
  });
});
describe('owner-only provider portal', () => {
  it.each(['MANAGER', 'STAFF'] as const)('denies %s before touching provider data', async role => {
    await expect(createBillingPortal({ ...actor, role }, {}, deps)).rejects.toMatchObject({ statusCode: 403 }); expect(m.portalCreate).not.toHaveBeenCalled();
  });
  it('rejects client company/customer/subscription selection', async () => {
    await expect(createBillingPortal(actor, { companyId: 99 }, deps)).rejects.toMatchObject({ statusCode: 400 }); expect(m.portalCreate).not.toHaveBeenCalled();
  });
  it('queries the exact canonical customer in the actor tenant and returns a fresh unpersisted hosted URL', async () => {
    m.subscriptions.mockResolvedValue([{ id: 'sub_fixture' }]);
    const result = await createBillingPortal(actor, {}, deps);
    expect(result.url).toContain('https://sandbox-customer-portal.paddle.com/');
    expect(m.customer).toHaveBeenCalledWith({ where: { id: customerId, companyId: 42 } });
    expect(m.portalCreate).toHaveBeenCalledWith(customerId, ['sub_fixture']); expect(m.auditCreate).not.toHaveBeenCalled();
  });
  it('does not grant portal access based on company billing ID without its tenant mirror', async () => {
    m.customer.mockResolvedValue(null); await expect(createBillingPortal(actor, {}, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.portalCreate).not.toHaveBeenCalled();
  });
  it.each(['http://customer-portal.paddle.com/', 'https://attacker.example/', 'https://user:password@customer-portal.paddle.com/'])('rejects unsafe provider URL %s', url => {
    m.portalCreate.mockResolvedValue({ customerId, urls: { general: { overview: url } } }); return expect(createBillingPortal(actor, {}, deps)).rejects.toMatchObject({ statusCode: 503 });
  });
  it('does not expose raw provider error payloads', async () => {
    m.portalCreate.mockRejectedValue(new Error('private-provider-body'));
    await expect(createBillingPortal(actor, {}, deps)).rejects.toMatchObject({ statusCode: 503, message: 'Billing is unavailable. Please try again later.' });
  });
});
describe('checkout request safety around Paddle', () => {
  it.each([{ ...request, companyId: 99 }, { ...request, priceId }, { plan: 'FREE', interval: 'month' }])('rejects client-owned entitlement or tenant selection', raw => {
    return expect(createBillingCheckout(actor, raw, deps)).rejects.toMatchObject({ statusCode: 400 });
  });
  it('does not call any provider when activation, verified ownership or return URL is unavailable', async () => {
    vi.stubEnv('PADDLE_BILLING_ENABLED', 'false'); await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
    vi.stubEnv('PADDLE_BILLING_ENABLED', 'true'); vi.stubEnv('PADDLE_ENVIRONMENT', 'production'); m.owner.mockResolvedValueOnce({ ...owner, emailVerifiedAt: null });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 403 });
    vi.stubEnv('PADDLE_CHECKOUT_URL', ''); await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
    expect(m.priceGet).not.toHaveBeenCalled(); expect(m.customerCreate).not.toHaveBeenCalled(); expect(m.transactionCreate).not.toHaveBeenCalled(); expect(m.auditCreate).not.toHaveBeenCalled();
  });
  it('allows an unverified sandbox owner through both checkout reservation locks without marking the email verified', async () => {
    m.owner.mockResolvedValue({ ...owner, emailVerifiedAt: null });
    const lifecycle = await getBillingLifecycle(actor, deps);
    expect(lifecycle).toMatchObject({ billingEnvironment: 'sandbox', ownerVerified: false, checkoutAvailable: true, onboardingRequired: true });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.transactionCreate).toHaveBeenCalledOnce();
  });
  it('requires verification in production and denies an owner who becomes unverified under the reservation lock', async () => {
    vi.stubEnv('PADDLE_ENVIRONMENT', 'production');
    m.owner.mockResolvedValue({ ...owner, emailVerifiedAt: null });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ billingEnvironment: 'production', ownerVerified: false, checkoutAvailable: false });
    m.owner.mockResolvedValueOnce(owner).mockResolvedValueOnce(owner);
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 403 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('uses the portal for any linked subscription rather than creating another purchase', async () => {
    m.company.mockResolvedValue({ ...company, billingSubscriptionId: 'sub_fixture' });
    m.owner.mockResolvedValue({ ...owner, company: { ...company, billingSubscriptionId: 'sub_fixture' } });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('reserves a single draft request before provider creation and records its exact result', async () => {
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.auditCreate).toHaveBeenCalledBefore(m.transactionCreate);
    expect(m.transactionCreate).toHaveBeenCalledWith({ status: 'draft', collectionMode: 'automatic', customerId, items: [{ priceId, quantity: 1 }], checkout: { url: 'https://workspace.example.invalid/choose-plan' }, customData: { checkoutReservationId: 10 } });
    expect(m.auditCreate).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'CHECKOUT_READY', newValue: { reservationId: 10, transactionId, customerId } }) }));
  });
  it('reuses a prior server-resolved checkout without asking Paddle for a second transaction', async () => {
    checkoutAudit();
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: true }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('permits replacement only after provider-confirmed canceled checkout', async () => {
    checkoutAudit();
    m.transaction.mockResolvedValue({ id: transactionId, customerId, companyId: 42, status: 'canceled' });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.transactionCreate).toHaveBeenCalledOnce();
  });
  it('blocks another purchase when the earlier checkout was paid but subscription sync is pending', async () => {
    checkoutAudit();
    m.transaction.mockResolvedValue({ id: transactionId, customerId, companyId: 42, status: 'paid' });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('holds an uncertain prior outcome instead of retrying another purchase', async () => {
    checkoutAudit(undefined, null);
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('does not overwrite a different pending plan choice', async () => {
    checkoutAudit({ plan: 'PRO', interval: 'month', priceId: 'other' });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('never marks an ambiguous provider failure as ready', async () => {
    m.transactionCreate.mockRejectedValue(new Error('timeout after a remote draft may have been created'));
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
    expect(m.auditCreate).toHaveBeenCalledTimes(1); expect(m.auditCreate.mock.calls[0]![0].data.action).toBe('CHECKOUT_RESERVED');
  });
  it('provisions customer linkage only from the server response for a verified owner', async () => {
    const freshCompany = { ...company, billingCustomerId: null };
    m.owner.mockResolvedValue({ ...owner, company: freshCompany }); m.customer.mockResolvedValue(null);
    m.companyUpdate.mockImplementation(async ({ data }) => Object.assign(freshCompany, data));
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.customerCreate).toHaveBeenCalledWith({ email: owner.email, name: owner.name });
    expect(m.companyUpdate).toHaveBeenCalledWith({ where: { id: 42 }, data: { billingCustomerId: customerId } });
  });
});
describe('installed Paddle signature verifier', () => {
  it('verifies actual raw signed bytes and rejects tampering using the existing SDK', async () => {
    const sdk = new Paddle('isolated-no-network-fixture', { environment: Environment.sandbox });
    const secret = 'isolated-signature-fixture', ts = Math.floor(Date.now() / 1000);
    const raw = JSON.stringify({ event_id: 'evt_fixture', event_type: 'customer.created', occurred_at: new Date().toISOString(), notification_id: 'ntf_fixture', data: { id: customerId, email: 'fixture@example.invalid', name: 'Synthetic customer', status: 'active', locale: 'en', custom_data: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
    const signature = `ts=${ts};h1=${createHmac('sha256', secret).update(`${ts}:${raw}`).digest('hex')}`;
    expect((await sdk.webhooks.unmarshal(raw, secret, signature)).eventId).toBe('evt_fixture');
    await expect(sdk.webhooks.unmarshal(raw + ' ', secret, signature)).rejects.toThrow();
  });
});

describe('subscription router public/private boundary', () => {
  it('keeps existing public pricing context outside the new protected manage namespace', async () => {
    const app = express(); app.use('/subscription', subscriptionRouter);
    app.use((error: { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => { res.status(error.statusCode ?? 500).json({ failed: true }); });
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('Expected isolated local listener');
    try {
      const publicResponse = await fetch(`http://127.0.0.1:${address.port}/subscription/pricing-context`);
      expect(publicResponse.status).toBe(200);
      const privateResponse = await fetch(`http://127.0.0.1:${address.port}/subscription/manage/lifecycle`);
      expect(privateResponse.status).toBe(401);
    } finally { server.close(); await once(server, 'close'); }
  });
});

describe('authoritative workspace permission and public readiness DTO', () => {
  const now = new Date('2026-11-07T12:00:00Z');
  const timedDeps = { ...deps, now: () => now };
  function linked(change: object = {}, companyChange: object = {}) {
    const linkedCompany = { ...company, billingSubscriptionId: 'sub_fixture', ...companyChange };
    m.owner.mockResolvedValue({ ...owner, company: linkedCompany });
    m.company.mockResolvedValue(linkedCompany);
    m.subscription.mockResolvedValue({ ...qualifiedSubscription(), ...change });
  }
  it.each(['active', 'trialing'])('grants permission only for the actual qualified current %s window', async (status) => {
    linked({ status });
    const result = await getBillingLifecycle(actor, timedDeps);
    expect(result).toMatchObject({ workspaceAccessAllowed: true, checkoutReadiness: 'LINKED_SUBSCRIPTION', checkoutAvailable: false, checkoutResume: null,
      subscription: { priceId, interval: 'month', catalogQualified: true, periodStart: '2026-11-01T00:00:00.000Z', periodEnd: '2026-12-01T00:00:00.000Z' } });
    expect(m.transactionCreate).not.toHaveBeenCalled();
    expect(m.priceGet).not.toHaveBeenCalled();
  });
  it.each([
    { currentBillingPeriodStart: null }, { currentBillingPeriodEnd: null },
    { currentBillingPeriodStart: new Date('2026-12-02T00:00:00Z') },
    { currentBillingPeriodEnd: now }, { currentBillingPeriodStart: new Date('invalid') },
    { canceledAt: now }, { pausedAt: now },
    { scheduledChangeAction: 'cancel', scheduledChangeAt: now },
    { scheduledChangeAction: 'pause', scheduledChangeAt: now },
    { status: 'past_due' }, { status: 'canceled' }, { status: 'paused' }, { status: 'unknown' },
    { priceId: 'pri_00000000000000000000000099' },
    { companyId: 99 }, { customerId: 'ctm_foreign' }, { id: 'sub_foreign' },
  ])('does not authorize from active-looking or mismatched facts: %#', async (change) => {
    linked(change);
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ workspaceAccessAllowed: false, checkoutAvailable: false, checkoutResume: null });
  });
  it('does not qualify a catalog price mapped to a different company plan', async () => {
    linked({}, { plan: 'PRO' });
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ workspaceAccessAllowed: false, subscription: { catalogQualified: false } });
  });
  it.each([{ isActive: false }, { operationalStatus: 'SUSPENDED' }])('administrative restriction overrides a paid window: %#', async (change) => {
    linked({}, change);
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ workspaceAccessAllowed: false, checkoutReadiness: 'COMPANY_RESTRICTED', checkoutAvailable: false, checkoutResume: null });
  });
  it('does not conflate disabled purchasing with revoking an existing qualified entitlement', async () => {
    linked(); vi.stubEnv('PADDLE_BILLING_ENABLED', 'false');
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ workspaceAccessAllowed: true, checkoutReadiness: 'BILLING_DISABLED', checkoutAvailable: false });
  });
  it('returns explicit false/null for a never-subscribed owner', async () => {
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ workspaceAccessAllowed: false, checkoutReadiness: 'READY', checkoutResume: null, checkoutAvailable: true });
  });
  it.each(['PADDLE_ENVIRONMENT', 'PADDLE_API_KEY', 'PADDLE_PRICE_CATALOG_JSON', 'PADDLE_CHECKOUT_URL'])('missing %s never advertises a ready checkout', async (key) => {
    vi.stubEnv(key, '');
    const result = await getBillingLifecycle(actor, timedDeps);
    expect(result).toMatchObject({ workspaceAccessAllowed: false, checkoutReadiness: 'BILLING_DISABLED', checkoutAvailable: false, checkoutResume: null });
    expect(JSON.stringify(result)).not.toContain('credential-fixture');
  });
  it('keeps production owner verification mandatory and sandbox verification unchanged', async () => {
    m.owner.mockResolvedValue({ ...owner, emailVerifiedAt: null });
    vi.stubEnv('PADDLE_ENVIRONMENT', 'production');
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ ownerVerified: false, checkoutReadiness: 'OWNER_VERIFICATION_REQUIRED' });
    vi.stubEnv('PADDLE_ENVIRONMENT', 'sandbox');
    expect(await getBillingLifecycle(actor, timedDeps)).toMatchObject({ ownerVerified: false, checkoutReadiness: 'READY' });
  });
  it('propagates unexpected database failures instead of reporting ready or empty success', async () => {
    m.company.mockRejectedValue(new Error('database read failed'));
    await expect(getBillingLifecycle(actor, timedDeps)).rejects.toThrow('database read failed');
  });
});

describe('tenant-correlated persisted checkout resume', () => {
  it.each([null, 'draft', 'ready'])('returns the exact saved selection for a proven prepared draft; mirror %s', async (status) => {
    checkoutAudit();
    m.transaction.mockResolvedValue(status ? { id: transactionId, companyId: 42, customerId, status } : null);
    const result = await getBillingLifecycle(actor, deps);
    expect(result).toMatchObject({ checkoutReadiness: 'READY', checkoutResume: { plan: 'STARTER', interval: 'month', transactionId }, reconciliationRequired: false });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ reused: true, transactionId });
    expect(m.transactionCreate).not.toHaveBeenCalled();
    expect(m.auditCreate).not.toHaveBeenCalled();
  });
  it.each(['paid', 'completed', 'billed', 'past_due', 'unknown', 'unrecognized'])('never resumes or repurchases a known %s outcome', async (status) => {
    checkoutAudit(); m.transaction.mockResolvedValue({ id: transactionId, companyId: 42, customerId, status });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutReadiness: 'RECONCILIATION_PENDING', checkoutAvailable: false, checkoutResume: null });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it.each([
    { reservationId: 99, transactionId, customerId }, { reservationId: 10, transactionId: 'txn_bad', customerId },
    { reservationId: 10, transactionId, customerId: 'ctm_foreign' },
    { reservationId: 10, transactionId },
    { reservationId: 10, transactionId, customerId, confirmedByProvider: true },
  ])('holds malformed or unproven READY facts: %#', async (saved) => {
    checkoutAudit(undefined, saved);
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutResume: null, checkoutReadiness: 'RECONCILIATION_PENDING' });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('permits legacy READY records only when a same-tenant reopenable mirror proves linkage', async () => {
    checkoutAudit(undefined, { reservationId: 10, transactionId });
    m.transaction.mockResolvedValue({ id: transactionId, companyId: 42, customerId, status: 'draft' });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutResume: { transactionId } });
  });
  it.each([{ companyId: 99 }, { customerId: 'ctm_foreign' }, { id: 'txn_foreign' }, { subscriptionId: 'sub_existing' }])('rejects foreign/linked transaction evidence: %#', async (change) => {
    checkoutAudit(); m.transaction.mockResolvedValue({ id: transactionId, companyId: 42, customerId, status: 'draft', ...change });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutReadiness: 'RECONCILIATION_PENDING', checkoutResume: null });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it.each([null, { id: customerId, companyId: 99 }])('cannot resume without the canonical same-tenant customer mirror: %#', async (customer) => {
    checkoutAudit(); m.customer.mockResolvedValue(customer);
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutReadiness: 'RECONCILIATION_PENDING', checkoutResume: null, portalAvailable: false });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
  });
  it('blocks a pending customer reservation even if a separate provider event linked its customer', async () => {
    m.auditFind.mockImplementation(async ({ where }) => where.action === 'CUSTOMER_CREATE_RESERVED' ? { id: 7, newValue: {} } : null);
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ reconciliationRequired: true, checkoutAvailable: false });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('requires a matching customer READY reservation and canonical customer', async () => {
    m.auditFind.mockImplementation(async ({ where }) => where.action === 'CUSTOMER_CREATE_RESERVED'
      ? { id: 7, newValue: {} } : where.action === 'CUSTOMER_CREATE_READY' ? { id: 8, newValue: { reservationId: 99, customerId } } : null);
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ reconciliationRequired: true, checkoutResume: null });
  });
  it('returns an exact yearly PRO selection rather than reconstructing the company default', async () => {
    const yearlyPrice = 'pri_00000000000000000000000002';
    vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ plan: 'PRO', interval: 'year', priceId: yearlyPrice }]));
    checkoutAudit({ plan: 'PRO', interval: 'year', priceId: yearlyPrice });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutResume: { plan: 'PRO', interval: 'year', transactionId } });
  });
  it('does not enable plan changes for a saved monthly transaction', async () => {
    checkoutAudit();
    vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }, { plan: 'STARTER', interval: 'year', priceId: 'pri_00000000000000000000000002' }]));
    m.priceGet.mockImplementation(async (id) => ({ id, productId, status: 'active', billingCycle: { interval: id === priceId ? 'month' : 'year', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null }));
    await expect(createBillingCheckout(actor, { plan: 'STARTER', interval: 'year' }, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('allows another selection only after same-tenant provider-confirmed cancellation', async () => {
    checkoutAudit(); m.transaction.mockResolvedValue({ id: transactionId, companyId: 42, customerId, status: 'canceled' });
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutResume: null, checkoutReadiness: 'READY', reconciliationRequired: false });
  });
});

// Persisted-boundary fixtures deliberately retain RESERVED on a rejected call.
// They test service decisions, not PostgreSQL rollback/locking (owned by spec60).
describe('failure after durable reservation never causes a second provider create', () => {
  it.each(['customer-reject', 'customer-persist', 'draft-reject', 'draft-persist'])('retains the hold after %s and a fresh read/retry', async (failure) => {
    const freshCompany = { ...company, billingCustomerId: failure.startsWith('customer') ? null : customerId };
    m.owner.mockResolvedValue({ ...owner, company: freshCompany }); m.company.mockResolvedValue(freshCompany);
    const audits: Array<{ id: number; action: string; newValue: unknown }> = [];
    m.auditFind.mockImplementation(async ({ where }) => [...audits].reverse().find(row => row.action === where.action &&
      (!where.newValue || (row.newValue as { reservationId?: number })?.reservationId === where.newValue.equals)) ?? null);
    m.auditCreate.mockImplementation(async ({ data }) => {
      if (failure === 'draft-persist' && data.action === 'CHECKOUT_READY') throw new Error('persist failed');
      const row = { ...data, id: audits.length + 1 }; audits.push(row); return row;
    });
    if (failure === 'customer-reject') m.customerCreate.mockRejectedValue(new Error('private-provider-payload'));
    if (failure === 'customer-persist') m.customerUpsert.mockRejectedValue(new Error('persist failed'));
    if (failure === 'draft-reject') m.transactionCreate.mockRejectedValue(new Error('private-provider-payload'));
    await expect(createBillingCheckout(actor, request, deps)).rejects.toThrow();
    expect(audits.map(row => row.action)).toEqual([failure.startsWith('customer') ? 'CUSTOMER_CREATE_RESERVED' : 'CHECKOUT_RESERVED']);
    const result = await getBillingLifecycle(actor, deps);
    expect(result).toMatchObject({ reconciliationRequired: true, checkoutResume: null, checkoutAvailable: false, checkoutReadiness: 'RECONCILIATION_PENDING' });
    expect(JSON.stringify(result)).not.toContain('private-provider-payload');
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 });
    expect(m.customerCreate).toHaveBeenCalledTimes(failure.startsWith('customer') ? 1 : 0);
    expect(m.transactionCreate).toHaveBeenCalledTimes(failure.startsWith('customer') ? 0 : 1);
    expect(audits).toHaveLength(1);
  });
  it('a lost response after READY can reopen the same transaction through a fresh lifecycle read', async () => {
    const audits: Array<{ id: number; action: string; newValue: unknown }> = [];
    m.auditFind.mockImplementation(async ({ where }) => [...audits].reverse().find(row => row.action === where.action &&
      (!where.newValue || (row.newValue as { reservationId?: number })?.reservationId === where.newValue.equals)) ?? null);
    m.auditCreate.mockImplementation(async ({ data }) => { const row = { ...data, id: audits.length + 1 }; audits.push(row); return row; });
    await createBillingCheckout(actor, request, deps); // Caller discards the successful response.
    expect(await getBillingLifecycle(actor, deps)).toMatchObject({ checkoutResume: { transactionId, plan: 'STARTER', interval: 'month' } });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ reused: true, transactionId });
    expect(m.transactionCreate).toHaveBeenCalledOnce();
    expect(audits.map(row => row.action)).toEqual(['CHECKOUT_RESERVED', 'CHECKOUT_READY']);
  });
});

describe('provider catalog and requested sandbox card requirements', () => {
  it.each([true, false, undefined])('reports provider requiresPaymentMethod=%s without guessing', async (requiresPaymentMethod) => {
    m.priceGet.mockResolvedValue({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: { interval: 'day', frequency: 7, requiresPaymentMethod } });
    expect((await getBillingCatalog(actor, deps))[0]!.trialPeriod).toEqual({ interval: 'day', frequency: 7, requiresPaymentMethod: requiresPaymentMethod ?? null });
    if (requiresPaymentMethod === true) expect(await createBillingCheckout(actor, request, deps)).toEqual({ reused: false, transactionId });
    else {
      await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
      expect(m.auditCreate).not.toHaveBeenCalled();
      expect(m.transactionCreate).not.toHaveBeenCalled();
    }
  });
  it.each([
    { unitPrice: { amount: '-1', currencyCode: 'USD' } }, { unitPrice: { amount: '1.2', currencyCode: 'USD' } },
    { unitPrice: { amount: 1234, currencyCode: 'USD' } }, { unitPrice: { amount: '1234', currencyCode: 'usd' } },
    { trialPeriod: { interval: 'day', frequency: 0 } }, { trialPeriod: { interval: 'week', frequency: 1, requiresPaymentMethod: 'true' } },
    { billingCycle: { interval: 'month', frequency: 2 } }, { status: 'archived' },
  ])('rejects malformed/inactive price facts before reservation: %#', async (change) => {
    m.priceGet.mockResolvedValue({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null, ...change });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
    expect(m.auditCreate).not.toHaveBeenCalled();
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
});

it('never reports ready when subscription changes between the policy read and public record read', async () => {
  const linkedCompany = { ...company, billingSubscriptionId: 'sub_fixture' };
  m.owner.mockResolvedValue({ ...owner, company: linkedCompany }); m.company.mockResolvedValue(linkedCompany);
  m.subscription.mockResolvedValueOnce(qualifiedSubscription()).mockResolvedValueOnce({ ...qualifiedSubscription(), status: 'canceled' });
  expect(await getBillingLifecycle(actor, { ...deps, now: () => new Date('2026-11-07T12:00:00Z') })).toMatchObject({ workspaceAccessAllowed: false, subscription: { status: 'canceled' } });
});

it('a fulfilled draft linked to the canonical subscription stops holding confirmation without allowing purchase',async()=>{
 const subscription=qualifiedSubscription();
 m.company.mockResolvedValue({...company,billingSubscriptionId:subscription.id});
 m.owner.mockResolvedValue({...owner,company:{...company,billingSubscriptionId:subscription.id}});
 m.subscription.mockResolvedValue(subscription);checkoutAudit();
 m.transaction.mockResolvedValue({id:transactionId,companyId:42,customerId,subscriptionId:subscription.id,status:'completed'});
 expect(await getBillingLifecycle(actor,{...deps,now:()=>new Date('2026-11-08T12:00:00Z')})).toMatchObject({workspaceAccessAllowed:true,reconciliationRequired:false,checkoutReadiness:'LINKED_SUBSCRIPTION',checkoutAvailable:false,checkoutResume:null});
 await expect(createBillingCheckout(actor,request,deps)).rejects.toMatchObject({statusCode:409});
 expect(m.transactionCreate).not.toHaveBeenCalled();
});
