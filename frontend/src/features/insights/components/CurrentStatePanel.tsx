import type { LearningInsights, TimelineEstimate } from '@/api/progress';
import type { ProgressStats } from '@/api/progress';

interface Props {
  stats: ProgressStats | undefined;
  insights: LearningInsights;
  timeline: TimelineEstimate | undefined;
}

function StatBox({
  value,
  label,
  accent,
  sub,
}: {
  value: string | number;
  label: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-[12px] border px-5 py-4"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      <div
        className="text-[36px] font-medium leading-none tracking-[-0.02em]"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: accent ?? '#1a1614' }}
      >
        {value}
      </div>
      <div className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        {label}
      </div>
      {sub && (
        <div className="text-[12px] mt-0.5" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

const MOMENTUM_CONFIG = {
  up:   { icon: '↑', label: 'More active than last week', color: 'oklch(0.55 0.12 150)' },
  flat: { icon: '→', label: 'Same pace as last week',     color: '#9a9088' },
  down: { icon: '↓', label: 'Less active than last week',  color: 'oklch(0.62 0.18 28)' },
};

export function CurrentStatePanel({ stats, insights, timeline }: Props) {
  const momentum = MOMENTUM_CONFIG[insights.momentum.trend];
  const completion = stats?.completionPercent ?? 0;
  const mastered = stats?.masteredCount ?? 0;
  const total = stats?.totalNodes ?? 0;
  const streak = stats?.currentStreak ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Big stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox
          value={`${completion}%`}
          label="Completed"
          accent="oklch(0.62 0.18 28)"
          sub={`${mastered} of ${total} nodes`}
        />
        <StatBox
          value={streak}
          label="Day streak"
          accent={streak >= 7 ? 'oklch(0.55 0.12 150)' : '#1a1614'}
          sub={streak >= 7 ? 'Keep it up!' : streak > 0 ? 'Active today' : 'Start a streak'}
        />
        <StatBox
          value={insights.avgScore !== null ? `${insights.avgScore}%` : '—'}
          label="Avg quiz score"
          accent={
            insights.avgScore == null ? '#9a9088'
            : insights.avgScore >= 80 ? 'oklch(0.55 0.12 150)'
            : insights.avgScore >= 60 ? '#1a1614'
            : 'oklch(0.62 0.18 28)'
          }
          sub={
            insights.avgScore == null ? 'No attempts yet'
            : insights.avgScore >= 80 ? 'Excellent'
            : insights.avgScore >= 60 ? 'Good'
            : 'Needs improvement'
          }
        />
        <StatBox
          value={insights.profile.daysSinceEnrollment}
          label="Days enrolled"
          sub={timeline?.estimatedCompletionDate ? `Target: ${timeline.estimatedCompletionDate}` : undefined}
        />
      </div>

      {/* Momentum banner */}
      <div
        className="rounded-[10px] border px-4 py-3 flex items-center gap-3"
        style={{
          borderColor: 'color-mix(in srgb,' + momentum.color + ' 30%, transparent)',
          background: 'color-mix(in srgb,' + momentum.color + ' 6%, #faf7f1)',
        }}
      >
        <span className="text-[22px]" style={{ color: momentum.color }}>{momentum.icon}</span>
        <div>
          <div className="text-[15px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
            {momentum.label}
          </div>
          <div className="text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            {insights.momentum.recentMasteries} nodes mastered this week
            {insights.momentum.prevMasteries > 0 && ` (vs ${insights.momentum.prevMasteries} last week)`}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[11px] mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          <span>Overall completion</span>
          <span>{mastered} / {total}</span>
        </div>
        <div className="h-[8px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${completion}%`, background: 'oklch(0.62 0.18 28)' }}
          />
        </div>
        {stats && (
          <div className="flex gap-3 mt-2 flex-wrap">
            {[
              { color: 'oklch(0.60 0.13 150)', label: `${stats.masteredCount} Mastered` },
              { color: 'oklch(0.55 0.13 250)', label: `${stats.inProgressCount} In progress` },
              { color: 'oklch(0.72 0.13 70)',  label: `${stats.reviewNeededCount} Review needed` },
              { color: '#c2b9a6',              label: `${stats.lockedCount} Locked` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
