import { Suspense } from 'react';
import { genPageMetadata } from '@/app/seo';
import AjukanContainer from './_components/AjukanContainer.jsx';
import AjukanSkeleton from './_components/AjukanSkeleton.jsx';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return genPageMetadata({
    title: 'Ajukan Peminjaman',
    description: `Formulir pengajuan peminjaman barang inventaris #${id} OKI kampus.`,
  });
}

/**
 * Halaman Pengajuan Peminjaman Barang Inventaris (Peminjam).
 */
export default async function PeminjamInventarisAjukanPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<AjukanSkeleton />}>
      <AjukanContainer id={id} />
    </Suspense>
  );
}
