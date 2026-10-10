import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';

/**
 * Pagination berbasis tombol (bukan tautan), digunakan untuk kontrol list
 * yang paginasinya dikelola state lokal / query string.
 *
 * @param {{
 *   page: number,
 *   totalPages: number,
 *   onPageChange: (nextPage: number) => void,
 *   className?: string,
 * }} props
 */
const PaginationButton = ({ page = 1, totalPages = 1, onPageChange, className = '' }) => {
  const current = Math.max(1, Math.min(Number(page) || 1, Math.max(1, totalPages)));
  const max = Math.max(1, totalPages);

  const pageNumbers = useMemo(() => {
    // Tampilkan hingga 7 nomor halaman dengan ellipsis di ujung.
    const pages = [];
    const range = 1; // jumlah halaman di sekitar current (±range)
    for (let i = 1; i <= max; i++) {
      const isBoundary = i === 1 || i === max;
      const isNear = Math.abs(i - current) <= range;
      if (isBoundary || isNear) {
        pages.push(i);
      }
    }
    // Tambahkan ellipsis di celah.
    const withEllipsis = [];
    let prev = 0;
    for (const p of pages) {
      if (prev > 0 && p - prev > 1) withEllipsis.push('…');
      withEllipsis.push(p);
      prev = p;
    }
    return withEllipsis;
  }, [max, current]);

  const goPrev = () => {
    if (current > 1) onPageChange?.(current - 1);
  };
  const goNext = () => {
    if (current < max) onPageChange?.(current + 1);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('mx-auto flex w-full flex-col items-center gap-3', className)}
    >
      <div className="flex flex-row items-center flex-wrap gap-1 justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={current <= 1}
          className="gap-1 rounded-xl pl-2.5 pr-3"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Sebelumnya</span>
        </Button>

        {pageNumbers.map((p, idx) =>
          p === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant={p === current ? 'outline' : 'ghost'}
              size="icon"
              onClick={() => onPageChange?.(p)}
              aria-current={p === current ? 'page' : undefined}
              aria-label={`Halaman ${p}`}
              className={cn(
                'h-9 w-9 rounded-xl',
                p === current &&
                  'border-primary text-primary font-semibold bg-primary/5 dark:bg-primary/10'
              )}
            >
              {p}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={goNext}
          disabled={current >= max}
          className="gap-1 rounded-xl pl-3 pr-2.5"
          aria-label="Halaman berikutnya"
        >
          <span>Berikutnya</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default PaginationButton;
