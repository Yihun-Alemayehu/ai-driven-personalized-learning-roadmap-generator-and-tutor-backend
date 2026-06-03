import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export interface AskPayload {
  question: string;
  explanation?: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
  enrollmentId?: string;
}

// ── Non-streaming mutation (kept for internal fallback use) ───────────────────

export function useAskInstructorMutation(nodeId: string) {
  return useMutation({
    mutationFn: (payload: AskPayload) =>
      apiClient
        .post<{ answer: string | null }>(`/nodes/${nodeId}/ask`, payload)
        .then((r) => r.data.answer),
  });
}

// ── Streaming hook ────────────────────────────────────────────────────────────

export interface AskStreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: () => void;
}

export function useAskInstructorStream(nodeId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const ask = useCallback(
    (payload: AskPayload, callbacks: AskStreamCallbacks) => {
      // Cancel any in-flight stream first
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      void (async () => {
        try {
          const res = await fetch(`/api/v1/nodes/${nodeId}/ask/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken ?? ''}`,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!res.ok || !res.body) {
            setIsStreaming(false);
            callbacks.onError();
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();

              if (data === '[DONE]') {
                setIsStreaming(false);
                callbacks.onDone();
                return;
              }

              try {
                const parsed = JSON.parse(data) as { t?: string; error?: string };
                if (parsed.error) {
                  setIsStreaming(false);
                  callbacks.onError();
                  return;
                }
                if (parsed.t) {
                  callbacks.onChunk(parsed.t);
                }
              } catch {
                // Malformed SSE line — skip
              }
            }
          }

          // Stream ended without explicit [DONE]
          setIsStreaming(false);
          callbacks.onDone();
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
          setIsStreaming(false);
          callbacks.onError();
        }
      })();
    },
    [nodeId, accessToken],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { ask, isStreaming, abort };
}
