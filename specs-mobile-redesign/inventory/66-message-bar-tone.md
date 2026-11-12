# Spec 66 inventory

- `design/Feedback.tsx`: `useSnackbar().show(messageKey, values?, tone?)`; `tone` is `'confirm'` (default, `Check` in `yellow`) or `'failure'` (`CircleAlert` in `surface`). Exported type `SnackTone`.
- `HomeScreen.tsx` and `TasksScreen.tsx` pass `'failure'` for their failed-refresh messages.
- Test tip: the bar's icon is the first `Icon` under the live-region view when `Icon` is mocked as a plain element.
