import { FlameIcon } from 'lucide-react';

interface StreakBadgeProps {
  current: number;
  variant?: 'full' | 'mini' | 'chip';
}

export function StreakBadge({ current, variant = 'chip' }: StreakBadgeProps) {
  const color = current >= 14
    ? 'oklch(0.52 0.22 30)'  // deep amber-red at 14+
    : current >= 5
    ? 'oklch(0.62 0.18 28)'  // brand orange at 5+
    : '#9a9088';              // muted when < 5

  if (variant === 'mini') {
    return (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-md"
        style={{ background: current > 0 ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' : '#f3efe7' }}
      >
        <FlameIcon size={11} style={{ color }} />
        <span
          className="text-[10px] font-medium"
          style={{ fontFamily: 'JetBrains Mono, monospace', color }}
        >
          {current}d
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className="flex items-center gap-3 rounded-[14px] px-4 py-3 border"
        style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
      >
        <span
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: '#ebe6db', color }}
        >
          <FlameIcon size={18} />
        </span>
        <div>
          <div
            className="text-[28px] font-medium leading-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            {current}
          </div>
          <div
            className="text-[10px] tracking-[0.1em] uppercase mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            Day Streak
          </div>
        </div>
        {current >= 5 && (
          <div
            className="ml-auto text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, oklch(0.62 0.18 28) 15%, #faf7f1)',
              color,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {current >= 14 ? 'Relentless' : 'Dedicated'}
          </div>
        )}
      </div>
    );
  }

  // chip (default)
  return (
    <div className="flex items-center gap-1">
      <FlameIcon size={13} style={{ color }} />
      <span
        className="text-[12px]"
        style={{ fontFamily: "'Crimson Pro', serif", color, fontWeight: current > 0 ? 600 : 400 }}
      >
        {current} day{current !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
