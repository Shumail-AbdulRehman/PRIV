# Spec 67 inventory

- Rule: never pass a `Pressable` a `style` callback. NativeWind's native interop spreads it into `{}` on Android (web is unaffected). Keep `pressed` in React state with `onPressIn`/`onPressOut`, as `TaskRow` does. `tests/nativeStyleScan.test.mjs` fails on a callback or a web-only style.
- Rule: a scrolling screen puts the top inset in a fixed band (`testID="status-band"`, height `insets.top`) before its scroll view, never in the scroll content. History, Profile, My day, Sign in and Tasks do this; `TopBar withSafeArea` screens already have a fixed bar.
- `DayHeader.tsx`: exports `skyColor(state, loading)`; the header no longer pads by the top inset.
- `StaffTabs.tsx`: exports `StaffTabBar`, passed as `tabBar`; renders nothing when the focused route has `params.fullScreen`. `StaffTabsParamList.Shift` is `{ fullScreen?: boolean } | undefined`; `HomeScreen` sets it for locating, the selfie camera and the receipt.
- `AttendanceCamera.tsx`: exports `faceGuideFrame(width, height, top)`; the top block has `testID="camera-top"` and is measured.
- `AttendanceHistoryView.tsx`: rows are `AttendanceRow`; the pill sits in a `attendance-row-pill` box so the row centres it.
- Test tip: override `react-native-safe-area-context` in `installMocks` to give a non-zero top inset; compare styles at inset 24 and 0 to prove only the band uses it.
- Web-only bug seen in the render check, not in the app source: expo-location's web `watchPositionAsync` subscription `remove()` throws (`LocationEventEmitter.removeSubscription is not a function`), so on web My day stays on "Finding your location…". The check patched a scratch copy of `dist`.
