export interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  fake_balance: number;
  tier: 'free' | 'holder';
  // Chapter 10: Profile fields
  username?: string;
  avatar_url?: string;
  bio?: string;
  joined_at?: string;
  builder_xp?: number;
  achievements?: any[];
  followers_count?: number;
  following_count?: number;
  social_links?: Record<string, string>;
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
  // Chapter 10: Publishing fields
  description?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  tags?: string[];
  strategy_json?: Record<string, any>;
  strategy_tql?: string;
  strategy_blocks?: any;
  version?: number;
  forked_from?: string;
  likes_count?: number;
  comments_count?: number;
  downloads_count?: number;
  is_featured?: boolean;
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  strategy_json?: Record<string, any>;
  strategy_tql?: string;
  strategy_blocks?: any;
  created_at: string;
  editor_mode?: 'tql' | 'blocks' | 'json';
  summary?: string;
}

export interface StrategyLike {
  id: string;
  user_id: string;
  strategy_id: string;
  created_at: string;
}

export interface StrategyComment {
  id: string;
  strategy_id: string;
  user_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface UserFollowing {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
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

