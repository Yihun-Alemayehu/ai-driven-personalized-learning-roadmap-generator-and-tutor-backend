import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MASTERY_CONFIG } from '@/lib/masteryConfig';
import type { RoadmapNode, MasteryState } from '@/types';

interface LearnSidebarProps {
  nodes: RoadmapNode[];
  activeNodeId: string;
  enrollmentId: string;
}

const STATE_ICON: Record<MasteryState, string> = {
  mastered:      '✓',
  in_progress:   '◑',
  review_needed: '↻',
  not_started:   '○',
  relearn:       '⚠',
  locked:        '🔒',
};

function NodeRow({
  node,
  active,
  onClick,
}: {
  node: RoadmapNode;
  active: boolean;
  onClick: () => void;
}) {
  const cfg = MASTERY_CONFIG[node.masteryState];
  const icon = STATE_ICON[node.masteryState];
  const isLocked = node.masteryState === 'locked';

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-[8px] transition-colors group"
      style={{
        background: active ? '#1a1614' : 'transparent',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      <span
        className="shrink-0 text-[11px] font-mono mt-0.5 w-4 text-center"
        style={{ color: active ? '#f3efe7' : cfg.textColor }}
      >
        {icon}
      </span>
      <span
        className="text-[13px] leading-snug"
        style={{
          fontFamily: "'Crimson Pro', serif",
          color: active ? '#f3efe7' : isLocked ? '#9a9088' : '#3a342e',
        }}
      >
        {node.title}
      </span>
    </button>
  );
}

interface Section {
  label: string;
  nodes: RoadmapNode[];
}

function groupNodes(nodes: RoadmapNode[]): Section[] {
  const sorted = [...nodes].sort((a, b) => (a.positionY ?? 0) - (b.positionY ?? 0));

  const sections: Section[] = [];
  let currentSection: Section = { label: 'Topics', nodes: [] };

  for (const node of sorted) {
    if (node.isBranchingPoint && currentSection.nodes.length > 0) {
      sections.push(currentSection);
      currentSection = { label: node.title, nodes: [] };
    } else {
      currentSection.nodes.push(node);
    }
  }
  if (currentSection.nodes.length > 0) sections.push(currentSection);

  return sections.length > 0 ? sections : [{ label: 'Topics', nodes: sorted }];
}

export function LearnSidebar({ nodes, activeNodeId, enrollmentId }: LearnSidebarProps) {
  const navigate = useNavigate();
  const sections = groupNodes(nodes);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const mastered = nodes.filter((n) => n.masteryState === 'mastered').length;
  const total = nodes.length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#f3efe7' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: '#d6cfbf' }}>
        <div
          className="text-[11px] tracking-[0.1em] uppercase mb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          Course outline
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#d6cfbf' }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(mastered / Math.max(total, 1)) * 100}%`, background: 'oklch(0.60 0.13 150)' }}
            />
          </div>
          <span className="text-[11px] font-mono shrink-0" style={{ color: '#6e645a' }}>
            {mastered}/{total}
          </span>
        </div>
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">
            {sections.length > 1 && (
              <button
                onClick={() => toggle(section.label)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] hover:bg-[#ebe6db] transition-colors"
              >
                <span
                  className="text-[10px] font-mono tracking-wider transition-transform"
                  style={{ color: '#9a9088', transform: collapsed[section.label] ? 'rotate(-90deg)' : 'rotate(0deg)', display: 'inline-block' }}
                >
                  ▾
                </span>
                <span
                  className="text-[11px] tracking-[0.06em] uppercase"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
                >
                  {section.label}
                </span>
              </button>
            )}

            {!collapsed[section.label] && (
              <div className="flex flex-col gap-0.5 pl-1">
                {section.nodes.map((node) => (
                  <NodeRow
                    key={node.id}
                    node={node}
                    active={node.id === activeNodeId}
                    onClick={() => navigate(`/enrollments/${enrollmentId}/learn/${node.id}`)}
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
