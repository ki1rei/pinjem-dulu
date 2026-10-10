import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Pengajuan PJ',
  description: 'Ajukan diri sebagai Penanggung Jawab Inventaris untuk organisasi Anda.',
});

export default function PeminjamPengajuanPjPage() {
  return (
    <>
      <PageHeader
        title="Pengajuan PJ"
        description="Unggah surat persetujuan organisasi untuk menjadi Penanggung Jawab Inventaris."
      />
      <EmptyState
        title="Form belum tersedia"
        description="Form pengajuan PJ akan ditambahkan pada tahap berikutnya."
      />
    </>
  );
}
