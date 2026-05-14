import { useState } from 'react';
import { useExplanationQuery } from '@/api/explanation';

interface ExplanationPanelProps {
  nodeId: string;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 py-2 animate-pulse">
      <div className="h-3 rounded w-3/4" style={{ background: '#ebe6db' }} />
      <div className="h-3 rounded w-full" style={{ background: '#ebe6db' }} />
      <div className="h-3 rounded w-5/6" style={{ background: '#ebe6db' }} />
      <div className="h-3 rounded w-2/3 mt-2" style={{ background: '#ebe6db' }} />
      <div className="h-3 rounded w-3/4" style={{ background: '#ebe6db' }} />
      <div className="h-3 rounded w-1/2" style={{ background: '#ebe6db' }} />
      <p className="text-[12px] text-center mt-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        Generating explanation… this may take up to 30 seconds
      </p>
    </div>
  );
}

export function ExplanationPanel({ nodeId }: ExplanationPanelProps) {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, isError } = useExplanationQuery(nodeId, enabled);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <p className="text-[14px] text-center" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
          Get an AI-generated explanation tailored to this topic.
        </p>
        <button
          className="px-5 py-2 rounded-full border text-[14px] transition-all hover:bg-[#ebe6db]"
          style={{ fontFamily: "'Crimson Pro', serif", borderColor: '#d6cfbf', color: '#1a1614' }}
          onClick={() => setEnabled(true)}
        >
          Generate explanation
        </button>
      </div>
    );
  }

  if (isLoading) return <Skeleton />;

  if (isError || !data) {
    return (
      <p className="text-[14px] py-4 text-center italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
        Could not load explanation. Please try again later.
      </p>
    );
  }

  const { explanation, fallback } = data;

  // AI explanation available
  if (explanation) {
    return (
      <div className="flex flex-col gap-4">
        {/* Summary */}
        <div>
          <div className="drawer-label">Summary</div>
          <p className="text-[15px] leading-relaxed mt-1" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
            {explanation.summary}
          </p>
        </div>

        {/* Key points */}
        {explanation.keyPoints.length > 0 && (
          <div>
            <div className="drawer-label">📌 Key Points</div>
            <ul className="flex flex-col gap-1.5 mt-1.5">
              {explanation.keyPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.62 0.18 28)', marginTop: 6 }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common mistakes */}
        {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
          <div>
            <div className="drawer-label">⚠ Common Mistakes</div>
            <ul className="flex flex-col gap-1.5 mt-1.5">
              {explanation.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
                  <span className="shrink-0" style={{ color: 'oklch(0.62 0.18 28)', marginTop: 1 }}>•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback — AI unavailable
  if (fallback) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className="text-[12px] px-3 py-2 rounded-[8px]"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088', background: '#f3efe7', border: '1px solid #ebe6db' }}
        >
          AI explanation unavailable — showing node content
        </div>

        {fallback.description && (
          <div>
            <div className="drawer-label">Description</div>
            <p className="text-[15px] leading-relaxed mt-1" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
              {fallback.description}
            </p>
          </div>
        )}

        {fallback.learningOutcomes.length > 0 && (
          <div>
            <div className="drawer-label">Learning Outcomes</div>
            <ul className="flex flex-col gap-1.5 mt-1.5">
              {fallback.learningOutcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  <span className="shrink-0" style={{ color: '#9a9088', marginTop: 1 }}>·</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}
