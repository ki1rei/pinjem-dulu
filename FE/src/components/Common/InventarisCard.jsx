import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';
import { getBasePath } from '@/lib/navigation.js';
import { ROLES } from '@/lib/constants.js';
import OrganisasiBadge from './OrganisasiBadge.jsx';
import KategoriBadge from './KategoriBadge.jsx';
import ImageWithFallback from './ImageWithFallback.jsx';

/**
 * Kartu inventaris di katalog. SELURUH kartu dapat diklik untuk menuju detail.
 * Tombol panah di kanan bawah tetap ada sebagai affordance.
 *
 * Prop `inventaris` berbentuk sesuai kontrak Inventaris.
 */
const InventarisCard = ({ inventaris, baseRole = ROLES.PEMINJAM, className = '' }) => {
  if (!inventaris) return null;
  const {
    idInventaris,
    namaBarang,
    thumbnail,
    namaKategori,
    namaOrganisasi,
    sisaHariIni,
    totalBarang,
  } = inventaris;

  const base = getBasePath(baseRole);
  const hrefDetail = `${base}/inventaris/${encodeURIComponent(idInventaris)}`;
  const habis = Number(sisaHariIni) <= 0;

  return (
    <Link
      href={hrefDetail}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700',
        className
      )}
      aria-label={`Lihat detail ${namaBarang}`}
    >
      {/* Baris atas: OKI (kiri) · Kategori (kanan) */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <OrganisasiBadge nama={namaOrganisasi} size="sm" />
        <KategoriBadge nama={namaKategori} />
      </div>

      {/* Gambar */}
      <div className="mb-3">
        <ImageWithFallback src={thumbnail} alt={`Gambar ${namaBarang}`} aspect="aspect-[4/3]" />
      </div>

      {/* Teks ketersediaan · nama barang */}
      <div className="flex-1 space-y-2">
        <p
          className={cn(
            'text-xs font-medium',
            habis ? 'text-destructive' : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {sisaHariIni} / {totalBarang} Tersedia
        </p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-primary">
          {namaBarang}
        </h3>
      </div>

      {/* Tombol panah kanan bawah */}
      <div className="mt-4 flex items-center justify-end">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          tabIndex={-1}
          aria-label={`Lihat detail ${namaBarang}`}
          className={cn(
            'h-9 w-9 rounded-full border border-zinc-200 text-zinc-500 transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white dark:border-zinc-800 dark:text-zinc-400 dark:group-hover:border-primary dark:group-hover:text-primary-foreground'
          )}
        >
          <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </Button>
      </div>
    </Link>
  );
};

export default InventarisCard;
