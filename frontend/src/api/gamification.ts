import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type XpSource =
  | 'node_mastered_strong'
  | 'node_mastered_marginal'
  | 'quiz_attempt'
  | 'spaced_review'
  | 'streak_milestone'
  | 'enrollment_complete';

export type BadgeKey =
  | 'first_mastery'
  | 'streak_5'
  | 'streak_14'
  | 'quiz_ace'
  | 'speed_learner'
  | 'completionist'
  | 'consistent'
  | 'comeback';

export interface BadgeMeta {
  key:         BadgeKey;
  label:       string;
  description: string;
  icon:        string;
  earnedAt:    string | null;
}

export interface EarnedBadge extends BadgeMeta {
  earnedAt: string;
}

export interface WeeklyGoal {
  target:      number;
  progress:    number;
  percentDone: number;
  weekLabel:   string;
}

export interface GamificationSummary {
  xp: {
    total:          number;
    level:          number;
    xpIntoLevel:    number;
    xpForNextLevel: number;
    progressPct:    number;
  };
  streak: {
    current: number;
  };
  badges: {
    earned: EarnedBadge[];
    all:    BadgeMeta[];
  };
  weeklyGoal: WeeklyGoal;
  recentXpEvents: {
    source:    XpSource;
    amount:    number;
    createdAt: string;
  }[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGamificationQuery() {
  return useQuery({
    queryKey: ['gamification'],
    queryFn: () =>
      apiClient
        .get<{ gamification: GamificationSummary }>('/me/gamification')
        .then((r) => r.data.gamification),
    staleTime: 60_000,
  });
}

// ── XP source labels ──────────────────────────────────────────────────────────

export const XP_SOURCE_LABELS: Record<XpSource, string> = {
  node_mastered_strong:   'Node mastered',
  node_mastered_marginal: 'Node mastered',
  quiz_attempt:           'Quiz attempt',
  spaced_review:          'Spaced review',
  streak_milestone:       'Streak milestone',
  enrollment_complete:    'Course complete',
};

export const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400] as const;
