# Spec 69 — Faster task-photo upload on the server

**Status:** Done
**Depends on:** Spec 68
**Model:** Heavy — `claude-opus-5-5` · `gpt-6-astra` · `gemini-3.1-pro-preview`
**Issue:** —
**Owns:** `backend/src/services/verification-v2/fasterPhotoUpload.test.ts`, `specs-mobile-redesign/inventory/69-faster-photo-upload-server.md`
**Reuses:** `backend/src/services/verification-v2/directPhoto.service.ts`, `backend/src/services/verification-v2/media.service.ts`, `backend/src/services/verification-v2/bufferedPhoto.provider.ts`, `backend/src/services/verification-v2/directPhoto.service.test.ts`, `backend/src/services/verification-v2/directProcessing.ts`, `backend/src/services/verification-v2/launchQualification.ts`, `backend/src/services/verification-v2/evidence.service.ts`, `backend/src/routes/verification.route.ts`, `backend/src/utils/cloudinary.ts`

## Goal

One task photo spends about 4–8 s on the server (photo-flow analysis, 2026-11-12, median 6.5 s), almost all of it waiting on Cloudflare `clef` (median 1.9 s) and then on Cloudinary storage (median 4.1 s), one after the other. After this spec the server waits on both at the same time, skips the storage lookup for a fresh attempt, keeps Cloudinary connections warm, and retries a quick transient vendor failure once. Every check, decision and response stays as it is. Rows 1, 2, 6 and 9 of the analysis; the owner asked for nothing heavier (no queue, worker, service or flag).

## Scope

**(a) Overlap.** When the photo passes server quality and no cached AI answer exists, the request starts storing both copies and the `clef` call together and waits for both. The AI answer alone decides the result; the stored copies are used only when that decision keeps the photo. When it does not (dirty, wrong item, missing part, screen photo), the copies are deleted once their upload settles, after the result is recorded. When the request fails before a keep decision while it still owns the attempt, it deletes the copies before it hands the attempt back for a manual upload. A request that lost ownership deletes nothing. A cached answer, a failed quality check and the qualification gate behave as before (no early upload).

**(b) One upload per copy, no lookup on a fresh attempt.** The review copy stays a second upload: it is the exact sharp output the AI judged, and the manager review, privacy and retention readers fetch it by its own public id; a Cloudinary transformation cannot reproduce those bytes. Both copies upload once, in parallel. The Admin API lookup runs only when the attempt was already claimed by an earlier request (`receivedAt`, a cached answer or media on the row). On a fresh attempt an upload that Cloudinary reports as already existing is still checked against its bound hash.

**(c) Warm connections.** One keep-alive HTTPS agent for every Cloudinary lookup, upload and delete in `media.service.ts`. Cloudflare already goes through Node's shared `fetch` pool, so it needs no change.

**(d) One retry.** A Cloudflare call or a Cloudinary upload that fails with a network error, a timeout, 429 (420 at Cloudinary) or 5xx within 10 s is tried once more after 1 s. A definitive answer (other 4xx, malformed body, configuration error, hash mismatch) is never retried. Worst case: about 41 s on a fresh attempt and about 71 s with the lookup, against 90 s before and the phone's 120 s.

- This spec is the **sole later editor** of `directPhoto.service.ts`, `media.service.ts` and `bufferedPhoto.provider.ts` (all existing before the redesign plan; none edited by an earlier spec), and of `directPhoto.service.test.ts`. It changes only: in `processDirectPhoto` the start and await of storage, the discard of unkept copies and the `lookup` argument; in `media.service.ts` the keep-alive agent, the `lookup` option, the upload retry and `discardPrivateImages`; in `bufferedPhoto.provider.ts` the retry around the one `fetch`; in the existing test the assertions that said "AI before storage" or "nothing uploaded", which now say "uploaded together, then deleted".

## Explicit non-scope

- Sequential one-photo-at-a-time rule, nonce, slot, hash, time window, rate limits, manager review, response shape → unchanged (`captureSession.service.ts`, `photoResultPolicy.ts`); any change to them is an owner decision for spec 00.
- `launchQualification.ts` → unchanged; the local timing copy's patch never enters the repo (spec 53's verification owns repo state).
- Phone-side speed-ups (rows 3 and 4 of the analysis) → spec 71.
- Fewer SQL queries (row 7) and responding before the check (row 5) → not planned; owner decision needed (spec 00 records decisions).

## Reuse first

- `storePrivateImage` hash binding, `ProviderServiceFailure` and `providerHttpFailure`, the `timed` stage events, the processing token and the reset-to-`RESERVED` path in `directPhoto.service.ts`.

## Steps

1. Add the agent, `lookup` option, upload retry and `discardPrivateImages` to `media.service.ts`.
2. Add the one retry around the `clef` fetch.
3. Overlap storage with the AI in `processDirectPhoto`; adapt the existing direct-photo tests.
4. Write `fasterPhotoUpload.test.ts`; run the backend suite, typecheck and build.
5. Time 3 photos per image size against a scratch copy with real vendors (port 8097, throwaway database).

## Done when

- [x] `cd backend && npx vitest run src/services/verification-v2/fasterPhotoUpload.test.ts` passes: storage and AI both start before either finishes; a discarded photo's two copies are deleted and its result is recorded first; an AI failure deletes the copies and resets the attempt; lost ownership deletes nothing; each copy uploads once; a fresh attempt does no lookup and an earlier-claimed one does; a transient Cloudflare or Cloudinary failure is retried once and a definitive one, or a slow failure, is not; a failed delete is retried once and logged. [unit]
- [x] `grep -n "keepAlive: true" backend/src/services/verification-v2/media.service.ts` prints one line. [static]
- [x] `git diff --quiet -- backend/src/services/verification-v2/launchQualification.ts` exits 0. [static]
- [x] `cd backend && npx vitest run` passes with 0 failures; real count in the Log. [unit]
- [x] `cd backend && npx tsc --noEmit -p tsconfig.json` passes with 0 errors. [static]
- [x] `cd backend && npm run build` passes. [static]

## Log

- **2026-11-12** — Done as in Scope. Review copy stays a second upload (not a Cloudinary transformation): it must be the exact sharp bytes the AI judged, and four readers fetch it by its own public id. The lookup flag is read inside the claim transaction from the row before the claim writes `receivedAt`. Cloudflare needed no agent change (shared `fetch` pool). `directPhoto.service.test.ts`: 7 assertions changed from "AI before storage / nothing uploaded" to "uploaded together / copies deleted / lost ownership deletes nothing"; the prisma mock gained `findUnique`. `fasterPhotoUpload.test.ts` 22/22; verification-v2 558/558; backend suite 2653 passed, 7 skipped, 0 failed; `tsc --noEmit` 0 errors; `npm run build` exit 0; `launchQualification.ts` unchanged.
- **2026-11-12** — Timed with real Cloudflare and Cloudinary against a scratch copy (port 8097, throwaway databases dropped, local-only qualification patch only in the copy, all test assets deleted). 12 photos after, 6 of them back to back with the old code. 187 KB photo: median server total 5.9 s before (6 runs) → 3.5 s after (6 runs). 510 KB photo: 7.5 s → 7.9 s, no gain: on this uplink the AI request (about 680 KB of base64) and the two uploads share the bandwidth, so the AI call slowed from a median 2.7 s to 5.9 s when it ran alongside. No Admin API lookup ran on any fresh attempt. A configuration error inside the AI step now answers 503 after about 2.5–4 s instead of 0.2 s, because it waits for the copies to upload and deletes them first.
