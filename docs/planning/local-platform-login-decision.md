# Local product-owner login decision — 2026-10-31

The user explicitly requests enabling the current local platform dashboard with a unique generated email/password. Original production OIDC/MFA work remains postponed. A tenant ADMIN cannot become the product owner: Manager/Staff credentials and JWTs have the wrong audience and scope.

Selected: a separate opt-in **local-development-only** platform password session. Require NODE_ENV=development, explicit enable flag, loopback peer, approved local database, owner-only bcrypt credential file, allowed loopback frontend Origin and bounded opaque HttpOnly platform-cookie sessions. Production mode rejects this path even with credentials/flag present. Existing RS256/MFA/provisioned-subject verifier remains unchanged. No identity provider, tenant user, schema migration, public operator registration or seeded fake MFA identity is introduced.

The current protected local config stays unchanged. Its validated private launcher adds the two local-only env values after the existing provider-disabled/local-DB checks. Credentials and owner handoff note stay mode0600 outside Git; launcher is backed up. Only an explicit VITE_LOCAL_PLATFORM_LOGIN=true local build exposes the form, and it refuses nonloopback API targets. Local status comes from the backend; browser/tenant state cannot grant authority.

43consumes19principal/middleware,27AuthShell,33companymetadata and35service surfaces. The partially shipped34unavailable guard is extended serially, while its production provider acceptance remains Blocked. Existing40 owns the new opt-in isolated browser test;41 retains release qualification. No original spec is renumbered or marked complete by local access.

The static approved v5 operator layout is reused. No design/prototype change is required for adding local-only fields inside that composition. Current source, tests, runtime and plan are grounded against b826856 in the preserved feature worktree; root dirty changes remain untouched. All heavy checks run sequentially with nice15/maxWorkers1 per the user's laptop constraint.
