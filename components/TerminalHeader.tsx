'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnectButton } from './WalletConnectButton';
import { useAuthStore } from '@/stores/authStore';

export function TerminalHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD' },
    { href: '/strategy/new', label: 'CREATE STRATEGY' },
    { href: '/charts', label: 'CHARTS' },
    { href: '/competitions', label: 'COMPETITIONS' },
    { href: '/leaderboard', label: 'LEADERBOARD' },
  ];

  return (
    <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-lg font-bold text-primary font-mono group-hover:glow-lime transition-all">
                ./iQ
              </span>
              <span className="text-xl font-bold glow-cyan hidden sm:inline">TRADEIQ</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    pathname === item.href
                      ? 'text-primary border-b-2 border-primary glow-lime'
                      : 'text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 text-sm font-mono">
                <div className="px-3 py-1 border border-primary/30 bg-primary/5 rounded-sm">
                  <span className="text-primary">FAKE BAL: </span>
                  <span className="text-foreground glow-lime">${user.fake_balance.toFixed(2)}</span>
                </div>
                <div className="px-2 py-1 border border-border rounded-sm">
                  <span className="text-muted-foreground uppercase text-xs">{user.tier}</span>
                </div>
              </div>
            )}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

