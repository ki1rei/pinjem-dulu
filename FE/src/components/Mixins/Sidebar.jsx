'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  ChevronDown,
  ChevronUp,
  FileText,
  HandCoins,
  Home,
  LogOut,
  Package,
  PanelLeft,
  Sparkles,
  Undo2,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';

import { cn } from '@/lib/utils.js';
import { getInitials, getMenuForRole, isActivePath, ROLE_LABEL } from '@/lib/navigation.js';
import { useAuth } from '@/hooks/useAuth.js';

const STORAGE_KEY_COLLAPSED = 'pinjemdulu-sidebar-collapsed';
const ICON_SIZE = 22;

const LUCIDE_ICONS = Object.freeze({
  Home,
  Package,
  HandCoins,
  Undo2,
  UserRoundPlus,
  FileText,
  UsersRound,
});

function SidebarIcon({ name, className = '', strokeWidth = 1.9 }) {
  const Cmp = LUCIDE_ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={ICON_SIZE} strokeWidth={strokeWidth} className={className} />;
}

function SidebarBrand({ collapsed, onToggle }) {
  return (
    <div
      className={cn(
        'flex w-full items-center px-4 pt-6 pb-5',
        collapsed ? 'justify-center px-2 pt-5' : 'justify-between'
      )}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Lebarkan sidebar"
          title="Lebarkan sidebar"
          aria-expanded="false"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <PanelLeft size={22} strokeWidth={1.8} />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="PinjemDulu beranda"
            className="inline-flex items-center gap-3 min-w-0"
          >
            <span className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-brand-solid text-white shadow-sm sm:h-[44px] sm:w-[44px]">
              <Sparkles size={24} strokeWidth={2.2} />
            </span>
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-[20px] font-extrabold tracking-tight sm:text-[24px]">
                <span className="text-zinc-900 dark:text-zinc-100">Pinjem</span>
                <span className="text-brand">Dulu</span>
              </span>
              <span className="mt-1.5 truncate text-[8px] font-semibold uppercase tracking-[0.26em] text-zinc-500 dark:text-zinc-400">
                Inventaris OKI Kampus
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Persempit sidebar"
            title="Persempit sidebar"
            aria-expanded="true"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 h-11 w-11"
          >
            <PanelLeft size={20} strokeWidth={1.8} />
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ items, collapsed, pathname, onNavigate }) {
  const defaultOpen = useMemo(() => {
    const init = {};
    for (const item of items) {
      if (Array.isArray(item.children) && item.children.length) {
        const hasActiveChild = item.children.some((c) => isActivePath(c.href, pathname));
        if (hasActiveChild) init[item.key] = true;
      }
    }
    return init;
  }, [items, pathname]);

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of items) {
        if (Array.isArray(item.children) && item.children.length) {
          const hasActiveChild = item.children.some((c) => isActivePath(c.href, pathname));
          if (hasActiveChild && !next[item.key]) {
            next[item.key] = true;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [items, pathname]);

  function toggleSub(key) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4">
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          const itemActive = hasChildren
            ? item.children.some((c) => isActivePath(c.href, pathname))
            : isActivePath(item.href, pathname);
          const href = hasChildren
            ? item.firstChildHref || item.children?.[0]?.href || '#'
            : item.href;

          return (
            <li key={item.key}>
              {hasChildren ? (
                <div>
                  <button
                    type="button"
                    onClick={() => (collapsed ? null : toggleSub(item.key))}
                    aria-expanded={Boolean(open[item.key])}
                    aria-controls={`sub-${item.key}`}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] transition',
                      collapsed && 'justify-center px-0 py-3',
                      itemActive
                        ? 'text-brand'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 shrink-0 items-center justify-center',
                        itemActive && 'text-brand'
                      )}
                    >
                      <SidebarIcon name={item.icon} strokeWidth={2} />
                    </span>
                    {collapsed ? null : (
                      <>
                        <span className="flex-1 leading-tight">
                          <span
                            className={cn(
                              'block text-[15.5px]',
                              itemActive ? 'font-semibold' : 'font-medium'
                            )}
                          >
                            {item.label}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'inline-flex h-5 w-5 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400'
                          )}
                        >
                          {open[item.key] ? (
                            <ChevronUp size={18} strokeWidth={2.25} />
                          ) : (
                            <ChevronDown size={18} strokeWidth={2.25} />
                          )}
                        </span>
                      </>
                    )}
                  </button>

                  {collapsed ? null : open[item.key] ? (
                    <ul id={`sub-${item.key}`} role="group" className="mt-1 ml-3 pl-3">
                      {item.children.map((child) => {
                        const childActive = isActivePath(child.href, pathname);
                        return (
                          <li key={child.key} className="my-1.5">
                            <Link
                              href={child.href}
                              onClick={onNavigate}
                              className={cn(
                                'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[14.5px] transition',
                                childActive
                                  ? 'bg-zinc-50 font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50'
                                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'ml-0.5 inline-flex h-2 w-2 shrink-0 rounded-full',
                                  childActive
                                    ? 'bg-brand'
                                    : 'bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-500 dark:group-hover:bg-zinc-400'
                                )}
                              />
                              <span className="leading-tight">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={itemActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[15px] transition',
                    collapsed && 'justify-center px-0 py-3',
                    itemActive
                      ? 'bg-zinc-50 font-semibold text-brand dark:bg-zinc-900'
                      : 'text-zinc-500 hover:bg-zinc-50/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 shrink-0 items-center justify-center',
                      itemActive && 'text-brand'
                    )}
                  >
                    <SidebarIcon name={item.icon} strokeWidth={2} />
                  </span>
                  {collapsed ? null : (
                    <span className="leading-tight text-[15.5px] font-medium">{item.label}</span>
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarUserCard({ collapsed, user, onLogout }) {
  const initials = user?.nama ? getInitials(user.nama) : '--';
  const roleLabel = user?.role ? ROLE_LABEL[user.role] || '' : '';

  return (
    <div
      className={cn(
        'mt-auto border-t border-zinc-100 px-3 pb-5 pt-4 dark:border-zinc-900',
        collapsed && 'flex flex-col items-center gap-3 px-2'
      )}
    >
      {collapsed ? (
        <div
          title={user?.nama ? `${user.nama} · ${roleLabel}` : undefined}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] bg-avatar text-base font-bold text-white shadow-sm"
        >
          {initials}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[20px] px-2 py-3">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-avatar text-base font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.nama || '—'}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-zinc-500 dark:text-zinc-400">
              {roleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar"
            title="Keluar"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-rose-500 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
          >
            <LogOut size={22} strokeWidth={2.1} />
          </button>
        </div>
      )}
    </div>
  );
}

function DesktopSidebar({ collapsed, onToggleCollapsed, menu, pathname, user, onLogout }) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-100 bg-white transition-[width] duration-200 ease-out dark:border-zinc-900 dark:bg-zinc-950 md:flex',
        collapsed ? 'w-[84px]' : 'w-[280px]'
      )}
    >
      <SidebarBrand collapsed={collapsed} onToggle={onToggleCollapsed} />
      <SidebarNav items={menu} collapsed={collapsed} pathname={pathname} />
      <SidebarUserCard collapsed={collapsed} user={user} onLogout={onLogout} />
    </aside>
  );
}

function MobileDrawer({ open, onClose, menu, pathname, user, onLogout }) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[90vw] shrink-0 flex-col border-r border-zinc-100 bg-white shadow-xl transition-transform duration-200 ease-out dark:border-zinc-900 dark:bg-zinc-950 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarBrand collapsed={false} onToggle={() => {}} />
        <SidebarNav items={menu} collapsed={false} pathname={pathname} onNavigate={onClose} />
        <SidebarUserCard collapsed={false} user={user} onLogout={onLogout} />
      </aside>
    </>
  );
}

export default function Sidebar({
  role,
  collapsed,
  onToggleCollapsed,
  drawerOpen,
  onDrawerClose,
  user,
}) {
  const pathname = usePathname() || '';
  const { logout } = useAuth();
  const router = useRouter();
  const menu = useMemo(() => getMenuForRole(role), [role]);

  async function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <>
      <DesktopSidebar
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        menu={menu}
        pathname={pathname}
        user={user}
        onLogout={handleLogout}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={onDrawerClose}
        menu={menu}
        pathname={pathname}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}

export { STORAGE_KEY_COLLAPSED };
