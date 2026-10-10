'use client';

import { ChevronDown, Package, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

import StatusBadge from '@/components/Common/StatusBadge.jsx';
import { cn } from '@/lib/utils.js';
import { getStatusLabel } from '@/lib/constants.js';
import { formatTanggal, formatTanggalPendek } from '@/lib/format.js';

/**
 * Item baris jadwal peminjaman pada halaman detail inventaris.
 *
 * @param {{
 *   item: {
 *     startDate: string,
 *     endDate: string,
 *     bufferStartDate: string,
 *     bufferEndDate: string,
 *     jumlahPinjam: number,
 *     status: string,
 *     keperluan?: string,
 *     namaOrganisasi?: string
 *   },
 *   open: boolean,
 *   onToggle: () => void
 * }} props
 */
export default function JadwalItem({ item, open, onToggle }) {
  const startShort = formatTanggalPendek(item.startDate);
  const rentang = `${formatTanggal(item.startDate)} - ${formatTanggal(item.endDate)}`;

  return (
    <li
      className={cn(
        'rounded-xl border border-border bg-background transition-all',
        open && 'ring-1 ring-accent/40'
      )}
    >
      {/* TODO(desain): Perilaku klik baris jadwal belum ada di desain.
          Saat ini klik baris atau chevron berfungsi expand/collapse rincian sebaris.
          Bila ada interaksi klik lain (mis. kalender detail), sesuaikan nanti. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl p-3 text-left sm:p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Tanggal blok */}
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-zinc-50 text-center dark:bg-zinc-900 sm:h-16 sm:w-16">
          <span className="text-lg font-bold leading-none text-foreground sm:text-xl">
            {startShort.hari}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
            {startShort.bulan}
          </span>
        </div>

        {/* Keperluan & rentang tanggal */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground sm:text-base">
            {item.keperluan || 'Kegiatan'}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{rentang}</p>
        </div>

        {/* Badge & chevron desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          <StatusBadge status={item.status} label={getStatusLabel(item.status, 'peminjaman')} />
          <ChevronDown
            size={18}
            className={cn(
              'text-muted-foreground transition-transform duration-200',
              open && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Chevron mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <ChevronDown
            size={18}
            className={cn('text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Rincian sebaris saat diekspansi */}
      {open && (
        <div className="border-t border-border px-3 pb-4 pt-3 sm:px-5 sm:pb-5" role="region">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Jumlah Unit
                </dt>
                <dd className="text-sm font-medium text-foreground">{item.jumlahPinjam} unit</dd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  OKI Peminjam
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {item.namaOrganisasi || '-'}
                </dd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Hari Persiapan
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatTanggal(item.bufferStartDate)}
                </dd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-muted-foreground" aria-hidden="true" />
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Hari Pengecekan
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatTanggal(item.bufferEndDate)}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      )}
    </li>
  );
}
