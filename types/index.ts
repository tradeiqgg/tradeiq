export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  fake_balance: number;
  tier: 'free' | 'holder';
}

export interface Strategy {
  id: string;
  user_id: string;
  title: string;
  raw_prompt: string;
  json_logic: Record<string, any>;
  block_schema: Record<string, any>;
  pseudocode: string;
  created_at: string;
  updated_at: string;
}

export interface Backtest {
  id: string;
  user_id: string;
  strategy_id: string;
  chart_asset: string;
  pnl: number;
  trades: Trade[];
  created_at: string;
}

export interface Trade {
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  pnl: number;
  type: 'long' | 'short';
}

export interface Competition {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  status: 'upcoming' | 'active' | 'ended';
}

export interface CompetitionEntry {
  id: string;
  competition_id: string;
  user_id: string;
  strategy_id: string;
  pnl: number;
  rank: number;
}

export interface Block {
  id: string;
  type: 'condition' | 'action' | 'indicator' | 'operator';
  label: string;
  inputs: BlockInput[];
  outputs?: any;
}

export interface BlockInput {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'block';
  value: any;
}

