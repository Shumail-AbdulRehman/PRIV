# Split rationale — draft pending approved design

Separate backend readiness from browser initialization: the Heroku runtime and Netlify build can fail independently. Both must be proven, and neither UI alone repairs them.

Separate plan choice, checkout handoff, activation and existing-subscriber billing: they have different authority/state/error contracts. Share the plan-summary data shape, not a monolithic component with many mode booleans. Keep routing integration with one owner after the pages exist. Reuse current provider reservations, canonical customer ownership and webhook ordering rather than write a billing system again.

Rejected splits:

- One giant “fix billing” spec: hides deployment/provider/UI/security boundaries and cannot prove them independently.
- Compose-only fix: does not target the user-confirmed deployment.
- UI-only enable-button fix: can start duplicate or unconfigured purchase attempts and does not fix provider prerequisites.
- Inline custom card form: user requests card entry, which Paddle already hosts; rebuilding the card form introduces unnecessary scope and breaks the provider boundary.
- One entire new app design: user explicitly wants the existing theme and billing flow only.
- Multiple e2e specs or separate e2e runs in every unit: duplicate slow tests and compete for isolated runtime resources.
- Reusing original plan's final-gate numbering: would falsely imply unrelated blocked photo/native/mail acceptance is complete; use a scoped feature plan with its own final gates.

These are planning notes, not formal executable spec files. Steering docs, exact ownership, binary unit/build criteria, verified model IDs and validator output follow v3 approval.

## Final split — 2026-11-06

The approved no-help design now maps to specs44–63. Separate contract/server/client/SDK/shell modules allow safe parallel work without shared-file edits. The previously proposed11-unit outline was split further for Sol medium: pure display/price helpers, query recovery, headless checkout, signup, five screens and route integration each have distinct ownership/tests. Database locking proof is a separate existing SQL-harness extension. Deployment preparation is documentation, while actual sandbox acceptance follows local browser success in the final gate. Do not make missing live credentials block independent local component/service work.

Rejected: one giant billing PR, an all-client enable flag, building a new card form, a new provider stub in deployable server code, a second browser harness, performing actual deployment before local integration checks, and deleting global Help APIs merely because this surface has no Help/Contact UI.
