# Spec34 reuse handoff

- `frontend/src/pages/Platform/platformRoutes.tsx`: top-level RouteObject array for separate login/callback/security; root composition registers it outside tenant App bootstrap.
- `frontend/src/pages/Platform/OperatorLogin.tsx`: unavailable provider entry, callback rejection, own-security unavailable explanation, local cache cleanup, `OperatorShell` and `OperatorBoundary`. Boundary has no authorized branch until a real qualified provider adapter exists.
- `frontend/src/pages/Platform/operatorSession.ts`: `operatorQueryScope`, explicit unavailable session status, `operatorRequest` rejects before network, cancellation/removal of operator-only cache. Consumers33/35 must reuse this boundary, never tenant Axios/Redux or local JWT claim promotion.
- `frontend/src/pages/Platform/operatorTranslations.ts` and `operator.css`: feature-local EN/UR text and approved v5 semantic styling; no shared i18n/token changes.
- `docs/implementation/OPERATOR_UI.md`: exact registration contract, backend19 facts and unqualified-provider blocker for39/40.

Use these instead of another platform auth client, browser-token storage, provider URL guess, local MFA form or tenant role gate. Backend19 remains the final authority; this UI does not create authenticated operators. All provider handoffs are safely disabled, not empirically qualified.

## V5 public correction — 2026-10-28

- The current `AuthShell` is the actual approved centered public foundation from
  the accepted authentication correction; OperatorLogin/Callback/Security reuse it.
  Its brand, title, single panel, skip link and language control replace the old
  separate operator topbar. Do not rebuild another public shell.
- `OperatorShell` remains compatible with guarded Companies/Service workspaces.
  A missing qualified provider always renders OperatorLogin instead of mounting
  those children; no fake operator sidebar, identity or provider challenge ships.
- `frontend/e2e/operator-v5.spec.ts` is a Spec40-owned actual-route capture and
  denial harness, with evidence in `docs/implementation/v5-operator-evidence/`.
  No HTTP positive response is replaced; callback material remains untrusted.
