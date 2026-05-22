import type { NodeAnalytic } from '@/api/instructor';

interface Props {
  data: NodeAnalytic[];
}

function rateColor(rate: number) {
  if (rate >= 70) return 'oklch(0.60 0.13 150)';
  if (rate >= 40) return 'oklch(0.72 0.13 70)';
  if (rate > 0)   return 'oklch(0.62 0.18 28)';
  return '#c8c2b8';
}

export function MasteryRateChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => (b.masteryRate ?? 0) - (a.masteryRate ?? 0));
  const hasAnyActivity = sorted.some((n) => (n.learnerCount ?? 0) > 0 || (n.avgAttempts ?? 0) > 0);

  return (
    <div className="flex flex-col min-w-0">
      {/* No activity banner */}
      {!hasAnyActivity && (
        <div
          className="mb-4 px-4 py-3 rounded-[10px] text-[13px]"
          style={{
            background: '#f3efe7',
            border: '1px solid #e0d9ce',
            fontFamily: "'Crimson Pro', serif",
            color: '#6e645a',
          }}
        >
          No quiz attempts recorded yet. Data will populate as learners progress through nodes.
        </div>
      )}

      {/* Header */}
      <div
        className="grid gap-3 pb-2 mb-1 border-b text-[9.5px] tracking-[0.13em] uppercase select-none"
        style={{
          gridTemplateColumns: 'minmax(220px, 1fr) repeat(4, 110px)',
          borderColor: '#e0d9ce',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#b0a898',
        }}
      >
        <div>Node</div>
        <div>Mastery</div>
        <div className="text-center">Rate</div>
        <div className="text-center">Learners</div>
        <div className="text-center">Attempts</div>
      </div>

      {/* Rows */}
      {sorted.map((entry) => {
        const rate    = entry.masteryRate  ?? 0;
        const learners = entry.learnerCount ?? 0;
        const attempts = entry.avgAttempts  ?? 0;
        const hasData  = learners > 0 || attempts > 0;
        const color    = rateColor(rate);

        return (
          <div
            key={entry.nodeId}
            className="grid gap-3 py-2.5 border-b items-center"
            style={{
              gridTemplateColumns: 'minmax(220px, 1fr) repeat(4, 110px)',
              borderColor: '#f0ece4',
            }}
          >
            {/* Title */}
            <div
              className="truncate text-[13px] leading-snug min-w-0"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#2e2924' }}
              title={entry.title}
            >
              {entry.title}
            </div>

            {/* Bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: '#e0d9ce' }}
            >
              {hasData && rate > 0 ? (
                <div
                  className="h-full rounded-full"
                  style={{ width: `${rate}%`, background: color, minWidth: 3 }}
                />
              ) : (
                <div
                  className="h-full rounded-full"
                  style={{ width: hasData ? '2px' : '0', background: '#c8c2b8' }}
                />
              )}
            </div>

            {/* Rate */}
            <div
              className="text-center text-[12px] tabular-nums font-medium"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: hasData ? color : '#c8c2b8',
              }}
            >
              {hasData ? `${rate.toFixed(0)}%` : '—'}
            </div>

            {/* Learners */}
            <div
              className="text-center text-[12px] tabular-nums"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: learners > 0 ? '#5a524a' : '#c8c2b8',
              }}
            >
              {learners > 0 ? learners : '—'}
            </div>

            {/* Attempts */}
            <div
              className="text-center text-[12px] tabular-nums"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: attempts > 0 ? '#5a524a' : '#c8c2b8',
              }}
            >
              {attempts > 0 ? attempts.toFixed(1) : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
