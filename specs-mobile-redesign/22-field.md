# Spec 22 — Text field

**Status:** Done
**Depends on:** Spec 02, Spec 14
**Model:** Standard — `claude-sonnet-5-5` · `gpt-6.1-sol` · `gemini-3.8-flash`
**Issue:** —
**Owns:** `frontend-mobile/src/design/Field.tsx`, `frontend-mobile/tests/design/field.test.mjs`, `specs-mobile-redesign/inventory/22-field.md`
**Reuses:** `frontend-mobile/src/design/StaffText.tsx`, `DESIGN-SYSTEM.md#components`

## Goal

Sign in, the access code form and the password forms use one large, clear field with a label, an optional show-password button and an inline error.

## Scope

`Field` props: `label` (English key), `value`, `onChangeText`, `kind` (`email`, `password`, `code`, `url`, `text`), `placeholder` (not translated for emails and URLs), `error` (English key or server message), `editable`, `autoFocus`, `returnKeyType`, `onSubmitEditing`, `accessibilityLabel` (defaults to the label).

- Label `fieldLabel` role above the box. Box 60 high, radius 16, `surface`, 1.5 `lineStrong` border; 2 `blue` border when focused; 2 `bad` border with an error. Error text below in `bad` with a `CircleAlert` icon, `accessibilityLiveRegion` polite.
- Input text role `input`, always left-to-right with `writingDirection: 'ltr'`, aligned right in Urdu (same as `LaunchRecovery` fields today).
- `kind` sets `autoCapitalize` none, `autoCorrect` false, `keyboardType` (`email-address`, `url`, default) and `secureTextEntry` for `password` and `code`. `password` and `code` show a 44 eye button that toggles visibility, labelled "Show password" or "Hide password".
- Keep a 128 `maxLength` default for passwords and codes like `LaunchRecovery`.

## Explicit non-scope

- Form validation rules → specs 27 and 28 (they stay in each form: `validReplacementPassword` and login checks).
- Replacing `components/ui/input.tsx` → spec 49.

## Reuse first

- Copy the left-to-right field style from `LaunchRecovery.tsx`.

## Steps

1. Build the field.
2. Test focus, error and the eye toggle.

## Done when

- [x] `cd frontend-mobile && npx tsx --test tests/design/field.test.mjs` passes: the label renders translated; typing calls `onChangeText`; `password` starts hidden and the eye toggles it with the right accessibility label; an error renders below with the error border token; the input is left-to-right in Urdu. [unit]
- [x] `npm test --prefix frontend-mobile` passes with 0 failures; real count in the Log. [unit]
- [x] No raw hex in `Field.tsx`. [static]
- [x] `npm run typecheck --prefix frontend-mobile` passes with 0 errors. [static]
- [x] `npm run build:web --prefix frontend-mobile` passes. [static]

## Log

- **2026-11-11** — Built `Field` in `frontend-mobile/src/design/Field.tsx` and `tests/design/field.test.mjs` (8 tests pass). Whole mobile suite: 305 pass, 0 fail. Typecheck 0 errors; `build:web` passed (waited for another running export first). No raw hex in Field.tsx. Not verified: device, font scaling, screen reader, 360 px visual check. Notes: "Hide password" has no Urdu key in `staffAppTranslations.ts` (only "Show password"), so it shows English in Urdu; spec 49 should add it. Added an optional `maxLength` and `testID` prop beyond the spec; eye button is 44 with hitSlop 4; row reverses in Urdu so the eye sits on the end side.
- **2026-11-12** — Lead: removed `frontend-mobile/src/components/ui/input.tsx` from Reuses because spec 62 deleted the file (it had no importer).
