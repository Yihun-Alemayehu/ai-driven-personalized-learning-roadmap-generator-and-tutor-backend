// ─── ProgressSidebar ──────────────────────────────────────────────────────────
// Left-side panel: domain name, progress bar, mastery breakdown by state,
// branch path selector, and "next up" quick-action card.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MASTERY_CONFIG } from '../masteryConfig';
import type { MasteryState, ProgressStats, RoadmapNode, BranchPath } from '../roadmap.types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProgressSidebarProps {
  domainName: string;
  enrolledAt: string;
  selectedBranchPath: BranchPath;
  stats: ProgressStats;
  nextNode: RoadmapNode | null;
  onBranchChange: (path: BranchPath) => void;
  onNextNodeClick: (node: RoadmapNode) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] tracking-[0.12em] uppercase"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-none border-t my-0" style={{ borderTopColor: '#d6cfbf', borderTopWidth: 1 }} />;
}

const MASTERY_ROWS: { state: MasteryState; label: string }[] = [
  { state: 'mastered',      label: 'Mastered'      },
  { state: 'in_progress',   label: 'In progress'   },
  { state: 'review_needed', label: 'Review needed' },
  { state: 'not_started',   label: 'Not started'   },
  { state: 'locked',        label: 'Locked'        },
];

const BRANCH_PATHS: { path: BranchPath; label: string }[] = [
  { path: 'frontend',    label: 'Frontend'    },
  { path: 'backend',     label: 'Backend'     },
  { path: 'data_science',label: 'Data'        },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function ProgressSidebar({
  domainName,
  enrolledAt,
  selectedBranchPath,
  stats,
  nextNode,
  onBranchChange,
  onNextNodeClick,
}: ProgressSidebarProps) {

  const statCountMap: Record<MasteryState, number> = {
    mastered:      stats.masteredCount,
    in_progress:   stats.inProgressCount,
    review_needed: stats.reviewNeededCount,
    not_started:   stats.notStartedCount,
    relearn:       stats.rerelearnCount,
    locked:        stats.lockedCount,
  };

  return (
    <aside
      className="w-[252px] flex-shrink-0 flex flex-col gap-[22px] overflow-y-auto overflow-x-hidden
                 px-5 py-[22px]"
      style={{ background: '#faf7f1', borderRight: '1px solid #d6cfbf' }}
    >
      {/* ── Domain ── */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>currently enrolled</SectionLabel>
        <h2
          className="text-[22px] font-medium leading-[1.05] tracking-[-0.01em] m-0"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          {domainName}
        </h2>
        <div className="text-[13px]" style={{ color: '#6e645a' }}>
          {enrolledAt}
        </div>
      </div>

      <Divider />

      {/* ── Progress ── */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>overall progress</SectionLabel>
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span
              className="text-[28px] leading-none tracking-[-0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'oklch(0.62 0.18 28)' }}
            >
              {stats.completionPercent}%
            </span>
            <span
              className="text-[11px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
            >
              {stats.masteredCount} / {stats.totalNodes} nodes
            </span>
          </div>
          <div className="h-[7px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${stats.completionPercent}%`,
                background: 'oklch(0.62 0.18 28)',
              }}
            />
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Mastery breakdown ── */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>mastery breakdown</SectionLabel>
        <div className="flex flex-col gap-[7px]">
          {MASTERY_ROWS.map(({ state, label }) => {
            const cfg = MASTERY_CONFIG[state];
            const count = statCountMap[state] ?? 0;
            return (
              <div key={state} className="flex items-center gap-2 text-[13px]" style={{ color: '#3a342e' }}>
                <span
                  className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0 border"
                  style={{
                    background: cfg.dotColor,
                    borderColor: `color-mix(in srgb, ${cfg.dotColor} 40%, transparent)`,
                  }}
                />
                <span className="flex-1">{label}</span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* ── Branch selector ── */}
      <div className="flex flex-col gap-2.5">
        <SectionLabel>learning path</SectionLabel>
        <div className="flex gap-1">
          {BRANCH_PATHS.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => onBranchChange(path)}
              className="flex-1 py-1.5 text-center rounded-lg border text-[10.5px] tracking-[0.04em]
                         transition-all duration-150"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: selectedBranchPath === path ? '#1a1614' : '#f3efe7',
                color:      selectedBranchPath === path ? '#f3efe7' : '#6e645a',
                borderColor: selectedBranchPath === path ? '#1a1614' : '#d6cfbf',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Next up ── */}
      {nextNode && (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>next up</SectionLabel>
          <div
            className="border rounded-[10px] p-3.5"
            style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
          >
            <div
              className="text-[18px] font-medium mb-1"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
            >
              {nextNode.title}
            </div>
            <div className="text-[13px] mb-2.5" style={{ color: '#6e645a' }}>
              {nextNode.estimatedHours ? `${nextNode.estimatedHours}h · ` : ''}
              {nextNode.difficultyLevel === 1 ? 'Beginner' : nextNode.difficultyLevel === 2 ? 'Intermediate' : 'Advanced'} ·{' '}
              {MASTERY_CONFIG[nextNode.masteryState].label}
            </div>
            <Button
              size="sm"
              className="rounded-full h-[30px] text-[13px] font-medium"
              style={{
                fontFamily: "'Crimson Pro', serif",
                background: '#1a1614',
                color: '#f3efe7',
              }}
              onClick={() => onNextNodeClick(nextNode)}
            >
              View node →
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
