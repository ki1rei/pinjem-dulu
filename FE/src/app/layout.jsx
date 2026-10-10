import { Poppins as FontSans } from 'next/font/google';
import './globals.css';

import { siteMetadata } from '@/data/siteMetadata';
import ThemeProvider from '@/providers/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

const fontSans = FontSans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl || 'http://localhost:3000'),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.headerTitle}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${fontSans.className} min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
