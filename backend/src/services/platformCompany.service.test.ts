import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPlatformCompany, listPlatformCompanies, setPlatformCompanyStatus } from './platformCompany.service.js';
import type { OperatorPrincipal } from './operatorIdentity.service.js';

const actor: OperatorPrincipal = { kind: 'PLATFORM_OPERATOR', issuer: 'https://identity.example.test/', subject: 'synthetic-operator' };
const date = new Date('2026-10-20T00:00:00Z');
function harness() {
    let company: any = { id: 1, name: 'Synthetic company', plan: 'STARTER', isActive: true, operationalStatus: 'ACTIVE', accountVersion: 0,
        createdAt: date, updatedAt: date, subscriptionStatus: 'CANCELLED', billingCustomerId: null, billingSubscriptionId: null,
        suspendedAt: null, suspensionReason: null, password: 'PRIVATE', staff: ['PRIVATE'], verificationPolicy: { secret: 'PRIVATE' } };
    let audits: any[] = [];
    const tx = {
        $queryRaw: vi.fn(async () => []),
        company: {
            findMany: vi.fn(async () => [company]), findUnique: vi.fn(async () => company), findUniqueOrThrow: vi.fn(async () => company),
            updateMany: vi.fn(async ({ data }: any) => {
                company = { ...company, ...data, accountVersion: company.accountVersion + data.accountVersion.increment }; return { count: 1 };
            }),
        },
        paddleSubscription: { findFirst: vi.fn(async (): Promise<any> => null) },
        auditLog: {
            create: vi.fn(async ({ data }: any) => { const row = { ...data, id: audits.length + 1, createdAt: date }; audits.push(row); return row; }),
            findMany: vi.fn(async () => audits),
        },
    };
    const db = { ...tx, $transaction: vi.fn(async (run: any) => {
        const before = { ...company }, prior = [...audits];
        try { return await run(tx); } catch (error) { company = before; audits = prior; throw error; }
    }) };
    return { tx, db: db as any, get company() { return company; }, get audits() { return audits; }, patch: (data: any) => { company = { ...company, ...data }; } };
}
const change = (expectedVersion = 0, operationalStatus = 'SUSPENDED') => ({ expectedVersion, operationalStatus, reason: '  Synthetic review reason  ' });
afterEach(() => vi.unstubAllEnvs());

