import type { BadgeKey, XpSource } from '@prisma/client';

export type { BadgeKey, XpSource };

// ── XP / Level ─────────────────────────────────────────────────────────────

/** XP needed to reach each level (index = level - 1, so THRESHOLDS[0] = 0 for L1) */
export const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400] as const;

export const XP_WEIGHTS: Record<XpSource, number> = {
  node_mastered_strong:   100,
  node_mastered_marginal:  60,
  quiz_attempt:            10,
  spaced_review:           20,
  streak_milestone:        50,  // +50 at 5 days, +100 at 14 (overridden in service)
  enrollment_complete:    300,
};

export function computeLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForNextLevel(level: number): number {
  const idx = level; // LEVEL_THRESHOLDS[level] is the threshold for level+1
  return idx < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[idx] : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

// ── Badge metadata ──────────────────────────────────────────────────────────

export interface BadgeMeta {
  key:         BadgeKey;
  label:       string;
  description: string;
  icon:        string;   // emoji/symbol used in UI before icon component
}

export const BADGE_META: Record<BadgeKey, BadgeMeta> = {
  first_mastery:  { key: 'first_mastery',  label: 'First Master',     description: 'Master your first learning node',                 icon: '🎯' },
  streak_5:       { key: 'streak_5',       label: 'Dedicated',        description: 'Maintain a 5-day learning streak',                icon: '🔥' },
  streak_14:      { key: 'streak_14',      label: 'Relentless',       description: 'Maintain a 14-day learning streak',               icon: '⚡' },
  quiz_ace:       { key: 'quiz_ace',       label: 'Quiz Ace',         description: 'Score 100% on any quiz',                          icon: '💯' },
  speed_learner:  { key: 'speed_learner',  label: 'Speed Learner',    description: 'Master a node in under half the estimated time',  icon: '🚀' },
  completionist:  { key: 'completionist',  label: 'Completionist',    description: 'Master every node in an enrollment',              icon: '🏆' },
  consistent:     { key: 'consistent',     label: 'On a Roll',        description: 'Hit your weekly goal',                           icon: '📅' },
  comeback:       { key: 'comeback',       label: 'Comeback Kid',     description: 'Go from Relearn back to Mastered on a node',      icon: '↩️' },
};

// ── API response shapes ─────────────────────────────────────────────────────

export interface EarnedBadge {
  key:      BadgeKey;
  label:    string;
  description: string;
  icon:     string;
  earnedAt: string; // ISO
}

export interface WeeklyGoal {
  target:       number;
  progress:     number;
  percentDone:  number;
  weekLabel:    string; // e.g. "May 19 – May 25"
}

export interface GamificationSummary {
  xp: {
    total:          number;
    level:          number;
    xpIntoLevel:    number;
    xpForNextLevel: number;
    progressPct:    number; // 0–100
  };
  streak: {
    current: number;
  };
  badges: {
    earned:  EarnedBadge[];
    all:     (BadgeMeta & { earnedAt: string | null })[];
  };
  weeklyGoal: WeeklyGoal;
  recentXpEvents: {
    source:    XpSource;
    amount:    number;
    createdAt: string;
  }[];
}
