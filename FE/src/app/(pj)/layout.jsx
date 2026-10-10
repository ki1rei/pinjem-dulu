'use client';

import DashboardShell from '@/components/Mixins/DashboardShell';
import RoleGuard from '@/components/Mixins/RoleGuard';
import { ROLES } from '@/lib/constants.js';

export default function PjLayout({ children }) {
  return (
    <RoleGuard role={ROLES.PENANGGUNG_JAWAB}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
