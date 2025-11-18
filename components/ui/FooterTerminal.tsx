'use client';

import Link from 'next/link';

export function FooterTerminal() {
  return (
    <footer className="border-t border-[#1e1f22] bg-[#0B0B0C] mt-32">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-4">
              TradeIQ
            </h3>
            <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
              AI Trading IDE for building, testing, and competing with trading strategies.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-sans font-semibold text-white mb-4 uppercase tracking-wider">Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="https://github.com" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/discord" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Discord
                </Link>
              </li>
              <li>
                <Link href="https://x.com" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  X / Twitter
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-sans font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/strategy/new" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Create Strategy
                </Link>
              </li>
              <li>
                <Link href="/charts" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Charts
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="text-sm text-[#A9A9B3] font-sans hover:text-white transition-colors">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-sans font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
              TradeIQ is a simulated trading platform. All trading is done with fake capital. No real funds are at risk.
            </p>
          </div>
        </div>
        <div className="border-t border-[#1e1f22] pt-8 text-center">
          <p className="text-sm text-[#6f7177] font-sans">
            © 2025 TradeIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

