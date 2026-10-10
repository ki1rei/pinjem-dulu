import { Suspense } from 'react';

import { genPageMetadata } from '@/app/seo';
import KatalogPageInner from './_components/KatalogPage.jsx';

export const metadata = genPageMetadata({
  title: 'Inventaris',
  description:
    'Katalog barang inventaris OKI kampus. Cari dan ajukan peminjaman barang dengan mudah.',
});

export default function PeminjamInventarisPage() {
  return (
    <Suspense fallback={<div className="h-40 w-full animate-pulse" aria-hidden="true" />}>
      <KatalogPageInner />
    </Suspense>
  );
}
