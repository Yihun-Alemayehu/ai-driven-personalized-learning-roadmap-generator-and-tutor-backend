import { formatDistanceToNow } from 'date-fns';
import type { LearningInsights } from '@/api/progress';

interface Props {
  weakNodes: LearningInsights['weakNodes'];
  strugglingNodes: LearningInsights['strugglingNodes'];
  enrollmentId: string;
}

const STATE_CONFIG = {
  review_needed: { label: 'Review needed', color: 'oklch(0.72 0.13 70)', bg: 'color-mix(in srgb, oklch(0.72 0.13 70) 10%, #faf7f1)' },
  relearn:       { label: 'Relearn',        color: 'oklch(0.62 0.18 28)', bg: 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' },
};

function DifficultyDots({ level }: { level: number | null }) {
  if (!level) return null;
  return (
    <div className="flex gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= level ? 'oklch(0.62 0.18 28)' : '#d6cfbf' }}
        />
      ))}
    </div>
  );
}

export function WeakAreasPanel({ weakNodes, strugglingNodes, enrollmentId }: Props) {
  void enrollmentId;

  return (
    <div className="flex flex-col gap-3">
      {/* Decaying / forgotten nodes */}
      {weakNodes.length > 0 && (
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e8e2d9' }}>
            <span style={{ color: 'oklch(0.72 0.13 70)' }}>↻</span>
            <span className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Knowledge decay
            </span>
          </div>
          <div className="flex flex-col">
            {weakNodes.map((node) => {
              const cfg = STATE_CONFIG[node.masteryState as keyof typeof STATE_CONFIG] ?? STATE_CONFIG.review_needed;
              return (
                <div
                  key={node.nodeId}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                  style={{ borderColor: '#e8e2d9', background: cfg.bg }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[14px] font-medium truncate"
                      style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                    >
                      {node.title}
                    </div>
                    {node.lastReviewedAt && (
                      <div className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
                        last seen {formatDistanceToNow(new Date(node.lastReviewedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DifficultyDots level={node.difficultyLevel} />
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full border"
                      style={{ fontFamily: 'JetBrains Mono, monospace', color: cfg.color, borderColor: cfg.color, background: '#faf7f1' }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Struggling nodes */}
      {strugglingNodes.length > 0 && (
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
        >
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#e8e2d9' }}>
            <span style={{ color: 'oklch(0.62 0.18 28)' }}>⚠</span>
            <span className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Multiple attempts needed
            </span>
          </div>
          <div className="flex flex-col">
            {strugglingNodes.map((node) => (
              <div
                key={node.nodeId}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: '#e8e2d9' }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[14px] font-medium truncate"
                    style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                  >
                    {node.title}
                  </div>
                  <div className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
                    {node.attemptsCount} attempt{node.attemptsCount !== 1 ? 's' : ''}
                    {node.bestQuizScore !== null ? ` · best ${Math.round(node.bestQuizScore)}%` : ''}
                  </div>
                </div>
                <DifficultyDots level={node.difficultyLevel} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
