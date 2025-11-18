'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef } from 'react';

// Hooks are always called - context is provided by WalletContextProvider
export function useWalletSafe() {
  const wallet = useWallet();
  return wallet;
}

export function useWalletModalSafe() {
  const prevVisibleRef = useRef(false);
  const modal = useWalletModal();
  const { visible } = modal;
  
  // Track when modal closes to trigger connection if wallet was selected
  useEffect(() => {
    if (prevVisibleRef.current && !visible) {
      // Modal just closed - check if we need to trigger connection
      // This will be handled by the component using this hook
    }
    prevVisibleRef.current = visible;
  }, [visible]);
  
  return modal;
}

