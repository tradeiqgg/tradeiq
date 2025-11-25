'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MobileBlockProps {
  children: React.ReactNode;
  allowViewing?: boolean; // Allow viewing but not editing
}

export function MobileBlock({ children, allowViewing = false }: MobileBlockProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isMobile && !allowViewing) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
        <div className="bg-[#111214] border-2 border-[#7CFF4F] rounded-lg p-8 max-w-md text-center space-y-6">
          <div className="text-5xl mb-4">⚠️</div>
          
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Desktop Required
          </h2>
          
          <p className="text-[#A9A9B3] font-sans leading-relaxed">
            The TradeIQ Strategy IDE is desktop-only. You may view strategies and explore features, but editing and running the IDE require a computer.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#7CFF4F] text-black font-display font-bold py-3 px-6 rounded-lg hover:bg-[#70e84b] transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-transparent border border-[#1e1f22] text-white font-display font-semibold py-3 px-6 rounded-lg hover:border-[#7CFF4F] transition-colors"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

