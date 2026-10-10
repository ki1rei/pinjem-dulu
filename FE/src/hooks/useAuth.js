'use client';

import { useContext } from 'react';

import AuthContext from '@/context/AuthContext';

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider.');
  }

  return authContext;
};
