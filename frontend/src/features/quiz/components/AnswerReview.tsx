import type { ReviewQuestion } from '@/api/quizzes';

interface AnswerReviewProps {
  question: ReviewQuestion;
  submitted: string | undefined;
}

export function AnswerReview({ question, submitted }: AnswerReviewProps) {
  const isCorrect = submitted === question.correctAnswer;
  const options = question.options ?? [];

  return (
    <div className="border rounded-[12px] p-4 flex flex-col gap-3" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
      <p className="text-[17px] leading-snug font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
        {question.questionText}
      </p>

      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => {
          const isUserAnswer = opt === submitted;
          const isRightAnswer = opt === question.correctAnswer;
          let bg = 'transparent';
          let border = '#d6cfbf';
          let textColor = '#6e645a';
          if (isRightAnswer) { bg = 'color-mix(in srgb, oklch(0.60 0.13 150) 12%, #faf7f1)'; border = 'oklch(0.60 0.13 150)'; textColor = 'oklch(0.45 0.13 150)'; }
          else if (isUserAnswer && !isCorrect) { bg = 'color-mix(in srgb, oklch(0.60 0.18 28) 10%, #faf7f1)'; border = 'oklch(0.60 0.18 28)'; textColor = 'oklch(0.50 0.18 28)'; }

          return (
            <div
              key={i}
              className="px-3 py-2 rounded-[8px] border text-[14px] flex items-center gap-2"
              style={{ background: bg, borderColor: border, color: textColor, fontFamily: "'Crimson Pro', serif" }}
            >
              {isRightAnswer ? (
                <span className="text-[11px] shrink-0" style={{ color: 'oklch(0.60 0.13 150)' }}>✓</span>
              ) : isUserAnswer ? (
                <span className="text-[11px] shrink-0" style={{ color: 'oklch(0.60 0.18 28)' }}>✗</span>
              ) : (
                <span className="w-3 shrink-0" />
              )}
              {opt}
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div className="pt-1 border-t" style={{ borderColor: '#ebe6db' }}>
          <span className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Explanation
          </span>
          <p className="text-[14px] mt-1 leading-relaxed" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
