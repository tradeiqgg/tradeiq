// =====================================================================
// CHAPTER 12: Alert System Provider (Client-Side Initialization)
// =====================================================================

'use client';

import { useEffect } from 'react';
import { initializeAlertSystem } from '@/lib/alerts/init';

export function AlertSystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize alert system when component mounts
    initializeAlertSystem();
  }, []);

  return <>{children}</>;
}

