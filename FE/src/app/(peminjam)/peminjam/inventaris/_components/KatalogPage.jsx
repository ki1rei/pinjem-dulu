'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import EmptyState from '@/components/Common/EmptyState.jsx';
import InventarisCard from '@/components/Common/InventarisCard.jsx';
import InventarisCardSkeleton from '@/components/Common/InventarisCardSkeleton.jsx';
import MultiSelectFilter from '@/components/Common/MultiSelectFilter.jsx';
import PaginationButton from '@/components/Common/PaginationButton.jsx';
import PageHeader from '@/components/Common/PageHeader.jsx';

import { useDebounce } from '@/hooks/useDebounce.js';
import { getInventarisList } from '@/lib/api/inventaris.js';
import { getKategori } from '@/lib/api/kategori.js';
import { getOrganisasi } from '@/lib/api/organisasi.js';
import { CATALOG_QUERY_KEY } from '@/lib/catalog-nav.js';
import { cn } from '@/lib/utils.js';

/* -------------------------------------------------------------------------- */
/*                               PARSE QUERY URL                             */
/* -------------------------------------------------------------------------- */

function splitCsvStr(s) {
  if (!s || typeof s !== 'string') return [];
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function areArraysEqual(a = [], b = []) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function readFilterFromParams(searchParams) {
  return {
    q: searchParams.get('q') || '',
    idKategori: splitCsvStr(searchParams.get('kategori')),
    idOrganisasi: splitCsvStr(searchParams.get('oki')),
    page: Math.max(1, Number(searchParams.get('page') || 1)),
  };
}

/* -------------------------------------------------------------------------- */
/*                                HALAMAN KATALOG                             */
/* -------------------------------------------------------------------------- */

const LIMIT = 8;

function KatalogPageInner() {
  const sp = useSearchParams();
  const initial = useMemo(() => readFilterFromParams(sp), [sp]);

  // State filter.
  const [q, setQ] = useState(initial.q || '');
  const [debouncedQ, setDebouncedQ] = useDebounce(initial.q || '', 400);
  const [selectedKategori, setSelectedKategori] = useState(initial.idKategori);
  const [selectedOki, setSelectedOki] = useState(initial.idOrganisasi);
  const [page, setPage] = useState(initial.page);
  const isFirstMount = useRef(true);

  // Sinkronisasi URL → state (jika navigate back/forward).
  useEffect(() => {
    const next = readFilterFromParams(sp);
    setQ((prev) => (prev !== next.q ? next.q : prev));
    setDebouncedQ((prev) => (prev !== next.q ? next.q : prev));
    setSelectedKategori((prev) => (areArraysEqual(prev, next.idKategori) ? prev : next.idKategori));
    setSelectedOki((prev) => (areArraysEqual(prev, next.idOrganisasi) ? prev : next.idOrganisasi));
    setPage((prev) => (prev !== next.page ? next.page : prev));
  }, [sp, setDebouncedQ]);

  // Sinkronisasi state filter ke URL tanpa memicu request server RSC & simpan ke sessionStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      try {
        const currentSearch = window.location.search;
        if (currentSearch && currentSearch !== '?') {
          sessionStorage.setItem(CATALOG_QUERY_KEY, currentSearch);
        } else {
          sessionStorage.removeItem(CATALOG_QUERY_KEY);
        }
      } catch {
        // sessionStorage mungkin dinonaktifkan atau tidak tersedia
      }
      return;
    }

    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (selectedKategori.length) params.set('kategori', selectedKategori.join(','));
    if (selectedOki.length) params.set('oki', selectedOki.join(','));
    if (page > 1) params.set('page', String(page));

    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.replaceState(null, '', nextUrl);
    }

    try {
      const search = window.location.search;
      if (search && search !== '?') {
        sessionStorage.setItem(CATALOG_QUERY_KEY, search);
      } else {
        sessionStorage.removeItem(CATALOG_QUERY_KEY);
      }
    } catch {
      // sessionStorage mungkin dinonaktifkan atau tidak tersedia
    }
  }, [debouncedQ, selectedKategori, selectedOki, page]);

  /* ---------------------------------------------------------------------- */
  /*                          OPSI FILTER (KATEGORI + OKI)                  */
  /* ---------------------------------------------------------------------- */

  const [opsiKategori, setOpsiKategori] = useState([]);
  const [opsiOki, setOpsiOki] = useState([]);
  const [opsiLoading, setOpsiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setOpsiLoading(true);
        const [kat, oki] = await Promise.all([getKategori(), getOrganisasi()]);
        if (cancelled) return;
        setOpsiKategori((kat || []).map((k) => ({ value: k.idKategori, label: k.namaKategori })));
        setOpsiOki((oki || []).map((o) => ({ value: o.idOrganisasi, label: o.namaOrganisasi })));
      } finally {
        if (!cancelled) setOpsiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                             HANDLER PERUBAHAN                           */
  /* ---------------------------------------------------------------------- */

  const onQChange = (e) => {
    const v = e.target.value;
    setQ(v);
    setDebouncedQ(v);
    setPage(1);
  };

  const onKategoriChange = (next) => {
    setSelectedKategori(next);
    setPage(1);
  };

  const onOkiChange = (next) => {
    setSelectedOki(next);
    setPage(1);
  };

  const onPageChange = (p) => {
    setPage(p);
    // Scroll up agar data baru mulai dari atas.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------------------------------------------------------------------- */
  /*                              FETCH DATA LIST                           */
  /* ---------------------------------------------------------------------- */

  const [data, setData] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: LIMIT, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const totalPages = useMemo(() => {
    if (!meta?.total) return 1;
    return Math.max(1, Math.ceil(meta.total / (meta?.limit || LIMIT)));
  }, [meta]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await getInventarisList({
          search: debouncedQ,
          idKategori: selectedKategori,
          idOrganisasi: selectedOki,
          page,
          limit: LIMIT,
        });
        if (cancelled) return;
        setData(res.data);
        setMeta(res.meta);
      } catch (e) {
        if (!cancelled) {
          setError(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ, selectedKategori, selectedOki, page, retryKey]);

  const retry = () => {
    setRetryKey((x) => x + 1);
  };

  const displayData = data || [];

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                  */
  /* ---------------------------------------------------------------------- */

  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';

  const stateError = !!error;
  const stateLoading = loading && displayData.length === 0;
  const stateEmpty = !loading && !stateError && displayData.length === 0;

  return (
    <>
      <PageHeader
        title="Katalog Barang Inventaris"
        // description="Cari, filter, dan lihat detail barang inventaris yang dapat dipinjam."
      />

      {/* BARIS KONTROL: cari · filter Kategori · filter OKI */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="relative md:col-span-5 lg:col-span-6">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          />
          <Input
            value={q}
            onChange={onQChange}
            type="search"
            placeholder="Cari barang inventaris..."
            className="h-11 rounded-xl pl-10 pr-4"
            aria-label="Cari barang inventaris"
          />
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          {opsiLoading ? (
            <Skeleton className="h-11 w-full rounded-xl" />
          ) : (
            <MultiSelectFilter
              placeholder="Semua Kategori"
              searchPlaceholder="Cari kategori..."
              selectedPlural="Kategori"
              options={opsiKategori}
              value={selectedKategori}
              onChange={onKategoriChange}
            />
          )}
        </div>

        <div className="md:col-span-3 lg:col-span-3">
          {/* TODO(desain): Filter OKI tidak muncul di lampiran desain katalog.
              Ditambahkan sesuai kontrak API & supaya pengguna dapat menyaring
              per organisasi pemilik barang. Hapus atau pindahkan bila desain
              final menyatakan lain. */}
          {opsiLoading ? (
            <Skeleton className="h-11 w-full rounded-xl" />
          ) : (
            <MultiSelectFilter
              placeholder="Semua OKI"
              searchPlaceholder="Cari organisasi..."
              selectedPlural="OKI"
              options={opsiOki}
              value={selectedOki}
              onChange={onOkiChange}
            />
          )}
        </div>
      </div>

      {/* STATE: ERROR */}
      {stateError && (
        <div
          className={cn(
            'rounded-2xl border border-dashed border-destructive/50',
            'bg-destructive/5 p-6 text-center'
          )}
          role="alert"
        >
          <AlertTriangle size={28} className="mx-auto mb-2 text-destructive" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">Gagal memuat katalog</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Silakan cek koneksi Anda lalu coba lagi.
          </p>
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={retry} className="gap-2 rounded-xl">
              <RefreshCw size={14} aria-hidden="true" />
              Coba Lagi
            </Button>
          </div>
        </div>
      )}

      {/* STATE: LOADING (skeleton, hanya jika tidak punya data sebelumnya) */}
      {stateLoading && (
        <div className={gridClass}>
          {Array.from({ length: LIMIT }).map((_, i) => (
            <InventarisCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* STATE: KOSONG */}
      {stateEmpty && (
        <EmptyState
          title="Barang tidak ditemukan"
          description="Coba ubah kata kunci pencarian atau atur ulang filter kategori dan OKI."
        />
      )}

      {/* BERHASIL ADA DATA */}
      {displayData.length > 0 && (
        <>
          {loading && displayData.length > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none -mb-3 mt-1 text-xs text-muted-foreground"
            >
              Memperbarui daftar...
            </div>
          )}
          <div className={gridClass}>
            {displayData.map((inv) => (
              <InventarisCard key={inv.idInventaris} inventaris={inv} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationButton page={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default KatalogPageInner;
