import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { createCustomerPortalSession, getPricingContext, getSubscription, getBillingLifecycle, getBillingCatalog } from './api';
import type { BillingLifecycle } from './types';

export const subscriptionQueryKey = ['subscription'] as const;
export const billingLifecycleKey = (companyId?:number, ownerId?:number) => ['billing-lifecycle',companyId,ownerId] as const;
export const billingCatalogKey = (companyId?:number, ownerId?:number) => ['billing-catalog',companyId,ownerId] as const;
const privateFamilies = ['subscription', 'billing-lifecycle', 'billing-catalog'];

function useBillingScope() {
 const { user } = useAuth();
 const client = useQueryClient();
 const companyId = user?.companyId, ownerId = user?.id, role = user?.role;
 useEffect(() => {
  // Also runs on first mount so a former principal's unobserved cache cannot survive.
  const obsolete = { predicate: (query: {queryKey: readonly unknown[]}) => privateFamilies.includes(String(query.queryKey[0])) &&
   (query.queryKey[1] !== companyId || query.queryKey[2] !== ownerId || !role || !['ADMIN','MANAGER'].includes(role) || (query.queryKey[0] !== 'subscription' && role !== 'ADMIN')) };
  void client.cancelQueries(obsolete);
  client.removeQueries(obsolete);
 }, [client, companyId, ownerId, role]);
 return { companyId, ownerId, role };
}
export const usePricingContext = () => useQuery({queryKey:['pricing-context'], queryFn:getPricingContext, staleTime:30*60*1000});
export function useSubscription({poll=false}:{poll?:boolean}={}) {
 const {companyId,ownerId,role} = useBillingScope();
 return useQuery({
  queryKey:[...subscriptionQueryKey,companyId,ownerId],
  queryFn:({signal})=>getSubscription(signal,companyId), enabled:role==='ADMIN'||role==='MANAGER',
  retry:false, gcTime:0, staleTime:0, refetchOnWindowFocus:true,
  refetchInterval:poll ? (query)=>query.state.data?.company.subscriptionStatus==='ACTIVE'?false:3000 : false,
 });
}
export const useCustomerPortalSession = () => useMutation({mutationFn:createCustomerPortalSession,retry:false,gcTime:0});

function pending(data: BillingLifecycle | undefined) {
 return !data || data.reconciliationRequired || data.checkoutReadiness==='RECONCILIATION_PENDING' || data.subscription?.status==='unknown' ||
  (data.providerState==='AWAITING_PROVIDER' && !data.workspaceAccessAllowed);
}
function denied(error: unknown) {
 const status = (error as {response?:{status?:number}} | null)?.response?.status;
 return status===401 || status===403;
}

export function useBillingLifecycle({poll=false}:{poll?:boolean}={}) {
 const {companyId,ownerId,role} = useBillingScope();
 const scope = `${companyId}:${ownerId}:${role}`;
 const client = useQueryClient();
 const query = useQuery({
  queryKey:billingLifecycleKey(companyId,ownerId), queryFn:({signal})=>getBillingLifecycle(signal,companyId),
  enabled:role==='ADMIN', retry:false, retryOnMount:false, staleTime:0, gcTime:0,
  refetchOnWindowFocus:(query)=>!denied(query.state.error), refetchOnReconnect:(query)=>!denied(query.state.error),
 });
 const {isFetching,dataUpdatedAt,errorUpdatedAt,refetch:refetchQuery}=query;
 const attempts = useRef({scope:'',start:0,count:0});
 const [timeoutScope,setTimeoutScope] = useState<string|null>(null);
 const timedOut = timeoutScope===scope;
 const shouldPoll = poll && role==='ADMIN' && pending(query.data) && !denied(query.error);
 useEffect(() => {
  if (!shouldPoll || isFetching || timedOut) return;
  if (attempts.current.scope!==scope) attempts.current={scope,start:Date.now(),count:0};
  const remaining=120_000-(Date.now()-attempts.current.start);
  const delay=[2000,5000,10000,30000][Math.min(attempts.current.count,3)];
  const timer=setTimeout(()=>{
   if (remaining<=delay) { setTimeoutScope(scope); return; }
   attempts.current.count++;
   void refetchQuery();
  },Math.max(0,Math.min(delay,remaining)));
  return ()=>clearTimeout(timer);
 },[shouldPoll,isFetching,dataUpdatedAt,errorUpdatedAt,refetchQuery,scope,timedOut]);
 const refresh = () => {
  attempts.current={scope,start:Date.now(),count:0};
  setTimeoutScope(null);
  return refetchQuery();
 };
 const refreshBilling = async () => {
  const result=await refresh();
  if (!result.isError && client.getQueryData(billingLifecycleKey(companyId,ownerId))===result.data) await client.invalidateQueries({queryKey:billingCatalogKey(companyId,ownerId)});
  return result;
 };
 return {...query,data:role==='ADMIN'?query.data:undefined,refetch:refresh,refreshBilling,pollingTimedOut:timedOut,
  dataOwner:role==='ADMIN' && companyId && ownerId ? {companyId,ownerId} : null};
}

/** Catalog READ does not imply purchase permission and is independent of checkout uncertainty. */
export function useBillingCatalog() {
 const {companyId,ownerId,role} = useBillingScope();
 return useQuery({
  queryKey:billingCatalogKey(companyId,ownerId),queryFn:({signal})=>getBillingCatalog(signal),
  enabled:role==='ADMIN',retry:false,staleTime:0,gcTime:0,refetchOnWindowFocus:true,refetchOnReconnect:true,
 });
}
