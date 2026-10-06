// ============================================================
// RAIH — Root Layout
// ============================================================
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Raih — Platform Pencarian & Manajemen Kompetisi',
  description: 'Temukan, daftar, dan kelola partisipasi lomba/kompetisi akademik dan non-akademik terlengkap di Indonesia. Untuk pelajar, mahasiswa, dan masyarakat umum.',
  keywords: ['lomba', 'kompetisi', 'mahasiswa', 'pelajar', 'hackathon', 'olimpiade', 'Indonesia'],
  authors: [{ name: 'Raih Team' }],
  openGraph: {
    title: 'Raih — Platform Pencarian & Manajemen Kompetisi',
    description: 'Temukan ribuan lomba & kompetisi terpercaya di Indonesia',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
