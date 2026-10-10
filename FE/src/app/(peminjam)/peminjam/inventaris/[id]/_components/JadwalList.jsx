'use client';

import { useState } from 'react';
import { CalendarDays, AlertTriangle, RefreshCw } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton.jsx';
import EmptyState from '@/components/Common/EmptyState.jsx';
import JadwalItem from './JadwalItem.jsx';

/**
 * Bagian Jadwal Peminjaman di kolom kiri halaman detail.
 *
 * @param {{
 *   jadwal: Array<object>,
 *   loading: boolean,
 *   error: any,
 *   onRetry: () => void
 * }} props
 */
export default function JadwalList({ jadwal = [], loading = false, error = null, onRetry }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section
      aria-labelledby="jadwal-heading"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="jadwal-heading" className="text-base font-semibold sm:text-lg text-foreground">
            Jadwal Peminjaman
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Klik jadwal untuk melihat ketersediaan!
          </p>
        </div>
        <CalendarDays
          size={20}
          className="mt-1 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </div>

      {/* Error state spesifik jadwal — tidak membatalkan seluruh halaman */}
      {!loading && error && (
        <div
          role="note"
          className="mb-2 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Gagal memuat daftar jadwal</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                <RefreshCw size={12} /> coba lagi
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Keadaan kosong */}
      {!loading && !error && jadwal.length === 0 && (
        <EmptyState
          title="Belum ada jadwal peminjaman"
          description="Saat ini belum ada kegiatan yang memesan barang ini di masa mendatang."
        />
      )}

      {/* Daftar jadwal */}
      {!loading && !error && jadwal.length > 0 && (
        <ul className="flex flex-col gap-2" role="list">
          {jadwal.map((item, idx) => (
            <JadwalItem
              key={idx}
              item={item}
              open={!!expanded[idx]}
              onToggle={() => toggleExpand(idx)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