describe('platform company metadata boundary', () => {
    it.each(['ADMIN', 'MANAGER', 'STAFF', 'SYSTEM'])('denies tenant %s before querying or writing', async role => {
        const h = harness(), tenant = { role, id: 1, companyId: 1 } as unknown as OperatorPrincipal;
        await expect(listPlatformCompanies(tenant, {}, h.db)).rejects.toMatchObject({ statusCode: 403 });
        await expect(getPlatformCompany(tenant, 1, h.db)).rejects.toMatchObject({ statusCode: 403 });
        await expect(setPlatformCompanyStatus(tenant, 1, change(), h.db)).rejects.toMatchObject({ statusCode: 403 });
        expect(h.tx.company.findMany).not.toHaveBeenCalled(); expect(h.db.$transaction).not.toHaveBeenCalled();
    });
    it.each([null, {}, { kind: 'PLATFORM_OPERATOR' }, { ...actor, subject: '' }])('rejects missing or incomplete principal %j', async invalid => {
        await expect(listPlatformCompanies(invalid as OperatorPrincipal, {}, harness().db)).rejects.toMatchObject({ statusCode: 403 });
    });
    it('returns bounded stable cursor paging and explicit commercial DTO only', async () => {
        const h = harness(); h.tx.company.findMany.mockResolvedValueOnce([h.company, { ...h.company, id: 2 }]);
        const result = await listPlatformCompanies(actor, { q: ' Synthetic ', status: 'ACTIVE', after: '4', limit: '1' }, h.db);
        expect(result.nextCursor).toBe('1'); expect(result.items).toHaveLength(1);
        expect(Object.keys(result.items[0]!).sort()).toEqual(['id', 'name', 'plan', 'isActive', 'operationalStatus', 'accountVersion', 'createdAt', 'updatedAt'].sort());
        expect(h.tx.company.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2, orderBy: { id: 'asc' }, where: {
            name: { contains: 'Synthetic', mode: 'insensitive' }, operationalStatus: 'ACTIVE', id: { gt: 4 },
        } }));
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
    });
    it('returns honest empty page and default bound', async () => {
        const h = harness(); h.tx.company.findMany.mockResolvedValueOnce([]);
        expect(await listPlatformCompanies(actor, {}, h.db)).toEqual({ items: [], nextCursor: null });
        expect(h.tx.company.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 26 }));
    });
    it.each([{ limit: '0' }, { limit: '51' }, { limit: 10 }, { limit: ['1'] }, { after: '-1' }, { after: '2147483648' },
        { after: '1.2' }, { q: 'a'.repeat(101) }, { q: {} }, { status: 'DELETED' }, { include: 'staff' }])('rejects unbounded or unsupported filters %j', async input => {
        const h = harness(); await expect(listPlatformCompanies(actor, input, h.db)).rejects.toMatchObject({ statusCode: 400 });
        expect(h.tx.company.findMany).not.toHaveBeenCalled();
    });
    it('shows absent provider/configuration truth and account policy without workforce', async () => {
        vi.stubEnv('PADDLE_BILLING_ENABLED', 'false');
        const h = harness(), result = await getPlatformCompany(actor, '1', h.db);
        expect(result).toMatchObject({ billingConfigured: false, providerState: 'NOT_LINKED', subscription: null, operationalReadAllowed: true, activity: [] });
        expect(h.tx.paddleSubscription.findFirst).not.toHaveBeenCalled();
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
        h.patch({ operationalStatus: 'SUSPENDED' });
        expect(await getPlatformCompany(actor, 1, h.db)).toMatchObject({ operationalReadAllowed: false });
    });
    it('constrains provider mirror to canonical company/customer/subscription and strips extra fields', async () => {
        const h = harness(); h.patch({ billingCustomerId: 'ctm_fixture', billingSubscriptionId: 'sub_fixture' });
        h.tx.paddleSubscription.findFirst.mockResolvedValue({ status: 'active', priceId: 'unknown', currentBillingPeriodStart: date,
            currentBillingPeriodEnd: date, scheduledChangeAt: null, scheduledChangeAction: null, lastEventAt: date, updatedAt: date, secret: 'PRIVATE' });
        h.tx.auditLog.findMany.mockResolvedValueOnce([{ id: 7, action: 'COMPANY_SUSPENDED', reason: 'Synthetic reason', createdAt: date, newValue: { password: 'PRIVATE' } }]);
        const result = await getPlatformCompany(actor, 1, h.db);
        expect(h.tx.paddleSubscription.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'sub_fixture', companyId: 1, customerId: 'ctm_fixture' } }));
        expect(result).toMatchObject({ providerState: 'MIRRORED', subscription: { status: 'active', plan: null, catalogQualified: false } });
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
        expect(h.tx.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20, where: expect.objectContaining({ companyId: 1, actorType: 'PLATFORM_OPERATOR', entityType: 'COMPANY_ACCOUNT' }) }));
    });
    it('does not misrepresent missing mirror as synchronized', async () => {
        const h = harness(); h.patch({ billingCustomerId: 'ctm_fixture', billingSubscriptionId: 'sub_missing' });
        expect(await getPlatformCompany(actor, 1, h.db)).toMatchObject({ providerState: 'AWAITING_PROVIDER', subscription: null });
    });
    it.each([0, -1, 1.1, '01', '1 OR TRUE', '2147483648', undefined])('rejects invalid identifier %s', async id => {
        const h = harness();
        await expect(getPlatformCompany(actor, id, h.db)).rejects.toMatchObject({ statusCode: 400 });
        await expect(setPlatformCompanyStatus(actor, id, change(), h.db)).rejects.toMatchObject({ statusCode: 400 });
        expect(h.db.$transaction).not.toHaveBeenCalled();
    });
    it('returns missing accounts and propagates storage failures without fabricated success', async () => {
        const h = harness(); h.tx.company.findUnique.mockResolvedValue(null);
        await expect(getPlatformCompany(actor, 1, h.db)).rejects.toMatchObject({ statusCode: 404 });
        await expect(setPlatformCompanyStatus(actor, 1, change(), h.db)).rejects.toMatchObject({ statusCode: 404 });
        h.tx.company.findMany.mockRejectedValue(new Error('DB unavailable'));
        await expect(listPlatformCompanies(actor, {}, h.db)).rejects.toThrow('DB unavailable');
    });
});

