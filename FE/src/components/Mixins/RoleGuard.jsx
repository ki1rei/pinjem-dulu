'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Loader from '@/components/Common/Loader';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/lib/constants';

const dashboardByRole = {
  [ROLES.PEMINJAM]: '/peminjam/dashboard',
  [ROLES.PENANGGUNG_JAWAB]: '/pj/dashboard',
};

const RoleGuard = ({ children, role }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== role) {
      router.replace(dashboardByRole[user.role] || '/login');
    }
  }, [isLoading, role, router, user]);

  if (isLoading || !user || user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader />
      </div>
    );
  }

  return children;
};

export default RoleGuard;
