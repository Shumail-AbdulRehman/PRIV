import { useMutation, useQuery } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { createCustomerPortalSession, getPricingContext, getSubscription } from "./api";

export const subscriptionQueryKey = ["subscription"] as const;

export const usePricingContext = () =>
  useQuery({
    queryKey: ["pricing-context"],
    queryFn: getPricingContext,
    staleTime: 30 * 60 * 1000,
  });

export const useSubscription = ({ poll = false }: { poll?: boolean } = {}) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...subscriptionQueryKey, user?.companyId],
    queryFn: getSubscription,
    enabled: user?.role === "ADMIN" || user?.role === "MANAGER",
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: poll ? (query) =>
      query.state.data?.company.subscriptionStatus === "ACTIVE" ? false : 3000
      : false,
  });
};

export const useCustomerPortalSession = () => {
  return useMutation({
    mutationFn: createCustomerPortalSession,
  });
};
