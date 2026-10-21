export function isolatedBootstrap(raw, mode) {
  if (mode === "production" || !raw)
    throw new Error("Explicit local E2E bootstrap database required");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid E2E bootstrap configuration");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/priv_e2e_test" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Only the disposable local priv_e2e_test bootstrap is permitted",
    );
  return url;
}
