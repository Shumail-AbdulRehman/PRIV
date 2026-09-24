import { prisma } from "../prisma/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { companyHasPaidAccess } from "./paddleFulfillment.service.js";

export type PlanCode = "STARTER" | "PRO" | "ADVANCED";
export type PlanFeature =
  | "managerAccess"
  | "automaticAssignment"
  | "automaticReassignment"
  | "multiAreaTasks"
  | "verificationInsights";
export type LimitedResource = "locations" | "staff" | "managers";

type PlanDefinition = {
  code: PlanCode;
  name: string;
  description: string;
  limits: {
    locations: number;
    staff: number;
    managers: number;
    referenceImagesPerTask: number;
  };
  features: Record<PlanFeature, boolean>;
  featureLabels: string[];
};

export const PLAN_DEFINITIONS: Record<PlanCode, PlanDefinition> = {
  STARTER: {
    code: "STARTER",
    name: "Starter",
    description: "For individuals and very small cleaning teams.",
    limits: { locations: 1, staff: 3, managers: 1, referenceImagesPerTask: 1 },
    features: {
      managerAccess: false,
      automaticAssignment: false,
      automaticReassignment: false,
      multiAreaTasks: false,
      verificationInsights: false,
    },
    featureLabels: [
      "GPS attendance and selfies",
      "Daily and one-time tasks",
      "QR-based task starting",
      "Single-area reference verification",
      "Core operational dashboard",
    ],
  },
  PRO: {
    code: "PRO",
    name: "Pro",
    description: "For small cleaning companies managing multiple teams.",
    limits: { locations: 5, staff: 25, managers: 3, referenceImagesPerTask: 5 },
    features: {
      managerAccess: true,
      automaticAssignment: true,
      automaticReassignment: true,
      multiAreaTasks: true,
      verificationInsights: true,
    },
    featureLabels: [
      "Everything in Starter",
      "Manager location access",
      "Automatic assignment and reassignment",
      "Up to 5 reference areas per task",
      "AI and image verification insights",
      "Staff and location performance views",
    ],
  },
  ADVANCED: {
    code: "ADVANCED",
    name: "Enterprise",
    description: "For larger cleaning operations with more locations and staff.",
    limits: { locations: 20, staff: 200, managers: 20, referenceImagesPerTask: 10 },
    features: {
      managerAccess: true,
      automaticAssignment: true,
      automaticReassignment: true,
      multiAreaTasks: true,
      verificationInsights: true,
    },
    featureLabels: [
      "Everything in Pro",
      "Up to 10 reference areas per task",
      "Higher location, staff, and manager limits",
      "Detailed verification attempts and scores",
      "Assignment and reassignment history",
      "Multi-timezone and overnight-shift support",
    ],
  },
};

const resourceLabels: Record<LimitedResource, string> = {
  locations: "locations",
  staff: "staff members",
  managers: "manager accounts (including the company admin)",
};

export const getCompanyPlan = async (companyId: number) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      plan: true,
      subscriptionStatus: true,
      planUpdatedAt: true,
      billingCustomerId: true,
      billingSubscriptionId: true,
    },
  });

  if (!company) throw new ApiError(404, "Company not found");

  return {
    company,
    definition: PLAN_DEFINITIONS[company.plan],
  };
};

export const getCompanySubscriptionSummary = async (companyId: number) => {
  const [{ company, definition }, locations, staff, managers] = await Promise.all([
    getCompanyPlan(companyId),
    prisma.location.count({ where: { companyId, isActive: true } }),
    prisma.staff.count({ where: { companyId, isActive: true } }),
    prisma.manager.count({ where: { companyId, isActive: true } }),
  ]);

  return {
    company,
    plan: definition,
    usage: { locations, staff, managers },
    availablePlans: Object.values(PLAN_DEFINITIONS),
  };
};

export const assertCompanyCanAdd = async (
  companyId: number,
  resource: LimitedResource
) => {
  const { company, definition } = await getCompanyPlan(companyId);

  const hasAccess = company.billingSubscriptionId
    ? await companyHasPaidAccess(companyId)
    : company.subscriptionStatus === "ACTIVE";
  if (!hasAccess) {
    throw new ApiError(403, "Your subscription is not active. Contact your company administrator.");
  }

  const current = resource === "locations"
    ? await prisma.location.count({ where: { companyId, isActive: true } })
    : resource === "staff"
      ? await prisma.staff.count({ where: { companyId, isActive: true } })
      : await prisma.manager.count({ where: { companyId, isActive: true } });
  const limit = definition.limits[resource];

  if (current >= limit) {
    throw new ApiError(
      403,
      `${definition.name} allows up to ${limit} ${resourceLabels[resource]}. Upgrade your plan to add more.`
    );
  }
};

export const assertReferenceImageAllowance = async (companyId: number, count: number) => {
  const { company, definition } = await getCompanyPlan(companyId);
  const hasAccess = company.billingSubscriptionId
    ? await companyHasPaidAccess(companyId)
    : company.subscriptionStatus === "ACTIVE";
  if (!hasAccess) {
    throw new ApiError(403, "Your subscription is not active. Contact your company administrator.");
  }
  const limit = definition.limits.referenceImagesPerTask;

  if (count > limit) {
    throw new ApiError(
      403,
      `${definition.name} allows up to ${limit} reference ${limit === 1 ? "area" : "areas"} per task. Upgrade your plan to add more.`
    );
  }
};

export const companyHasFeature = async (companyId: number, feature: PlanFeature) => {
  const { company, definition } = await getCompanyPlan(companyId);
  const hasAccess = company.billingSubscriptionId
    ? await companyHasPaidAccess(companyId)
    : company.subscriptionStatus === "ACTIVE";
  return hasAccess && definition.features[feature];
};
