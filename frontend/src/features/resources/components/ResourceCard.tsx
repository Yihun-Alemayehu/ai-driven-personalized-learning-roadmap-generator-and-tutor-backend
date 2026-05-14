import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { useRateResourceMutation } from '@/api/resources';
import type { Resource, ResourceModality } from '@/types';

const MODALITY_ICONS: Record<ResourceModality, string> = {
  documentation: '📄',
  tutorial:      '📖',
  video:         '🎬',
  interactive:   '🎮',
  reference:     '🔗',
};

interface ResourceCardProps {
  resource: Resource;
  nodeId: string;
}

export function ResourceCard({ resource, nodeId }: ResourceCardProps) {
  const [rateOpen, setRateOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const rateMutation = useRateResourceMutation();

  const icon = MODALITY_ICONS[resource.modality] ?? '🔗';
  const avg = Number(resource.avgRating) || 0;

  const handleRate = async (rating: number) => {
    setPending(rating);
    await rateMutation.mutateAsync({ resourceId: resource.id, nodeId, rating });
    setRateOpen(false);
    setPending(0);
  };

  return (
    <div
      className="border rounded-[10px] p-3 flex flex-col gap-2"
      style={{ borderColor: resource.isPrimary ? 'oklch(0.72 0.18 70)' : '#d6cfbf', background: '#faf7f1' }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2">
        <span className="text-[15px] shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {resource.isPrimary && (
              <span
                className="text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: 'color-mix(in srgb, oklch(0.72 0.18 70) 15%, #faf7f1)', color: 'oklch(0.55 0.18 70)', fontFamily: 'JetBrains Mono, monospace' }}
              >
                Recommended
              </span>
            )}
            {!resource.isValid && (
              <span
                className="text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: '#fef3c7', color: '#92400e', fontFamily: 'JetBrains Mono, monospace' }}
              >
                ⚠ Link may be broken
              </span>
            )}
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium leading-snug hover:underline block mt-0.5"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614', textDecoration: 'none' }}
          >
            {resource.title}
          </a>
          <div className="text-[11px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            {resource.sourceDomain}
          </div>
        </div>
      </div>

      {/* Rating row */}
      <div className="flex items-center gap-2">
        <StarRating value={avg} size={12} />
        <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          {avg > 0 ? avg.toFixed(1) : '—'} ({resource.ratingCount})
        </span>
        <div className="flex-1" />
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] hover:underline"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
        >
          Open ↗
        </a>
        <button
          className="text-[12px] px-2 py-0.5 rounded-full border transition-colors hover:border-stone-400"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', borderColor: '#d6cfbf' }}
          onClick={() => setRateOpen(!rateOpen)}
        >
          Rate
        </button>
      </div>

      {/* Inline rate widget */}
      {rateOpen && (
        <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: '#ebe6db' }}>
          <span className="text-[12px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>Your rating:</span>
          <StarRating
            value={pending}
            interactive
            size={16}
            onChange={handleRate}
          />
          {rateMutation.isPending && (
            <span className="text-[11px] animate-pulse" style={{ color: '#9a9088' }}>saving…</span>
          )}
          <Button
            variant="ghost"
            className="ml-auto h-6 px-2 text-[11px] rounded-full"
            style={{ color: '#9a9088' }}
            onClick={() => setRateOpen(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
