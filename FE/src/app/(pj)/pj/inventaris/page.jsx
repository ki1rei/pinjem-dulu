import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Kelola Inventaris',
  description: 'Kelola barang inventaris organisasi.',
});

export default function PjInventarisPage() {
  return (
    <>
      <PageHeader title="Inventaris" description="Kelola data barang organisasi Anda." />
      <EmptyState
        title="Daftar kosong"
        description="Pengelolaan inventaris akan ditambahkan nanti."
      />
    </>
  );
}
