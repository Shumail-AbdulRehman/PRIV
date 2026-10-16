import { ExceptionInboxPage, ExceptionDetailPage, VerificationHistoryPage, AreaSetupPage, AreaDetailPage, LocationsPage, LocationDetailPage, DashboardPage, StaffPage, StaffDetailPage, AttendancePage, TodayStatusPage, ManagersPage, SubscriptionPage } from "./routes/workspacePages";
import '@fontsource/noto-sans-arabic/arabic-400.css';
import '@fontsource/noto-sans-arabic/arabic-600.css';
import { LanguageProvider } from './i18n/LanguageProvider';
import { createRoot } from 'react-dom/client';
import './index.css';
import App, { GuestRoute, ProtectedRoute, RequireRole } from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';

import DashboardLayout from './components/layout/DashboardLayout.tsx';
import { PublicLayout } from './components/layout/PublicLayout.tsx';
import SignUp from './pages/Signup/SignUpPage.tsx';
import Login from './pages/Login/LoginPage.tsx';
import LandingPage from './pages/Landing/LandingPage.tsx';
import FeaturesPage from './pages/Landing/FeaturesPage.tsx';
import PricingPage from './pages/Pricing/PricingPage.tsx';
import WelcomePage from './pages/Pricing/WelcomePage.tsx';
import ChoosePlanPage from './pages/Pricing/ChoosePlanPage.tsx';
import WorkspaceGate from './components/onboarding/WorkspaceGate.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'features', element: <FeaturesPage /> },
          { path: 'pricing', element: <PricingPage /> },
          { path: 'welcome', element: <RequireRole roles={['ADMIN']}><WelcomePage /></RequireRole> },
          { path: 'choose-plan', element: <RequireRole roles={['ADMIN']}><ChoosePlanPage /></RequireRole> },
        ],
      },
      {
        path: 'signup',
        element: (
          <GuestRoute>
            <SignUp />
          </GuestRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        element: (
          <ProtectedRoute>
            <WorkspaceGate><DashboardLayout /></WorkspaceGate>
          </ProtectedRoute>
        ),
        children: [
          {path:'exceptions',element:<RequireRole roles={['ADMIN','MANAGER']}><ExceptionInboxPage/></RequireRole>},
          {path:'exceptions/:id',element:<RequireRole roles={['ADMIN','MANAGER']}><ExceptionDetailPage/></RequireRole>},
          {path:'verification/:id',element:<RequireRole roles={['ADMIN','MANAGER']}><VerificationHistoryPage/></RequireRole>},
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
              <RequireRole roles={['ADMIN', 'MANAGER']}>
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
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider><RouterProvider router={router} /></LanguageProvider>
      </QueryClientProvider>
    </Provider>
 
);
