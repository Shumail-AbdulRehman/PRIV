import { client } from "@/api/client";

export interface TodayStatusFilters {
  locationId?: number;
}

export const getTodayStatus = async (filters?: TodayStatusFilters) => {
  const params: Record<string, number> = {};

  if (filters?.locationId) {
    params.locationId = filters.locationId;
  }

  const res = await client.get("/manager/today-status", { params });
  return res.data;
};
