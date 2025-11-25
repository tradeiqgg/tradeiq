-- =========================================================
-- CHAPTER 10: User Profiles, Strategy Library, Sharing, Syncing & Cloud Storage
-- =========================================================

-- Extend users table with profile fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS builder_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Update existing users to set joined_at
UPDATE users SET joined_at = created_at WHERE joined_at IS NULL;

-- Extend strategies table with publishing fields
ALTER TABLE strategies
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'unlisted')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS strategy_json JSONB,
ADD COLUMN IF NOT EXISTS strategy_tql TEXT,
ADD COLUMN IF NOT EXISTS strategy_blocks JSONB,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS forked_from UUID REFERENCES strategies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downloads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create strategy_versions table
CREATE TABLE IF NOT EXISTS strategy_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  strategy_json JSONB,
  strategy_tql TEXT,
  strategy_blocks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  editor_mode TEXT CHECK (editor_mode IN ('tql', 'blocks', 'json')),
  summary TEXT,
  UNIQUE(strategy_id, version)
);

-- Create strategy_likes table
CREATE TABLE IF NOT EXISTS strategy_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- Create strategy_comments table
CREATE TABLE IF NOT EXISTS strategy_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_following table
CREATE TABLE IF NOT EXISTS user_following (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- Create strategy_saves table (for saving strategies to personal library)
CREATE TABLE IF NOT EXISTS strategy_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategy_versions_strategy_id ON strategy_versions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_versions_created_at ON strategy_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_likes_strategy_id ON strategy_likes(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_likes_user_id ON strategy_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_comments_strategy_id ON strategy_comments(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_comments_user_id ON strategy_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_following_follower_id ON user_following(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_following_followed_id ON user_following(followed_id);
CREATE INDEX IF NOT EXISTS idx_strategies_visibility ON strategies(visibility);
CREATE INDEX IF NOT EXISTS idx_strategies_user_id_visibility ON strategies(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_strategies_likes_count ON strategies(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_strategies_created_at ON strategies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_strategy_saves_user_id ON strategy_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_saves_strategy_id ON strategy_saves(strategy_id);

-- Function to update updated_at on strategy_comments
CREATE TRIGGER update_strategy_comments_updated_at
  BEFORE UPDATE ON strategy_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update likes_count when a like is added/removed
CREATE OR REPLACE FUNCTION update_strategy_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE strategies SET likes_count = likes_count + 1 WHERE id = NEW.strategy_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE strategies SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.strategy_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_strategy_likes_count
  AFTER INSERT OR DELETE ON strategy_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_likes_count();

-- Function to update comments_count when a comment is added/removed
CREATE OR REPLACE FUNCTION update_strategy_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE strategies SET comments_count = comments_count + 1 WHERE id = NEW.strategy_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE strategies SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.strategy_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_strategy_comments_count
  AFTER INSERT OR DELETE ON strategy_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_comments_count();

-- Function to update followers_count and following_count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.followed_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.followed_id;
    UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON user_following
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Function to generate username from wallet address if not set
CREATE OR REPLACE FUNCTION generate_username_from_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username := 'user_' || SUBSTRING(NEW.wallet_address FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_username
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.username IS NULL OR NEW.username = '')
  EXECUTE FUNCTION generate_username_from_wallet();

