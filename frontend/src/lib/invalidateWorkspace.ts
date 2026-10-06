import type { QueryClient } from "@tanstack/react-query";

// Deletions affect lists, detail screens, assignment options, today's totals and billing usage.
const workspaceKeys = new Set([
  "staff",
  "location",
  "getLocations",
  "getManagers",
  "dashboard-locations",
  "manager",
  "attendance",
  "subscription",
  "area-submissions",
  "area-migration", "areas", "area", "area-qr", "area-labels", "area-standards", "verification", "verification-exceptions",
]);
export async function invalidateWorkspace(client: QueryClient) {
  await client.invalidateQueries({
    predicate: (query) => workspaceKeys.has(String(query.queryKey[0])),
  });
}
