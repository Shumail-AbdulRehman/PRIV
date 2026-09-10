import { client } from "@/api/client";
import type { ApiEnvelope, PricingContext, SubscriptionSummary } from "./types";

export const getPricingContext = async () => {
  const response = await client.get<ApiEnvelope<PricingContext>>("/subscription/pricing-context");
  return response.data.data;
};

export const getSubscription = async () => {
  const response = await client.get<ApiEnvelope<SubscriptionSummary>>("/subscription");
  return response.data.data;
};

export const createCustomerPortalSession = async () => {
  const response = await client.post<ApiEnvelope<{ url: string }>>("/subscription/portal-session");
  return response.data.data;
};
