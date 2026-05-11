// ─── NodeDetailDrawer ─────────────────────────────────────────────────────────
// Right-side shadcn Sheet that opens when a learner clicks an unlocked node.
// Props match the RoadmapNode type + an open/close callback.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MASTERY_CONFIG } from '../masteryConfig';
import type { RoadmapNode, MasteryState } from '../roadmap.types';

// ── Mastery badge ─────────────────────────────────────────────────────────────
function MasteryBadge({ state }: { state: MasteryState }) {
  const cfg = MASTERY_CONFIG[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em]
                 uppercase px-2.5 py-[3px] rounded-[6px] border font-mono"
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

// ── Difficulty stars ──────────────────────────────────────────────────────────
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

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }: { score: number }) {
  const fill =
    score >= 80
      ? 'oklch(0.60 0.13 150)'
      : score >= 60
      ? 'oklch(0.72 0.13 70)'
      : 'oklch(0.60 0.18 28)';
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${score}%`, background: fill }}
      />
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface NodeDetailDrawerProps {
  node: RoadmapNode | null;
  open: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function NodeDetailDrawer({ node, open, onClose }: NodeDetailDrawerProps) {
  const navigate = useNavigate();

  if (!node) return null;

  const canTakeQuiz = node.unlocked && node.masteryState !== 'locked';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[340px] p-0 flex flex-col border-l overflow-hidden"
        style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      >
        {/* ── Head ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: '#d6cfbf' }}>
          <SheetTitle
            className="text-[26px] font-medium leading-tight tracking-[-0.012em] mb-1.5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#1a1614' }}
          >
            {node.title}
          </SheetTitle>
          <MasteryBadge state={node.masteryState} />
        </SheetHeader>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Description */}
          <div>
            <div className="drawer-label">Description</div>
            <p className="text-[15px] leading-relaxed" style={{ color: '#3a342e' }}>
              {node.description}
            </p>
          </div>

          <Separator style={{ background: '#d6cfbf' }} />

          {/* Learning outcomes */}
          {node.learningOutcomes?.length > 0 && (
            <div>
              <div className="drawer-label">Learning outcomes</div>
              <ul className="flex flex-col gap-1.5 list-none p-0">
                {node.learningOutcomes.map((o, i) => (
                  <li key={i} className="relative pl-4 text-[14px]" style={{ color: '#3a342e' }}>
                    <span
                      className="absolute left-0 font-mono text-[11px]"
                      style={{ color: 'oklch(0.62 0.18 28)' }}
                    >
                      →
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator style={{ background: '#d6cfbf' }} />

          {/* Stats */}
          <div>
            <div className="drawer-label">Node stats</div>
            <div className="flex gap-3 flex-wrap">
              <div
                className="flex-1 min-w-[70px] border rounded-lg p-2.5"
                style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
              >
                <div
                  className="text-[22px] font-medium leading-none tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
                >
                  {node.estimatedHours ? `${node.estimatedHours}h` : '—'}
                </div>
                <div className="drawer-sublabel mt-0.5">EST. HOURS</div>
              </div>
              <div
                className="flex-1 min-w-[70px] border rounded-lg p-2.5"
                style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
              >
                <DifficultyStars level={node.difficultyLevel ?? 0} />
                <div className="drawer-sublabel mt-1">DIFFICULTY</div>
              </div>
            </div>
          </div>

          <Separator style={{ background: '#d6cfbf' }} />

          {/* Your progress */}
          <div>
            <div className="drawer-label">Your progress</div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span style={{ color: '#6e645a' }}>Attempts</span>
                <span className="font-mono text-[12px]" style={{ color: '#1a1614' }}>
                  {node.attemptsCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: '#6e645a' }}>Best score</span>
                <span className="font-mono text-[12px]" style={{ color: '#1a1614' }}>
                  {node.bestQuizScore != null ? `${node.bestQuizScore}%` : '—'}
                </span>
              </div>
              {node.bestQuizScore != null && <ScoreBar score={node.bestQuizScore} />}
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div
          className="px-5 pt-3.5 pb-5 border-t flex flex-col gap-2 flex-shrink-0"
          style={{ borderColor: '#d6cfbf' }}
        >
          <Button
            className="w-full rounded-full h-10 text-[15px] font-medium"
            style={{
              fontFamily: "'Crimson Pro', serif",
              background: canTakeQuiz ? '#1a1614' : '#ebe6db',
              color: canTakeQuiz ? '#f3efe7' : '#9a9088',
            }}
            disabled={!canTakeQuiz}
            onClick={() => node.unlocked && navigate(`/quiz/${node.id}`)}
          >
            Take quiz →
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full h-10 text-[15px] font-medium"
            style={{ fontFamily: "'Crimson Pro', serif", borderColor: '#c2b9a6' }}
            onClick={() => { /* navigate to resources tab */ }}
          >
            View resources
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full h-8 text-[14px]"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
            onClick={() => { /* trigger AI explanation */ }}
          >
            Get AI explanation
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Global CSS — add to your globals.css:
// .drawer-label    { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #9a9088; margin-bottom: 6px; }
// .drawer-sublabel { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #6e645a; letter-spacing: 0.06em; }
