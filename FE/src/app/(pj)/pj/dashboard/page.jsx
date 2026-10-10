import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Dashboard Penanggung Jawab',
  description: 'Ringkasan pengelolaan inventaris dan peminjaman.',
});

export default function PjDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan inventaris, pengajuan, dan pengembalian."
      />
      <EmptyState
        title="Belum ada data"
        description="Ringkasan penanggung jawab akan diisi pada tahap berikutnya."
      />
    </>
  );
}
