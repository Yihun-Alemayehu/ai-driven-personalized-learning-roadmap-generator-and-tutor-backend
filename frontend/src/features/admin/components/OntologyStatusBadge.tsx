import type { OntologyStatus } from '@/types';

const STATUS_STYLES: Record<OntologyStatus, { bg: string; color: string; label: string }> = {
  draft:      { bg: '#ebe6db', color: '#6e645a', label: 'Draft' },
  in_review:  { bg: 'oklch(0.92 0.08 60)', color: 'oklch(0.45 0.12 60)', label: 'In Review' },
  verified:   { bg: 'oklch(0.92 0.08 145)', color: 'oklch(0.40 0.12 145)', label: 'Verified' },
  published:  { bg: 'oklch(0.90 0.10 155)', color: 'oklch(0.35 0.15 155)', label: 'Published' },
  archived:   { bg: '#e8e4de', color: '#9a9088', label: 'Archived' },
};

export function OntologyStatusBadge({ status }: { status: OntologyStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] tracking-[0.04em]"
      style={{ background: s.bg, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}
    >
      {s.label}
    </span>
  );
}
