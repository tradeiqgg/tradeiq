"use client";

import { ReactNode } from "react";

interface LockdownButtonProps {
  children: ReactNode;
  feature: string;
  onClick?: () => void;
  className?: string;
}

export function LockdownButton({ children, feature, onClick, className = "" }: LockdownButtonProps) {
  return (
    <button
      onClick={onClick}
      className={className}
      title={`${feature} is locked in staging mode`}
      disabled
    >
      {children}
    </button>
  );
}

