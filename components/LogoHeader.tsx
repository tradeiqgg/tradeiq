"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWalletSafe } from "@/lib/useWalletSafe";
import { useAuthStore } from "@/stores/authStore";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { NotificationBell } from "@/components/alerts/NotificationBell";

export function LogoHeader() {
  const pathname = usePathname();
  const { connected, publicKey, disconnect } = useWalletSafe();
  const { user, signOut } = useAuthStore();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/discover", label: "Discover" },
    { href: "/competitions", label: "Competitions" },
    { href: "/leaderboard", label: "Leaderboard" },
    ...(connected && publicKey ? [{ href: "/community", label: "Community Chat" }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname?.startsWith("/dashboard") || pathname?.startsWith("/strategy");
    }
    return pathname === href;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      signOut();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0C]/95 backdrop-blur-sm border-b border-[#1e1f22]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/iqlogobgrm.png"
              alt="TradeIQ Logo"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="text-xl md:text-2xl font-display font-bold text-white">
              TradeIQ
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 text-sm font-sans font-medium transition-colors
                  ${
                    isActive(link.href)
                      ? "text-[#7CFF4F] border-b-2 border-[#7CFF4F]"
                      : "text-[#A9A9B3] hover:text-white"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect/Disconnect */}
          <div className="flex items-center gap-4">
            {connected && publicKey && <NotificationBell />}
            {connected && publicKey ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111214] border border-[#1e1f22] rounded-md">
                  <div className="w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse" />
                  <span className="text-sm text-[#A9A9B3] font-mono">
                    {user?.username || formatAddress(publicKey.toBase58())}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-sm text-[#A9A9B3] hover:text-white border border-[#1e1f22] rounded-md hover:border-[#7CFF4F]/40 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

