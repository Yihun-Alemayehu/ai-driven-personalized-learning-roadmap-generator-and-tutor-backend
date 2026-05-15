import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MASTERY_CONFIG } from '@/lib/masteryConfig';
import { useMyLearningStore } from '@/store/myLearning.store';
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
          fontWeight: active ? 600 : 400,
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
  const [myLearningOpen, setMyLearningOpen] = useState(true);
  const { entries, remove } = useMyLearningStore();

  const toggle = (label: string) =>
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));

  const mastered = nodes.filter((n) => n.masteryState === 'mastered').length;
  const total = nodes.length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#f3efe7' }}>
      {/* My Learning panel */}
      {entries.length > 0 && (
        <div className="border-b" style={{ borderColor: '#d6cfbf' }}>
          <button
            className="w-full flex items-center justify-between px-4 pt-3 pb-2"
            onClick={() => setMyLearningOpen((v) => !v)}
          >
            <span
              className="text-[10px] tracking-[0.12em] uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              My Learning
            </span>
            <span
              className="text-[10px] font-mono transition-transform"
              style={{ color: '#9a9088', display: 'inline-block', transform: myLearningOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            >
              ▾
            </span>
          </button>

          {myLearningOpen && (
            <div className="pb-2 px-2 flex flex-col gap-0.5">
              {entries.map((entry) => {
                const isActive = entry.enrollmentId === enrollmentId;
                return (
                  <div
                    key={entry.enrollmentId}
                    className="flex items-center gap-1.5 rounded-[8px] px-2 py-2 group"
                    style={{ background: isActive ? 'rgba(26,22,20,0.08)' : 'transparent' }}
                  >
                    <button
                      className="flex-1 text-left min-w-0"
                      onClick={() =>
                        navigate(`/enrollments/${entry.enrollmentId}/learn/${entry.lastNodeId}`)
                      }
                    >
                      <span
                        className="block text-[12px] leading-snug truncate"
                        style={{
                          fontFamily: "'Crimson Pro', serif",
                          color: isActive ? '#1a1614' : '#5a524a',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {entry.domainName}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: '#9a9088' }}
                      >
                        {new Date(entry.lastAccessedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </button>
                    <button
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded"
                      style={{ color: '#9a9088' }}
                      onClick={(e) => { e.stopPropagation(); remove(entry.enrollmentId); }}
                      title="Remove from My Learning"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
