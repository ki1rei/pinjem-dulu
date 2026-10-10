import { genPageMetadata } from '@/app/seo';

import LoginView from './LoginView';

export const metadata = genPageMetadata({
  title: 'Masuk',
  description: 'Masuk ke Pinjam Dulu untuk mengelola peminjaman inventaris.',
});

const Login = () => {
  return <LoginView />;
};

export default Login;
