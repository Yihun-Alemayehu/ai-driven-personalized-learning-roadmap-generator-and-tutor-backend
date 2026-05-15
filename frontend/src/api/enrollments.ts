import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Enrollment, FamiliarityLevel, LearningGoal } from '@/types';

export interface EnrollPayload {
  domainId: string;
  weeklyHours?: number;
  familiarityLevel?: FamiliarityLevel;
  learningGoal?: LearningGoal;
  aboutSelf?: string;
}

// API response for GET /enrollments — extends Enrollment with live counts
export interface EnrollmentWithCounts extends Enrollment {
  ontologyVersion: { id: string; versionNumber: number };
  _count: { nodeProgress: number };
}

// API response for POST /enrollments
export interface EnrollResult {
  enrollment: Omit<EnrollmentWithCounts, 'domain' | 'ontologyVersion' | '_count'>;
  totalNodes: number;
  unlockedNodes: number;
}

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  byId: (id: string) => ['enrollments', id] as const,
};

export function useEnrollmentsQuery() {
  return useQuery({
    queryKey: enrollmentKeys.all,
    queryFn: () =>
      apiClient
        .get<{ enrollments: EnrollmentWithCounts[] }>('/enrollments')
        .then((r) => r.data.enrollments),
  });
}

export function useEnrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EnrollPayload) =>
      apiClient
        .post<EnrollResult>('/enrollments', payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.all }),
  });
}

export function useUnenrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => apiClient.delete(`/enrollments/${enrollmentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: enrollmentKeys.all }),
  });
}
