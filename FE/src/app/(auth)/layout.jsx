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

/**
 * Layout route group (auth) — mengelompokkan /login dan route auth lain.
 *
 * Guard: jika user sudah login, redirect ke dashboard sesuai role.
 * Per halaman (mis. LoginView) yang mengatur tampilan layout 2 kolom.
 * Layout ini hanya menampilkan Loader saat belum tahu status auth.
 */
export default function AuthLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      const target = dashboardByRole[user.role] || '/login';
      router.replace(target);
    }
  }, [isLoading, router, user]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {isLoading || user ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
