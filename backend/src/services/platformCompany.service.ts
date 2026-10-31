import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { configuredPlanForPrice, requireBillingActivation } from '../config/paddle.js';
import { evaluateAccountAccess } from './accountAccess.service.js';
import { writeAuditLog } from './auditLog.service.js';
import type { OperatorPrincipal } from './operatorIdentity.service.js';

type Db = typeof prisma;
const integer = z.number().int().min(1).max(2147483647);
const query = z.object({
    q: z.string().trim().max(100).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
    after: z.string().regex(/^[1-9]\d{0,9}$/).transform(Number).pipe(integer).optional(),
    limit: z.string().regex(/^[1-9]\d?$/).transform(Number).pipe(z.number().max(50)).optional(),
}).strict();
const change = z.object({
    operationalStatus: z.enum(['ACTIVE', 'SUSPENDED']),
    expectedVersion: z.number().int().min(0).max(2147483646),
    reason: z.string().trim().min(1).max(500).refine(value => !/[\u0000-\u001f\u007f]/.test(value)),
}).strict();
const companySelect = {
    id: true, name: true, plan: true, isActive: true, operationalStatus: true,
    accountVersion: true, createdAt: true, updatedAt: true,
    _count: { select: {
        managers: { where: { isActive: true, role: 'MANAGER' } },
        staff: { where: { isActive: true } },
        locations: { where: { isActive: true } },
    } },
} satisfies Prisma.CompanySelect;
type Summary = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;
// Explicit DTO construction remains mandatory even when a DB adapter returns extra fields.
const summary = (company: Summary) => ({ id: company.id, name: company.name, plan: company.plan,
    isActive: company.isActive, operationalStatus: company.operationalStatus, accountVersion: company.accountVersion,
    createdAt: company.createdAt, updatedAt: company.updatedAt,
    counts: { managers: company._count.managers, staff: company._count.staff, locations: company._count.locations } });
function operator(actor: OperatorPrincipal) {
    if (!actor || actor.kind !== 'PLATFORM_OPERATOR' || typeof actor.issuer !== 'string' || !actor.issuer.trim() ||
        typeof actor.subject !== 'string' || !actor.subject.trim()) throw new ApiError(403, 'Platform operator required');
}
function companyId(raw: unknown) {
    const parsed = typeof raw === 'string' && /^[1-9]\d{0,9}$/.test(raw) ? Number(raw) : raw;
    if (!integer.safeParse(parsed).success) throw new ApiError(400, 'Invalid company identifier');
    return parsed as number;
}
const conflict = () => new ApiError(409, 'Company account changed. Reload before trying again.');

export async function listPlatformCompanies(actor: OperatorPrincipal, raw: unknown = {}, db: Db = prisma) {
    operator(actor);
    const parsed = query.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'Invalid company filters');
    const { q, status, after, limit = 25 } = parsed.data;
    const rows = await db.company.findMany({ where: {
        ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
        ...(status ? { operationalStatus: status } : {}), ...(after ? { id: { gt: after } } : {}),
    }, select: companySelect, orderBy: { id: 'asc' }, take: limit + 1 });
    const more = rows.length > limit, page = rows.slice(0, limit);
    return { items: page.map(summary), nextCursor: more ? String(page.at(-1)!.id) : null };
}

