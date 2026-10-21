import { build } from "vite";
if (process.env.HYGENE_E2E_MANAGED !== "true") {
  throw new Error(
    "Only the isolated E2E runner may build this fixture application",
  );
}
// Do not load a checkout's ignored .env files into the test browser bundle.
await build({ envDir: false });
