import { Skeleton } from '@/components/ui/skeleton.jsx';

/**
 * Skeleton untuk InventarisCard. Dua belas buah dipakai saat katalog
 * sedang memuat untuk menghindari CLS.
 */
const InventarisCardSkeleton = ({ className = '' }) => {
  return (
    <div
      className={
        'flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ' +
        className
      }
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-3 aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="mb-2 h-3 w-24 rounded" />
      <Skeleton className="mb-1 h-4 w-full rounded" />
      <Skeleton className="mb-4 h-4 w-3/4 rounded" />
      <div className="mt-auto flex justify-end">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
};

export default InventarisCardSkeleton;
