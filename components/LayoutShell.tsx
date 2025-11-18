'use client';

import { ReactNode } from 'react';
import { LogoHeader } from './LogoHeader';

export function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col">
      <LogoHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

