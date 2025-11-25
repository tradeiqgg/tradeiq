"use client";

import { ReactNode } from "react";
import { LogoHeader } from "@/components/LogoHeader";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <LogoHeader />
      <main>{children}</main>
    </div>
  );
}

