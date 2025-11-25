-- =========================================================
-- CHAPTER 12: Alerts, Notifications, Triggers, Risk Events, Messaging & Cross-Strategy Signals
-- =========================================================

-- Alerts table - tracks all alerts triggered by strategies
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'entry', 'exit', 'risk', 'indicator', 'system', 
    'take_profit', 'stop_loss', 'trailing_stop', 'position_closed',
    'indicator_cross', 'indicator_threshold',
    'max_drawdown', 'max_daily_trades', 'volatility_spike', 'unexpected_behavior',
    'competition_standing_changed', 'strategy_version_updated', 'followed_user_published'
  )),
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Alert triggers table - user-defined triggers built inside IDE
CREATE TABLE IF NOT EXISTS alert_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger JSONB NOT NULL, -- JSON schema for conditions
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cross-strategy links table - links strategy outputs to inputs of another strategy
CREATE TABLE IF NOT EXISTS cross_strategy_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  target_strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('signal_only', 'value_forward', 'risk_sync')),
  config JSONB DEFAULT '{}'::jsonb, -- Additional configuration
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (source_strategy_id != target_strategy_id)
);

-- Notifications table - general user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'follow', 'strategy_update', 'comment', 'competition', 
    'like', 'fork', 'mention', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT, -- Optional link to related resource
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push', 'browser')),
  alert_type TEXT, -- NULL means applies to all types
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, channel, alert_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_strategy_id ON alerts(strategy_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(user_id, read);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_strategy_id ON alert_triggers(strategy_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_user_id ON alert_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_strategy_links_source ON cross_strategy_links(source_strategy_id);
CREATE INDEX IF NOT EXISTS idx_cross_strategy_links_target ON cross_strategy_links(target_strategy_id);
CREATE INDEX IF NOT EXISTS idx_cross_strategy_links_user_id ON cross_strategy_links(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Function to update updated_at on alert_triggers
CREATE TRIGGER update_alert_triggers_updated_at
  BEFORE UPDATE ON alert_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification when alert is created
CREATE OR REPLACE FUNCTION create_alert_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the alert
  INSERT INTO notifications (user_id, type, title, body, link, payload)
  VALUES (
    NEW.user_id,
    'system',
    CASE 
      WHEN NEW.type IN ('entry', 'exit') THEN 'Strategy Signal'
      WHEN NEW.type LIKE 'risk%' THEN 'Risk Alert'
      WHEN NEW.type LIKE 'indicator%' THEN 'Indicator Alert'
      ELSE 'System Alert'
    END,
    NEW.message,
    CASE 
      WHEN NEW.strategy_id IS NOT NULL THEN '/strategy/' || NEW.strategy_id
      ELSE NULL
    END,
    jsonb_build_object('alert_id', NEW.id, 'alert_type', NEW.type)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_alert_notification
  AFTER INSERT ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION create_alert_notification();

