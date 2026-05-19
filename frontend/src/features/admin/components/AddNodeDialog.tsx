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

function autoSlug(t: string) {
  return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function AddNodeDialog({ ontologyId, onClose, defaultPosition }: Props) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [branchPath, setBranchPath] = useState<BranchPath | ''>('');
  const { mutate, isPending, error } = useAddNodeMutation(ontologyId);

  function handleTitleChange(val: string) {
    setTitle(val);
    setSlug(autoSlug(val));
  }

  function addOutcome() {
    const trimmed = outcomeInput.trim();
    if (trimmed) {
      setOutcomes((prev) => [...prev, trimmed]);
      setOutcomeInput('');
    }
  }

  function removeOutcome(i: number) {
    setOutcomes((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      {
        title,
        slug,
        learningOutcomes: outcomes,
        description: description || undefined,
        branchPath: (branchPath as BranchPath) || undefined,
        positionX: defaultPosition?.x ?? 100,
        positionY: defaultPosition?.y ?? 100,
      },
      { onSuccess: onClose },
    );
  }

  const inputStyle = {
    borderColor: '#d6cfbf',
    background: '#fff',
    fontFamily: "'Crimson Pro', serif",
    color: '#1a1614',
  };

  const labelStyle = {
    fontFamily: 'JetBrains Mono, monospace',
    color: '#9a9088',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,22,20,0.35)' }}>
      <div
        className="w-full max-w-sm rounded-[16px] p-6 flex flex-col gap-4 shadow-xl"
        style={{ background: '#faf7f1', border: '1px solid #d6cfbf', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 className="text-[20px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
          Add Node
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={labelStyle}>Title *</span>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              autoFocus
              className="h-9 px-3 rounded-[8px] border outline-none text-[14px]"
              style={inputStyle}
              placeholder="e.g. HTML Basics"
            />
          </label>

          {/* Slug (auto-filled, editable) */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={labelStyle}>Slug *</span>
            <input
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              required
              className="h-9 px-3 rounded-[8px] border outline-none text-[13px]"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
              placeholder="html-basics"
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={labelStyle}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="px-3 py-2 rounded-[8px] border outline-none text-[14px] resize-none"
              style={inputStyle}
            />
          </label>

          {/* Learning outcomes */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={labelStyle}>
              Learning Outcomes *{' '}
              <span style={{ color: outcomes.length > 0 ? 'oklch(0.55 0.14 145)' : '#c0b8b0' }}>
                ({outcomes.length})
              </span>
            </span>
            <div className="flex flex-col gap-1">
              {outcomes.map((o, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[6px]" style={{ background: '#f3efe7' }}>
                  <span className="flex-1 text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{o}</span>
                  <button type="button" onClick={() => removeOutcome(i)} className="text-[14px] opacity-50 hover:opacity-100">×</button>
                </div>
              ))}
              <div className="flex gap-1.5">
                <input
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                  className="flex-1 h-8 px-3 rounded-[6px] border outline-none text-[13px]"
                  style={inputStyle}
                  placeholder="Add outcome and press Enter…"
                />
                <button
                  type="button"
                  onClick={addOutcome}
                  className="px-2.5 h-8 rounded-[6px] text-[12px] hover:bg-[#ebe6db] transition-colors"
                  style={{ border: '1px solid #d6cfbf', color: '#6e645a' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Branch Path */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={labelStyle}>Branch Path</span>
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

          {error && (
            <p className="text-[12px]" style={{ color: 'oklch(0.50 0.18 28)', fontFamily: "'Crimson Pro', serif" }}>
              {(error as Error).message}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
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
              disabled={isPending || !title.trim() || !slug.trim() || outcomes.length === 0}
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
