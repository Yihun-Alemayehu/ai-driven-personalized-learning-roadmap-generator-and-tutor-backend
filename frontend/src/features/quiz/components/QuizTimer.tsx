import { useState, useEffect, useRef } from 'react';

interface QuizTimerProps {
  startedAt: Date;
}

export function QuizTimer({ startedAt }: QuizTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    rafRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => {
      if (rafRef.current) clearInterval(rafRef.current);
    };
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const label = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <span
      className="text-[12px] tabular-nums"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {label}
    </span>
  );
}
