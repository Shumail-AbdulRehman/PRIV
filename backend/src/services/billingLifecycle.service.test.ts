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
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('PADDLE_ENVIRONMENT', 'sandbox'); vi.stubEnv('PADDLE_BILLING_ENABLED', 'true'); vi.stubEnv('PADDLE_API_KEY', 'isolated-credential-fixture-000000000000000');
  vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ plan: 'STARTER', interval: 'month', priceId }])); vi.stubEnv('PADDLE_CHECKOUT_URL', 'https://workspace.example.invalid/choose-plan');
  m.owner.mockResolvedValue({ ...owner, company: { ...company } }); m.customer.mockResolvedValue({ id: customerId, companyId: 42 }); m.subscription.mockResolvedValue(null); m.subscriptions.mockResolvedValue([]); m.count.mockResolvedValue(1);
  m.priceGet.mockResolvedValue({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null });
  m.productGet.mockResolvedValue({ id: productId, status: 'active' }); m.transactionCreate.mockResolvedValue({ id: transactionId, customerId });
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
    m.auditFind.mockResolvedValueOnce({ id: 10, action: 'CHECKOUT_RESERVED' }).mockResolvedValueOnce(null);
    const result = await getBillingLifecycle(actor, deps);
    expect(result.reconciliationRequired).toBe(true); expect(result.checkoutAvailable).toBe(false);
    expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('reads actual provider amount/currency/trial facts without local price arithmetic', async () => {
    m.priceGet.mockResolvedValueOnce({ id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 }, unitPrice: { amount: '0', currencyCode: 'PKR' }, trialPeriod: { interval: 'day', frequency: 5 } });
    expect(await getBillingCatalog(actor, deps)).toEqual([{ plan: 'STARTER', interval: 'month', priceId, productId, amount: '0', currencyCode: 'PKR', trialPeriod: { interval: 'day', frequency: 5 } }]);
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
    vi.stubEnv('PADDLE_BILLING_ENABLED', 'true'); m.owner.mockResolvedValueOnce({ ...owner, emailVerifiedAt: null });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 403 });
    vi.stubEnv('PADDLE_CHECKOUT_URL', ''); await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 503 });
    expect(m.priceGet).not.toHaveBeenCalled(); expect(m.customerCreate).not.toHaveBeenCalled(); expect(m.transactionCreate).not.toHaveBeenCalled(); expect(m.auditCreate).not.toHaveBeenCalled();
  });
  it('uses the portal for any linked subscription rather than creating another purchase', async () => {
    m.owner.mockResolvedValue({ ...owner, company: { ...company, billingSubscriptionId: 'sub_fixture' } });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('reserves a single draft request before provider creation and records its exact result', async () => {
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.auditCreate).toHaveBeenCalledBefore(m.transactionCreate);
    expect(m.transactionCreate).toHaveBeenCalledWith({ status: 'draft', collectionMode: 'automatic', customerId, items: [{ priceId, quantity: 1 }], checkout: { url: 'https://workspace.example.invalid/choose-plan' }, customData: { checkoutReservationId: 10 } });
    expect(m.auditCreate).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'CHECKOUT_READY', newValue: { reservationId: 10, transactionId } }) }));
  });
  it('reuses a prior server-resolved checkout without asking Paddle for a second transaction', async () => {
    m.auditFind.mockResolvedValueOnce({ id: 10, newValue: { priceId } }).mockResolvedValueOnce({ newValue: { reservationId: 10, transactionId } });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: true }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('permits replacement only after provider-confirmed canceled checkout', async () => {
    m.auditFind.mockResolvedValueOnce({ id: 5, newValue: { priceId } }).mockResolvedValueOnce({ newValue: { reservationId: 5, transactionId: 'txn_canceled' } });
    m.transaction.mockResolvedValue({ status: 'canceled' });
    expect(await createBillingCheckout(actor, request, deps)).toEqual({ transactionId, reused: false });
    expect(m.transactionCreate).toHaveBeenCalledOnce();
  });
  it('blocks another purchase when the earlier checkout was paid but subscription sync is pending', async () => {
    m.auditFind.mockResolvedValueOnce({ id: 5, newValue: { priceId } }).mockResolvedValueOnce({ newValue: { reservationId: 5, transactionId } });
    m.transaction.mockResolvedValue({ status: 'paid' });
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('holds an uncertain prior outcome instead of retrying another purchase', async () => {
    m.auditFind.mockResolvedValueOnce({ id: 10, newValue: { priceId } }).mockResolvedValueOnce(null);
    await expect(createBillingCheckout(actor, request, deps)).rejects.toMatchObject({ statusCode: 409 }); expect(m.transactionCreate).not.toHaveBeenCalled();
  });
  it('does not overwrite a different pending plan choice', async () => {
    m.auditFind.mockResolvedValueOnce({ id: 10, newValue: { priceId: 'other' } }).mockResolvedValueOnce({ newValue: { transactionId } });
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
