import type {Metadata} from 'next';
import {Plus_Jakarta_Sans} from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Sanggup Ga? - Kalkulator Biaya Hidup Indonesia',
  description: 'Cek apakah gajimu cukup untuk hidup di kota tujuanmu, di tengah ekonomi sekarang.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
