
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { setUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';
import { signUp } from './api';







export const useCreateManager = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (user) => {
      dispatch(setUser(user));
    },
  });
};
