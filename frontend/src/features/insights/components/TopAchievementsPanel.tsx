import { formatDistanceToNow } from 'date-fns';
import type { LearningInsights } from '@/api/progress';

interface Props {
  topNodes: LearningInsights['topNodes'];
}

export function TopAchievementsPanel({ topNodes }: Props) {
  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e8e2d9' }}>
        <span style={{ color: 'oklch(0.60 0.13 150)' }}>✓</span>
        <span className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          Hardest nodes mastered
        </span>
      </div>
      <div className="flex flex-col">
        {topNodes.map((node, i) => (
          <div
            key={node.nodeId}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: '#e8e2d9' }}
          >
            {/* Rank */}
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{
                background: i === 0 ? 'oklch(0.72 0.18 70)' : i === 1 ? '#d6cfbf' : '#ebe6db',
                color: i === 0 ? '#fff' : '#6e645a',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div
                className="text-[14px] font-medium truncate"
                style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
              >
                {node.title}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {node.bestQuizScore !== null && (
                  <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.60 0.13 150)' }}>
                    {Math.round(node.bestQuizScore)}%
                  </span>
                )}
                {node.masteredAt && (
                  <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
                    {formatDistanceToNow(new Date(node.masteredAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>

            {/* Difficulty stars */}
            {node.difficultyLevel != null && (
              <div className="flex gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: s <= (node.difficultyLevel ?? 0) ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
