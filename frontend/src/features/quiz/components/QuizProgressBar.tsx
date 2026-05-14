interface QuizProgressBarProps {
  current: number;
  total: number;
}

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[12px] shrink-0"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {current} / {total}
      </span>
      <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: 'oklch(0.62 0.18 28)' }}
        />
      </div>
    </div>
  );
}
