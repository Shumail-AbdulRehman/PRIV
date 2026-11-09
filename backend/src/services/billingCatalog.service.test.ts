import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Price, Product } from '@paddle/paddle-node-sdk';
import { createBillingCatalog } from './billingCatalog.service.js';

vi.mock('../prisma/prisma.js', () => ({ prisma: {} }));
const priceId = 'pri_00000000000000000000000001';
const productId = 'pro_00000000000000000000000001';
const actor = { id: 1, companyId: 42, role: 'ADMIN' as const };
const entry = { plan: 'STARTER', interval: 'month', priceId };
function fixture() {
    let time = 0;
    const price = { id: priceId, productId, status: 'active', billingCycle: { interval: 'month', frequency: 1 },
        unitPrice: { amount: '1234', currencyCode: 'USD' }, trialPeriod: null };
    const prices = { get: vi.fn().mockResolvedValue(price) };
    const products = { get: vi.fn().mockResolvedValue({ id: productId, status: 'active' }) };
    const owner = vi.fn().mockResolvedValue({ company: { id: 42 } });
    const log = vi.fn();
    const read = createBillingCatalog({
        db: { manager: { findFirst: owner } } as unknown as NonNullable<Parameters<typeof createBillingCatalog>[0]>['db'],
        provider: { prices: { get: prices.get }, products: { get: products.get } } as NonNullable<Parameters<typeof createBillingCatalog>[0]>['provider'],
        now: () => new Date(time), log,
    });
    return { read, price, prices, products, owner, log, advance: (ms: number) => { time += ms; } };
}
beforeEach(() => {
    vi.stubEnv('PADDLE_ENVIRONMENT', 'sandbox');
    vi.stubEnv('PADDLE_BILLING_ENABLED', 'true');
    vi.stubEnv('PADDLE_API_KEY', 'isolated-credential-fixture-000000000000000');
    vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([entry]));
});
afterEach(() => vi.unstubAllEnvs());

