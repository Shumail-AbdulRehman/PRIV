# Implementation handoff — 2026-10-20

Latest user authorizes design/v5 and recommended discovery launch scope, D01–D12 technical defaults and sequential execution. Do not repeat discovery/audits, generate a new design or request routine approval. User status answered: roughly 88% remaining by count after specs01–05; now06 also complete (6/41 execution/gate units, about85% remaining). These are counts, not effort estimates.

## Current execution
Specs00–06 Done (00 is decision record). 01 role/tenant-safe self reads;02 historical-site rows/totals isolation;03 production startup guard/Compose;04 atomic role-safe refresh and logout;05 authenticated attendance media/scoped byte endpoint/safe DTO;06 web component harness. Whole backend687 tests/71 files + build passed. Web57 node +2 component tests +build/touched ESLint passed. No production DB or live provider changes.

Next: spec08 protected attendance photo component and Attendance/StaffDetail integration; consumes safe checkInPhoto/checkOutPhoto metadata, not checkInImage URLs (now null). Spec07 legacy transition is independent, not a reason to block08. Then09 attendance reliability; remaining eligible units listed in tracker. Update progress after each.

## Review and ownership
Draft PRs7–11 on implementation/spec-01-security through spec-05-security; stacked in that order, none merged. Current branch spec05; prepare06 scoped commit next. Git working tree preserves pre-existing user dashboard/CI/performance changes recorded in planning/repo-survey.md; never stage them incidentally. Plans/docs are force-tracked because existing .gitignore ignores specs and docs. Current ownership of attendance route/self and staff controller transferred to05; preserve earlier regression tests.

## Boundaries and limits
JWT format now requires purpose/expiry and refresh jti; pre-patch sessions need signin on rollout. Immediate access credential-epoch revocation remains18. New photos use authenticated Cloudinary, server byte checks; legacy URLs withheld, old public/cached links remain external cutover gate07. checkInPhoto metadata statuses AVAILABLE/NONE/LEGACY_RESTRICTED. No live storage/DB/API/device/billing qualification claimed. New photos kept until approved lifecycle; no automatic retention deletion introduced.

Paddle catalog/terms, sender/support, operator IdP/MFA/people, legal/retention/exit, TLS/host/secrets, signed Android/device, customer calendar fit, consented photo qualification and restore remain release gates. Dependency audit found33 installed frontend advisories; see research/dependency-security.md; no force updates. Spec39 must resolve/qualify before release, prioritize runtime axios/router. No deployment authorized.
