
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';
import { signUp } from './api';







export const useCreateManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(["currentUser"], user);
      dispatch(setUser(user));
      navigate("/choose-plan", { replace: true });
    },
  });
};