describe('reasoned versioned platform status transitions', () => {
    it('atomically suspends, preserves billing/legacy activation, and records distinct issuer/subject/reason/time', async () => {
        const h = harness(), before = h.company;
        const result = await setPlatformCompanyStatus(actor, '1', change(), h.db);
        expect(result).toMatchObject({ changed: true, company: { operationalStatus: 'SUSPENDED', accountVersion: 1, isActive: true } });
        expect(h.company).toMatchObject({ subscriptionStatus: before.subscriptionStatus, plan: before.plan, suspensionReason: 'Synthetic review reason', suspendedAt: expect.any(Date) });
        expect(h.audits).toEqual([expect.objectContaining({ companyId: 1, actorType: 'PLATFORM_OPERATOR', actorId: null,
            action: 'COMPANY_SUSPENDED', reason: 'Synthetic review reason', createdAt: date,
            oldValue: { operationalStatus: 'ACTIVE', accountVersion: 0 }, newValue: { operationalStatus: 'SUSPENDED', accountVersion: 1,
                operator: { issuer: actor.issuer, subject: actor.subject } } })]);
        expect(JSON.stringify(result)).not.toContain('PRIVATE');
        expect(h.tx.company.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1, accountVersion: 0 } }));
    });
    it('rejects stale repeated writes and stale reactivation; current-version same state is a no-op', async () => {
        const h = harness(); await setPlatformCompanyStatus(actor, 1, change(), h.db);
        await expect(setPlatformCompanyStatus(actor, 1, change(), h.db)).rejects.toMatchObject({ statusCode: 409 });
        await expect(setPlatformCompanyStatus(actor, 1, change(0, 'ACTIVE'), h.db)).rejects.toMatchObject({ statusCode: 409 });
        expect(await setPlatformCompanyStatus(actor, 1, change(1), h.db)).toMatchObject({ changed: false });
        expect(h.audits).toHaveLength(1); expect(h.company.accountVersion).toBe(1);
    });
    it('reactivates operations while preserving subscription state and prior audit', async () => {
        const h = harness(); await setPlatformCompanyStatus(actor, 1, change(), h.db);
        expect(await setPlatformCompanyStatus(actor, 1, change(1, 'ACTIVE'), h.db)).toMatchObject({ changed: true, company: { accountVersion: 2, operationalStatus: 'ACTIVE' } });
        expect(h.company).toMatchObject({ suspendedAt: null, suspensionReason: null, subscriptionStatus: 'CANCELLED' });
        expect(h.audits.map(row => row.action)).toEqual(['COMPANY_SUSPENDED', 'COMPANY_REACTIVATED']);
    });
    it('refuses legacy inactive account reactivation without altering its activation', async () => {
        const h = harness(); h.patch({ isActive: false, operationalStatus: 'SUSPENDED' });
        await expect(setPlatformCompanyStatus(actor, 1, change(0, 'ACTIVE'), h.db)).rejects.toMatchObject({ statusCode: 409 });
        expect(h.company.isActive).toBe(false); expect(h.audits).toHaveLength(0);
    });
    it('rolls back status and version when audit fails', async () => {
        const h = harness(); h.tx.auditLog.create.mockRejectedValueOnce(new Error('Audit unavailable'));
        await expect(setPlatformCompanyStatus(actor, 1, change(), h.db)).rejects.toThrow('Audit unavailable');
        expect(h.company).toMatchObject({ accountVersion: 0, operationalStatus: 'ACTIVE' }); expect(h.audits).toHaveLength(0);
    });
    it('does not audit a failed conditional update', async () => {
        const h = harness(); h.tx.company.updateMany.mockResolvedValueOnce({ count: 0 });
        await expect(setPlatformCompanyStatus(actor, 1, change(), h.db)).rejects.toMatchObject({ statusCode: 409 });
        expect(h.tx.auditLog.create).not.toHaveBeenCalled();
    });
    it.each([{ reason: '' }, { reason: '  ' }, { reason: 'a'.repeat(501) }, { reason: 'bad\u0000reason' }, { expectedVersion: -1 },
        { expectedVersion: 0.1 }, { expectedVersion: 2147483647 }, { expectedVersion: '0' }, { operationalStatus: 'DELETED' }, { plan: 'ADVANCED' }, { companyId: 2 }])('rejects malformed/financial/forged input %j', async patch => {
        const h = harness(); await expect(setPlatformCompanyStatus(actor, 1, { ...change(), ...patch }, h.db)).rejects.toMatchObject({ statusCode: 400 });
        expect(h.db.$transaction).not.toHaveBeenCalled();
    });
});

