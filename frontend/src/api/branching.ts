import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { BranchPath } from '@/types';

export interface PathSummary {
  branchPath: BranchPath;
  nodeCount: number;
  estimatedHours: number | null;
  description: string | null;
}

export interface BranchingPoint {
  node: { id: string; title: string; slug: string; description: string | null };
  isReached: boolean;
  isMastered: boolean;
  paths: PathSummary[];
}

interface BranchingPointsResponse {
  selectedBranchPath: BranchPath | null;
  branchingPoints: BranchingPoint[];
}

export function useBranchingPointsQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['branching-points', enrollmentId],
    queryFn: () =>
      apiClient
        .get<BranchingPointsResponse>(`/enrollments/${enrollmentId}/branching-points`)
        .then((r) => r.data.branchingPoints),
    enabled: Boolean(enrollmentId),
    staleTime: 30_000,
  });
}

export function useSelectPathMutation(enrollmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (branchPath: BranchPath) =>
      apiClient
        .post(`/enrollments/${enrollmentId}/select-path`, { branchPath })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap', enrollmentId] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['branching-points', enrollmentId] });
    },
  });
}

export function useSwitchPathMutation(enrollmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (branchPath: BranchPath) =>
      apiClient
        .post(`/enrollments/${enrollmentId}/switch-path`, { branchPath })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap', enrollmentId] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
      qc.invalidateQueries({ queryKey: ['branching-points', enrollmentId] });
    },
  });
}
