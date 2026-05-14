import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Resource, ResourceModality } from '@/types';

export type { Resource, ResourceModality };

export interface DiscoverResult {
  discovered: number;
  resources: Resource[];
}

interface RateInput {
  resourceId: string;
  nodeId: string;
  rating: number;
  comment?: string;
}

export function useResourcesQuery(nodeId: string) {
  return useQuery({
    queryKey: ['resources', nodeId],
    queryFn: () =>
      apiClient
        .get<{ resources: Resource[] }>(`/nodes/${nodeId}/resources`)
        .then((r) => r.data.resources),
    enabled: Boolean(nodeId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDiscoverResourcesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) =>
      apiClient
        .post<DiscoverResult>(`/nodes/${nodeId}/resources/discover`)
        .then((r) => r.data),
    onSuccess: (_, nodeId) => qc.invalidateQueries({ queryKey: ['resources', nodeId] }),
  });
}

export function useRateResourceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, rating, comment }: RateInput) =>
      apiClient.post(`/resources/${resourceId}/rate`, { rating, comment }),
    onSuccess: (_, { nodeId }) => qc.invalidateQueries({ queryKey: ['resources', nodeId] }),
  });
}
