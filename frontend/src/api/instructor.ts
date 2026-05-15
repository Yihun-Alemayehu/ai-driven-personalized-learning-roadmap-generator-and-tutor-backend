import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

// ── Response shapes ───────────────────────────────────────────────────────────

export interface InstructorEnrollment {
  id: string;
  enrolledAt: string;
  selectedBranchPath: string | null;
  user: { id: string; email: string; fullName: string; avatarUrl: string | null };
  domain: { id: string; name: string; slug: string };
  _count: { nodeProgress: number };
}

export interface LearnerProgressEnrollment {
  id: string;
  domain: { id: string; name: string; slug: string };
  nodeProgress: {
    masteryState: string;
    bestQuizScore: string | null;
    attemptsCount: number;
    updatedAt: string;
    node: { id: string; title: string; slug: string; difficultyLevel: number | null };
  }[];
}

export interface QuizAttempt {
  id: string;
  scorePercent: string;
  outcome: string;
  completedAt: string;
  startedAt: string;
  node: { id: string; title: string; slug: string };
  quiz: { id: string; isMicroQuiz: boolean; generatedBy: string };
}

export interface NodeAnalytic {
  nodeId: string;
  title: string;
  slug: string;
  difficultyLevel: number | null;
  learnerCount: number;
  masteryRate: number;
  avgQuizScore: number | null;
  avgAttempts: number;
}

export interface FlaggedEvent {
  id: string;
  userId: string;
  nodeId: string;
  adaptationType: string;
  details: {
    reason?: string;
    failCount?: number;
    resolved?: boolean;
    resolutionNotes?: string;
    resolvedAt?: string;
  };
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  node: { id: string; title: string; slug: string };
  quizAttempt: { id: string; scorePercent: string; outcome: string } | null;
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const instructorKeys = {
  learners:        (domainId?: string) => ['instructor', 'learners', domainId ?? 'all'] as const,
  learnerProgress: (userId: string)   => ['instructor', 'progress', userId] as const,
  quizHistory:     (userId: string)   => ['instructor', 'quiz-history', userId] as const,
  analytics:       (domainId: string) => ['instructor', 'analytics', domainId] as const,
  flagged:         ()                 => ['instructor', 'flagged'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useLearnersQuery(domainId?: string) {
  return useQuery({
    queryKey: instructorKeys.learners(domainId),
    queryFn: () =>
      apiClient
        .get<{ learners: InstructorEnrollment[]; total: number }>('/instructor/learners', {
          params: domainId ? { domainId } : {},
        })
        .then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useLearnerProgressQuery(userId: string) {
  return useQuery({
    queryKey: instructorKeys.learnerProgress(userId),
    queryFn: () =>
      apiClient
        .get<{ user: { id: string; email: string; fullName: string }; enrollments: LearnerProgressEnrollment[] }>(
          `/instructor/learners/${userId}/progress`,
        )
        .then((r) => r.data),
    enabled: Boolean(userId),
  });
}

export function useLearnerQuizHistoryQuery(userId: string) {
  return useQuery({
    queryKey: instructorKeys.quizHistory(userId),
    queryFn: () =>
      apiClient
        .get<{ user: { fullName: string; email?: string }; attempts: QuizAttempt[]; total: number }>(
          `/instructor/learners/${userId}/quiz-history`,
          { params: { limit: 50 } },
        )
        .then((r) => r.data),
    enabled: Boolean(userId),
  });
}

export function useDomainAnalyticsQuery(domainId: string) {
  return useQuery({
    queryKey: instructorKeys.analytics(domainId),
    queryFn: () =>
      apiClient
        .get<{
          domain: { id: string; name: string };
          enrollmentCount: number;
          overallMasteryRate: number;
          nodeAnalytics: NodeAnalytic[];
          problemNodes: NodeAnalytic[];
        }>(`/instructor/domains/${domainId}/analytics`)
        .then((r) => r.data),
    enabled: Boolean(domainId),
  });
}

export function useFlaggedEventsQuery() {
  return useQuery({
    queryKey: instructorKeys.flagged(),
    queryFn: () =>
      apiClient
        .get<{ flaggedEvents: FlaggedEvent[]; total: number }>('/instructor/flagged', {
          params: { limit: 100 },
        })
        .then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useResolveEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, resolutionNotes }: { eventId: string; resolutionNotes: string }) =>
      apiClient
        .patch(`/instructor/flagged/${eventId}/resolve`, { resolutionNotes })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: instructorKeys.flagged() }),
  });
}
