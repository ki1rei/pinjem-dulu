import { genPageMetadata } from '@/app/seo';
import ErrorState from '@/components/Common/ErrorState';

export const metadata = genPageMetadata({
  title: 'Halaman tidak ditemukan',
  description: 'Halaman yang Anda cari tidak tersedia.',
});

const NotFound = () => {
  return <ErrorState code={404} />;
};

export default NotFound;
