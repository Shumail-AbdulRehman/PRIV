# Spec59 inventory

`onboarding/billingRoutes.tsx` exports importable owner-only standalone routes beneath App, with Suspense/lazy exports in routes/workspacePages.tsx. main.tsx mounts these outside PublicLayout/DashboardLayout. SubscriptionPage is a thin validated-lifecycle composer; checkout controller remains mounted through background refetch. ChoosePlanPage/WelcomePage preserve aliases; return URLs only inspect server facts.

WorkspaceGate now also runs before operational chrome, redirects new unpaid owners, preserves historical subscriber READ_OPERATIONAL and blocks suspension/error/foreign facts with self-service recovery. GuestRoute waits while loading and signup agrees on /choose-plan. Global unrelated help/security remain.

Verified83 focused integrated regressions, full81 Node +744 Vitest, typecheck/scoped lint/build. See spec59 Log for query51 and legacy test-only compatibility exceptions.
