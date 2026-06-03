-- Add subscription tier enum and user_subscriptions table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionTier') THEN
    CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id               UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier             "SubscriptionTier" NOT NULL DEFAULT 'free',
  credits_remaining INTEGER      NOT NULL DEFAULT 30,
  credits_reset_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
