import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Domain } from '@/types';

export const domainKeys = {
  all: ['domains'] as const,
  bySlug: (slug: string) => ['domains', slug] as const,
};

export function useDomainsQuery() {
  return useQuery({
    queryKey: domainKeys.all,
    queryFn: () =>
      apiClient.get<{ domains: Domain[] }>('/domains').then((r) => r.data.domains),
  });
}

export function useDomainBySlugQuery(slug: string) {
  return useQuery({
    queryKey: domainKeys.bySlug(slug),
    queryFn: () =>
      apiClient.get<{ domain: Domain }>(`/domains/${slug}`).then((r) => r.data.domain),
    enabled: Boolean(slug),
  });
}
