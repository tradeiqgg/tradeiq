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
  
  // Initialize wallets immediately - don't wait for mount
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
    // Create wallet adapter instance
    const phantom = new PhantomWalletAdapter();
    return [phantom];
  }, []);

  // Initialize endpoint
  const endpoint = useMemo(() => {
    const network = WalletAdapterNetwork.Mainnet;
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={mounted}
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

