import './App.css';
import { Outlet, Navigate } from 'react-router-dom';
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
  if(isLoading) return <LoadingSpinner fullScreen/>
  if (!isAuthenticated) return <Navigate to="/login" replace />;


  return <>{children}</>;
};

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;


  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const getCurrentUserQuery = useGetCurrentUser();

  
  useEffect(() => {
    if (getCurrentUserQuery.isLoading) {
      dispatch(setLoading(true));
    } else if (getCurrentUserQuery.isSuccess && getCurrentUserQuery.data) {
      dispatch(setUser(getCurrentUserQuery.data.data.data));
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

  
 if (getCurrentUserQuery.isLoading && !getCurrentUserQuery.isError) {
  return <LoadingSpinner fullScreen />;
}


  return <Outlet />;
}

export default App;