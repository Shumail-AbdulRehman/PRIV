import { Navigate } from 'react-router-dom';
import CompaniesPage from './CompaniesPage';
import type { RouteObject } from 'react-router-dom';
import OperatorLogin, { OperatorCallback, OperatorSecurity } from './OperatorLogin';

/** Mount outside App/GuestRoute/ProtectedRoute and their tenant session bootstrap. */
export const platformRoutes: RouteObject[] = [
  { path: '/platform/login', element: <OperatorLogin /> },
  { path: '/platform/callback', element: <OperatorCallback /> },
  { path: '/platform/security', element: <OperatorSecurity /> },
  { path: '/platform/companies', element: <CompaniesPage /> },
  { path: '/platform/companies/:companyId', element: <CompaniesPage /> },
  // Temporarily hidden from the platform UI; preserve the underlying services.
  { path: '/platform/service', element: <Navigate to="/platform/companies" replace /> },
  { path: '/platform/audit', element: <Navigate to="/platform/companies" replace /> },
  { path: '/platform/inquiries', element: <Navigate to="/platform/companies" replace /> },
  { path: '/platform/*', element: <OperatorLogin /> },
];
