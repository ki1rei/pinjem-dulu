import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import OrganisasiBadge from '@/components/Common/OrganisasiBadge.jsx';
import { LABEL_KONDISI } from '@/lib/constants.js';
import { cn } from '@/lib/utils.js';

/* Sub-komponen baris label & value */
const InfoRow = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-6 sm:justify-between">
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <div className="sm:text-right sm:max-w-[65%] sm:min-w-0 flex flex-col items-start sm:items-end">
      {children}
    </div>
  </div>
);

/**
 * Kartu informasi detail barang inventaris di kolom kanan.
 *
 * @param {{
 *   inventaris: {
 *     namaBarang: string,
 *     totalBarang: number,
 *     sisaHariIni: number,
 *     kondisi: string,
 *     namaOrganisasi: string,
 *     deskripsiBarang?: string
 *   },
 *   hrefAjukan: string
 * }} props
 */
export default function DetailInfoCard({ inventaris, hrefAjukan }) {
  const sisa = Number(inventaris?.sisaHariIni || 0);
  const total = Number(inventaris?.totalBarang || 0);
  const tersedia = sisa > 0;

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <header>
          <h2 className="text-base font-semibold sm:text-lg text-foreground">
            Detail Barang Inventaris
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Informasi ketersediaan, kondisi, dan pemilik barang.
          </p>
        </header>

        <div className="space-y-4 rounded-xl border border-border bg-background/60 p-3 sm:p-4">
          <InfoRow label="Tersedia hari ini">
            <span className="text-sm font-medium text-foreground">
              <span className="text-brand font-bold">{sisa}</span>{' '}
              <span className="text-muted-foreground font-normal">dari {total}</span>
            </span>
          </InfoRow>

          <div className="h-px w-full bg-border" />

          <InfoRow label="Kondisi">
            <span className="text-sm font-medium text-foreground">
              {LABEL_KONDISI[inventaris?.kondisi] || inventaris?.kondisi || '-'}
            </span>
          </InfoRow>

          {/* TODO(desain): Badge ketersediaan (hijau "Tersedia" / merah "Tidak Tersedia")
              belum ada spesifikasi visual resmi di desain detail.
              Menggunakan Badge varian success / danger sementara. */}
          <InfoRow label="Ketersediaan">
            {tersedia ? (
              <Badge variant="success" className="gap-1.5">
                <CheckCircle2 size={12} /> Tersedia
              </Badge>
            ) : (
              <Badge variant="danger" className="gap-1.5">
                <XCircle size={12} /> Tidak Tersedia
              </Badge>
            )}
          </InfoRow>

          <InfoRow label="Pemilik Inventaris">
            <div className="mt-0.5 sm:mt-0">
              <OrganisasiBadge nama={inventaris?.namaOrganisasi} size="md" />
            </div>
          </InfoRow>
        </div>

        {/* Deskripsi Barang */}
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Deskripsi
          </span>
          <p
            className={cn(
              'text-sm leading-relaxed text-foreground/90',
              'text-justify sm:text-justify',
              'max-sm:text-left'
            )}
          >
            {inventaris?.deskripsiBarang || 'Deskripsi belum tersedia.'}
          </p>
        </div>

        {/* Tombol Ajukan Peminjaman — tetap aktif meski sisaHariIni = 0 */}
        <Button
          asChild
          size="lg"
          className="w-full rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <Link
            href={hrefAjukan}
            aria-label={`Ajukan peminjaman ${inventaris?.namaBarang || 'barang'}`}
          >
            Ajukan Peminjaman
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
