import { useCallback, useEffect, useRef, useState } from 'react';

export type ReadAloudState = 'idle' | 'speaking' | 'paused';

export function useReadAloud() {
  const [state, setState] = useState<ReadAloudState>('idle');
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cancel speech when the component unmounts (e.g. navigating away)
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.pitch = 1.0;
    utt.lang = 'en-US';

    utt.onstart = () => setState('speaking');
    utt.onend = () => setState('idle');
    utt.onerror = () => setState('idle');
    utt.onpause = () => setState('paused');
    utt.onresume = () => setState('speaking');

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
    setState('speaking');
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setState('idle');
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (state === 'speaking') {
        stop();
      } else {
        speak(text);
      }
    },
    [state, speak, stop],
  );

  return { state, speak, pause, resume, stop, toggle };
}
