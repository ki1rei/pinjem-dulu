'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import ThemeToggle from '@/components/Common/ThemeToggle';

const BrandLogo = ({ className = '' }) => (
  <span
    className={`inline-flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-primary text-white shadow-sm ${className}`}
  >
    <Sparkles size={22} strokeWidth={2.2} />
  </span>
);

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-zinc-900 dark:text-white"
          aria-label="PinjemDulu beranda"
        >
          <BrandLogo />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              <span className="text-zinc-900 dark:text-zinc-100">Pinjem</span>
              <span className="text-primary dark:text-blue-400">Dulu</span>
            </span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              Inventaris OKI Kampus
            </span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 dark:hover:bg-primary/95"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
export { BrandLogo };
