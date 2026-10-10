import { Skeleton } from '@/components/ui/skeleton.jsx';

/**
 * Skeleton placeholder saat detail inventaris sedang dimuat.
 * @param {{ hrefKatalog?: string }} props
 */
export default function DetailSkeleton() {
  return (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite">
      {/* Header baris: tombol kembali, judul barang, kategori */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <Skeleton className="h-7 w-48 sm:w-64 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
      </div>

      {/* Grid 2 kolom */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Kolom kiri: gambar + jadwal */}
        <div className="space-y-6 lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-60 rounded-md" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Kolom kanan: kartu detail barang */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-56 rounded-md" />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-background/50 p-4">
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
              <Skeleton className="h-5 w-full rounded-md" />
            </div>

            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-5/6 rounded-md" />
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>

            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
