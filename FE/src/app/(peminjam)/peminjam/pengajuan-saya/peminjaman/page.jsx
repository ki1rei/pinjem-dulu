import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Peminjaman',
  description: 'Daftar pengajuan peminjaman yang Anda ajukan.',
});

export default function PeminjamPengajuanSayaPeminjamanPage() {
  return (
    <>
      <PageHeader
        title="Peminjaman"
        description="Lihat status pengajuan peminjaman (Diajukan, Disetujui, Dipinjam, Ditolak)."
      />
      <EmptyState
        title="Belum ada pengajuan"
        description="Daftar pengajuan peminjaman akan ditampilkan di sini."
      />
    </>
  );
}
