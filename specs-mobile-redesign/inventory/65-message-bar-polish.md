# Spec 65 inventory

- `design/tokens.ts`: `whiteAlpha` (`tick` 7, `track` 16, `block` 22, `rail` 26 percent white; outside `colors`); `space.tabBarPadTop`, `tabBarPadBottom`, `tabPipLabelGap`, `tabLabelScaleCap`, `snackAboveBar`; `tabBarHeight(insetBottom, labelLineHeight, fontScale)`.
- `design/Feedback.tsx`: file-local `SnackBar` (fade + rise 12 over 200 ms; fade only in 120 ms under reduced motion; no exit animation); `bottom = tabBarHeight(...) + 12`.
- `StaffTabs.tsx` takes its height from `tabBarHeight`; `DayHeader` and `LanguageToggle` use `whiteAlpha`.
- Test tip: override `react-native-safe-area-context`, `react-native` (`useWindowDimensions`) and `react-native-reanimated` (`withTiming`, `useReducedMotion`) in `installMocks` to drive insets, font scale and motion.
