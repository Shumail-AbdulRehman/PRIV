import type { BillingCheckoutResume, PlanCode, PlanDefinition, ValidatedBillingLifecycle } from '../types';
import { parseBillingLifecycle } from './billingContract';

export type BillingOwnerScope = { companyId: number; ownerId: number };
export type BillingViewKind = 'checking' | 'choose-plan' | 'resume' | 'pending' | 'confirmed' | 'existing' | 'restricted' | 'unavailable' | 'uncertain';
export type BillingViewInput = {
  owner: BillingOwnerScope | null;
  /** Identity attached to the query result, never inferred from the current owner. */
  dataOwner: BillingOwnerScope | null;
  data?: unknown;
  read: 'loading' | 'fresh' | 'stale' | 'error';
  httpStatus?: number;
  uncertain?: boolean;
  activationReturn?: boolean;
};
export type BillingViewState = {
  kind: BillingViewKind;
  reason: 'loading' | 'identity' | 'denied' | 'stale' | 'error' | 'invalid' | 'server' | 'unknown';
  data: ValidatedBillingLifecycle | null;
  canChoosePlan: boolean;
  canOpenWorkspace: boolean;
  canOpenPortal: boolean;
  resume: BillingCheckoutResume | null;
};

/** Display decisions only. No clock, permission reconstruction, mutation or storage. */
export function deriveBillingViewState(input: BillingViewInput): BillingViewState {
  const state = (kind: BillingViewKind, reason: BillingViewState['reason'], data: ValidatedBillingLifecycle | null = null): BillingViewState => ({
    kind, reason, data, canChoosePlan: kind === 'choose-plan', canOpenWorkspace: kind === 'confirmed',
    canOpenPortal: input.read === 'fresh' && !!data?.portalAvailable,
    resume: kind === 'resume' ? data?.checkoutResume ?? null : null,
  });
  const validScope = (scope: BillingOwnerScope | null): scope is BillingOwnerScope => !!scope &&
    Number.isSafeInteger(scope.companyId) && scope.companyId > 0 && Number.isSafeInteger(scope.ownerId) && scope.ownerId > 0;
  if (!validScope(input.owner)) return state('unavailable', 'identity');
  if (input.httpStatus === 401 || input.httpStatus === 403) return state('unavailable', 'denied');
  if (input.read === 'loading') return state('checking', 'loading');
  if (!validScope(input.dataOwner) || input.owner.companyId !== input.dataOwner.companyId || input.owner.ownerId !== input.dataOwner.ownerId) return state('unavailable', 'identity');
  let data: ValidatedBillingLifecycle;
  try { data = parseBillingLifecycle(input.data); } catch { return state('unavailable', 'invalid'); }
  if (data.company.id !== input.owner.companyId) return state('unavailable', 'identity');
  if (input.read === 'error') return state('unavailable', 'error', data);
  if (input.read === 'stale') return state('unavailable', 'stale', data);
  if (!data.company.isActive || data.company.operationalStatus !== 'ACTIVE' || data.checkoutReadiness === 'COMPANY_RESTRICTED') return state('restricted', 'server', data);
  if (data.reconciliationRequired || data.checkoutReadiness === 'RECONCILIATION_PENDING') return state('uncertain', 'server', data);
  if (data.workspaceAccessAllowed) return state('confirmed', 'server', data);
  if (input.uncertain) return state('uncertain', 'unknown', data);
  if (data.subscription?.status === 'unknown') return state('pending', 'server', data);
  if (data.subscription || data.providerState === 'MIRRORED' || data.checkoutReadiness === 'LINKED_SUBSCRIPTION') return state('existing', 'server', data);
  if (data.billingConfigured && data.checkoutAvailable && data.checkoutReadiness === 'READY') {
    if (data.checkoutResume) return state('resume', 'server', data);
    if (!input.activationReturn) return state('choose-plan', 'server', data);
  }
  if (input.activationReturn || data.providerState === 'AWAITING_PROVIDER') return state('pending', 'unknown', data);
  return state('unavailable', data.checkoutReadiness === 'UNKNOWN' ? 'unknown' : 'server', data);
}

/** Reuse API-supplied plan capacities; only the public Enterprise label is adapted. */
export function billingPlanDefinition(plans: readonly PlanDefinition[], code: PlanCode): PlanDefinition | null {
  const matches = plans.filter((plan) => plan.code === code);
  if (matches.length !== 1) return null;
  return { ...matches[0], name: code === 'ADVANCED' ? 'Enterprise' : matches[0].name };
}
