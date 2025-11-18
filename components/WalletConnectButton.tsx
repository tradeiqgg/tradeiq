'use client';

import { useWalletSafe, useWalletModalSafe } from '@/lib/useWalletSafe';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState, useCallback } from 'react';

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { setPublicKey, signOut } = useAuthStore();
  const { 
    publicKey, 
    connected, 
    disconnect, 
    connect, 
    connecting,
    wallet,
    select,
    wallets 
  } = useWalletSafe();
  const { setVisible, visible } = useWalletModalSafe();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet connection and Supabase authentication
  useEffect(() => {
    if (!mounted) return;
    
    if (connected && publicKey) {
      // Wallet is connected - authenticate with Supabase
      console.log('Wallet connected:', publicKey.toBase58());
      setPublicKey(publicKey);
      // fetchUser will be called by setPublicKey in authStore
    } else if (!connected && !connecting) {
      // Wallet is disconnected
      setPublicKey(null);
      signOut();
    }
  }, [publicKey, connected, connecting, mounted, setPublicKey, signOut]);

  // Listen for wallet selection from modal and auto-connect
  useEffect(() => {
    if (!mounted) return;
    
    // When a wallet is selected but not connected, try to connect
    if (wallet && !connected && !connecting) {
      console.log('Wallet selected, attempting to connect...', wallet.adapter.name);
      
      const attemptConnect = async (retryCount = 0) => {
        try {
          // Check wallet adapter ready state
          const readyState = wallet.adapter.readyState;
          console.log('Wallet ready state:', readyState);
          
          // Wait for wallet to be ready (Installed means it's detected but may need time)
          if (readyState === 'Installed' || readyState === 'Loadable') {
            // Poll until ready or timeout
            let attempts = 0;
            const maxAttempts = 10;
            
            while (attempts < maxAttempts && wallet.adapter.readyState !== 'Installed') {
              await new Promise(resolve => setTimeout(resolve, 200));
              attempts++;
            }
          }
          
          // Additional wait to ensure adapter is fully initialized
          await new Promise(resolve => setTimeout(resolve, 300));
          
          if (connect && typeof connect === 'function') {
            console.log('Calling connect()...');
            await connect();
          }
        } catch (error: any) {
          console.error('Connection attempt error:', error);
          
          // Retry if wallet not ready (up to 3 times)
          if ((error?.name === 'WalletNotReadyError' || error?.message?.includes('not ready')) && retryCount < 3) {
            console.log(`Wallet not ready, retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/3)`);
            setTimeout(() => attemptConnect(retryCount + 1), (retryCount + 1) * 500);
          } else if (retryCount >= 3) {
            console.error('Failed to connect after multiple attempts. Please ensure Phantom wallet is installed and unlocked.');
          }
        }
      };
      
      // Initial delay to ensure wallet adapter is ready
      const timer = setTimeout(() => attemptConnect(0), 500);
      return () => clearTimeout(timer);
    }
  }, [wallet, connected, connecting, mounted, connect]);

  const handleConnect = () => {
    // Open the modal - clicking a wallet in the modal will trigger selection
    setVisible(true);
  };

  const handleDisconnect = async () => {
    try {
      if (disconnect && typeof disconnect === 'function') {
    await disconnect();
      }
    await signOut();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (!mounted) {
    return (
      <button
        className="btn-primary opacity-50"
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 border border-[#7CFF4F]/40 bg-[#7CFF4F]/10 rounded-md text-sm font-sans text-[#7CFF4F]">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
        <button
          onClick={handleDisconnect}
          className="btn-secondary border-[#FF617D]/40 text-[#FF617D] hover:bg-[#FF617D]/10"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="btn-primary"
      disabled={connecting}
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

