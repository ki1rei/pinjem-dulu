'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  FileText,
  HandCoins,
  Home,
  Menu,
  Package,
  Undo2,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';

import Sidebar, { STORAGE_KEY_COLLAPSED } from './Sidebar';
import Footer from './Footer';
import ThemeToggle from '@/components/Common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth.js';
import { getPageTitle } from '@/lib/navigation.js';

const ICON_FOR = Object.freeze({
  Home,
  Package,
  HandCoins,
  Undo2,
  UserRoundPlus,
  FileText,
  UsersRound,
});

function DashboardHeader({ onOpenDrawer, role }) {
  const pathname = usePathname() || '';
  const { title, icon } = useMemo(() => getPageTitle(pathname, role), [pathname, role]);
  const IconCmp = icon ? ICON_FOR[icon] : null;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/90 px-4 py-4 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/90 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="Buka menu"
          aria-haspopup="dialog"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 md:hidden"
        >
          <Menu size={24} strokeWidth={2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {IconCmp ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-brand">
              <IconCmp size={22} strokeWidth={2} />
            </span>
          ) : null}
          <h1 className="min-w-0 truncate text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {title}
          </h1>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

const STORAGE_KEY_COLLAPSED_V2 = 'pinjemdulu-sidebar-collapsed-v2';
const FIRST_VISIT_KEY = 'pinjemdulu-shell-v1-seen';

const DashboardShell = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role || '';

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const firstVisit = window.localStorage.getItem(FIRST_VISIT_KEY);
      if (firstVisit !== '1') {
        window.localStorage.setItem(STORAGE_KEY_COLLAPSED, '0');
        window.localStorage.setItem(STORAGE_KEY_COLLAPSED_V2, '0');
        window.localStorage.setItem(FIRST_VISIT_KEY, '1');
        if (mounted) setCollapsed(false);
      } else {
        const raw =
          window.localStorage.getItem(STORAGE_KEY_COLLAPSED_V2) ??
          window.localStorage.getItem(STORAGE_KEY_COLLAPSED);
        if (raw === null) {
          window.localStorage.setItem(STORAGE_KEY_COLLAPSED_V2, '0');
          if (mounted) setCollapsed(false);
        } else if (mounted) {
          setCollapsed(raw === '1' || raw === 'true');
        }
      }
    } catch {
      /* abaikan */
    }
    return () => {
      mounted = false;
    };
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY_COLLAPSED, next ? '1' : '0');
        window.localStorage.setItem(STORAGE_KEY_COLLAPSED_V2, next ? '1' : '0');
      } catch {
        /* abaikan */
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        drawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
        user={user}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader onOpenDrawer={() => setDrawerOpen(true)} role={role} />

        <main className="min-w-0 flex-1 p-4 sm:p-7">{children}</main>

        <div className="px-4 pb-4 sm:px-7">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
