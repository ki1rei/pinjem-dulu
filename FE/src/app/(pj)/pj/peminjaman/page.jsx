import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Peminjaman',
  description: 'Tinjau dan proses pengajuan peminjaman.',
});

export default function PjPeminjamanPage() {
  return (
    <>
      <PageHeader title="Peminjaman" description="Tinjau pengajuan dari peminjam." />
      <EmptyState
        title="Tidak ada pengajuan"
        description="Daftar peminjaman akan tampil di sini."
      />
    </>
  );
}
