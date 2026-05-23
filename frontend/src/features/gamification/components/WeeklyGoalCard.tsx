import { CheckCircle2Icon, TargetIcon } from 'lucide-react';
import type { WeeklyGoal } from '@/api/gamification';

interface WeeklyGoalCardProps {
  goal: WeeklyGoal;
  variant?: 'full' | 'compact';
}

export function WeeklyGoalCard({ goal, variant = 'full' }: WeeklyGoalCardProps) {
  const done   = goal.progress >= goal.target;
  const accent = done ? 'oklch(0.52 0.18 28)' : 'oklch(0.62 0.18 28)';

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-3 rounded-[12px] px-4 py-2.5 border"
        style={{
          borderColor: done ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
          background: done
            ? 'color-mix(in srgb, oklch(0.62 0.18 28) 8%, #faf7f1)'
            : '#f3efe7',
        }}
      >
        <span style={{ color: accent }}>
          {done ? <CheckCircle2Icon size={15} /> : <TargetIcon size={15} />}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className="text-[11px] truncate"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
          >
            {goal.progress}/{goal.target} nodes this week
          </div>
          <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: '#e8e2d9' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${goal.percentDone}%`, background: accent }}
            />
          </div>
        </div>
        <span
          className="shrink-0 text-[10px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: accent }}
        >
          {goal.percentDone}%
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] px-5 py-4 border flex flex-col gap-3"
      style={{
        borderColor: done ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
        background: done
          ? 'color-mix(in srgb, oklch(0.62 0.18 28) 8%, #faf7f1)'
          : '#f3efe7',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="text-[10px] tracking-[0.1em] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            Weekly Goal
          </div>
          <div
            className="text-[12px] mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            {goal.weekLabel}
          </div>
        </div>
        {done && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-[0.1em] uppercase"
            style={{
              background: 'oklch(0.62 0.18 28)',
              color: '#fff',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <CheckCircle2Icon size={10} />
            Done!
          </div>
        )}
      </div>

      {/* Progress numbers */}
      <div className="flex items-end gap-1">
        <span
          className="text-[36px] font-medium leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: accent }}
        >
          {goal.progress}
        </span>
        <span
          className="text-[18px] pb-0.5 leading-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#9a9088' }}
        >
          / {goal.target}
        </span>
        <span
          className="ml-1 pb-1 text-[11px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          nodes mastered
        </span>
      </div>

      {/* Bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e8e2d9' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${goal.percentDone}%`,
              background: done
                ? 'linear-gradient(90deg, oklch(0.52 0.18 28), oklch(0.62 0.18 28))'
                : 'oklch(0.62 0.18 28)',
            }}
          />
        </div>
        <div
          className="text-[10px] mt-1 text-right"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
        >
          {goal.percentDone}% complete
        </div>
      </div>
    </div>
  );
}
