import { client } from "@/api/client";
import { parseBillingLifecycle, parseBillingCatalog, parseBillingCheckout } from './onboarding/billingContract';
import type { ApiEnvelope, PricingContext, SubscriptionSummary } from "./types";

export const getPricingContext = async () => {
  const response = await client.get<ApiEnvelope<PricingContext>>("/subscription/pricing-context");
  return response.data.data;
};

export const getSubscription = async (signal?: AbortSignal, companyId?: number) => {
  const response = await client.get<ApiEnvelope<SubscriptionSummary>>("/subscription", { signal });
  signal?.throwIfAborted();
  if (companyId !== undefined && response.data.data.company.id !== companyId) throw new Error('Billing response is unavailable');
  return response.data.data;
};

export const createCustomerPortalSession = async () => {
  const response = await client.post<ApiEnvelope<{ url: string }>>("/subscription/portal-session");
  return response.data.data;
};

export async function getBillingLifecycle(signal?: AbortSignal, companyId?: number) {
 const raw = (await client.get<ApiEnvelope<unknown>>('/subscription/manage/lifecycle', {signal})).data.data;
 signal?.throwIfAborted();
 const result = parseBillingLifecycle(raw);
 if (companyId !== undefined && result.company.id !== companyId) throw new Error('Billing response is unavailable');
 return result;
}
export async function getBillingCatalog(signal?: AbortSignal) {
 const raw = (await client.get<ApiEnvelope<unknown>>('/subscription/manage/catalog', {signal})).data.data;
 signal?.throwIfAborted();
 return parseBillingCatalog(raw);
}
export async function prepareBillingCheckout(plan:import('./types').PlanCode, interval:'month'|'year', signal?:AbortSignal) {
 const raw = (await client.post<ApiEnvelope<unknown>>('/subscription/manage/checkout', {plan,interval}, {signal})).data.data;
 signal?.throwIfAborted();
 return parseBillingCheckout(raw);
}
function approvedPortal(value: unknown): string {
 try {
  if (typeof value !== 'string' || /[\s\\]/.test(value)) throw new Error();
  const url = new URL(value);
  // Explicit ports (including :443 normalized away by URL) are not accepted.
  const authority = value.match(/^https:\/\/([^/?#]+)/)?.[1];
  if (!authority || authority.includes(':') || url.protocol !== 'https:' || url.username || url.password || url.port ||
   !['customer-portal.paddle.com','sandbox-customer-portal.paddle.com'].includes(url.hostname)) throw new Error();
  return url.toString();
 } catch { throw new Error('Billing portal unavailable'); }
}
export async function prepareBillingPortal(signal?:AbortSignal) {
 const raw = (await client.post<ApiEnvelope<{url:unknown}>>('/subscription/manage/managed-portal', {}, {signal})).data.data;
 signal?.throwIfAborted();
 return {url: approvedPortal(raw?.url)};
}
export function navigateToBillingPortal(value:string) {
 window.location.assign(approvedPortal(value));
}
