# Paddle sandbox probe

## 2026-11-10 — implementation and unit verification only

No real Paddle request, probe command, payment or database inspection ran in this session. The run instruction explicitly reserves the real command for the user's coordinator. The results below distinguish the implemented checks from unverified provider behavior.

| Finding | Real sandbox result |
|---|---|
| Status, billing interval/frequency, currency and trial presence for all six catalog prices | Not verified; the command reads `backend/config/paddle-sandbox-catalog.json` and reports each price independently. |
| Creating and reading back a draft | Not verified. |
| Listing the exact draft with a customer filter | Not verified. A truncated list without that draft fails as `LIST_INCOMPLETE`. |
| Canceling a draft and reading its canceled status back | Not verified. Readback establishes the observed status only; permanent irreversibility has not been proven. |
| Exact raw `customer_already_exists` response shape | Not observed. The probe intentionally repeats creation for its disposable email and reports only the gateway's normalized code and optional validated customer ID. The gateway strips raw error details and payloads, so the command cannot establish the raw wire shape. Do not infer that shape from unit fixtures. |
| Stuck company's `BILLING_OPERATION` reservation state | Not inspected. Requires a separately authorized database read by the coordinator; this command has no database dependency or company selector. |

## Coordinator command

From `backend/`, after separately arranging sandbox credentials and approval:

```sh
npx tsx scripts/paddleSandboxProbe.ts --confirm
```

This is a command reference, not evidence of execution. `PADDLE_ENVIRONMENT` must be exactly `sandbox`; both the command and module enforce the environment and confirmation guards before provider I/O. The command uses the existing lazy billing gateway, so credentials come from its established configuration. Do not paste credentials or raw provider payloads into this report.

The command prints a JSON report and exits unsuccessfully when any check fails. It reads all six prices, creates one disposable customer using a random address at `example.com`, repeats that email to probe duplicate handling, and creates one draft for the first active catalog price. It checks the draft by ID and customer-filtered list, attempts cancellation in `finally`, and reads the canceled transaction back. It neither removes trials nor charges a card. The disposable customer is retained because the shared gateway has no customer archive operation.

Output includes validated provider IDs, fixed statuses/codes and the requested price metadata only. No emails, request bodies, API keys, provider messages or raw errors are serialized. A cancellation failure includes the known transaction ID for coordinator follow-up. An uncertain create is never retried or described as proof that no transaction exists; without a returned ID, cleanup is marked `NO_KNOWN_TRANSACTION`.

## Evidence to append after the real run

Record the execution date and redacted JSON results, then state the six real trial states, the observed canceled-draft readback status and the observed normalized duplicate error fields. Keep the exact raw error shape and permanent cancellation finality explicitly unverified unless separate real evidence establishes them. Record an authorized stuck-company reservation inspection separately, with no owner identity, credentials or raw audit payloads.
