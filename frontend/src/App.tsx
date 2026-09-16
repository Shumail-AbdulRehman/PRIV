import './App.css';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useGetCurrentUser } from './queries/auth.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUser,setLoading,clearUser } from './store/slices/authSlice.js';
import type { AppDispatch } from '@/store/store';
import { useEffect } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner.js';
import type { RootState } from '@/store/store';



export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();
  const {isLoading}= useSelector((state: RootState)=>  state.auth);
  const location = useLocation();
  if(isLoading) return <LoadingSpinner fullScreen/>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;


  return <>{children}</>;
};

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const destination = location.state?.from === "/welcome" ? "/welcome" : "/dashboard";
  if (isAuthenticated) return <Navigate to={destination} replace />;


  return <>{children}</>;
};

export const RequireRole = ({ roles, children }: { roles: Array<'ADMIN' | 'MANAGER' | 'STAFF'>; children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const getCurrentUserQuery = useGetCurrentUser();
  const { user } = useAuth();

  
  useEffect(() => {
    if (getCurrentUserQuery.isLoading) {
      dispatch(setLoading(true));
    } else if (getCurrentUserQuery.isSuccess && getCurrentUserQuery.data) {
      dispatch(setUser(getCurrentUserQuery.data));
    } else if (getCurrentUserQuery.isError) {
       dispatch(clearUser());
    }
  }, [
    getCurrentUserQuery.isLoading,
    getCurrentUserQuery.isSuccess,
    getCurrentUserQuery.isError,
    getCurrentUserQuery.data,
    dispatch,
  ]);

  
 // Wait for restored authentication to reach Redux before mounting routes.
 // Otherwise a reload of /welcome or /choose-plan can briefly redirect to login.
 const restoredUser = getCurrentUserQuery.data;
 const restoringSession = getCurrentUserQuery.isSuccess && restoredUser && (
   user?.id !== restoredUser.id || user?.role !== restoredUser.role ||
   user?.companyId !== restoredUser.companyId
 );
 if (getCurrentUserQuery.isLoading || restoringSession) {
  return <LoadingSpinner fullScreen />;
}


  return <Outlet />;
}

export default App;
