import { useMutation, useQuery } from "@tanstack/react-query";
import { createCustomerPortalSession, getPricingContext, getSubscription } from "./api";

export const subscriptionQueryKey = ["subscription"] as const;

export const usePricingContext = () =>
  useQuery({
    queryKey: ["pricing-context"],
    queryFn: getPricingContext,
    staleTime: 30 * 60 * 1000,
  });

export const useSubscription = () =>
  useQuery({
    queryKey: subscriptionQueryKey,
    queryFn: getSubscription,
    staleTime: 60 * 1000,
  });

export const useCustomerPortalSession = () => {
  return useMutation({
    mutationFn: createCustomerPortalSession,
  });
};
