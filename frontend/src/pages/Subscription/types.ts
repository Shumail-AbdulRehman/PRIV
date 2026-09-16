export type PlanCode = "STARTER" | "PRO" | "ADVANCED";

export type PlanDefinition = {
  code: PlanCode;
  name: string;
  description: string;
  limits: {
    locations: number;
    staff: number;
    managers: number;
    referenceImagesPerTask: number;
  };
  features: {
    managerAccess: boolean;
    automaticAssignment: boolean;
    automaticReassignment: boolean;
    multiAreaTasks: boolean;
    verificationInsights: boolean;
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