describe('platform company route authentication adapter', () => {
    async function request(headers: Record<string, string>, method = 'GET', path = '/', body?: object) {
        const express = (await import('express')).default;
        const router = (await import('../routes/platformCompany.route.js')).default;
        const app = express(); app.use(express.json()); app.use('/companies', router);
        app.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode ?? 500).json({ message: error.message }));
        const server = app.listen(0, '127.0.0.1');
        await new Promise<void>(resolve => server.once('listening', resolve));
        const port = (server.address() as import('node:net').AddressInfo).port;
        try {
            const response = await fetch(`http://127.0.0.1:${port}/companies${path}`, { method, headers: { ...headers, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
            return { status: response.status, cache: response.headers.get('Cache-Control'), body: await response.json() };
        } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
    }
    it.each([['GET', '/'], ['GET', '/1'], ['PATCH', '/1/status']])('denies cookie-only tenant identity for %s %s with no-store', async (method, path) => {
        expect(await request({ Cookie: 'accessToken=tenant-session' }, method, path, method === 'PATCH' ? change() : undefined))
            .toMatchObject({ status: 401, cache: 'private, no-store' });
    });
    it('rejects a signed tenant administrator bearer at the actual operator middleware', async () => {
        const jwt = (await import('jsonwebtoken')).default;
        // Config enables only local verification of the wrong-algorithm denial; no JWKS fetch.
        vi.stubEnv('PLATFORM_OIDC_ISSUER', 'https://identity.example.test/'); vi.stubEnv('PLATFORM_OIDC_AUDIENCE', 'platform');
        vi.stubEnv('PLATFORM_OIDC_JWKS_URL', 'https://identity.example.test/keys'); vi.stubEnv('PLATFORM_OIDC_MFA_ACR', 'fixture');
        vi.stubEnv('PLATFORM_OIDC_SUBJECTS', '["fixture"]');
        const token = jwt.sign({ id: 1, companyId: 1, role: 'ADMIN' }, 'synthetic-tenant-test-key', { algorithm: 'HS256' });
        expect(await request({ Authorization: `Bearer ${token}` })).toMatchObject({ status: 401, cache: 'private, no-store' });
    });
    it('fails unavailable when operator configuration is absent', async () => {
        vi.stubEnv('PLATFORM_OIDC_ISSUER', '');
        expect(await request({ Authorization: 'Bearer a.b.c' })).toMatchObject({ status: 503, body: { message: 'Platform sign-in is unavailable' } });
    });
});
