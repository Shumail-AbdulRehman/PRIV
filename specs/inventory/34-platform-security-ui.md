# Spec34 reuse handoff

- `frontend/src/pages/Platform/platformRoutes.tsx`: top-level RouteObject array for separate login/callback/security; root composition registers it outside tenant App bootstrap.
- `frontend/src/pages/Platform/OperatorLogin.tsx`: unavailable provider entry, callback rejection, own-security unavailable explanation, local cache cleanup, `OperatorShell` and `OperatorBoundary`. Boundary has no authorized branch until a real qualified provider adapter exists.
- `frontend/src/pages/Platform/operatorSession.ts`: `operatorQueryScope`, explicit unavailable session status, `operatorRequest` rejects before network, cancellation/removal of operator-only cache. Consumers33/35 must reuse this boundary, never tenant Axios/Redux or local JWT claim promotion.
- `frontend/src/pages/Platform/operatorTranslations.ts` and `operator.css`: feature-local EN/UR text and approved v5 semantic styling; no shared i18n/token changes.
- `docs/implementation/OPERATOR_UI.md`: exact registration contract, backend19 facts and unqualified-provider blocker for39/40.

Use these instead of another platform auth client, browser-token storage, provider URL guess, local MFA form or tenant role gate. Backend19 remains the final authority; this UI does not create authenticated operators. All provider handoffs are safely disabled, not empirically qualified.
