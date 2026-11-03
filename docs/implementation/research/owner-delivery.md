# Owner delivery adapter research — 2026-10-20

Primary sources checked:

- [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email): HTTPS POST /emails with authenticated JSON from/to/subject/text; success contains an email ID. Adapter uses native fetch and no SDK/package addition.
- [Resend Idempotency Keys](https://resend.com/docs/dashboard/emails/idempotency-keys): Idempotency-Key header, maximum256 characters, retention24h. Adapter keys each attempted email by persisted CredentialToken UUID, not the secret token. It does not automatically retry or claim delivery; provider acceptance is a separate internal audit fact.

No actual credentials, sender/domain or mailbox qualified, no API call/mail sent. Synthetic fetch fixtures exercise redirects/timeouts/body bounds/errors without network. Provider choice is an opt-in implementation adapter, not activation or a commercial commitment. Production sender/domain/link/UI/channel qualification remains39/40. Links use approved configured HTTPS origin and token fragment rather than query/path; consumer30 must read fragment locally, remove it immediately, and POST token bodies without logging them.
