import type { RouteObject } from 'react-router-dom';
import OperatorLogin, { OperatorCallback, OperatorSecurity } from './OperatorLogin';

/** Mount outside App/GuestRoute/ProtectedRoute and their tenant session bootstrap. */
export const platformRoutes: RouteObject[] = [
  { path: '/platform/login', element: <OperatorLogin /> },
  { path: '/platform/callback', element: <OperatorCallback /> },
  { path: '/platform/security', element: <OperatorSecurity /> },
  { path: '/platform/*', element: <OperatorLogin /> },
];
