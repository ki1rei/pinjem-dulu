import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Pengembalian',
  description:
    'Daftar peminjaman yang menunggu konfirmasi pengembalian, sudah dikembalikan, atau terlambat.',
});

export default function PeminjamPengajuanSayaPengembalianPage() {
  return (
    <>
      <PageHeader
        title="Pengembalian"
        description="Tab: Menunggu, Dikembalikan, Terlambat. Ajukan pengembalian untuk barang yang sudah selesai dipakai."
      />
      <EmptyState
        title="Belum ada data"
        description="Daftar pengembalian akan ditampilkan di sini."
      />
    </>
  );
}
