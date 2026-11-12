# Spec 59 inventory: photo row wrap

- `PHOTO_TEXT_MIN_WIDTH` (100) and `RowPill` in `frontend-mobile/src/screens/verification/VerificationProgress.tsx`: a wrapping row whose text column has a minimum width, and a pill that drops under the text (margin on the start side from `onLayout`, `marginRight` in Urdu because react-native-web does not mirror `marginStart` for `row-reverse`). Use this pattern for any row with a long trailing pill.
- Test: `frontend-mobile/tests/screens/photoRowLayout.test.mjs` (own `useLanguage` mock that fills placeholders).
