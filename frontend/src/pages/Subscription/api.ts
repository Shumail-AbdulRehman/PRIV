import { client } from "@/api/client";
import type { ApiEnvelope, PricingContext, SubscriptionSummary, BillingLifecycle } from "./types";

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

export async function getBillingLifecycle(signal?:AbortSignal) {
 return (await client.get<ApiEnvelope<BillingLifecycle>>('/subscription/manage/lifecycle',{signal})).data.data;
}

export async function getBillingCatalog(signal?:AbortSignal) {
 return (await client.get<ApiEnvelope<import('./types').BillingCatalogEntry[]>>('/subscription/manage/catalog',{signal})).data.data;
}
export async function prepareBillingCheckout(plan:import('./types').PlanCode, interval:'month'|'year', signal?:AbortSignal) {
 return (await client.post<ApiEnvelope<import('./types').BillingCheckout>>('/subscription/manage/checkout',{plan,interval},{signal})).data.data;
}
export async function prepareBillingPortal(signal?:AbortSignal) {
 return (await client.post<ApiEnvelope<{url:string}>>('/subscription/manage/managed-portal',{}, {signal})).data.data;
}
export function navigateToBillingPortal(value:string) {
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.port||!['customer-portal.paddle.com','sandbox-customer-portal.paddle.com'].includes(url.hostname))throw new Error('Billing portal unavailable');
 window.location.assign(url.toString());
}
