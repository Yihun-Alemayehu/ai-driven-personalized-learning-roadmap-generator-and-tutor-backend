import { useState } from 'react';
import type { BranchPath } from '@/types';
import { useAddNodeMutation } from '@/api/admin';

const BRANCH_OPTIONS: { value: BranchPath | ''; label: string }[] = [
  { value: '', label: 'None (all paths)' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'data_science', label: 'Data Science' },
];

interface Props {
  ontologyId: string;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
}

export function AddNodeDialog({ ontologyId, onClose, defaultPosition }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [branchPath, setBranchPath] = useState<BranchPath | ''>('');
  const { mutate, isPending } = useAddNodeMutation(ontologyId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      {
        title,
        description: description || undefined,
        branchPath: (branchPath as BranchPath) || undefined,
        positionX: defaultPosition?.x ?? 100,
        positionY: defaultPosition?.y ?? 100,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,22,20,0.35)' }}>
      <div
        className="w-full max-w-sm rounded-[16px] p-6 flex flex-col gap-5 shadow-xl"
        style={{ background: '#faf7f1', border: '1px solid #d6cfbf' }}
      >
        <h2 className="text-[20px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
          Add Node
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Title *
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="h-9 px-3 rounded-[8px] border outline-none text-[14px]"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
              placeholder="e.g. HTML Basics"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="px-3 py-2 rounded-[8px] border outline-none text-[14px] resize-none"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Branch Path
            </span>
            <select
              value={branchPath}
              onChange={(e) => setBranchPath(e.target.value as BranchPath | '')}
              className="h-9 px-3 rounded-[8px] border outline-none text-[13px]"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}
            >
              {BRANCH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[8px] text-[13px] hover:bg-[#ebe6db] transition-colors"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="px-4 py-2 rounded-[8px] text-[13px] disabled:opacity-50 transition-colors"
              style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
            >
              {isPending ? 'Adding…' : 'Add node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
