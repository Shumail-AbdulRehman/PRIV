# Spec 03 reuse additions

### runtime-security
`backend/src/config/runtimeSecurity.ts` — pure production config validator with redacted errors; call before side effects.

### initialize-runtime
`backend/src/config/initializeRuntime.ts` — dotenv + fail-closed bootstrap; must remain first app dependency.
