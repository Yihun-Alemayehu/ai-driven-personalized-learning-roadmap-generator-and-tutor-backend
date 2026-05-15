import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { AttemptResult } from '@/types';

interface OutcomeScreenProps {
  result: AttemptResult;
  enrollmentId: string;
  attemptId: string;
  onRetry: () => void;
  onContinue?: () => void;
}

function ScoreStars({ score }: { score: number }) {
  const filled = score >= 90 ? 5 : score >= 80 ? 4 : score >= 70 ? 3 : score >= 50 ? 2 : 1;
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 10 10">
          <polygon
            points="5,1 6.2,3.8 9,4.2 7,6.2 7.5,9 5,7.6 2.5,9 3,6.2 1,4.2 3.8,3.8"
            fill={i <= filled ? 'oklch(0.72 0.18 70)' : '#d6cfbf'}
          />
        </svg>
      ))}
    </div>
  );
}

const TIER_CONFIG = {
  strong_pass:      { emoji: '', label: 'Excellent!',     subLabel: 'Node mastered!',              accent: 'oklch(0.60 0.13 150)', bg: 'color-mix(in srgb, oklch(0.60 0.13 150) 8%, #faf7f1)' },
  marginal_pass:    { emoji: '✓', label: 'Passed!',        subLabel: 'Node mastered',               accent: 'oklch(0.55 0.13 250)', bg: 'color-mix(in srgb, oklch(0.55 0.13 250) 8%, #faf7f1)' },
  fail_low:         { emoji: '✗', label: 'Not quite',      subLabel: 'Keep practising!',            accent: 'oklch(0.72 0.13 70)',  bg: 'color-mix(in srgb, oklch(0.72 0.13 70) 8%, #faf7f1)'  },
  fail_fundamental: { emoji: '✗', label: 'Review needed',  subLabel: 'Revisit the fundamentals',    accent: 'oklch(0.62 0.18 28)',  bg: 'color-mix(in srgb, oklch(0.62 0.18 28) 8%, #faf7f1)'  },
  fail_severe:      { emoji: '✗', label: 'Need more work', subLabel: 'Consider reaching out for help', accent: 'oklch(0.50 0.20 25)', bg: 'color-mix(in srgb, oklch(0.50 0.20 25) 8%, #faf7f1)'  },
} as const;

export function OutcomeScreen({ result, enrollmentId, attemptId, onRetry, onContinue }: OutcomeScreenProps) {
  const navigate = useNavigate();
  const handleContinue = () => (onContinue ? onContinue() : navigate(-1));
  const { attempt, gatekeeper, challengeProject, adaptedResources } = result;
  const tier = gatekeeper.tier;
  const cfg = TIER_CONFIG[tier];
  const isPass = tier === 'strong_pass' || tier === 'marginal_pass';

  void enrollmentId;

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-6 max-w-lg mx-auto w-full">
      {/* Score card */}
      <div
        className="w-full rounded-[16px] border p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: cfg.bg, borderColor: `color-mix(in srgb, ${cfg.accent} 30%, transparent)` }}
      >
        {cfg.emoji && (
          <span className="text-4xl">{cfg.emoji}</span>
        )}
        <h2
          className="text-[36px] font-medium leading-none tracking-[-0.02em]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: cfg.accent }}
        >
          {cfg.label}
        </h2>
        <ScoreStars score={attempt.scorePercent} />
        <div className="text-[48px] font-medium leading-none tracking-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
          {Math.round(attempt.scorePercent)}%
        </div>
        <div className="text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          {attempt.correctAnswers} / {attempt.totalQuestions} correct
        </div>
        <div className="text-[16px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
          {cfg.subLabel}
        </div>
        {tier === 'marginal_pass' && (
          <div className="text-[13px] mt-1 px-3 py-1.5 rounded-full border"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088', borderColor: '#d6cfbf', background: '#f3efe7' }}>
            Review recommended — some weak spots detected
          </div>
        )}
      </div>

      {/* Challenge project (strong_pass) */}
      {tier === 'strong_pass' && challengeProject && (
        <div className="w-full border rounded-[12px] p-4" style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}>
          <div className="text-[10px] tracking-[0.12em] uppercase mb-2" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Challenge project unlocked
          </div>
          <div className="text-[20px] font-medium mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
            {challengeProject.title}
          </div>
          <p className="text-[14px] leading-relaxed mb-3" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
            {challengeProject.description}
          </p>
          <Button
            size="sm"
            className="rounded-full h-[30px] text-[13px]"
            style={{ background: '#1a1614', color: '#f3efe7', fontFamily: "'Crimson Pro', serif" }}
          >
            View challenge →
          </Button>
        </div>
      )}

      {/* Adapted resources (fail tiers) */}
      {!isPass && adaptedResources && adaptedResources.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          <div className="text-[10px] tracking-[0.12em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Recommended resources
          </div>
          {adaptedResources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded-[10px] p-3 flex flex-col gap-0.5 transition-colors hover:border-stone-400"
              style={{ borderColor: '#d6cfbf', background: '#f3efe7', textDecoration: 'none' }}
            >
              <div className="text-[15px] font-medium" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
                {r.title}
              </div>
              <div className="text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
                {r.modality} · {r.sourceDomain}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="w-full flex flex-col gap-2">
        {isPass ? (
          <>
            <Button
              className="w-full rounded-full h-10 text-[15px]"
              style={{ background: '#1a1614', color: '#f3efe7', fontFamily: "'Crimson Pro', serif" }}
              onClick={handleContinue}
            >
              Continue →
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full h-10 text-[15px]"
              style={{ borderColor: '#c2b9a6', fontFamily: "'Crimson Pro', serif" }}
              onClick={() => navigate(`/quiz-attempts/${attemptId}`)}
            >
              Review answers
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full rounded-full h-10 text-[15px]"
              style={{ background: '#1a1614', color: '#f3efe7', fontFamily: "'Crimson Pro', serif" }}
              onClick={onRetry}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full h-10 text-[15px]"
              style={{ borderColor: '#c2b9a6', fontFamily: "'Crimson Pro', serif" }}
              onClick={() => navigate(`/quiz-attempts/${attemptId}`)}
            >
              Review answers
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full h-9 text-[14px]"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
              onClick={handleContinue}
            >
              {onContinue ? 'Back to explanation' : 'Back to roadmap'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
