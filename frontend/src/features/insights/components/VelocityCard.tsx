import type { LearningInsights, TimelineEstimate } from '@/api/progress';

interface Props {
  timeline: TimelineEstimate | undefined;
  insights: LearningInsights;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: '#e8e2d9' }}>
      <span className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>{label}</span>
      <span
        className="text-[12px] font-semibold"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: accent ?? '#1a1614' }}
      >
        {value}
      </span>
    </div>
  );
}

export function VelocityCard({ timeline }: Props) {
  if (!timeline) {
    return (
      <div
        className="rounded-[14px] border px-5 py-8 flex items-center justify-center text-center"
        style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
      >
        <p className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
          Complete a few quizzes to see velocity data.
        </p>
      </div>
    );
  }

  const velocityMultiplier = timeline.velocityMultiplier;
  const velocityLabel =
    velocityMultiplier === null
      ? 'No data yet'
      : velocityMultiplier < 0.8
      ? `${Math.round((1 - velocityMultiplier) * 100)}% faster than estimated`
      : velocityMultiplier > 1.2
      ? `${Math.round((velocityMultiplier - 1) * 100)}% slower than estimated`
      : 'On track with estimates';

  const velocityColor =
    velocityMultiplier === null ? '#9a9088'
    : velocityMultiplier < 0.9 ? 'oklch(0.55 0.12 150)'
    : velocityMultiplier > 1.2 ? 'oklch(0.62 0.18 28)'
    : '#1a1614';

  // Gauge: velocity ratio clamped to 0–2x range displayed as 0–100%
  const gaugePercent = velocityMultiplier != null
    ? Math.round(Math.min(Math.max((2 - velocityMultiplier) / 2, 0), 1) * 100)
    : 50;

  return (
    <div
      className="rounded-[14px] border px-5 py-4 flex flex-col gap-4"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      {/* Velocity gauge */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Learning velocity
          </span>
          {velocityMultiplier !== null && (
            <span className="text-[11px] font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace', color: velocityColor }}>
              {velocityMultiplier.toFixed(2)}×
            </span>
          )}
        </div>
        <div className="relative h-[8px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
          {/* Full track */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              width: `${gaugePercent}%`,
              background: velocityMultiplier == null ? '#c2b9a6'
                : velocityMultiplier < 0.9 ? 'oklch(0.55 0.12 150)'
                : velocityMultiplier > 1.2 ? 'oklch(0.62 0.18 28)'
                : 'oklch(0.55 0.13 250)',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#c2b9a6' }}>
          <span>2× slower</span>
          <span>on track</span>
          <span>2× faster</span>
        </div>
      </div>

      <p className="text-[14px] leading-snug" style={{ fontFamily: "'Crimson Pro', serif", color: velocityColor }}>
        {velocityLabel}
      </p>

      {/* Timeline rows */}
      <div>
        <Row label="Remaining (raw)" value={`${timeline.remainingHours}h`} />
        <Row
          label="Adjusted remaining"
          value={`${timeline.adjustedRemainingHours}h`}
          accent={velocityColor}
        />
        <Row label="Weekly commitment" value={`${timeline.weeklyHours}h/week`} />
        {timeline.estimatedWeeksRemaining !== null && (
          <Row label="Estimated weeks left" value={`~${timeline.estimatedWeeksRemaining}w`} />
        )}
        {timeline.estimatedCompletionDate && (
          <Row label="Target date" value={timeline.estimatedCompletionDate} accent="oklch(0.55 0.12 150)" />
        )}
      </div>

      {/* Hours progress bar */}
      <div>
        <div className="flex justify-between text-[10px] mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          <span>Hours completed</span>
          <span>{timeline.completedHours}h / {timeline.totalHours}h</span>
        </div>
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${timeline.totalHours > 0 ? Math.round((timeline.completedHours / timeline.totalHours) * 100) : 0}%`,
              background: 'oklch(0.55 0.12 150)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
