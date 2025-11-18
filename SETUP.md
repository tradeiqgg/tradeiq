# TRADEIQ Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint (defaults to mainnet)
   - AI API keys (optional for now)

3. **Set Up Supabase Database**
   
   Run the migration file in your Supabase SQL editor:
   ```bash
   # Copy contents of supabase/migrations/001_initial_schema.sql
   # Paste into Supabase SQL Editor and run
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
TradeIQ.gg/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── strategy/           # Strategy builder pages
│   ├── charts/             # Charts explorer
│   ├── competitions/       # Competitions page
│   ├── leaderboard/        # Leaderboard page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── WalletConnectButton.tsx
│   ├── TerminalHeader.tsx
│   ├── LayoutShell.tsx
│   ├── StrategyCard.tsx
│   ├── BlockEditor.tsx
│   └── ChartViewer.tsx
├── lib/                    # Utilities
│   ├── supabase.ts         # Supabase client
│   ├── wallet.tsx          # Solana wallet adapter setup
│   ├── ai.ts               # AI conversion utilities
│   └── utils.ts            # Helper functions
├── stores/                 # Zustand state management
│   ├── authStore.ts
│   ├── strategyStore.ts
│   ├── backtestStore.ts
│   └── competitionStore.ts
├── types/                  # TypeScript types
│   └── index.ts
└── supabase/               # Database migrations
    └── migrations/
        └── 001_initial_schema.sql
```

## Key Features Implemented

✅ **Wallet Authentication**
- Phantom wallet integration
- Supabase user creation on first connect
- Wallet address stored in database

✅ **Strategy Builder**
- 3-pane layout (Prompt → Blocks → Code)
- AI conversion placeholder (ready for API integration)
- Save strategies to database

✅ **Charts Explorer**
- TradingView Lightweight Charts integration
- Load charts by symbol/contract address
- Backtest functionality (mock for now)

✅ **Competitions**
- View active and upcoming competitions
- Join competitions with strategies
- Leaderboard display

✅ **Dashboard**
- Overview of user strategies
- Quick navigation to all features
- User balance and tier display

## Next Steps

1. **Implement AI Conversion**
   - Integrate Groq/DeepSeek/Together APIs
   - Convert English prompts to JSON logic
   - Generate block schemas and pseudocode

2. **Real Backtesting**
   - Fetch real market data
   - Execute strategy logic
   - Calculate PnL and trades

3. **Dexscreener Integration**
   - Fetch Pump.fun token data
   - Display real-time charts
   - Support contract address lookup

4. **Token Gating**
   - Check $TRADEIQ balance
   - Upgrade user tier
   - Unlock premium features

5. **Competition System**
   - Automated competition creation
   - Real-time leaderboard updates
   - SOL prize distribution

## Environment Variables Reference

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Solana (Optional - defaults to mainnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# AI APIs (Optional - for future implementation)
GROQ_API_KEY=your-groq-key
DEEPSEEK_API_KEY=your-deepseek-key
TOGETHER_API_KEY=your-together-key
OPENROUTER_API_KEY=your-openrouter-key
```

## Database Schema

- **users** - User profiles with wallet addresses
- **strategies** - Trading strategies with JSON logic
- **backtests** - Backtest results and trades
- **competitions** - Competition details
- **competition_entries** - User entries in competitions
- **ai_usage_logs** - AI API usage tracking
- **token_gates** - $TRADEIQ holder verification

See `supabase/migrations/001_initial_schema.sql` for full schema.

