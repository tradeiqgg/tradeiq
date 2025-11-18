-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fake_balance NUMERIC DEFAULT 1000.00,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'holder'))
);

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  raw_prompt TEXT NOT NULL,
  json_logic JSONB,
  block_schema JSONB,
  pseudocode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backtests table
CREATE TABLE IF NOT EXISTS backtests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  chart_asset TEXT NOT NULL,
  pnl NUMERIC DEFAULT 0,
  trades JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_pool NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition entries table
CREATE TABLE IF NOT EXISTS competition_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  pnl NUMERIC DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id, strategy_id)
);

-- AI usage logs table (for future tracking)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER,
  cost NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token gates table (for $TRADEIQ holder verification)
CREATE TABLE IF NOT EXISTS token_gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  token_balance NUMERIC DEFAULT 0,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallet_address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_backtests_user_id ON backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_backtests_strategy_id ON backtests(strategy_id);
CREATE INDEX IF NOT EXISTS idx_competition_entries_competition_id ON competition_entries(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_entries_user_id ON competition_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on strategies
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

