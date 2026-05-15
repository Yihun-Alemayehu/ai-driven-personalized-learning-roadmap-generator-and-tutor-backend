import { useState } from 'react';
import { PathSelectorModal } from '../PathSelectorModal';
import { PATH_META } from './PathCard';
import type { BranchingPoint } from '@/api/branching';
import type { BranchPath } from '@/types';

interface BranchingPointBannerProps {
  enrollmentId: string;
  branchingPoint: BranchingPoint;
  currentPath?: BranchPath | null;
}

export function BranchingPointBanner({ enrollmentId, branchingPoint, currentPath }: BranchingPointBannerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="mx-4 mt-3 mb-0 rounded-[10px] border px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: 'color-mix(in srgb, oklch(0.55 0.13 250) 8%, #faf7f1)',
          borderColor: 'oklch(0.55 0.13 250)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[18px] shrink-0">🔀</span>
          <div className="min-w-0">
            <p className="text-[14px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
              {currentPath
                ? `Path: ${PATH_META[currentPath]?.label ?? currentPath}`
                : 'Branching point reached!'}
            </p>
            <p className="text-[12px] truncate" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              {currentPath
                ? `Switch to a different specialisation`
                : `Choose your learning path to continue`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 text-[13px] px-3 py-1.5 rounded-full transition-all hover:opacity-80"
          style={{
            background: 'oklch(0.55 0.13 250)',
            color: '#fff',
            fontFamily: "'Crimson Pro', serif",
          }}
        >
          {currentPath ? 'Switch path' : 'Choose path'}
        </button>
      </div>

      <PathSelectorModal
        enrollmentId={enrollmentId}
        branchingPoint={branchingPoint}
        currentPath={currentPath}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
