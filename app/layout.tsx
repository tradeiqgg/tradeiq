import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '@/lib/wallet';

export const metadata: Metadata = {
  title: 'TradeIQ — AI Trading IDE',
  description: 'Build AI Trading Algorithms in English. Trade. Compete. Earn.',
  icons: {
    icon: '/iqlogobgrm.png',
    apple: '/iqlogobgrm.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/iqlogobgrm.png" type="image/png" />
        <link rel="apple-touch-icon" href="/iqlogobgrm.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans">
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}

