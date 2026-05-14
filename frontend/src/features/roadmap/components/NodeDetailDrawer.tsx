import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MASTERY_CONFIG } from '@/lib/masteryConfig';
import { ResourcePanel } from '@/features/resources/components/ResourcePanel';
import type { RoadmapNode, MasteryState } from '@/types';

type DrawerTab = 'overview' | 'resources';

const TABS: { value: DrawerTab; label: string }[] = [
  { value: 'overview',   label: 'Overview'    },
  { value: 'resources',  label: 'Resources'   },
];

function MasteryBadge({ state }: { state: MasteryState }) {
  const cfg = MASTERY_CONFIG[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] uppercase px-2.5 py-[3px] rounded-[6px] border font-mono"
      style={{
        background: `color-mix(in srgb, ${cfg.borderColor} 15%, #faf7f1)`,
        color: cfg.textColor,
        borderColor: `color-mix(in srgb, ${cfg.borderColor} 35%, transparent)`,
      }}
    >
      {cfg.label}
    </span>
  );
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 10 10">
          <polygon
            points="5,1 6.2,3.8 9,4.2 7,6.2 7.5,9 5,7.6 2.5,9 3,6.2 1,4.2 3.8,3.8"
            fill={i <= level ? 'oklch(0.62 0.18 28)' : '#d6cfbf'}
          />
        </svg>
      ))}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const fill = score >= 80 ? 'oklch(0.60 0.13 150)' : score >= 60 ? 'oklch(0.72 0.13 70)' : 'oklch(0.60 0.18 28)';
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${score}%`, background: fill }} />
    </div>
  );
}

interface NodeDetailDrawerProps {
  node: RoadmapNode | null;
  open: boolean;
  onClose: () => void;
  enrollmentId?: string;
}

export function NodeDetailDrawer({ node, open, onClose, enrollmentId }: NodeDetailDrawerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');

  if (!node) return null;

  const canTakeQuiz = node.unlocked && node.masteryState !== 'locked';
  const hours = node.estimatedHours != null ? Number(node.estimatedHours) : null;
  const quizPath = `/quiz/${node.id}${enrollmentId ? `?enrollment=${enrollmentId}` : ''}`;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { onClose(); setActiveTab('overview'); } }}>
      <SheetContent
        side="right"
        className="w-[340px] p-0 flex flex-col border-l overflow-hidden"
        style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      >
        {/* Head */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b flex-shrink-0" style={{ borderColor: '#d6cfbf' }}>
          <SheetTitle
            className="text-[26px] font-medium leading-tight tracking-[-0.012em] mb-1.5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#1a1614' }}
          >
            {node.title}
          </SheetTitle>
          <MasteryBadge state={node.masteryState} />
        </SheetHeader>

        {/* Tab bar */}
        <div className="flex border-b shrink-0 px-5 gap-0" style={{ borderColor: '#d6cfbf' }}>
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className="py-2.5 px-3 text-[12px] tracking-[0.04em] transition-colors relative"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: activeTab === value ? '#1a1614' : '#9a9088',
                fontWeight: activeTab === value ? 600 : 400,
                borderBottom: activeTab === value ? '2px solid oklch(0.62 0.18 28)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* ── Overview tab ── */}
          {activeTab === 'overview' && (
            <>
              {node.description && (
                <div>
                  <div className="drawer-label">Description</div>
                  <p className="text-[15px] leading-relaxed" style={{ color: '#3a342e', fontFamily: "'Crimson Pro', serif" }}>
                    {node.description}
                  </p>
                </div>
              )}

              <Separator style={{ background: '#d6cfbf' }} />

              <div>
                <div className="drawer-label">Learning outcomes</div>
                <p className="text-[13px]" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif", fontStyle: 'italic' }}>
                  Load the node page to see detailed learning outcomes.
                </p>
              </div>

              <Separator style={{ background: '#d6cfbf' }} />

              {/* Stats */}
              <div>
                <div className="drawer-label">Node stats</div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[70px] border rounded-lg p-2.5" style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}>
                    <div className="text-[22px] font-medium leading-none tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
                      {hours != null ? `${hours}h` : '—'}
                    </div>
                    <div className="drawer-sublabel mt-0.5">EST. HOURS</div>
                  </div>
                  <div className="flex-1 min-w-[70px] border rounded-lg p-2.5" style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}>
                    <DifficultyStars level={node.difficultyLevel ?? 0} />
                    <div className="drawer-sublabel mt-1">DIFFICULTY</div>
                  </div>
                </div>
              </div>

              <Separator style={{ background: '#d6cfbf' }} />

              {/* Progress */}
              <div>
                <div className="drawer-label">Your progress</div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>Attempts</span>
                    <span className="font-mono text-[12px]" style={{ color: '#1a1614' }}>{node.attemptsCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>Best score</span>
                    <span className="font-mono text-[12px]" style={{ color: '#1a1614' }}>
                      {node.bestQuizScore != null ? `${node.bestQuizScore}%` : '—'}
                    </span>
                  </div>
                  {node.bestQuizScore != null && <ScoreBar score={node.bestQuizScore} />}
                </div>
              </div>
            </>
          )}

          {/* ── Resources tab ── */}
          {activeTab === 'resources' && <ResourcePanel nodeId={node.id} />}

        </div>

        {/* Footer — only on overview tab */}
        {activeTab === 'overview' && (
          <div className="px-5 pt-3.5 pb-5 border-t flex flex-col gap-2 flex-shrink-0" style={{ borderColor: '#d6cfbf' }}>
            <Button
              className="w-full rounded-full h-10 text-[15px] font-medium"
              style={{
                fontFamily: "'Crimson Pro', serif",
                background: canTakeQuiz ? '#1a1614' : '#ebe6db',
                color: canTakeQuiz ? '#f3efe7' : '#9a9088',
              }}
              disabled={!canTakeQuiz}
              onClick={() => canTakeQuiz && navigate(quizPath)}
            >
              Take quiz →
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full h-10 text-[15px] font-medium"
              style={{ fontFamily: "'Crimson Pro', serif", borderColor: '#c2b9a6' }}
              onClick={() => setActiveTab('resources')}
            >
              View resources
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full h-8 text-[14px]"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
              onClick={() => enrollmentId && navigate(`/enrollments/${enrollmentId}/learn/${node.id}`)}
              disabled={!enrollmentId}
            >
              Get AI explanation ↗
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
