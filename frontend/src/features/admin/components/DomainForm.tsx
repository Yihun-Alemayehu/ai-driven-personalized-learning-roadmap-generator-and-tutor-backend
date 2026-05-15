import { useState, useEffect } from 'react';
import type { Domain } from '@/types';
import { useCreateDomainMutation, useUpdateDomainMutation } from '@/api/admin';

interface Props {
  domain?: Domain;
  onClose: () => void;
}

export function DomainForm({ domain, onClose }: Props) {
  const [name, setName] = useState(domain?.name ?? '');
  const [description, setDescription] = useState(domain?.description ?? '');
  const [iconUrl, setIconUrl] = useState(domain?.iconUrl ?? '');

  const create = useCreateDomainMutation();
  const update = useUpdateDomainMutation();
  const isPending = create.isPending || update.isPending;

  useEffect(() => {
    if (domain) {
      setName(domain.name);
      setDescription(domain.description ?? '');
      setIconUrl(domain.iconUrl ?? '');
    }
  }, [domain]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, description: description || undefined, iconUrl: iconUrl || undefined };
    if (domain) {
      update.mutate({ id: domain.id, ...data }, { onSuccess: onClose });
    } else {
      create.mutate(data, { onSuccess: onClose });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,22,20,0.35)' }}>
      <div
        className="w-full max-w-md rounded-[16px] p-6 flex flex-col gap-5 shadow-xl"
        style={{ background: '#faf7f1', border: '1px solid #d6cfbf' }}
      >
        <h2 className="text-[22px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
          {domain ? 'Edit Domain' : 'Create Domain'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Name *
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 px-3 rounded-[8px] border outline-none text-[14px]"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
              placeholder="e.g. Web Development"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="px-3 py-2 rounded-[8px] border outline-none text-[14px] resize-none"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
              placeholder="Short description of the domain"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Icon URL
            </span>
            <input
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="h-9 px-3 rounded-[8px] border outline-none text-[14px]"
              style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', fontSize: 12 }}
              placeholder="https://..."
            />
          </label>

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
              disabled={isPending || !name.trim()}
              className="px-4 py-2 rounded-[8px] text-[13px] disabled:opacity-50 transition-colors"
              style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
            >
              {isPending ? 'Saving…' : domain ? 'Save changes' : 'Create domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
