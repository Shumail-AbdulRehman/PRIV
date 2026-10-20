import { ExceptionInboxPage, ExceptionDetailPage, VerificationHistoryPage, AreaSetupPage, AreaDetailPage, LocationsPage, LocationDetailPage, DashboardPage, StaffPage, StaffDetailPage, AttendancePage, TodayStatusPage, ManagersPage, SubscriptionPage } from "./workspacePages";
import { RequireRole } from "../App";
import { CompanySettingsUnavailable } from "./launchPages";
import type { RouteObject } from "react-router-dom";

export const workspaceRoutes: RouteObject[] = [
          {path:'exceptions',element:<RequireRole roles={['ADMIN','MANAGER']}><ExceptionInboxPage/></RequireRole>},
          {path:'exceptions/:id',element:<RequireRole roles={['ADMIN','MANAGER']}><ExceptionDetailPage/></RequireRole>},
          {path:'verification/:id',element:<RequireRole roles={['ADMIN','MANAGER']}><VerificationHistoryPage/></RequireRole>},
          { path: 'settings', element: <RequireRole roles={['ADMIN']}><CompanySettingsUnavailable /></RequireRole> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'today-status', element: <TodayStatusPage /> },
          { path: 'locations', element: <LocationsPage /> },
          { path: 'locations/:locationId/areas/new', element: <RequireRole roles={['ADMIN', 'MANAGER']}><AreaSetupPage /></RequireRole> },
          { path: 'areas/:id', element: <RequireRole roles={['ADMIN', 'MANAGER']}><AreaDetailPage /></RequireRole> },
          { path: 'locations/:id', element: <LocationDetailPage /> },
          { path: 'staff', element: <StaffPage /> },
          { path: 'staff/:id', element: <StaffDetailPage /> },
          { path: 'attendance', element: <AttendancePage /> },
          {
            path: 'subscription',
            element: (
              <RequireRole roles={['ADMIN']}>
                <SubscriptionPage />
              </RequireRole>
            ),
          },
          {
            path: 'managers',
            element: (
              <RequireRole roles={['ADMIN']}>
                <ManagersPage />
              </RequireRole>
            ),
          },
        ];
