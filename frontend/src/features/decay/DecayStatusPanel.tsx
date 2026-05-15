import { useState } from 'react';
import { useDecayStatusQuery } from '@/api/decay';
import { MicroQuizModal } from './MicroQuizModal';
import { DecayNodeCard } from './components/DecayNodeCard';

interface DecayStatusPanelProps {
  enrollmentId: string;
}

export function DecayStatusPanel({ enrollmentId }: DecayStatusPanelProps) {
  const { data: decayStatus, isLoading } = useDecayStatusQuery(enrollmentId);
  const [expanded, setExpanded] = useState(false);
  const [reviewNode, setReviewNode] = useState<{ nodeId: string; title: string } | null>(null);

  if (isLoading || !decayStatus || decayStatus.length === 0) return null;

  const shown = expanded ? decayStatus : decayStatus.slice(0, 2);

  return (
    <>
      <div
        className="border rounded-2xl overflow-hidden"
        style={{ borderColor: 'oklch(0.72 0.13 70)', background: 'color-mix(in srgb, oklch(0.72 0.13 70) 5%, #faf7f1)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b"
          style={{ borderColor: 'oklch(0.82 0.08 70)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[15px]">⚠</span>
            <span
              className="text-[16px] font-medium"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
            >
              Knowledge Decay Alerts
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'oklch(0.72 0.13 70)', color: '#fff' }}
            >
              {decayStatus.length}
            </span>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[12px] transition-colors hover:underline"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            {expanded ? 'Show less' : `Show all ${decayStatus.length}`}
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2.5 p-4">
          {shown.map((d) => (
            <DecayNodeCard
              key={d.nodeId}
              decay={d}
              onReview={() => setReviewNode({ nodeId: d.nodeId, title: d.title })}
            />
          ))}
        </div>
      </div>

      {reviewNode && (
        <MicroQuizModal
          nodeId={reviewNode.nodeId}
          nodeTitle={reviewNode.title}
          enrollmentId={enrollmentId}
          open={true}
          onClose={() => setReviewNode(null)}
        />
      )}
    </>
  );
}
