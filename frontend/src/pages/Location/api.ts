import { client } from "../../api/client.js";
import type { CreateLocationInput } from "./types.js";

export const getLocations = async () => {
  const res = await client.get("/location/");
  return res.data;
};

export const createLocation = async (data: CreateLocationInput) => {
  const res = await client.post(
    "/location/",
    { data },
    { withCredentials: true },
  );
  return res.data;
};

export type LocationStatsFilter =
  | { type: "days"; days: number }
  | { type: "range"; dateFrom: string; dateTo: string };

export const getLocationById = async (
  id: string,
  filter?: LocationStatsFilter,
) => {
  const params: Record<string, string | number> = {};

  if (filter?.type === "days") {
    params.days = filter.days;
  } else if (filter?.type === "range") {
    params.dateFrom = filter.dateFrom;
    params.dateTo = filter.dateTo;
  }

  const res = await client.get(`/location/${id}/stats`, { params });
  return res.data;
};
export const deleteLocation = async (id: number) => {
  const res = await client.delete(`/location/${id}`);
  return res.data;
};

export const getLocationSchedule = async (id: string, week: string | undefined, signal?: AbortSignal) => {
  const res = await client.get<{ data: import('./scheduleTypes').LocationSchedule }>(`/location/${id}/schedule`, {
    params: week ? { week } : {}, signal,
  });
  return res.data.data;
};
