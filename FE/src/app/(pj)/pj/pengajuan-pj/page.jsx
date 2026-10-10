import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'List Pengajuan PJ',
  description: 'Daftar permintaan menjadi Penanggung Jawab Inventaris untuk organisasi Anda.',
});

export default function PjPengajuanPjPage() {
  return (
    <>
      <PageHeader
        title="List Pengajuan PJ"
        description="Setujui atau tolak permintaan menjadi Penanggung Jawab Inventaris."
      />
      <EmptyState
        title="Belum ada permintaan"
        description="Daftar pengajuan PJ akan ditampilkan di sini."
      />
    </>
  );
}
