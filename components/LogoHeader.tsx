'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useAuthStore } from '@/stores/authStore';
import { WalletConnectButton } from './WalletConnectButton';
import { NeonButton } from './ui/NeonButton';

export function LogoHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey, disconnect } = useWalletSafe();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/strategy/new', label: 'Create Strategy' },
    { href: '/charts', label: 'Charts' },
    { href: '/competitions', label: 'Competitions' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  const shortenedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  const handleDisconnect = async () => {
    try {
      // Disconnect wallet
      if (disconnect && typeof disconnect === 'function') {
        await disconnect();
      }
      // Sign out from auth store
      await signOut();
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still redirect even if disconnect fails
      router.push('/');
    }
  };

  return (
    <header className="border-b border-[#1e1f22] bg-[#0C0C0D]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/iqlogobgrm.png"
                alt="TradeIQ Logo"
                width={32}
                height={32}
                className="transition-opacity group-hover:opacity-80"
              />
              <span className="text-xl font-display font-semibold text-white hidden sm:inline">
                TradeIQ
              </span>
            </Link>
            {pathname !== '/' && (
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-sans font-medium transition-all ${
                      pathname === item.href
                        ? 'text-white border-b-2 border-[#7CFF4F]'
                        : 'text-[#A9A9B3] hover:text-white hover:border-b-2 hover:border-[#7CFF4F]/40'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {mounted && connected && user ? (
              <>
                <div className="hidden sm:flex items-center gap-3 text-sm font-sans">
                  <div className="px-3 py-1.5 border border-[#7CFF4F]/40 bg-[#7CFF4F]/10 rounded-md">
                    <span className="text-[#7CFF4F] text-xs font-medium">Wallet: </span>
                    <span className="text-white">{shortenedAddress}</span>
                  </div>
                </div>
                <NeonButton 
                  size="sm" 
                  variant="secondary"
                  onClick={handleDisconnect}
                  className="border-[#FF617D]/40 text-[#FF617D] hover:bg-[#FF617D]/10 hover:border-[#FF617D]/60"
                >
                  Disconnect Wallet
                </NeonButton>
              </>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

