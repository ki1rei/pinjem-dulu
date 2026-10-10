'use client';

import DashboardShell from '@/components/Mixins/DashboardShell';
import RoleGuard from '@/components/Mixins/RoleGuard';
import { ROLES } from '@/lib/constants.js';

export default function PeminjamLayout({ children }) {
  return (
    <RoleGuard role={ROLES.PEMINJAM}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
