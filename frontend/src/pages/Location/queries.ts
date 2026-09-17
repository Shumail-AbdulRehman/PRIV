import { deleteLocation } from "./api";
import { invalidateWorkspace } from "@/lib/invalidateWorkspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocations, createLocation, getLocationById } from "./api";
import type { LocationStatsFilter } from "./api";

export const useGetLocations = () => {
  return useQuery({
    queryKey: ["getLocations"],
    queryFn: getLocations,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getLocations"] });
    },
  });
};

export const useGetLocationById = (
  id: string,
  filter?: LocationStatsFilter,
) => {
  return useQuery({
    queryKey: ["location", id, filter ?? null],
    queryFn: () => getLocationById(id, filter),
    enabled: !!id,
  });
};

export type { LocationStatsFilter };
export const useDeleteLocation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => invalidateWorkspace(client),
  });
};
