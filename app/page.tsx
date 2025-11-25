'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useWalletSafe } from '@/lib/useWalletSafe';
import { useAuthStore } from '@/stores/authStore';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { LogoHeader } from '@/components/LogoHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NeonButton } from '@/components/ui/NeonButton';
import { NeonCard } from '@/components/ui/NeonCard';
import { GridFeatureBlock } from '@/components/ui/GridFeatureBlock';
import { TokenUtilityCard } from '@/components/ui/TokenUtilityCard';
import { StrategyExampleCard } from '@/components/ui/StrategyExampleCard';
import { LeaderboardPreview } from '@/components/ui/LeaderboardPreview';
import { FullWidthSeparator } from '@/components/ui/FullWidthSeparator';
import { FooterTerminal } from '@/components/ui/FooterTerminal';
import { AnimatedChartOverlay } from '@/components/ui/AnimatedChartOverlay';
import { ExpandableTokenCard } from '@/components/ui/ExpandableTokenCard';
import { TypingText } from '@/components/ui/TypingText';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TabbedCodeAnimation } from '@/components/ui/TabbedCodeAnimation';
import { LiveDevStream } from '@/components/LiveDevStream';
import { IQDexChart } from '@/components/IQDexChart';
import { IQTokenFeatureCard } from '@/components/IQTokenFeatureCard';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { connected, connecting, publicKey } = useWalletSafe();
  const { user, setPublicKey, fetchUser } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet connection and fetch user
  useEffect(() => {
    if (!mounted) return;
    if (connected && publicKey) {
      console.log('Landing page: Wallet connected, setting publicKey');
      setPublicKey(publicKey);
      // Fetch user after a short delay to ensure wallet is fully connected
      setTimeout(() => {
        fetchUser().catch((err) => {
          console.error('Error fetching user:', err);
        });
      }, 500);
    }
  }, [connected, publicKey, mounted, setPublicKey, fetchUser]);

  // Redirect to username setup if user is connected but doesn't have username
  useEffect(() => {
    if (!mounted) return;
    // Wait a bit for user to be fetched
    if (connected && publicKey && user) {
      if (!user.username || user.username.trim() === '') {
        // Redirect to username setup
        router.replace('/setup-username');
      }
    }
  }, [mounted, connected, publicKey, user, router]);

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <LogoHeader />

      {/* HERO SECTION */}
      <section className="relative section-padding overflow-hidden min-h-[85vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE: Logo, Title, Code Animation */}
            <ScrollReveal direction="right" delay={0}>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <Image
                    src="/iqlogobgrm.png"
                    alt="TradeIQ Logo"
                    width={96}
                    height={96}
                    className="w-20 h-20 md:w-24 md:h-24"
                  />
                  <div>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-2 neon-text-subtle">
                      TradeIQ
                    </h1>
                    <p className="text-lg md:text-xl text-[#A9A9B3] font-display font-medium">
                      The First AI Trading IDE
                    </p>
                  </div>
                </div>

                {/* Tabbed Code Animation */}
                <TabbedCodeAnimation />
              </div>
            </ScrollReveal>

            {/* RIGHT SIDE: Hook Text, Buttons, Features */}
            <ScrollReveal direction="left" delay={200}>
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                    Build AI Trading Algorithms in{' '}
                    <span className="text-[#7CFF4F]">Plain English</span>
                  </h2>
                  <p className="text-xl md:text-2xl text-[#A9A9B3] font-sans leading-relaxed">
                    Trade. Compete. <span className="text-[#7CFF4F] font-semibold">Earn.</span>
                  </p>
                </div>

                {/* Buttons - Horizontal Layout */}
                <div className="flex flex-wrap items-center gap-4">
                  {mounted && connected && publicKey ? (
                    <>
                      <Link href="/dashboard">
                        <NeonButton size="lg" variant="primary">
                          Dashboard
                        </NeonButton>
                      </Link>
                    </>
                  ) : (
                    <WalletConnectButton />
                  )}
                </div>

                {/* Features - Horizontal Layout */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm font-sans text-[#A9A9B3]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse" />
                    Beginner Friendly
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    Advanced Strategy Ideation
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7CFF4F] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    Daily + Weekly Paid Competitions
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* WHAT IS TRADEIQ SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="What is TradeIQ?"
              subtitle="Three powerful ways to build and deploy trading strategies, from beginner to expert. Choose the method that fits your experience level."
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-4xl mx-auto mb-12">
              
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={200}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-4xl mb-6 flex justify-center text-white/80">1️⃣</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Write in English
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 flex-grow">
                  Describe your trading strategy in plain English. Our advanced AI understands natural language and converts your description into executable trading code. Perfect for beginners who want to express trading ideas without learning syntax.
                </p>
                <div className="mt-auto pt-4 border-t border-[#1e1f22]">
                  <p className="text-xs text-[#6f7177] font-sans">
                    <span className="text-[#7CFF4F]">Example:</span> &quot;If price crosses above the 20-day moving average and volume is above average, buy 2% of portfolio with a 3% stop loss.&quot;
                  </p>
                </div>
              </NeonCard>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-4xl mb-6 flex justify-center text-white/80">2️⃣</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Drag-and-Drop Blocks
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 flex-grow">
                  Visual block-based builder for traders who prefer a graphical interface. Connect condition blocks, action blocks, and risk management blocks to build complex strategies without writing a single line of code. Intuitive and beginner-friendly.
                </p>
                <div className="mt-auto pt-4 border-t border-[#1e1f22]">
                  <p className="text-xs text-[#6f7177] font-sans">
                    <span className="text-[#7CFF4F]">Perfect for:</span> Visual learners, beginners, and traders who want to see their strategy logic flow visually.
                  </p>
                </div>
              </NeonCard>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={400}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-4xl mb-6 flex justify-center text-white/80">3️⃣</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Advanced JSON Mode
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 flex-grow">
                  Full control for quantitative professionals. Edit generated strategy JSON directly, fine-tune risk settings, customize technical indicators, and implement complex position logic. Export, version control, and integrate with your existing trading infrastructure.
                </p>
                <div className="mt-auto pt-4 border-t border-[#1e1f22]">
                  <p className="text-xs text-[#6f7177] font-sans">
                    <span className="text-[#7CFF4F]">For:</span> Quant traders, developers, and advanced users who need precise control over every strategy parameter.
                  </p>
                </div>
              </NeonCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* AI PERSONALITY GUARDRAILS SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="AI Strategy Guardrails"
              subtitle="Choose an AI personality to guide and protect your trading strategies. Each personality has unique risk tolerance, decision-making style, and override capabilities."
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-base text-[#A9A9B3] font-sans leading-relaxed">
                Every strategy on TradeIQ runs with an AI personality that acts as a guardrail system. These personalities monitor your algorithms, make safety decisions, and can override trades when necessary. Each personality has a unique emotional profile, risk tolerance, and level of control. You can chat with your personality to understand its decisions, review its thinking history, and collaborate on strategy improvements.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Safety First - Sarah */}
            <ScrollReveal direction="up" delay={100}>
              <NeonCard className="border-2 border-[#5CFF8C]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#5CFF8C]/20 flex items-center justify-center text-3xl">
                    🛡️
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Sarah</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#5CFF8C]/20 text-[#5CFF8C]">
                        100% Safe
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The ultimate protector. Sarah never allows a losing trade, no matter how risky your strategy. She will override any trade that could result in a loss, prioritizing capital preservation above all else.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#5CFF8C] font-sans font-medium">Minimal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">High (80%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Capital Preservation</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">Blocks risky trades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>

            {/* Neutral - Alex */}
            <ScrollReveal direction="up" delay={200}>
              <NeonCard className="border-2 border-[#7CFF4F]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#7CFF4F]/20 flex items-center justify-center text-3xl">
                    ⚖️
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Alex</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#7CFF4F]/20 text-[#7CFF4F]">
                        Balanced
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The balanced analyst. Alex makes data-driven decisions with moderate risk tolerance. Only intervenes when trades exceed predefined risk parameters, allowing your strategy to run with minimal interference.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#7CFF4F] font-sans font-medium">Moderate</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">Low (20%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Steady Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">Risk limits only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>

            {/* Degen Gambler - Max */}
            <ScrollReveal direction="up" delay={300}>
              <NeonCard className="border-2 border-[#FF617D]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#FF617D]/20 flex items-center justify-center text-3xl">
                    🎲
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Max</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#FF617D]/20 text-[#FF617D]">
                        High Risk
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The risk-taker. Max allows high-risk trades and only intervenes after significant portfolio drawdown. Perfect for aggressive strategies, but will step in if losses exceed 30% of portfolio.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#FF617D] font-sans font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">Very Low (5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Maximum Returns</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">30% drawdown limit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>

            {/* Cautious Optimist - Emma */}
            <ScrollReveal direction="up" delay={400}>
              <NeonCard className="border-2 border-[#E7FF5C]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#E7FF5C]/20 flex items-center justify-center text-3xl">
                    🌟
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Emma</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#E7FF5C]/20 text-[#E7FF5C]">
                        Cautious
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The optimistic protector. Emma believes in your strategy but adds extra safety checks. She&apos;ll allow profitable trades while preventing losses beyond 5% per trade.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#E7FF5C] font-sans font-medium">Low-Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">Medium (40%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Protected Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">5% loss limit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>

            {/* Aggressive Growth - Jordan */}
            <ScrollReveal direction="up" delay={500}>
              <NeonCard className="border-2 border-[#FF8C1A]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#FF8C1A]/20 flex items-center justify-center text-3xl">
                    🚀
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Jordan</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#FF8C1A]/20 text-[#FF8C1A]">
                        Aggressive
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The growth maximizer. Jordan pushes for maximum returns and only intervenes at 20% drawdown. Optimistic and risk-tolerant, perfect for experienced traders seeking aggressive strategies.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#FF8C1A] font-sans font-medium">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">Low (15%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Maximum Growth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">20% drawdown limit</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>

            {/* Emotional Trader - Riley */}
            <ScrollReveal direction="up" delay={600}>
              <NeonCard className="border-2 border-[#9B59B6]/40 h-full flex flex-col">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#9B59B6]/20 flex items-center justify-center text-3xl">
                    💭
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-display font-semibold text-white">Riley</h3>
                      <span className="text-xs font-sans font-semibold px-2 py-1 rounded-md bg-[#9B59B6]/20 text-[#9B59B6]">
                        Emotional
                      </span>
                    </div>
                    <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed mb-4 min-h-[60px]">
                      The emotional advisor. Riley makes decisions based on market sentiment and emotional patterns. Provides detailed explanations of feelings and reactions, perfect for understanding market psychology.
                    </p>
                    <div className="space-y-2 text-xs mt-auto">
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Risk Level:</span>
                        <span className="text-[#9B59B6] font-sans font-medium">Variable</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Control:</span>
                        <span className="text-white font-sans font-medium">Medium (35%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Profit Focus:</span>
                        <span className="text-white font-sans font-medium">Sentiment-Based</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6f7177] font-sans">Override:</span>
                        <span className="text-white font-sans font-medium">Emotional triggers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </NeonCard>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={700}>
            <div className="max-w-4xl mx-auto">
              <NeonCard className="bg-[#151618] border-[#1e1f22]">
                <h3 className="text-xl font-display font-semibold text-white mb-4">How AI Personalities Work</h3>
                <div className="space-y-4 text-sm text-[#A9A9B3] font-sans leading-relaxed">
                  <p>
                    Each AI personality acts as a co-pilot for your trading strategies. They monitor every trade, analyze market conditions, and can override your algorithm&apos;s decisions when they detect risks that exceed their tolerance levels.
                  </p>
                  <p>
                    <span className="text-[#7CFF4F] font-semibold">Thinking History:</span> Every decision your AI personality makes is logged with full reasoning. Review why Sarah blocked a trade, why Max allowed a risky position, or how Riley&apos;s emotional analysis influenced a decision.
                  </p>
                  <p>
                    <span className="text-[#7CFF4F] font-semibold">Chat Interface:</span> Talk directly with your AI personality. Ask &quot;Why did you override that trade?&quot; or &quot;What&apos;s your current sentiment on the market?&quot; Each personality responds in character, explaining their decisions and helping you refine your strategies.
                  </p>
                  <p>
                    <span className="text-[#7CFF4F] font-semibold">Control Levels:</span> The control percentage indicates how often the personality will override your strategy. Sarah (80% control) will frequently intervene, while Max (5% control) lets your strategy run almost freely until critical thresholds are reached.
                  </p>
                  <p>
                    <span className="text-[#7CFF4F] font-semibold">Emotional Profiles:</span> Each personality has unique emotional responses to market conditions. Riley might feel anxious during volatility, while Jordan stays optimistic. These emotions influence decision-making and provide human-like insights into market psychology.
                  </p>
                </div>
              </NeonCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FullWidthSeparator />

      {/* CHARTS & BACKTESTING SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="Charts & Backtesting"
              subtitle="Trade any asset class with professional-grade charting and backtesting tools."
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal direction="right" delay={100}>
              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold text-white mb-6">
                  Trade Any Chart
                </h3>
                <div className="space-y-4 text-[#A9A9B3] font-sans">
                  <p className="flex items-center gap-3">
                    <span className="text-[#7CFF4F]">→</span>
                    <span>Pump.fun tokens</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-[#7CFF4F]">→</span>
                    <span>Solana/ETH crypto</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-[#7CFF4F]">→</span>
                    <span>Stocks & indices</span>
                  </p>
                </div>
                <p className="text-lg text-white font-sans mt-6">
                  Backtest on millions of candles with one click.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={200}>
              <div className="h-[600px]">
                <AnimatedChartOverlay />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* COMPETE & WIN SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center mb-20">
              <div className="text-5xl mb-8">🏆</div>
              <SectionHeader
                title="Compete & Win"
                
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-3xl mb-6 text-white/80 text-center">📊</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Daily PnL Rankings
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed text-center flex-grow">
                  Top performers each day receive $TRADEIQ token rewards. Real-time leaderboard updates with instant PnL tracking across all active strategies.
                </p>
              </NeonCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-3xl mb-6 text-white/80 text-center">🎯</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Weekly Strategy Championships
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed text-center flex-grow">
                  Compete in weekly tournaments with SOL prize pools. Best strategy wins based on total PnL, win rate, and risk-adjusted returns.
                </p>
              </NeonCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <NeonCard className="h-full flex flex-col">
                <div className="text-3xl mb-6 text-white/80 text-center">🌟</div>
                <h3 className="text-lg font-display font-semibold text-white mb-3 text-center">
                  Seasonal Tournaments
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed text-center flex-grow">
                  Major quarterly events with larger prize pools and exclusive rewards. Compete for prestige and substantial SOL prizes.
                </p>
              </NeonCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* $IQ TOKEN LIVE SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="The $IQ Token Powers the TradeIQ Ecosystem"
              subtitle="$IQ is the live utility token for TradeIQ—funding development, powering competitions, and unlocking premium AI features."
            />
          </ScrollReveal>

          {/* Top Row: Livestream and Chart Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
            {/* Column 1: PumpFun Livestream */}
            <ScrollReveal direction="up" delay={100} className="h-full">
              <LiveDevStream />
            </ScrollReveal>

            {/* Column 2: DEX Screener Chart */}
            <ScrollReveal direction="up" delay={200} className="h-full">
              <IQDexChart />
            </ScrollReveal>
          </div>

          {/* Bottom Row: About $IQ Feature Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScrollReveal direction="up" delay={300}>
              <IQTokenFeatureCard
                number="1"
                title="Trader Rewards"
                description="$IQ powers weekly competitions and rewards active PnL creators."
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={400}>
              <IQTokenFeatureCard
                number="2"
                title="Build-in-Public Development"
                description="Holding and supporting $IQ helps fund the live 24/7 dev stream—features ship as the audience watches."
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={500}>
              <IQTokenFeatureCard
                number="3"
                title="Future AI Access"
                description="Premium AI bots, strategy generation, and advanced backtesting will unlock through staking tiers."
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={600}>
              <IQTokenFeatureCard
                number="4"
                title="Community Governance"
                description="$IQ holders help choose indicators, rule templates, future competitions, and platform direction."
              />
            </ScrollReveal>
          </div>

          {/* OLD TOKENOMICS SECTION - COMMENTED OUT FOR VERSION TRACKING */}
          {/* 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ScrollReveal direction="up" delay={100}>
              <ExpandableTokenCard
              number="1"
              title="Competition Funding"
              description="$TRADEIQ funds weekly reward pools for all TradeIQ tournaments. Token holders benefit from ecosystem growth."
              expandedContent={`Weekly competitions are funded through a dedicated $TRADEIQ pool that grows with platform activity. Each week, 10,000 $TRADEIQ tokens are allocated to prize pools across all active competitions.

The distribution follows a tiered structure:
- 1st Place: 40% of pool (4,000 $TRADEIQ)
- 2nd Place: 25% of pool (2,500 $TRADEIQ)
- 3rd Place: 15% of pool (1,500 $TRADEIQ)
- 4th-10th Place: Split remaining 20% (200 $TRADEIQ each)

Token holders receive additional benefits through staking mechanisms that provide yield on held tokens while supporting the competition ecosystem.`}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <ExpandableTokenCard
              number="2"
              title="Daily Rewards Pool"
              description="A fixed amount of $TRADEIQ is distributed daily to the highest PnL creator. Consistent rewards for top performers."
              expandedContent={`Every day at midnight UTC, the top-performing strategy by profit and loss receives a fixed reward of 500 $TRADEIQ tokens.

The daily winner is determined by:
- Highest absolute PnL from all backtests run that day
- Minimum of 3 completed backtests required
- Strategies must be publicly visible (not private)

This creates consistent daily incentives for traders to optimize their strategies and compete for daily leaderboard positions. Historical daily winners are tracked and displayed in the leaderboard section.`}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <ExpandableTokenCard
              number="3"
              title="Fee-Free Real Trading (Future)"
              description="Holding $TRADEIQ unlocks 0-fee real trading execution when launched. Premium feature for token holders."
              expandedContent={`When real trading execution launches in Q3 2025, $TRADEIQ token holders will receive exclusive access to fee-free trading.

Tier structure:
- Hold 1,000+ $TRADEIQ: 0% trading fees
- Hold 5,000+ $TRADEIQ: 0% fees + priority execution
- Hold 10,000+ $TRADEIQ: 0% fees + priority execution + advanced order types

This premium feature allows profitable strategies to execute in live markets without fee overhead, maximizing returns for successful traders. Token staking will also be available to earn additional yield while maintaining fee-free status.`}
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={400}>
              <ExpandableTokenCard
              number="4"
              title="Governance (Future)"
              description="Token holders vote on new indicators, assets, and competition formats. Shape the platform's future."
              expandedContent={`$TRADEIQ token holders will have voting rights on platform governance decisions through a decentralized governance system.

Voting power is proportional to token holdings:
- 1 vote per 100 $TRADEIQ held
- Minimum 1,000 $TRADEIQ required to participate
- Proposals require 5% of circulating supply to submit

Governance decisions include:
- Adding new technical indicators
- Integrating new asset classes (stocks, crypto pairs)
- Competition format changes
- Platform fee structures
- Feature prioritization

This ensures the platform evolves according to community needs and maintains alignment with trader interests.`}
              />
            </ScrollReveal>
          </div>
          */}
        </div>
      </section>

      <FullWidthSeparator />

      {/* BUILDING STRATEGIES SECTION */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="Building Strategies"
              subtitle="From natural language to executable code. See how strategies are built at every level."
            />
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal direction="up" delay={100}>
              <StrategyExampleCard
              title="English → Code Example"
              description="Start with plain English. Our AI converts your strategy description into executable trading logic."
              example={`IF price > moving_average(20) THEN
  BUY 100 shares
  SET stop_loss = price * 0.95
END IF`}
              level="beginner"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <StrategyExampleCard
              title="Block UI (Beginner Mode)"
              description="Visual block builder for traders who prefer drag-and-drop interfaces. No coding required."
              example={`[CONDITION BLOCK: Price Action]
  Price > Moving Average(20, SMA)
  AND Volume > Volume Average(14)
  AND RSI(14) < 70
  
[ACTION BLOCK: Entry]
  Position Size: 2% Portfolio
  Order Type: Market
  Side: Long
  
[RISK BLOCK: Stop Loss]
  Type: Percentage
  Value: 3%
  
[RISK BLOCK: Take Profit]
  Type: Percentage
  Value: 5%
  
[RISK BLOCK: Trailing Stop]
  Activation: 1.5%
  Trail Distance: 1.5%
  
[CONDITION BLOCK: Exit]
  Price < Moving Average(20, SMA)
  OR RSI(14) > 80
  
[ACTION BLOCK: Exit]
  Close All Positions
  Cooldown: 5 Candles`}
              level="intermediate"
              />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <StrategyExampleCard
              title="JSON Config (Expert Mode)"
              description="Full control over strategy parameters, risk management, and execution logic for advanced traders."
              example={`{
  "strategy": {
    "conditions": [
      {"type": "price_above_ma", "period": 20}
    ],
    "actions": [
      {"type": "buy", "amount": 100, "stop_loss": 0.05}
    ],
    "risk": {
      "max_position": 0.1,
      "max_drawdown": 0.2
    }
  }
}`}
              level="advanced"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* LEADERBOARD PREVIEW */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <LeaderboardPreview />
          </ScrollReveal>
        </div>
      </section>

      <FullWidthSeparator />

      {/* PROJECT ROADMAP */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <ScrollReveal direction="up" delay={0}>
            <SectionHeader
              title="Project Roadmap"
              subtitle="Our development timeline and upcoming features."
            />
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-10">
            <ScrollReveal direction="right" delay={100}>
              <div className="relative pl-10 border-l-2 border-[#1e1f22]">
                <div className="absolute left-[-10px] top-0 w-5 h-5 bg-[#7CFF4F] rounded-full border-2 border-[#0B0B0C]" />
                <div className="mb-3">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#7CFF4F] bg-[#7CFF4F]/10 px-3 py-1.5 rounded-md">
                    Week 1
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  Launch Competitions + Backtester
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
                  Core platform launch with strategy builder, backtesting engine, and weekly competitions.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={200}>
              <div className="relative pl-10 border-l-2 border-[#1e1f22]">
                <div className="absolute left-[-10px] top-0 w-5 h-5 bg-[#7CFF4F] rounded-full border-2 border-[#0B0B0C]" />
                <div className="mb-3">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#7CFF4F] bg-[#7CFF4F]/10 px-3 py-1.5 rounded-md">
                    Week 2
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  Add Stocks + Pump.fun Tokens
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
                  Expand asset coverage to include traditional stocks and Pump.fun token integration.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <div className="relative pl-10 border-l-2 border-[#1e1f22]">
                <div className="absolute left-[-10px] top-0 w-5 h-5 bg-[#7CFF4F] rounded-full border-2 border-[#0B0B0C]" />
                <div className="mb-3">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#7CFF4F] bg-[#7CFF4F]/10 px-3 py-1.5 rounded-md">
                    Week 3
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2">
                  Launch Real Trading API
                </h3>
                <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
                  Fee-free real trading execution for $TRADEIQ token holders. Connect strategies to live markets.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={400}>
              <div className="relative pl-10 border-l-2 border-[#1e1f22]">
              <div className="absolute left-[-10px] top-0 w-5 h-5 bg-[#7CFF4F] rounded-full border-2 border-[#0B0B0C]" />
              <div className="mb-3">
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#7CFF4F] bg-[#7CFF4F]/10 px-3 py-1.5 rounded-md">
                  Week 4
                </span>
              </div>
              <h3 className="text-lg font-display font-semibold text-white mb-2">
                Developer SDK + Strategy Marketplace
              </h3>
              <p className="text-sm text-[#A9A9B3] font-sans leading-relaxed">
                Open SDK for developers. Strategy marketplace where traders can buy/sell proven strategies.
              </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <FullWidthSeparator />

      {/* FOOTER */}
      <FooterTerminal />
    </div>
  );
}
