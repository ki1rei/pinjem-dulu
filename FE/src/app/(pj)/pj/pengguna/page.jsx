import EmptyState from '@/components/Common/EmptyState';
import PageHeader from '@/components/Common/PageHeader';
import { genPageMetadata } from '@/app/seo';

export const metadata = genPageMetadata({
  title: 'Pengguna',
  description: 'Kelola pengguna yang terkait dengan organisasi.',
});

export default function PjPenggunaPage() {
  return (
    <>
      <PageHeader title="Pengguna" description="Kelola akun yang terhubung ke organisasi." />
      <EmptyState title="Daftar kosong" description="Manajemen pengguna akan ditambahkan nanti." />
    </>
  );
}
