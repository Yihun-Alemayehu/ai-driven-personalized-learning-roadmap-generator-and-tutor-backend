import { useAnalyticsAiStream } from '@/api/instructor';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

interface Props {
  domainId: string;
  domainName: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: 'oklch(0.55 0.13 250)', animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

export function AiAnalysisPanel({ domainId, domainName }: Props) {
  const { state, text, generate, regenerate, reset } = useAnalyticsAiStream(domainId);

  return (
    <div
      className="border rounded-2xl overflow-hidden"
      style={{ borderColor: 'oklch(0.55 0.13 250)', background: '#faf7f1' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: 'color-mix(in srgb, oklch(0.55 0.13 250) 20%, #faf7f1)', background: 'color-mix(in srgb, oklch(0.55 0.13 250) 6%, #faf7f1)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[18px]">🤖</span>
          <div>
            <p className="text-[15px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
              AI Analytics Summary
            </p>
            <p className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
              Situation analysis &amp; action plan for {domainName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state === 'error' && (
            <button
              onClick={reset}
              className="text-[12px] px-3 py-1.5 rounded-full border transition-colors hover:bg-muted"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', borderColor: '#d6cfbf' }}
            >
              Clear
            </button>
          )}
          {state === 'done' ? (
            <button
              onClick={regenerate}
              disabled={false}
              className="text-[13px] px-4 py-1.5 rounded-full border transition-all hover:bg-muted"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', borderColor: '#d6cfbf' }}
            >
              Regenerate
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={state === 'streaming'}
              className="text-[13px] px-4 py-1.5 rounded-full transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Crimson Pro', serif", background: 'oklch(0.55 0.13 250)', color: '#fff' }}
            >
              {state === 'streaming' ? 'Analysing…' : 'Generate Analysis'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-[32px]">📊</span>
            <p className="text-[16px]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3a342e' }}>
              Get an AI-powered situation report
            </p>
            <p className="text-[13px] max-w-md" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
              The AI will analyse all learner performance data for <strong>{domainName}</strong> and return
              a situation summary, key concerns, and specific curriculum recommendations.
            </p>
          </div>
        )}

        {state === 'streaming' && !text && <TypingDots />}

        {(state === 'streaming' || state === 'done') && text && (
          <div className="text-[14.5px] leading-relaxed" style={{ fontFamily: "'Crimson Pro', serif", color: '#2a2420' }}>
            <MarkdownRenderer context="content">{text}</MarkdownRenderer>
            {state === 'streaming' && (
              <span
                className="inline-block w-0.5 h-[1em] ml-px align-middle animate-pulse"
                style={{ background: 'oklch(0.55 0.13 250)', borderRadius: 1 }}
              />
            )}
          </div>
        )}

        {state === 'error' && (
          <p className="text-[13px] py-4 text-center italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
            Could not generate analysis. Check that the AI service is running and try again.
          </p>
        )}
      </div>
    </div>
  );
}
