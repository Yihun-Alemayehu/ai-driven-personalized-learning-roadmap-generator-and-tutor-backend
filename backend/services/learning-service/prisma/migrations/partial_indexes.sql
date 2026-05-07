-- Partial indexes not expressible in Prisma schema DSL.
-- Run this once after `prisma migrate dev` applies the initial migration.

-- Speeds up unread notification queries (WHERE read = false)
CREATE INDEX CONCURRENTLY IF NOT EXISTS notifications_unread_idx
  ON notifications (user_id)
  WHERE read = false;

-- Speeds up decay scheduler queries (WHERE mastery_state = 'mastered')
CREATE INDEX CONCURRENTLY IF NOT EXISTS learner_node_progress_mastered_idx
  ON learner_node_progress (last_reviewed_at)
  WHERE mastery_state = 'mastered';
