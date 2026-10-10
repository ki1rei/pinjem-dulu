import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Dashboard Peminjam',
  description: 'Ringkasan peminjaman inventaris Anda.',
});

export default function PeminjamDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan pengajuan dan peminjaman inventaris Anda."
      />
      <EmptyState
        title="Belum ada data"
        description="Fitur ringkasan akan diisi pada tahap pengembangan berikutnya."
      />
    </>
  );
}
