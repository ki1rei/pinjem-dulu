'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { getInventarisById, getPeminjamanAktif } from '@/lib/api/inventaris.js';
import { getSystemToday } from '@/lib/api/peminjaman.js';
import { getBasePath } from '@/lib/navigation.js';
import { ROLES } from '@/lib/constants.js';
import { buildKatalogUrl, CATALOG_QUERY_KEY } from '@/lib/catalog-nav.js';

import AjukanSkeleton from './AjukanSkeleton.jsx';
import AjukanForm from './AjukanForm.jsx';

/**
 * Kontainer pemuatan data dan orkestrasi untuk formulir pengajuan peminjaman.
 */
export default function AjukanContainer({ id }) {
  const { user } = useAuth();

  const base = getBasePath(ROLES.PEMINJAM);
  const baseKatalog = `${base}/inventaris`;
  const [hrefKatalog, setHrefKatalog] = React.useState(baseKatalog);
  const hrefDetail = `${baseKatalog}/${encodeURIComponent(id || '')}`;

  // Pulihkan parameter filter/pencarian katalog dari sessionStorage
  React.useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem(CATALOG_QUERY_KEY);
      if (savedQuery) {
        setHrefKatalog(buildKatalogUrl(baseKatalog, savedQuery));
      }
    } catch {
      // Abaikan bila sessionStorage tidak tersedia
    }
  }, [baseKatalog]);

  const [inventaris, setInventaris] = React.useState(null);
  const [jadwal, setJadwal] = React.useState([]);

  const [loadingInv, setLoadingInv] = React.useState(true);
  const [loadingJadwal, setLoadingJadwal] = React.useState(true);

  const [errorInv, setErrorInv] = React.useState(null);
  const [errorJadwal, setErrorJadwal] = React.useState(null);

  const [retryJadwalKey, setRetryJadwalKey] = React.useState(0);
  const [retryInvKey, setRetryInvKey] = React.useState(0);

  // Ambil tanggal acuan hari ini dari sistem
  const today = getSystemToday();

  // 1. Ambil detail inventaris
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoadingInv(true);
    setErrorInv(null);

    getInventarisById(id)
      .then((data) => {
        if (!cancelled) setInventaris(data);
      })
      .catch((err) => {
        if (!cancelled) setErrorInv(err);
      })
      .finally(() => {
        if (!cancelled) setLoadingInv(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryInvKey]);

  // 2. Ambil jadwal peminjaman aktif
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoadingJadwal(true);
    setErrorJadwal(null);

    getPeminjamanAktif(id)
      .then((data) => {
        if (!cancelled) setJadwal(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setErrorJadwal(err);
      })
      .finally(() => {
        if (!cancelled) setLoadingJadwal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryJadwalKey]);

  // State Memuat Awal
  if (loadingInv) {
    return <AjukanSkeleton />;
  }

  const is404 =
    !inventaris &&
    (errorInv?.status === 404 ||
      errorInv?.statusCode === 404 ||
      errorInv?.response?.status === 404);

  // Error 404 — Barang Tidak Ditemukan
  if (is404) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12 shadow-sm">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={28} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Barang tidak ditemukan
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Barang dengan ID yang Anda cari tidak tersedia atau sudah dihapus.
          </p>
          <div className="mt-5">
            <Button asChild className="rounded-xl">
              <Link href={hrefKatalog}>Kembali ke Katalog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error umum memuat inventaris
  if (errorInv || !inventaris) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center sm:p-10 shadow-sm">
          <AlertTriangle size={26} className="mx-auto mb-2 text-destructive" />
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Gagal memuat barang inventaris
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Silakan coba muat ulang atau kembali ke katalog inventaris.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => setRetryInvKey((k) => k + 1)}
            >
              <RefreshCw size={15} />
              Coba Lagi
            </Button>
            <Button asChild className="rounded-xl">
              <Link href={hrefKatalog}>Kembali ke Katalog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto space-y-5">
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Kembali ke detail barang"
          className="h-10 w-10 shrink-0 rounded-full border border-border hover:bg-muted text-foreground"
        >
          <Link href={hrefDetail}>
            <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Kembali ke detail barang</span>
      </div>

      {/* Peringatan jika jadwal booking gagal dimuat */}
      {errorJadwal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />
            <span>
              Gagal memuat jadwal peminjaman. Pemilihan tanggal dinonaktifkan demi keakuratan kuota.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRetryJadwalKey((k) => k + 1)}
            className="shrink-0 rounded-xl gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="size-3.5" />
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Formulir Pengajuan */}
      <AjukanForm
        user={user}
        inventaris={inventaris}
        jadwal={jadwal}
        jadwalDisabled={Boolean(errorJadwal) || loadingJadwal}
        today={today}
        hrefDetail={hrefDetail}
        hrefKatalog={hrefKatalog}
      />
    </div>
  );
}
