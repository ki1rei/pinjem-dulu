import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Konfirmasi Pengembalian',
  description: 'Konfirmasi barang yang dikembalikan peminjam.',
});

export default function PjPengembalianPage() {
  return (
    <>
      <PageHeader title="Pengembalian" description="Konfirmasi pengembalian dari peminjam." />
      <EmptyState
        title="Tidak ada pengembalian"
        description="Antrian konfirmasi pengembalian akan tampil di sini."
      />
    </>
  );
}
