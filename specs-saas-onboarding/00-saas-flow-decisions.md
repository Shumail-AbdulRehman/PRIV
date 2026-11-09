# Spec 00 — Decisions for the account, plan and checkout flow

**Status:** Done
**Depends on:** —
**Model:** Heavy — `claude-opus-5-5` · `gpt-6.1-sol` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** —

## Goal

Record the choices this spec set is built on, so implementing sessions never re-decide them.

## Scope

This is a decision record. Done means the decisions are written, not that behaviour changed.

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Flow | Account, plan, card, confirm, workspace | Trial first: the user asked to remove it |
| Free trial | Removed. A price with a trial is refused | Hiding trial text only: Paddle would still apply it |
| Card entry | Paddle inline one-page form on our page | Overlay: the user wants card entry in the flow. Own card fields: unsafe and against Paddle's model |
| Test card | Paddle sandbox `4242 4242 4242 4242` | Any other: sandbox rejects real cards |
| Activation | Signed webhook plus server read of the exact transaction | Webhook only: slow, and localhost webhooks go to Heroku |
| Login | Email and password, one endpoint | Account-type dropdown: needless step |
| Plan change after a draft | Cancel the unpaid draft at Paddle, create a new one | Locking the plan: common dead end |
| Stuck reservations | Repaired from real Paddle state, failed attempts recorded | Permanent hold: locks owners out. Deleting rows: destroys the audit trail |
| Email conflict at Paddle | Adopt only if exact, active, unlinked and sandbox or verified | Adopt on any match: could link someone else's billing |
| Look | Blue brand, Daily Worksheet, Fresh aurora, Mint sky panel, Checkbox logo, approved 2026-11-09 | See `design/saas-onboarding/` |
| Stack | Existing React, Vite, Express, Prisma, Paddle SDKs. No schema migration, no new libraries | Motion library: CSS is enough. New store: not needed |
| Testing | Vitest per spec, Playwright once in spec 42, real sandbox recorded separately | Mocks as proof of real payment |
| Spec numbering | Local to this folder, issues prefixed `Onboarding Spec` | Continuing from 86: the validator accepts two digits only |
| Earlier repair plan | `specs-billing-checkout-repair/` is superseded and was never executed | Running both: they own the same files |
| Live email verification | Existing rule stays: sandbox skips it, live requires it | Removing it: out of scope during testing |

## Explicit non-scope

- Any code change → spec 01.
- Real payment acceptance → spec 42.

## Steps

1. Read this record before starting any other spec.
2. A decision that must change is amended here with a dated Log entry and the user's agreement.

## Done when

- [x] The decisions above are recorded and agree with `ARCHITECTURE.md` and `DESIGN-SYSTEM.md`. [static]
- [x] The approved design is recorded in `design/saas-onboarding/README.md`. [static]

## Log

**2026-11-09** — Decisions recorded from the user's brief, intake answers and design approval. No application code changed.
