-- Migration: add_gamification
-- Adds XP, XP event log, and badge tables for the gamification system.

-- Enums
CREATE TYPE "XpSource" AS ENUM (
  'node_mastered_strong',
  'node_mastered_marginal',
  'quiz_attempt',
  'spaced_review',
  'streak_milestone',
  'enrollment_complete'
);

CREATE TYPE "BadgeKey" AS ENUM (
  'first_mastery',
  'streak_5',
  'streak_14',
  'quiz_ace',
  'speed_learner',
  'completionist',
  'consistent',
  'comeback'
);

-- UserXp: one row per user, cumulative XP + computed level
CREATE TABLE "user_xp" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "total_xp"   INT         NOT NULL DEFAULT 0,
  "level"      INT         NOT NULL DEFAULT 1,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "user_xp_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "user_xp_uid_key" UNIQUE ("user_id"),
  CONSTRAINT "user_xp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- XpEvent: log of every individual XP grant
CREATE TABLE "xp_events" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "source"     "XpSource"  NOT NULL,
  "amount"     INT         NOT NULL,
  "ref_id"     UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "xp_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "xp_events_user_id_created_at_idx" ON "xp_events"("user_id", "created_at");

-- UserBadge: earned badges per user (one row per badge, unique on user+badge)
CREATE TABLE "user_badges" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "badge_key"  "BadgeKey"  NOT NULL,
  "earned_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "user_badges_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "user_badges_uid_badge_key" UNIQUE ("user_id", "badge_key"),
  CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");
