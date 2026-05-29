import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from './client';

export interface CertificateDto {
  publicId: string;
  recipientName: string;
  courseName: string;
  hoursInvested: number | null;
  averageScore: number | null;
  completedAt: string;
  issuedAt: string;
}

export interface MyCertificateState {
  certificate: CertificateDto | null;
  eligible: boolean;
  completionPercent: number;
}

/** Authenticated: certificate state for one of my enrollments. */
export function useMyCertificate(enrollmentId: string) {
  return useQuery({
    queryKey: ['certificate', enrollmentId],
    queryFn: () =>
      apiClient
        .get<MyCertificateState>(`/enrollments/${enrollmentId}/certificate`)
        .then((r) => r.data),
    enabled: Boolean(enrollmentId),
  });
}

/** Authenticated: claim a certificate for a completed enrollment. */
export function useClaimCertificate(enrollmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post<{ certificate: CertificateDto }>(`/enrollments/${enrollmentId}/certificate`)
        .then((r) => r.data.certificate),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['certificate', enrollmentId] });
    },
  });
}

/**
 * Public (no-auth) verification. Uses a bare axios instance so a logged-out
 * visitor (or a stale token) never triggers the apiClient's 401-refresh/logout flow.
 */
const baseURL = (import.meta.env.VITE_API_BASE_URL as string) ?? '/api/v1';

export function useVerifyCertificate(publicId: string) {
  return useQuery({
    queryKey: ['certificate-verify', publicId],
    queryFn: () =>
      axios
        .get<{ verified: boolean; certificate: CertificateDto }>(
          `${baseURL}/certificates/${publicId}/verify`,
        )
        .then((r) => r.data),
    enabled: Boolean(publicId),
    retry: false,
  });
}
