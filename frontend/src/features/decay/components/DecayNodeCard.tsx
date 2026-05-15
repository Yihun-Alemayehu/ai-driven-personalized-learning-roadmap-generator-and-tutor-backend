import type { DecayStatus } from '@/api/decay';

interface DecayNodeCardProps {
  decay: DecayStatus;
  onReview: () => void;
}

export function DecayNodeCard({ decay, onReview }: DecayNodeCardProps) {
  const isRelearn = decay.masteryState === 'relearn';
  const urgencyColor = isRelearn ? 'oklch(0.60 0.18 28)' : 'oklch(0.72 0.13 70)';

  return (
    <div
      className="flex items-start justify-between gap-4 px-4 py-3.5 rounded-[10px] border"
      style={{
        background: isRelearn
          ? 'color-mix(in srgb, oklch(0.62 0.18 28) 6%, #faf7f1)'
          : 'color-mix(in srgb, oklch(0.72 0.13 70) 6%, #faf7f1)',
        borderColor: isRelearn ? 'oklch(0.75 0.12 28)' : 'oklch(0.80 0.08 70)',
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="shrink-0 text-[15px] mt-0.5" style={{ color: urgencyColor }}>
          {isRelearn ? '🔴' : '⚠'}
        </span>
        <div className="min-w-0">
          <p
            className="text-[15px] font-medium leading-snug"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
          >
            {decay.title}
          </p>
          <p
            className="text-[12px] mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            {decay.daysSinceReview != null
              ? `Last reviewed ${decay.daysSinceReview}d ago`
              : 'Never reviewed'}
            {isRelearn ? ' · relearn required' : ` · ${decay.daysUntilDecay ?? 0}d until decay`}
          </p>
        </div>
      </div>

      <button
        onClick={onReview}
        className="shrink-0 text-[13px] px-3 py-1.5 rounded-full border transition-all hover:opacity-80 whitespace-nowrap"
        style={{
          fontFamily: "'Crimson Pro', serif",
          background: '#1a1614',
          color: '#faf7f1',
          borderColor: '#1a1614',
        }}
      >
        {isRelearn ? 'Relearn' : 'Review now'}
      </button>
    </div>
  );
}
