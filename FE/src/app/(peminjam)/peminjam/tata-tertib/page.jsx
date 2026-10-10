import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Tata Tertib',
  description: 'Ketentuan peminjaman inventaris organisasi mahasiswa.',
});

export default function PeminjamTataTertibPage() {
  return (
    <>
      <PageHeader title="Tata Tertib" description="Ketentuan peminjaman inventaris." />
      <EmptyState
        title="Konten menyusul"
        description="Naskah tata tertib akan dilengkapi kemudian."
      />
    </>
  );
}
