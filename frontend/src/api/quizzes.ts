import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Quiz, AttemptResult, ChallengeProject } from '@/types';

export interface AttemptAnswer {
  questionId: string;
  answer: string;
}

export interface SubmitAttemptPayload {
  enrollmentId: string;
  answers: AttemptAnswer[];
  startedAt: string;
}

export interface ReviewQuestion {
  id: string;
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  orderIndex: number;
}

export interface AttemptReview {
  id: string;
  quizId: string;
  nodeId: string;
  scorePercent: number;
  outcome: string;
  answers: AttemptAnswer[];
  startedAt: string;
  completedAt: string;
  node: { id: string; title: string; slug: string };
  quiz: { questions: ReviewQuestion[] };
  adaptationEvents: { adaptationType: string; details: unknown; createdAt: string }[];
}

export interface AttemptSummary {
  id: string;
  quizId: string;
  nodeId: string;
  scorePercent: number;
  outcome: string;
  completedAt: string;
  node: { title: string };
}

export function useQuizQuery(nodeId: string) {
  return useQuery({
    queryKey: ['quiz', nodeId],
    queryFn: () => apiClient.get<{ quiz: Quiz }>(`/nodes/${nodeId}/quiz`).then((r) => r.data.quiz),
    enabled: Boolean(nodeId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitAttemptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: SubmitAttemptPayload }) =>
      apiClient.post<AttemptResult>(`/quizzes/${quizId}/attempt`, payload).then((r) => r.data),
    onSuccess: (_, { payload }) => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['quiz-attempts'] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      void payload;
    },
  });
}

export function useAttemptsQuery(nodeId?: string) {
  return useQuery({
    queryKey: ['quiz-attempts', nodeId ?? 'all'],
    queryFn: () => {
      const params = nodeId ? `?nodeId=${nodeId}` : '';
      return apiClient
        .get<{ attempts: AttemptSummary[] }>(`/quiz-attempts${params}`)
        .then((r) => r.data.attempts);
    },
  });
}

export function useAttemptReviewQuery(id: string) {
  return useQuery({
    queryKey: ['quiz-attempt', id],
    queryFn: () =>
      apiClient.get<{ attempt: AttemptReview }>(`/quiz-attempts/${id}`).then((r) => r.data.attempt),
    enabled: Boolean(id),
  });
}

export function useChallengeProjectQuery(nodeId: string, enabled = false) {
  return useQuery({
    queryKey: ['challenge-project', nodeId],
    queryFn: () =>
      apiClient
        .get<{ project: ChallengeProject }>(`/nodes/${nodeId}/challenge`)
        .then((r) => r.data.project),
    enabled: Boolean(nodeId) && enabled,
  });
}
