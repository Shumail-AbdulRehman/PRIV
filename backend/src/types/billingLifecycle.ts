/** Public JSON DTOs only. No Prisma rows, secrets, card fields or portal history. */
export type BillingPlanCode = 'STARTER' | 'PRO' | 'ADVANCED';
export type BillingInterval = 'month' | 'year';
export type CheckoutReadiness = 'UNKNOWN' | 'BILLING_DISABLED' | 'OWNER_VERIFICATION_REQUIRED' | 'COMPANY_RESTRICTED' | 'RECONCILIATION_PENDING' | 'LINKED_SUBSCRIPTION' | 'READY';
export type BillingCheckoutResume = { plan: BillingPlanCode; interval: BillingInterval; transactionId: string };
export type BillingCapacity = { locations: number; staff: number; managers: number };
export type BillingLifecycleDto = {
  company: { id: number; name: string; plan: BillingPlanCode; isActive: boolean; operationalStatus: 'ACTIVE' | 'SUSPENDED' };
  usage: BillingCapacity;
  limits: BillingCapacity;
  subscription: null | {
    status: string; plan: BillingPlanCode | null; catalogQualified: boolean;
    priceId?: string | null; interval?: BillingInterval | null;
    periodStart: string | null; periodEnd: string | null;
    scheduledChangeAction: string | null; scheduledChangeAt: string | null; lastEventAt: string;
  };
  reconciliationRequired: boolean; billingConfigured: boolean; ownerVerified: boolean;
  billingEnvironment?: 'sandbox' | 'production' | null; onboardingRequired?: boolean;
  providerState: 'MIRRORED' | 'AWAITING_PROVIDER' | 'NOT_LINKED';
  portalAvailable: boolean; checkoutAvailable: boolean;
  workspaceAccessAllowed?: boolean; checkoutReadiness?: CheckoutReadiness;
  checkoutResume?: BillingCheckoutResume | null;
};
export type BillingCatalogEntryDto = {
  plan: BillingPlanCode; interval: BillingInterval; priceId: string; productId: string;
  amount: string; currencyCode: string;
  trialPeriod: null | { interval: string; frequency: number; requiresPaymentMethod?: boolean | null };
};
export type BillingCheckoutDto = { transactionId: string; reused: boolean };
