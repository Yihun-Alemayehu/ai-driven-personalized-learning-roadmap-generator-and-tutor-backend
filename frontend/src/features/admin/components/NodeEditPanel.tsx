import { useState, useEffect } from 'react';
import type { OntologyNode, BranchPath } from '@/types';
import { useUpdateNodeMutation, useDeleteNodeMutation } from '@/api/admin';

const BRANCH_OPTIONS: { value: BranchPath | ''; label: string }[] = [
  { value: '', label: 'None (all paths)' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'data_science', label: 'Data Science' },
];

interface Props {
  node: OntologyNode;
  ontologyId: string;
  onClose: () => void;
}

export function NodeEditPanel({ node, ontologyId, onClose }: Props) {
  const [title, setTitle] = useState(node.title);
  const [slug, setSlug] = useState(node.slug);
  const [description, setDescription] = useState(node.description ?? '');
  const [outcomes, setOutcomes] = useState<string[]>(node.learningOutcomes);
  const [outcomeInput, setOutcomeInput] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(node.estimatedHours ?? 1);
  const [difficultyLevel, setDifficultyLevel] = useState(node.difficultyLevel ?? 1);
  const [isBranching, setIsBranching] = useState(node.isBranchingPoint);
  const [isConvergence, setIsConvergence] = useState(node.isConvergencePoint);
  const [branchPath, setBranchPath] = useState<BranchPath | ''>(node.branchPath ?? '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const update = useUpdateNodeMutation(ontologyId);
  const deleteNode = useDeleteNodeMutation(ontologyId);

  useEffect(() => {
    setTitle(node.title);
    setSlug(node.slug);
    setDescription(node.description ?? '');
    setOutcomes(node.learningOutcomes);
    setEstimatedHours(node.estimatedHours ?? 1);
    setDifficultyLevel(node.difficultyLevel ?? 1);
    setIsBranching(node.isBranchingPoint);
    setIsConvergence(node.isConvergencePoint);
    setBranchPath(node.branchPath ?? '');
  }, [node.id]);

  function autoSlug(t: string) {
    return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

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

  function handleSave() {
    update.mutate(
      {
        nodeId: node.id,
        title,
        slug,
        description: description || undefined,
        learningOutcomes: outcomes,
        estimatedHours,
        difficultyLevel,
        isBranchingPoint: isBranching,
        isConvergencePoint: isConvergence,
        branchPath: (branchPath as BranchPath) || undefined,
      },
      { onSuccess: onClose },
    );
  }

  function handleDelete() {
    deleteNode.mutate(node.id, { onSuccess: onClose });
  }

  return (
    <div
      className="fixed right-0 top-0 h-full z-40 flex flex-col overflow-y-auto"
      style={{ width: 360, background: '#faf7f1', borderLeft: '1px solid #d6cfbf', boxShadow: '-4px 0 16px rgba(0,0,0,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#d6cfbf' }}>
        <h3 className="text-[18px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
          Edit Node
        </h3>
        <button
          onClick={onClose}
          className="text-[20px] leading-none opacity-50 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 px-5 py-5 flex-1">
        <Field label="Title *">
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="h-9 px-3 rounded-[8px] border outline-none text-[14px] w-full"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
          />
        </Field>

        <Field label="Slug">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="h-9 px-3 rounded-[8px] border outline-none text-[13px] w-full font-mono"
            style={{ borderColor: '#d6cfbf', background: '#fff', color: '#6e645a' }}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="px-3 py-2 rounded-[8px] border outline-none text-[14px] w-full resize-none"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
          />
        </Field>

        <Field label="Learning Outcomes">
          <div className="flex flex-col gap-1.5">
            {outcomes.map((o, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-[6px]" style={{ background: '#f3efe7' }}>
                <span className="flex-1 text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{o}</span>
                <button onClick={() => removeOutcome(i)} className="text-[14px] opacity-50 hover:opacity-100">×</button>
              </div>
            ))}
            <div className="flex gap-1.5">
              <input
                value={outcomeInput}
                onChange={(e) => setOutcomeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                className="flex-1 h-8 px-3 rounded-[6px] border outline-none text-[13px]"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                placeholder="Add outcome…"
              />
              <button
                onClick={addOutcome}
                className="px-2.5 h-8 rounded-[6px] text-[12px] hover:bg-[#ebe6db] transition-colors"
                style={{ border: '1px solid #d6cfbf', color: '#6e645a' }}
              >
                +
              </button>
            </div>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Est. Hours">
            <input
              type="number"
              min={1}
              max={100}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="h-9 px-3 rounded-[8px] border outline-none text-[14px] w-full"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}
            />
          </Field>

          <Field label={`Difficulty: ${difficultyLevel}/5`}>
            <input
              type="range"
              min={1}
              max={5}
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: '#1a1614' }}
            />
          </Field>
        </div>

        <Field label="Branch Path">
          <select
            value={branchPath}
            onChange={(e) => setBranchPath(e.target.value as BranchPath | '')}
            className="h-9 px-3 rounded-[8px] border outline-none text-[13px] w-full"
            style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#1a1614' }}
          >
            {BRANCH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <div className="flex flex-col gap-2">
          <ToggleRow label="Branching Point" checked={isBranching} onChange={setIsBranching} />
          <ToggleRow label="Convergence Point" checked={isConvergence} onChange={setIsConvergence} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t flex flex-col gap-2" style={{ borderColor: '#d6cfbf' }}>
        <button
          onClick={handleSave}
          disabled={update.isPending}
          className="w-full py-2 rounded-[8px] text-[14px] disabled:opacity-50 transition-colors"
          style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>

        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 rounded-[8px] text-[13px] hover:bg-[#ebe6db] transition-colors"
              style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", border: '1px solid #d6cfbf' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteNode.isPending}
              className="flex-1 py-2 rounded-[8px] text-[13px] disabled:opacity-50 transition-colors"
              style={{ background: 'oklch(0.55 0.18 28)', color: '#fff', fontFamily: "'Crimson Pro', serif" }}
            >
              {deleteNode.isPending ? '…' : 'Confirm delete'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 rounded-[8px] text-[13px] hover:bg-[#ebe6db] transition-colors"
            style={{ color: 'oklch(0.50 0.18 28)', fontFamily: "'Crimson Pro', serif", border: '1px solid oklch(0.82 0.08 28)' }}
          >
            Delete node
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full relative transition-colors"
        style={{ background: checked ? '#1a1614' : '#d6cfbf' }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 rounded-full transition-all"
          style={{ background: '#fff', left: checked ? '22px' : '2px' }}
        />
      </div>
    </label>
  );
}
