import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

/**
 * Skeleton loader untuk halaman form pengajuan peminjaman.
 */
export default function AjukanSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-7 w-48 rounded-lg" />
      </div>

      <Card className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <CardContent className="p-0 space-y-6">
          <Skeleton className="h-8 w-64 rounded-lg" />

          {/* 4 Readonly Fields */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>

          {/* Jumlah Unit */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>

          {/* Tanggal Peminjaman & Pengembalian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>

          {/* Keperluan Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
