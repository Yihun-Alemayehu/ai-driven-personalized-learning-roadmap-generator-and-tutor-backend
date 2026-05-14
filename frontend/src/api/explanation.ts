import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export interface Explanation {
  nodeId: string;
  nodeTitle: string;
  explanation: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
  fallback?: { description?: string; learningOutcomes: string[] } | null;
}

export function useExplanationQuery(nodeId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['explanation', nodeId],
    queryFn: () =>
      apiClient.get<Explanation>(`/nodes/${nodeId}/explanation`).then((r) => r.data),
    enabled: enabled && Boolean(nodeId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
