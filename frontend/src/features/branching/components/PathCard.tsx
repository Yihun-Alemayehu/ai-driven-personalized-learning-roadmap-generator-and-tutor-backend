import type { BranchPath } from '@/types';
import type { PathSummary } from '@/api/branching';

export const PATH_META: Record<BranchPath, { label: string; icon: string; description: string; color: string }> = {
  frontend:     { label: 'Frontend',     icon: '🌐', description: 'React, CSS, UI/UX & web fundamentals', color: '#fdecd4' },
  backend:      { label: 'Backend',      icon: '⚙️',  description: 'Node.js, APIs & database design',     color: '#d8f0e0' },
  data_science: { label: 'Data Science', icon: '📊', description: 'Python, ML & statistics',              color: '#d8e4f8' },
};

interface PathCardProps {
  path: PathSummary;
  selected: boolean;
  current: boolean;
  onSelect: () => void;
  isPending: boolean;
}

export function PathCard({ path, selected, current, onSelect, isPending }: PathCardProps) {
  const meta = PATH_META[path.branchPath] ?? { label: path.branchPath, icon: '📚', description: '', color: '#f3efe7' };

  return (
    <button
      onClick={onSelect}
      disabled={isPending}
      className="flex flex-col gap-2 p-4 rounded-[12px] border-2 text-left transition-all hover:shadow-sm disabled:opacity-60"
      style={{
        background: selected ? '#1a1614' : meta.color,
        borderColor: selected ? '#1a1614' : current ? 'oklch(0.60 0.13 150)' : '#d6cfbf',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[24px]">{meta.icon}</span>
        {current && !selected && (
          <span
            className="text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: 'oklch(0.60 0.13 150)', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}
          >
            Current
          </span>
        )}
      </div>
      <div>
        <div
          className="text-[16px] font-semibold"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: selected ? '#faf7f1' : '#1a1614' }}
        >
          {meta.label}
        </div>
        <div
          className="text-[13px] mt-0.5 leading-snug"
          style={{ fontFamily: "'Crimson Pro', serif", color: selected ? '#c2b9a6' : '#6e645a' }}
        >
          {path.description ?? meta.description}
        </div>
      </div>
      {(path.nodeCount > 0 || path.estimatedHours != null) && (
        <div
          className="text-[11px] font-mono mt-auto"
          style={{ color: selected ? '#9a9088' : '#9a9088' }}
        >
          {path.nodeCount} nodes{path.estimatedHours != null ? ` · ~${path.estimatedHours}h` : ''}
        </div>
      )}
    </button>
  );
}
