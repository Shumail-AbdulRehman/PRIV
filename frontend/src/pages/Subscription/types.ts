export type PlanCode = "STARTER" | "PRO" | "ADVANCED";

export type PlanDefinition = {
  code: PlanCode;
  name: string;
  description: string;
  limits: {
    locations: number;
    staff: number;
    managers: number;
  };
  features: {
    managerAccess: boolean;
    automaticAssignment: boolean;
    automaticReassignment: boolean;
    inventoryVerification:boolean;
  };
  featureLabels: string[];
};

export type SubscriptionSummary = {
  company: {
    id: number;
    name: string;
    plan: PlanCode;
    subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELLED";
    planUpdatedAt: string;
    billingCustomerId: string | null;
    billingSubscriptionId: string | null;
  };
  plan: PlanDefinition;
  usage: {
    locations: number;
    staff: number;
    managers: number;
  };
  availablePlans: PlanDefinition[];
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PricingContext = {
  countryCode?: string;
};

export type BillingLifecycle = {
 company:{id:number;name:string;plan:PlanCode;operationalStatus:'ACTIVE'|'SUSPENDED'};
 usage:{locations:number;staff:number;managers:number};
 limits:PlanDefinition['limits'];
 subscription:null|{status:string;plan:PlanCode|null;catalogQualified:boolean;periodStart:string|null;periodEnd:string|null;scheduledChangeAction:string|null;scheduledChangeAt:string|null;lastEventAt:string};
 reconciliationRequired:boolean;billingConfigured:boolean;ownerVerified:boolean;
 providerState:'MIRRORED'|'AWAITING_PROVIDER'|'NOT_LINKED';portalAvailable:boolean;checkoutAvailable:boolean;
};

export type BillingCatalogEntry = {
 plan: PlanCode; interval: 'month' | 'year'; priceId: string; productId: string;
 amount: string; currencyCode: string; trialPeriod: null | {interval: string; frequency: number};
};
export type BillingCheckout = {transactionId: string; reused: boolean};
