import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSelectPathMutation, useSwitchPathMutation, type BranchingPoint } from '@/api/branching';
import { PathCard } from './components/PathCard';
import type { BranchPath } from '@/types';

interface PathSelectorModalProps {
  enrollmentId: string;
  branchingPoint: BranchingPoint;
  currentPath?: BranchPath | null;
  open: boolean;
  onClose: () => void;
}

export function PathSelectorModal({
  enrollmentId,
  branchingPoint,
  currentPath,
  open,
  onClose,
}: PathSelectorModalProps) {
  const [selected, setSelected] = useState<BranchPath | null>(null);
  const selectMutation = useSelectPathMutation(enrollmentId);
  const switchMutation = useSwitchPathMutation(enrollmentId);

  const isSwitch = Boolean(currentPath);
  const activeMutation = isSwitch ? switchMutation : selectMutation;
  const paths = branchingPoint.paths;

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      if (isSwitch) {
        await switchMutation.mutateAsync(selected);
      } else {
        await selectMutation.mutateAsync(selected);
      }
      onClose();
    } catch {
      // error handled by tanstack query
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg"
        style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      >
        <DialogHeader>
          <div className="text-[32px] mb-2">🔀</div>
          <DialogTitle
            className="text-[24px]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
          >
            {isSwitch ? 'Switch Your Path' : 'Choose Your Learning Path'}
          </DialogTitle>
          <DialogDescription
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', fontSize: 15 }}
          >
            {isSwitch
              ? 'You can switch to a different specialisation. Your progress on the shared nodes will be kept.'
              : `You've reached a branching point: ${branchingPoint.node.title}. Select a specialisation to continue.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-2">
          {paths.map((path) => (
            <PathCard
              key={path.branchPath}
              path={path}
              selected={selected === path.branchPath}
              current={currentPath === path.branchPath}
              onSelect={() => setSelected(path.branchPath)}
              isPending={activeMutation.isPending}
            />
          ))}
        </div>

        {activeMutation.isError && (
          <p className="text-[13px] text-center" style={{ color: '#b91c1c', fontFamily: "'Crimson Pro', serif" }}>
            Something went wrong. Please try again.
          </p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-[14px] border transition-colors hover:bg-[#ebe6db]"
            style={{ borderColor: '#d6cfbf', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
          >
            {isSwitch ? 'Cancel' : 'Decide later'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || activeMutation.isPending}
            className="flex-1 rounded-lg px-4 py-2.5 text-[14px] font-semibold transition-all disabled:opacity-50"
            style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
          >
            {activeMutation.isPending
              ? 'Updating…'
              : isSwitch
              ? 'Switch path'
              : 'Start this path →'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
