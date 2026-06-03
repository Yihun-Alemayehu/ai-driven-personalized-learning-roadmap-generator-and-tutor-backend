import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceInputState = 'idle' | 'listening' | 'unsupported';

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: () => void;
  lang?: string;
}

export function useVoiceInput({ onResult, onError, lang = 'en-US' }: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceInputState>(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
      ? 'idle'
      : 'unsupported',
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (state === 'unsupported' || state === 'listening') return;

    const SpeechRecognition =
      (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => setState('listening');

    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) onResult(transcript.trim());
    };

    rec.onerror = () => {
      setState('idle');
      onError?.();
    };

    rec.onend = () => setState('idle');

    recognitionRef.current = rec;
    rec.start();
  }, [state, lang, onResult, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  const toggle = useCallback(() => {
    if (state === 'listening') stop();
    else start();
  }, [state, start, stop]);

  return { state, toggle, start, stop };
}
