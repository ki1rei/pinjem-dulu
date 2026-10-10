import { Suspense } from 'react';

import { genPageMetadata } from '@/app/seo';
import DetailPage from './_components/DetailPage.jsx';
import DetailSkeleton from './_components/DetailSkeleton.jsx';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return genPageMetadata({
    title: 'Detail Inventaris',
    description: `Informasi detail ketersediaan, kondisi, dan jadwal peminjaman barang inventaris #${id}.`,
  });
}

export default async function PeminjamInventarisDetailPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailPage id={id} />
    </Suspense>
  );
}
