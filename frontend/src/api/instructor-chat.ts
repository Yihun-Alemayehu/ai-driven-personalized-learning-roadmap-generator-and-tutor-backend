import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export interface AskPayload {
  question: string;
  explanation?: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
  enrollmentId?: string;
}

export function useAskInstructorMutation(nodeId: string) {
  return useMutation({
    mutationFn: (payload: AskPayload) =>
      apiClient
        .post<{ answer: string | null }>(`/nodes/${nodeId}/ask`, payload)
        .then((r) => r.data.answer),
  });
}
