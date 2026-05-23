import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { RoadmapNode, RoadmapEdge, BranchPath, SupplementaryNode } from '@/types';

// ── Response shapes ───────────────────────────────────────────────────────────

export interface RoadmapApiResponse {
  nodes: (Omit<RoadmapNode, 'estimatedHours'> & { estimatedHours: string | number | null })[];
  edges: (RoadmapEdge & { id: string })[];
  selectedBranchPath: BranchPath | null;
  supplementaryNodes: SupplementaryNode[];
}

// Actual shape from GET /progress/stats
interface RawProgressStats {
  stats: {
    totalNodes: number;
    unlockedNodes: number;
    completedNodes: number;
    completionPercent: number;
    avgQuizScore: number | null;
    currentStreak: number;
    byState: {
      not_started: number;
      in_progress: number;
      mastered: number;
      review_needed: number;
      relearn: number;
    };
  };
}

// Normalised shape used by components
export interface ProgressStats {
  masteredCount: number;
  inProgressCount: number;
  reviewNeededCount: number;
  notStartedCount: number;
  rerelearnCount: number;
  lockedCount: number;
  totalNodes: number;
  completionPercent: number;
  unlockedNodes: number;
  avgQuizScore: number | null;
}

function normaliseStats(raw: RawProgressStats): ProgressStats {
  const s = raw.stats;
  const counted =
    s.byState.not_started +
    s.byState.in_progress +
    s.byState.mastered +
    s.byState.review_needed +
    s.byState.relearn;
  return {
    masteredCount:     s.byState.mastered,
    inProgressCount:   s.byState.in_progress,
    reviewNeededCount: s.byState.review_needed,
    notStartedCount:   s.byState.not_started,
    rerelearnCount:    s.byState.relearn,
    lockedCount:       Math.max(0, s.totalNodes - counted),
    totalNodes:        s.totalNodes,
    completionPercent: s.completionPercent,
    unlockedNodes:     s.unlockedNodes,
    avgQuizScore:      s.avgQuizScore,
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useRoadmapQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['roadmap', enrollmentId],
    queryFn: () =>
      apiClient
        .get<RoadmapApiResponse>(`/enrollments/${enrollmentId}/roadmap`)
        .then((r) => r.data),
    enabled: Boolean(enrollmentId),
    staleTime: 30_000,
  });
}

export function useProgressStatsQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['progress-stats', enrollmentId],
    queryFn: () =>
      apiClient
        .get<RawProgressStats>(`/enrollments/${enrollmentId}/progress/stats`)
        .then((r) => normaliseStats(r.data)),
    enabled: Boolean(enrollmentId),
    staleTime: 30_000,
  });
}

export interface TimelineEstimate {
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  adjustedRemainingHours: number;
  weeklyHours: number;
  estimatedWeeksRemaining: number | null;
  estimatedCompletionDate: string | null;
  velocityMultiplier: number | null;
}

export function useTimelineQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['timeline', enrollmentId],
    queryFn: () =>
      apiClient
        .get<{ timeline: TimelineEstimate }>(`/enrollments/${enrollmentId}/timeline`)
        .then((r) => r.data.timeline),
    enabled: Boolean(enrollmentId),
    staleTime: 60_000,
  });
}

// ── Activity Heatmap ─────────────────────────────────────────────────────────

export interface ActivityDay {
  date: string;
  count: number;
  quizzes: number;
  reviews: number;
  masteries: number;
}

export function useActivityQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['activity', enrollmentId],
    queryFn: () =>
      apiClient
        .get<{ days: ActivityDay[] }>(`/enrollments/${enrollmentId}/activity`)
        .then((r) => r.data.days),
    enabled: Boolean(enrollmentId),
    staleTime: 5 * 60_000,
  });
}

// ── Insights ──────────────────────────────────────────────────────────────────

export interface LearningInsights {
  profile: {
    enrolledAt: string;
    familiarityLevel: string | null;
    learningGoal: string | null;
    weeklyHours: number | null;
    aboutSelf: string | null;
    preferredLearningStyle: string | null;
    priorSkills: string | null;
    selectedBranchPath: string | null;
    daysSinceEnrollment: number;
  };
  weakNodes: {
    nodeId: string;
    title: string;
    masteryState: string;
    lastReviewedAt: string | null;
    difficultyLevel: number | null;
  }[];
  strugglingNodes: {
    nodeId: string;
    title: string;
    bestQuizScore: number | null;
    attemptsCount: number;
    difficultyLevel: number | null;
  }[];
  topNodes: {
    nodeId: string;
    title: string;
    bestQuizScore: number | null;
    difficultyLevel: number | null;
    masteredAt: string | null;
  }[];
  momentum: {
    trend: 'up' | 'down' | 'flat';
    recentMasteries: number;
    prevMasteries: number;
  };
  avgScore: number | null;
}

export function useInsightsQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['insights', enrollmentId],
    queryFn: () =>
      apiClient
        .get<{ insights: LearningInsights }>(`/enrollments/${enrollmentId}/insights`)
        .then((r) => r.data.insights),
    enabled: Boolean(enrollmentId),
    staleTime: 2 * 60_000,
  });
}

// ── Global (account-level) Insights ──────────────────────────────────────────

export interface EnrollmentBreakdown {
  enrollmentId: string;
  domain: { id: string; name: string; slug: string; iconUrl: string | null };
  completionPercent: number;
  masteredNodes: number;
  totalNodes: number;
  avgScore: number | null;
  lastActiveAt: string | null;
  enrolledAt: string;
  selectedBranchPath: string | null;
}

export interface GlobalInsights {
  totalEnrollments: number;
  enrollmentBreakdowns: EnrollmentBreakdown[];
  globalWeakNodes: {
    nodeId: string;
    title: string;
    masteryState: string;
    difficultyLevel: number | null;
    enrollmentId: string;
    domainName: string;
  }[];
  globalTopNodes: {
    nodeId: string;
    title: string;
    bestQuizScore: number | null;
    difficultyLevel: number | null;
    masteredAt: string | null;
  }[];
  overallStats: {
    totalNodes: number;
    masteredNodes: number;
    completionPercent: number;
    avgScore: number | null;
  };
  momentum: {
    trend: 'up' | 'down' | 'flat';
    recentMasteries: number;
    prevMasteries: number;
  };
  streakSummary: {
    currentStreak: number;
  };
}

export function useGlobalActivityQuery() {
  return useQuery({
    queryKey: ['global-activity'],
    queryFn: () =>
      apiClient
        .get<{ days: ActivityDay[] }>('/me/activity')
        .then((r) => r.data.days),
    staleTime: 5 * 60_000,
  });
}

export function useGlobalInsightsQuery() {
  return useQuery({
    queryKey: ['global-insights'],
    queryFn: () =>
      apiClient
        .get<{ insights: GlobalInsights }>('/me/insights')
        .then((r) => r.data.insights),
    staleTime: 2 * 60_000,
  });
}
