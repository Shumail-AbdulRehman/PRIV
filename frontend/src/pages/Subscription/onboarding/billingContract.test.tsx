import { describe, expect, it } from 'vitest';
import type { BillingCatalogEntryDto, BillingLifecycleDto } from '../../../../../backend/src/types/billingLifecycle';
import type { BillingLifecycle } from '../types';
import { parseBillingCatalog, parseBillingCheckout, parseBillingLifecycle } from './billingContract';
const txn = 'txn_' + 'a'.repeat(26);
const price = 'pri_' + 'b'.repeat(26);
const catalog: BillingCatalogEntryDto = { plan: 'PRO', interval: 'month', priceId: price, productId: 'pro_' + 'c'.repeat(26), amount: '1234', currencyCode: 'USD', trialPeriod: null };
function lifecycle(): BillingLifecycleDto {
  return { company: { id: 42, name: 'Fixture', plan: 'PRO', isActive: true, operationalStatus: 'ACTIVE' }, usage: { locations: 0, staff: 0, managers: 1 }, limits: { locations: 5, staff: 25, managers: 3 }, subscription: null, reconciliationRequired: false, billingConfigured: true, ownerVerified: false, billingEnvironment: 'sandbox', onboardingRequired: true, providerState: 'NOT_LINKED', portalAvailable: false, checkoutAvailable: true };
}
// Compile fixtures against both declarations; no backend implementation is bundled.
const compatibility: BillingLifecycle = lifecycle();
describe('billing lifecycle wire boundary', () => {
  it('fails closed for additive legacy fields and never mutates input', () => {
    const before = structuredClone(compatibility);
    expect(parseBillingLifecycle(compatibility)).toMatchObject({ workspaceAccessAllowed: false, checkoutReadiness: 'UNKNOWN', checkoutResume: null });
    expect(compatibility).toEqual(before);
  });
  it('accepts a prepared draft with exact saved selection', () => {
    expect(parseBillingLifecycle({ ...lifecycle(), checkoutReadiness: 'READY', checkoutResume: { plan: 'PRO', interval: 'year', transactionId: txn } }).checkoutResume).toEqual({ plan: 'PRO', interval: 'year', transactionId: txn });
  });
  it.each(['unknown', 'active', 'trialing'])('accepts mirrored %s facts without inferring access', status => {
    const row = lifecycle();
    row.subscription = { status, plan: 'PRO', catalogQualified: true, priceId: price, interval: 'month', periodStart: '2026-11-01T00:00:00Z', periodEnd: '2026-12-01T00:00:00Z', scheduledChangeAction: null, scheduledChangeAt: null, lastEventAt: '2026-11-06T00:00:00Z' };
    expect(parseBillingLifecycle(row).workspaceAccessAllowed).toBe(false);
    expect(parseBillingLifecycle({ ...row, workspaceAccessAllowed: true }).workspaceAccessAllowed).toBe(true);
  });
  it('retains restricted and actual over-limit counts without inventing ready', () => {
    const row = lifecycle(); row.company.operationalStatus = 'SUSPENDED'; row.usage.staff = 100;
    expect(parseBillingLifecycle(row)).toMatchObject({ company: { operationalStatus: 'SUSPENDED' }, usage: { staff: 100 }, workspaceAccessAllowed: false });
  });
  it.each(['checkoutAvailable', 'portalAvailable', 'billingConfigured', 'ownerVerified', 'reconciliationRequired', 'workspaceAccessAllowed', 'onboardingRequired'])('does not coerce %s', field => {
    expect(() => parseBillingLifecycle({ ...lifecycle(), [field]: 'true' })).toThrow('Billing response is unavailable');
  });
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '42'])('rejects malformed company id %s', id => {
    const row = lifecycle(); expect(() => parseBillingLifecycle({ ...row, company: { ...row.company, id } })).toThrow();
  });
  it.each([{ checkoutReadiness: 'SECRET_CONFIGURATION_VALUE' }, { providerState: 'PAID' }, { checkoutResume: { plan: 'FREE', interval: 'month', transactionId: txn } }, { checkoutResume: { plan: 'PRO', interval: 'week', transactionId: txn } }, { checkoutResume: { plan: 'PRO', interval: 'month', transactionId: 'txn_fake' } }])('rejects malformed enum/resume %j', patch => {
    expect(() => parseBillingLifecycle({ ...lifecycle(), ...patch })).toThrow();
  });
  it('returns only public fields, not unknown sensitive payloads', () => {
    expect(JSON.stringify(parseBillingLifecycle({ ...lifecycle(), secret: 'private', portalUrl: 'https://private.invalid' }))).not.toMatch(/private|portalUrl|secret/);
  });
  it.each([null, [], {}, { company: null }])('rejects invalid required structure %j', row => {
    expect(() => parseBillingLifecycle(row)).toThrow();
  });
});
describe('provider catalog and checkout wire boundary', () => {
  it('preserves exact amount, currency and provider trial policy', () => {
    expect(parseBillingCatalog([catalog])).toEqual([catalog]);
    expect(parseBillingCatalog([{ ...catalog, amount: '0', currencyCode: 'JPY', interval: 'year', trialPeriod: { interval: 'day', frequency: 5, requiresPaymentMethod: true } }])[0]).toMatchObject({ amount: '0', currencyCode: 'JPY', interval: 'year', trialPeriod: { frequency: 5, requiresPaymentMethod: true } });
  });
  it('normalizes unknown card requirement without guessing a cardless trial', () => {
    expect(parseBillingCatalog([{ ...catalog, trialPeriod: { interval: 'day', frequency: 5 } }])[0].trialPeriod?.requiresPaymentMethod).toBeNull();
  });
  it.each([{ amount: 1234 }, { amount: '-1' }, { amount: '1.5' }, { amount: 'NaN' }, { amount: '01' }, { currencyCode: 'usd' }, { priceId: 'pri_fake' }, { productId: 'pro_fake' }, { interval: 'week' }, { plan: 'FREE' }, { trialPeriod: { interval: 'day', frequency: 0 } }, { trialPeriod: { interval: 'day', frequency: 1, requiresPaymentMethod: 'true' } }])('rejects malformed price %j', patch => {
    expect(() => parseBillingCatalog([{ ...catalog, ...patch }])).toThrow();
  });
  it('accepts empty/partial catalogs but rejects duplicate price or plan/interval', () => {
    expect(parseBillingCatalog([])).toEqual([]);
    expect(() => parseBillingCatalog([catalog, catalog])).toThrow();
    expect(() => parseBillingCatalog([catalog, { ...catalog, interval: 'year' }])).toThrow();
  });
  it('validates checkout actions without retaining extra response fields', () => {
    expect(parseBillingCheckout({ transactionId: txn, reused: true, secret: 'private' })).toEqual({ transactionId: txn, reused: true });
    expect(() => parseBillingCheckout({ transactionId: txn, reused: 'false' })).toThrow();
    expect(() => parseBillingCheckout({ transactionId: 'txn_fake', reused: false })).toThrow();
  });
});
