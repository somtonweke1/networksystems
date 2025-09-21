import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NetworkOracle Pro - Advanced Network Intelligence Platform',
  description: 'World-class network intelligence platform with advanced graph theory algorithms and enterprise-grade analytics',
  keywords: ['network analysis', 'graph theory', 'centrality', 'network visualization', 'business intelligence'],
  authors: [{ name: 'NetworkOracle Team' }],
  creator: 'NetworkOracle Pro',
  publisher: 'NetworkOracle Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'NetworkOracle Pro',
    description: 'Advanced Network Intelligence Platform',
    url: '/',
    siteName: 'NetworkOracle Pro',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetworkOracle Pro',
    description: 'Advanced Network Intelligence Platform',
    creator: '@networkoracle',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
