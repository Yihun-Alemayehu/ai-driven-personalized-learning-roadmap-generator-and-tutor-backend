import { useMemo, useState } from 'react';
import type { ActivityDay } from '@/api/progress';

interface Props {
  days: ActivityDay[];
}

// Build a 52-week grid of dates, filling back from today
function buildGrid(): string[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align to Sunday start
  const todayDow = today.getDay(); // 0=Sun
  const gridEnd = new Date(today.getTime() + (6 - todayDow) * 86_400_000);

  const weeks: string[][] = [];
  for (let w = 51; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridEnd.getTime() - (w * 7 + (6 - d)) * 86_400_000);
      week.push(date.toISOString().slice(0, 10));
    }
    weeks.push(week);
  }
  return weeks;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function intensityColor(count: number): string {
  if (count === 0) return '#ebe6db';
  if (count === 1) return 'oklch(0.82 0.07 150)';
  if (count === 2) return 'oklch(0.70 0.11 150)';
  if (count <= 4) return 'oklch(0.58 0.14 150)';
  return 'oklch(0.45 0.17 150)';
}

export function ActivityHeatmap({ days }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; day: ActivityDay | null; x: number; y: number } | null>(null);

  const dayMap = useMemo(
    () => new Map(days.map((d) => [d.date, d])),
    [days],
  );

  const weeks = useMemo(() => buildGrid(), []);

  // Month labels: find the first week index where month changes
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const month = new Date(week[0]).getMonth();
      if (month !== lastMonth) {
        positions.push({ label: MONTH_LABELS[month], col: wi });
        lastMonth = month;
      }
    });
    return positions;
  }, [weeks]);

  const today = new Date().toISOString().slice(0, 10);
  const totalDays = days.length;
  const totalActivity = days.reduce((s, d) => s + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  const CELL = 13;
  const GAP = 3;
  const STEP = CELL + GAP;

  return (
    <div
      className="rounded-[14px] border p-5 flex flex-col gap-4"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      {/* Summary row */}
      <div className="flex items-center gap-6">
        <div>
          <span className="text-[24px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            {totalActivity}
          </span>
          <span className="text-[13px] ml-2" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
            total activities
          </span>
        </div>
        <div>
          <span className="text-[24px] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            {activeDays}
          </span>
          <span className="text-[13px] ml-2" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
            active days
          </span>
        </div>
        {totalDays > 0 && (
          <div className="ml-auto text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            {Math.round((activeDays / Math.max(totalDays, 1)) * 100)}% consistency
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ position: 'relative', paddingTop: 20 }}>
          {/* Month labels */}
          {monthPositions.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 24 + col * STEP,
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#9a9088',
              }}
            >
              {label}
            </span>
          ))}

          <div style={{ display: 'flex', gap: GAP }}>
            {/* Day-of-week labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4 }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  style={{
                    height: CELL,
                    width: 18,
                    fontSize: 9,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#c2b9a6',
                    display: 'flex',
                    alignItems: 'center',
                    visibility: i % 2 === 0 ? 'visible' : 'hidden',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.map((date) => {
                  const activity = dayMap.get(date) ?? null;
                  const count = activity?.count ?? 0;
                  const isFuture = date > today;
                  return (
                    <div
                      key={date}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        background: isFuture ? 'transparent' : intensityColor(count),
                        cursor: count > 0 ? 'pointer' : 'default',
                        border: date === today ? '1.5px solid oklch(0.62 0.18 28)' : 'none',
                        opacity: isFuture ? 0 : 1,
                        transition: 'opacity 150ms',
                      }}
                      onMouseEnter={(e) => {
                        if (!isFuture) {
                          const rect = (e.target as HTMLDivElement).getBoundingClientRect();
                          setTooltip({ date, day: activity, x: rect.left, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>Less</span>
        {[0, 1, 2, 3, 5].map((n) => (
          <div key={n} style={{ width: 11, height: 11, borderRadius: 2, background: intensityColor(n) }} />
        ))}
        <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>More</span>
      </div>

      {/* Tooltip (fixed positioned via portal-like approach) */}
      {tooltip && tooltip.day && tooltip.day.count > 0 && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y - 74,
            left: tooltip.x - 60,
            zIndex: 50,
            background: '#1a1614',
            color: '#f3efe7',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: "'Crimson Pro', serif",
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="font-semibold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
            {tooltip.date}
          </div>
          <div>{tooltip.day.quizzes} quiz{tooltip.day.quizzes !== 1 ? 'zes' : ''}</div>
          <div>{tooltip.day.masteries} mastered</div>
          <div>{tooltip.day.reviews} reviewed</div>
        </div>
      )}
    </div>
  );
}
