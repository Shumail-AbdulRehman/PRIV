import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
const useScope = () =>
  useSelector(
    (s: RootState) =>
      `${s.auth.user?.companyId}:${s.auth.user?.role}:${s.auth.user?.id}`,
  );
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import { getException, getExceptions } from "./api";
import type { ExceptionFilters } from "./types";
export const useExceptions = (filters: ExceptionFilters = {}) => {
  const scope = useScope();
  return useInfiniteQuery({
    queryKey: ["exceptions", scope, filters],
    queryFn: ({ pageParam }) => getExceptions(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};
export const useException = (id: number) => {
  const scope = useScope();
  return useQuery({
    queryKey: ["exception", scope, id],
    queryFn: () => getException(id),
    enabled: id > 0,
    refetchInterval: (query) =>
      query.state.data?.items?.some((i) =>
        i.requirements.some((r) => r.state === "PROCESSING"),
      )
        ? 5000
        : 30000,
    refetchIntervalInBackground: false,
  });
};
export const useExceptionCount = (enabled = true) => {
  const scope = useScope();
  return useQuery({
    queryKey: ["exception-count", scope],
    queryFn: async () =>
      (
        await client.get<{ data: { total: number; unreadCount?: number } }>(
          "/verification-exceptions",
          { params: { queue: "needs-me", page: 1, pageSize: 1 } },
        )
      ).data.data,
    enabled,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
};
