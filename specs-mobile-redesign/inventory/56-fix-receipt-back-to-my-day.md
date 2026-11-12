# Spec 56 inventory: receipt "Back to my day"

- `onDone` on the Work submitted receipt, `frontend-mobile/src/screens/verification/VerificationScreen.tsx` (SubmissionReceipt line): `navigation.popTo(stackRoutes.staffTabs,{screen:tabRoutes.myDay})`. Use this pattern instead of `navigation.goBack()` or `navigate('StaffTabs')` to return to My day from any stacked screen.
- Source guard for the receipt's callbacks: `frontend-mobile/tests/screens/receiptBackToMyDay.test.mjs`. Use it as the template when a stacked screen must return to a tab without `goBack`.
