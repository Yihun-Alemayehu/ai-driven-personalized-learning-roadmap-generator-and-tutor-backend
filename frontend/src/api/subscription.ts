import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface CreditStatus {
  tier: 'free' | 'pro';
  unlimited: boolean;
  creditsRemaining: number | null;
  creditsResetAt: string | null;
}

export function useCreditStatus() {
  return useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: () =>
      apiClient.get<CreditStatus>('/subscription/status').then((r) => r.data),
    staleTime: 60_000,
    retry: false,
  });
}

export function useInvalidateCredits() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['subscription', 'status'] });
}
