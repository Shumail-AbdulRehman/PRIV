import { lazy } from "react";

export const ExceptionInboxPage = lazy(
  () => import("../pages/Exceptions/ExceptionInboxPage"),
);
export const ExceptionDetailPage = lazy(
  () => import("../pages/Exceptions/ExceptionDetailPage"),
);
export const VerificationHistoryPage = lazy(
  () => import("../pages/Verification/VerificationHistoryPage"),
);
export const AreaSetupPage = lazy(() => import("../pages/Area/AreaSetupPage"));
export const AreaDetailPage = lazy(
  () => import("../pages/Area/AreaDetailPage"),
);
export const LocationsPage = lazy(
  () => import("../pages/Location/LocationsPage.tsx"),
);
export const LocationDetailPage = lazy(
  () => import("../pages/Location/LocationDetailPage.tsx"),
);
export const DashboardPage = lazy(
  () => import("../pages/Dashboard/DashboardPage.tsx"),
);
export const StaffPage = lazy(() => import("../pages/Staff/StaffPage.tsx"));
export const StaffDetailPage = lazy(
  () => import("../pages/Staff/StaffDetailPage.tsx"),
);
export const AttendancePage = lazy(
  () => import("../pages/Attendance/AttendancePage.tsx"),
);
export const TodayStatusPage = lazy(
  () => import("../pages/Manager/TodayStatusPage.tsx"),
);
export const ManagersPage = lazy(
  () => import("../pages/Managers/ManagersPage.tsx"),
);
export const SubscriptionPage = lazy(
  () => import("../pages/Subscription/SubscriptionPage.tsx"),
);
