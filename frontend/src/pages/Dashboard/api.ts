import { client } from "@/api/client";

export const getLocationsWithCounts = async () => {
  const res = await client.get("/location/");
  return res.data;
};

export const getLocationStats = async (
  id: number,
  params?: Record<string, string | number>
) => {
  const res = await client.get(`/location/${id}/stats`, { params });
  return res.data;
};