export async function getPlatformCompany(actor: OperatorPrincipal, rawId: unknown, db: Db = prisma) {
    operator(actor); const id = companyId(rawId);
    // A coherent local mirror snapshot; no live provider requests or guessed freshness guarantees.
    return db.$transaction(async tx => {
        const company = await tx.company.findUnique({ where: { id }, select: { ...companySelect,
            subscriptionStatus: true, billingCustomerId: true, billingSubscriptionId: true, suspendedAt: true, suspensionReason: true,
        } });
        if (!company) throw new ApiError(404, 'Company account not found');
        const sub = company.billingCustomerId && company.billingSubscriptionId ? await tx.paddleSubscription.findFirst({
            where: { id: company.billingSubscriptionId, companyId: id, customerId: company.billingCustomerId },
            select: { status: true, priceId: true, currentBillingPeriodStart: true, currentBillingPeriodEnd: true,
                canceledAt: true, pausedAt: true, scheduledChangeAction: true, scheduledChangeAt: true, lastEventAt: true, updatedAt: true },
        }) : null;
        let billingConfigured = false;
        try { requireBillingActivation(); billingConfigured = true; } catch { /* Explicit configuration boundary. */ }
        let operationalReadAllowed = false;
        try { evaluateAccountAccess({ company, subscription: null }, 'ADMIN', 'READ_OPERATIONAL'); operationalReadAllowed = true; }
        catch (error) { if (!(error instanceof ApiError) || error.statusCode !== 403) throw error; }
        const plan = sub ? configuredPlanForPrice(sub.priceId) : undefined;
        // Activity is only platform status audit, never arbitrary tenant audit JSON.
        const activity = await tx.auditLog.findMany({ where: { companyId: id, entityType: 'COMPANY_ACCOUNT', entityId: id,
            actorType: 'PLATFORM_OPERATOR', action: { in: ['COMPANY_SUSPENDED', 'COMPANY_REACTIVATED'] } },
            select: { id: true, action: true, reason: true, createdAt: true }, orderBy: { id: 'desc' }, take: 20 });
        return { company: { ...summary(company), suspendedAt: company.suspendedAt, suspensionReason: company.suspensionReason },
            operationalReadAllowed, billingConfigured, mirroredSubscriptionStatus: company.subscriptionStatus,
            providerState: sub ? 'MIRRORED' : company.billingCustomerId ? 'AWAITING_PROVIDER' : 'NOT_LINKED',
            subscription: sub ? { status: sub.status, plan: plan ?? null, catalogQualified: !!plan,
                periodStart: sub.currentBillingPeriodStart, periodEnd: sub.currentBillingPeriodEnd,
                canceledAt: sub.canceledAt, pausedAt: sub.pausedAt, scheduledChangeAction: sub.scheduledChangeAction,
                scheduledChangeAt: sub.scheduledChangeAt, lastEventAt: sub.lastEventAt, mirroredAt: sub.updatedAt } : null,
            activity: activity.map(row => ({ id: row.id, action: row.action, reason: row.reason, createdAt: row.createdAt })),
        };
    }, { isolationLevel: 'RepeatableRead' });
}

export async function setPlatformCompanyStatus(actor: OperatorPrincipal, rawId: unknown, raw: unknown, db: Db = prisma) {
    operator(actor); const id = companyId(rawId), parsed = change.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'A status, current version and reason are required');
    const input = parsed.data;
    return db.$transaction(async tx => {
        // Same company-first lock order as billing and capacity mutations.
        await tx.$queryRaw`SELECT id FROM "Company" WHERE id=${id} FOR UPDATE`;
        const company = await tx.company.findUnique({ where: { id }, select: companySelect });
        if (!company) throw new ApiError(404, 'Company account not found');
        if (company.accountVersion !== input.expectedVersion) throw conflict();
        if (input.operationalStatus === 'ACTIVE' && !company.isActive) throw new ApiError(409, 'Inactive legacy account requires review before reactivation');
        if (company.operationalStatus === input.operationalStatus) return { company: summary(company), changed: false };
        const suspended = input.operationalStatus === 'SUSPENDED';
        const update = await tx.company.updateMany({ where: { id, accountVersion: input.expectedVersion }, data: {
            operationalStatus: input.operationalStatus, accountVersion: { increment: 1 },
            suspendedAt: suspended ? new Date() : null, suspensionReason: suspended ? input.reason : null,
        } });
        if (update.count !== 1) throw conflict();
        const updated = await tx.company.findUniqueOrThrow({ where: { id }, select: companySelect });
        await writeAuditLog({ companyId: id, actorType: 'PLATFORM_OPERATOR', actorId: null, entityType: 'COMPANY_ACCOUNT', entityId: id,
            action: suspended ? 'COMPANY_SUSPENDED' : 'COMPANY_REACTIVATED', reason: input.reason,
            oldValue: { operationalStatus: company.operationalStatus, accountVersion: company.accountVersion },
            newValue: { operationalStatus: updated.operationalStatus, accountVersion: updated.accountVersion,
                operator: { issuer: actor.issuer, subject: actor.subject } },
        }, tx);
        return { company: summary(updated), changed: true };
    });
}
