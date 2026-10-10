import Footer from '@/components/Mixins/Footer';
import Navbar from '@/components/Mixins/Navbar';

export default function RootGroupLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      <Footer />
    </>
  );
}
