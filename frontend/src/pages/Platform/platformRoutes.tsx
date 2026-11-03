import ServicePage from './ServicePage';
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
  { path: '/platform/service', element: <ServicePage /> },
  { path: '/platform/audit', element: <ServicePage initialView="audit" /> },
  { path: '/platform/inquiries', element: <ServicePage initialView="inquiries" /> },
  { path: '/platform/*', element: <OperatorLogin /> },
];
