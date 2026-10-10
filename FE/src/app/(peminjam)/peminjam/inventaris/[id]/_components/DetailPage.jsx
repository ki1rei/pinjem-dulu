'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import KategoriBadge from '@/components/Common/KategoriBadge.jsx';
import ImageWithFallback from '@/components/Common/ImageWithFallback.jsx';

import { getInventarisById, getPeminjamanAktif } from '@/lib/api/inventaris.js';
import { getBasePath } from '@/lib/navigation.js';
import { ROLES } from '@/lib/constants.js';
import { buildKatalogUrl, CATALOG_QUERY_KEY } from '@/lib/catalog-nav.js';

import DetailSkeleton from './DetailSkeleton.jsx';
import DetailInfoCard from './DetailInfoCard.jsx';
import JadwalList from './JadwalList.jsx';

/**
 * Halaman Detail Inventaris (Peminjam).
 * Menampilkan informasi lengkap barang inventaris beserta jadwal peminjaman aktif.
 *
 * @param {{ id?: string }} props
 */
export default function DetailPage({ id: propId }) {
  const params = useParams();
  const id = propId || params?.id;

  const base = getBasePath(ROLES.PEMINJAM);
  const baseKatalog = `${base}/inventaris`;
  const [hrefKatalog, setHrefKatalog] = useState(baseKatalog);
  const hrefAjukan = `${base}/inventaris/${encodeURIComponent(id || '')}/ajukan`;

  // Baca query katalog tersimpan dari sessionStorage setelah mount (hindari hydration mismatch).
  useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem(CATALOG_QUERY_KEY);
      if (savedQuery) {
        setHrefKatalog(buildKatalogUrl(baseKatalog, savedQuery));
      }
    } catch {
      // sessionStorage mungkin dinonaktifkan atau tidak tersedia
    }
  }, [baseKatalog]);

  const [inventaris, setInventaris] = useState(null);
  const [jadwal, setJadwal] = useState([]);

  const [loadingInv, setLoadingInv] = useState(true);
  const [loadingJadwal, setLoadingJadwal] = useState(true);

  const [errorInv, setErrorInv] = useState(null);
  const [errorJadwal, setErrorJadwal] = useState(null);

  const [retryKey, setRetryKey] = useState(0);

  // Fetch detail inventaris & jadwal secara terpisah dan paralel.
  // Kegagalan jadwal tidak membatalkan penampilan detail inventaris.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    // 1. Detail Inventaris
    setLoadingInv(true);
    setErrorInv(null);
    getInventarisById(id)
      .then((inv) => {
        if (!cancelled) setInventaris(inv);
      })
      .catch((e) => {
        if (!cancelled) setErrorInv(e);
      })
      .finally(() => {
        if (!cancelled) setLoadingInv(false);
      });

    // 2. Jadwal Peminjaman Aktif
    setLoadingJadwal(true);
    setErrorJadwal(null);
    getPeminjamanAktif(id)
      .then((list) => {
        if (!cancelled) setJadwal(list || []);
      })
      .catch((e) => {
        if (!cancelled) setErrorJadwal(e);
      })
      .finally(() => {
        if (!cancelled) setLoadingJadwal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  // Loading skeleton saat inventaris masih dimuat
  if (loadingInv) {
    return <DetailSkeleton />;
  }

  const is404 =
    !inventaris &&
    (errorInv?.status === 404 ||
      errorInv?.statusCode === 404 ||
      errorInv?.response?.status === 404);

  // Error 404 — Barang tidak ditemukan
  if (is404) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
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

  // Error umum pemuatan inventaris
  if (errorInv || !inventaris) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center sm:p-10">
          <AlertTriangle size={26} className="mx-auto mb-2 text-destructive" />
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Gagal memuat detail barang
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Silakan coba beberapa saat lagi atau kembali ke katalog.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => setRetryKey((x) => x + 1)}
            >
              <RefreshCw size={14} /> Coba Lagi
            </Button>
            <Button asChild variant="ghost" className="rounded-xl">
              <Link href={hrefKatalog}>Ke Katalog</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Baris Header: Panah Kembali + Nama Barang + KategoriBadge */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Kembali ke katalog inventaris"
            className="h-10 w-10 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Link href={hrefKatalog}>
              <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {inventaris.namaBarang}
          </h1>
        </div>
        <KategoriBadge nama={inventaris.namaKategori} />
      </div>

      {/* Konten Utama 2 Kolom */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Kolom Kiri: Gambar + Bagian Jadwal Peminjaman */}
        <div className="space-y-6 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4">
            <ImageWithFallback
              src={inventaris.thumbnail}
              alt={`Gambar ${inventaris.namaBarang}`}
              aspect="aspect-[16/10]"
              className="!rounded-xl"
            />
          </div>

          <JadwalList
            jadwal={jadwal}
            loading={loadingJadwal}
            error={errorJadwal}
            onRetry={() => setRetryKey((x) => x + 1)}
          />
        </div>

        {/* Kolom Kanan: Kartu Detail Barang Inventaris */}
        <div className="lg:col-span-2">
          <DetailInfoCard inventaris={inventaris} hrefAjukan={hrefAjukan} />
        </div>
      </div>
    </div>
  );
}
