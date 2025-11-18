'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, ReactNode, useEffect, useState } from 'react';

if (typeof window !== 'undefined') {
require('@solana/wallet-adapter-react-ui/styles.css');
}

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [endpoint, setEndpoint] = useState<string>('https://api.mainnet-beta.solana.com');
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  const network = WalletAdapterNetwork.Mainnet;
    const ep = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
    setEndpoint(ep);
    setWallets([new PhantomWalletAdapter()]);
  }, []);

  // Always render the providers, but with empty wallets until mounted
  // This ensures the context is always available
  const walletList = mounted ? wallets : [];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walletList} autoConnect={mounted}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

