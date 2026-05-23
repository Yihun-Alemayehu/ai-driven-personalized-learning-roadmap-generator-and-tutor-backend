import type { GamificationSummary } from '@/api/gamification';

interface XpBarProps {
  xp: GamificationSummary['xp'];
  /** 'full' shows level label + numbers; 'mini' is sidebar-compact */
  variant?: 'full' | 'mini';
}

export function XpBar({ xp, variant = 'full' }: XpBarProps) {
  if (variant === 'mini') {
    return (
      <div className="flex flex-col gap-1 px-3 py-2">
        {/* Level chip + XP count */}
        <div className="flex items-center justify-between">
          <span
            className="text-[9px] tracking-[0.14em] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            Level {xp.level}
          </span>
          <span
            className="text-[9px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            {xp.total} XP
          </span>
        </div>
        {/* Bar */}
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: '#e8e2d9' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${xp.progressPct}%`,
              background: 'oklch(0.62 0.18 28)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[15px] font-bold"
            style={{
              background: 'oklch(0.62 0.18 28)',
              color: '#fff',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
            }}
          >
            {xp.level}
          </div>
          <div>
            <div
              className="text-[11px] tracking-[0.1em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              Level {xp.level}
            </div>
            <div
              className="text-[22px] font-medium leading-none"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
            >
              {xp.total.toLocaleString()} <span className="text-[14px]" style={{ color: '#9a9088' }}>XP</span>
            </div>
          </div>
        </div>
        <div
          className="text-[11px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          {xp.xpIntoLevel} / {xp.xpForNextLevel - (xp.xpForNextLevel - xp.xpIntoLevel - (xp.total - xp.xpIntoLevel))} to L{xp.level + 1}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: '#e8e2d9' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${xp.progressPct}%`,
              background: 'linear-gradient(90deg, oklch(0.62 0.18 28), oklch(0.72 0.18 60))',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span
            className="text-[9px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            {xp.xpIntoLevel} XP
          </span>
          <span
            className="text-[9px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
          >
            {xp.progressPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
