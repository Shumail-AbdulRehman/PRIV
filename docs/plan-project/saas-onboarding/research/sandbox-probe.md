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

## 2026-11-10 — real sandbox probe and trial-removal preview

Ran each approved command exactly once, in order, from `backend/`, with `DATABASE_URL='postgresql://none:none@127.0.0.1:1/none'`. The probe used `--confirm`; trial removal ran in preview mode without an apply flag. No database was used, no command was retried, and no trials were removed.

The probe exited with code **1** (`ok: false`). All six price reads passed (`PRICE_READ`): each price is `active`, uses `USD`, has frequency `1`, and has `trial: true`. Their individual intervals and IDs are recorded below. Customer creation passed (`CUSTOMER_CREATED`), with status `active`. The duplicate-customer check passed with normalized code `customer_already_exists` and the same customer ID.

Draft creation failed with `REJECTED`; the provider event reported `invalid_field`. Draft read and customer-filtered list were not reached and remain **unverified**. Cancellation was `SKIPPED` with `NO_KNOWN_TRANSACTION`; cancellation and its read-back status remain **unverified**, as does permanent cancellation finality. The exact raw duplicate-customer response shape remains **unverified**; only the printed normalized result was observed. The stuck company's billing reservation row remains **unverified** and was outside this session's authorization.

Redacted command 1 output (IDs, statuses, codes and requested price metadata):

```text
{"event":"BILLING_PROVIDER_CUSTOMERS_CREATE_FAILED","errorClass":"CUSTOMER_EXISTS","providerCode":"customer_already_exists"}
{"event":"BILLING_PROVIDER_TRANSACTIONS_CREATE_FAILED","errorClass":"REJECTED","providerCode":"invalid_field"}
{
  "ok": false,
  "checks": [
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxq2nvjb2ak7jt4gym22g",
      "providerStatus": "active",
      "interval": "month",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxqw2hx8kk0tc70wg5t29",
      "providerStatus": "active",
      "interval": "year",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxtv0k73yk444nc0vvqjj",
      "providerStatus": "active",
      "interval": "month",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxvj8cmtdtr7a660mqa2h",
      "providerStatus": "active",
      "interval": "year",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxxw7h9ma5xxcmsc0axgp",
      "providerStatus": "active",
      "interval": "month",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "price",
      "status": "PASS",
      "code": "PRICE_READ",
      "id": "pri_01m26dxyqpqr2cmr8cwez9am00",
      "providerStatus": "active",
      "interval": "year",
      "frequency": 1,
      "currency": "USD",
      "trial": true
    },
    {
      "step": "customer",
      "status": "PASS",
      "code": "CUSTOMER_CREATED",
      "id": "ctm_01m71jfw29cjar59jka8r88fpn",
      "providerStatus": "active"
    },
    {
      "step": "duplicateCustomer",
      "status": "PASS",
      "code": "customer_already_exists",
      "customerId": "ctm_01m71jfw29cjar59jka8r88fpn"
    },
    {
      "step": "draft",
      "status": "FAIL",
      "code": "REJECTED"
    },
    {
      "step": "cancelDraft",
      "status": "SKIPPED",
      "code": "NO_KNOWN_TRANSACTION"
    }
  ]
}
```

Command 2 exited with code **0**. All six prices reported `WOULD_REMOVE`; this is preview evidence only. Exact preview output:

```text
DRY RUN: no prices will be changed. Use --apply to remove trials.
STARTER/month pri_01m26dxq2nvjb2ak7jt4gym22g: WOULD_REMOVE
STARTER/year pri_01m26dxqw2hx8kk0tc70wg5t29: WOULD_REMOVE
PRO/month pri_01m26dxtv0k73yk444nc0vvqjj: WOULD_REMOVE
PRO/year pri_01m26dxvj8cmtdtr7a660mqa2h: WOULD_REMOVE
ADVANCED/month pri_01m26dxxw7h9ma5xxcmsc0axgp: WOULD_REMOVE
ADVANCED/year pri_01m26dxyqpqr2cmr8cwez9am00: WOULD_REMOVE
```

## 2026-11-10 — re-run after removing `status` from create

With the user's approval, re-ran `npx tsx scripts/paddleSandboxProbe.ts --confirm` once after commit d1171f2. Exit code 0, `ok: true`, every check PASS. All six prices are active with `trial: false`, following the approved trial removal. Customer created; duplicate returned `customer_already_exists`; draft created with status `draft`, read back and found by customer list; cancel returned `canceled` and read back `canceled`. This confirms that omitting `status` on create fixes the earlier `invalid_field` rejection. Permanent finality of a canceled draft and the exact raw error shape remain unverified. The stuck company's reservation state was not inspected.