describe('trial-free billing catalog', () => {
    it('returns only configured selection and verified provider money/product facts', async () => {
        const f = fixture();
        expect(await f.read(actor)).toEqual([{ ...entry, productId, amount: '1234', currencyCode: 'USD' }]);
        expect(f.prices.get).toHaveBeenCalledWith(priceId);
        expect(f.products.get).toHaveBeenCalledWith(productId);
        expect(f.owner).toHaveBeenCalledWith({ where: { id: 1, companyId: 42, role: 'ADMIN', isActive: true },
            select: { company: { select: { id: true } } } });
    });
    it.each([{ interval: 'day', frequency: 14 }, { interval: 'month', frequency: 1, requiresPaymentMethod: true },
        {}, false, 0, '', { interval: 'bad', frequency: -1 }])('refuses any trial metadata: %j', async trialPeriod => {
        const f = fixture(); f.prices.get.mockResolvedValue({ ...f.price, trialPeriod });
        await expect(f.read(actor)).rejects.toMatchObject({ statusCode: 503, code: 'PRICE_HAS_TRIAL', recoveryReason: 'PRICE_NOT_READY' });
        expect(f.log).toHaveBeenCalledExactlyOnceWith({ event: 'BILLING_CATALOG_FAILED', errorClass: 'BillingCatalogError', providerCode: 'PRICE_HAS_TRIAL' });
        expect(f.products.get).not.toHaveBeenCalled();
    });
    it.each([
        { id: 'pri_other' }, { status: 'archived' }, { billingCycle: null }, { billingCycle: { interval: 'year', frequency: 1 } },
        { billingCycle: { interval: 'month', frequency: 2 } }, { unitPrice: null },
        ...['', '-1', '1.5', 'NaN', 123].map(amount => ({ unitPrice: { amount, currencyCode: 'USD' } })),
        ...['usd', 'US', '', null].map(currencyCode => ({ unitPrice: { amount: '1234', currencyCode } })),
    ])('preserves price validation: %j', async patch => {
        const f = fixture(); f.prices.get.mockResolvedValue({ ...f.price, ...patch });
        await expect(f.read(actor)).rejects.toMatchObject({ code: 'PRICE_NOT_READY', recoveryReason: 'PRICE_NOT_READY' });
    });
    it.each([{ id: 'pro_other', status: 'active' }, { id: productId, status: 'archived' }])('preserves product validation: %j', async product => {
        const f = fixture(); f.products.get.mockResolvedValue(product);
        await expect(f.read(actor)).rejects.toMatchObject({ code: 'PRICE_NOT_READY' });
    });
    it('accepts zero and large integer strings without local arithmetic', async () => {
        const f = fixture(); f.prices.get.mockResolvedValue({ ...f.price, unitPrice: { amount: '0', currencyCode: 'PKR' } });
        expect((await f.read(actor))[0]).toMatchObject({ amount: '0', currencyCode: 'PKR' });
        f.advance(60_000); f.prices.get.mockResolvedValue({ ...f.price, unitPrice: { amount: '999999999999999999999', currencyCode: 'USD' } });
        expect((await f.read(actor))[0].amount).toBe('999999999999999999999');
    });
    it('hits within 60 seconds and expires at the exact boundary', async () => {
        const f = fixture(); await f.read(actor); f.advance(59_999); await f.read(actor);
        expect(f.prices.get).toHaveBeenCalledTimes(1);
        f.advance(1); await f.read(actor);
        expect(f.prices.get).toHaveBeenCalledTimes(2); expect(f.products.get).toHaveBeenCalledTimes(2);
    });
    it('isolates caller mutations from cached values', async () => {
        const f = fixture(); const result = await f.read(actor); result[0].amount = 'wrong'; result.pop();
        expect((await f.read(actor))[0].amount).toBe('1234');
    });
    it.each(['price', 'product', 'trial', 'validation'])('does not cache %s failures', async failure => {
        const f = fixture();
        if (failure === 'price') f.prices.get.mockRejectedValueOnce(new Error('synthetic provider failure'));
        if (failure === 'product') f.products.get.mockRejectedValueOnce(new Error('synthetic provider failure'));
        if (failure === 'trial') f.prices.get.mockResolvedValueOnce({ ...f.price, trialPeriod: {} });
        if (failure === 'validation') f.prices.get.mockResolvedValueOnce({ ...f.price, status: 'archived' });
        await expect(f.read(actor)).rejects.toThrow();
        expect((await f.read(actor))[0].amount).toBe('1234'); expect(f.prices.get).toHaveBeenCalledTimes(2);
    });
    it('shares a full set of calls among concurrent reads', async () => {
        const f = fixture();
        vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([entry, { plan: 'PRO', interval: 'year', priceId: 'pri_00000000000000000000000002' }]));
        let release!: () => void;
        const wait = new Promise<void>(resolve => { release = resolve; });
        f.prices.get.mockImplementation(async (id: string): Promise<Price> => {
            await wait; return { ...f.price, id, billingCycle: { interval: id === priceId ? 'month' : 'year', frequency: 1 } } as Price;
        });
        const reads = [f.read(actor), f.read(actor), f.read(actor)];
        await vi.waitFor(() => expect(f.prices.get).toHaveBeenCalledTimes(2)); release();
        const results = await Promise.all(reads);
        expect(results[0]).toHaveLength(2); expect(results[1]).toEqual(results[0]);
        expect(f.products.get).toHaveBeenCalledTimes(2);
    });
    it('starts TTL at successful completion', async () => {
        const f = fixture(); f.products.get.mockImplementationOnce(async (): Promise<Product> => {
            f.advance(20_000); return { id: productId, status: 'active' } as Product;
        });
        await f.read(actor); f.advance(59_999); await f.read(actor); expect(f.prices.get).toHaveBeenCalledTimes(1);
        f.advance(1); await f.read(actor); expect(f.prices.get).toHaveBeenCalledTimes(2);
    });
    it.each(['catalog', 'environment'])('invalidates cache on %s change', async kind => {
        const f = fixture(); await f.read(actor);
        if (kind === 'environment') vi.stubEnv('PADDLE_ENVIRONMENT', 'production');
        else vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ ...entry, plan: 'PRO' }]));
        const result = await f.read(actor); expect(f.prices.get).toHaveBeenCalledTimes(2);
        if (kind === 'catalog') expect(result[0].plan).toBe('PRO');
    });
    it('does not let an old in-flight configuration overwrite a new cache', async () => {
        const f = fixture(); let release!: (value: unknown) => void;
        f.prices.get.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
        const old = f.read(actor); await vi.waitFor(() => expect(f.prices.get).toHaveBeenCalledTimes(1));
        vi.stubEnv('PADDLE_PRICE_CATALOG_JSON', JSON.stringify([{ ...entry, plan: 'PRO' }]));
        expect((await f.read(actor))[0].plan).toBe('PRO'); release(f.price); await old;
        expect((await f.read(actor))[0].plan).toBe('PRO'); expect(f.prices.get).toHaveBeenCalledTimes(2);
    });
    it.each(['MANAGER', 'STAFF'] as const)('rejects %s before all I/O', async role => {
        const f = fixture(); await expect(f.read({ ...actor, role })).rejects.toMatchObject({ statusCode: 403 });
        expect(f.owner).not.toHaveBeenCalled(); expect(f.prices.get).not.toHaveBeenCalled();
    });
    it.each([null, { company: { id: 99 } }])('checks active owner scope on cache hits: %j', async owner => {
        const f = fixture(); await f.read(actor); f.owner.mockResolvedValue(owner);
        await expect(f.read(actor)).rejects.toMatchObject({ statusCode: 403 }); expect(f.prices.get).toHaveBeenCalledTimes(1);
    });
    it.each(['PADDLE_BILLING_ENABLED', 'PADDLE_API_KEY', 'PADDLE_PRICE_CATALOG_JSON', 'PADDLE_ENVIRONMENT'])('checks %s on cached reads', async key => {
        const f = fixture(); await f.read(actor); vi.stubEnv(key, '');
        await expect(f.read(actor)).rejects.toMatchObject({ statusCode: 503 }); expect(f.prices.get).toHaveBeenCalledTimes(1);
    });
});
