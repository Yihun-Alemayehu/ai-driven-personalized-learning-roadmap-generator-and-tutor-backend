import type { QuizQuestion as QuizQuestionType } from '@/types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | undefined;
  onSelect: (answer: string) => void;
}

export function QuizQuestion({ question, selectedAnswer, onSelect }: QuizQuestionProps) {
  const options = question.options ?? [];

  return (
    <div className="flex flex-col gap-5">
      <p
        className="text-[20px] leading-snug"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614', fontWeight: 500 }}
      >
        {question.questionText}
      </p>

      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={i}
              onClick={() => onSelect(opt)}
              className="w-full text-left px-4 py-3 rounded-[10px] border-[1.5px] transition-all duration-[100ms] flex items-start gap-3"
              style={{
                background: isSelected
                  ? 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)'
                  : '#f3efe7',
                borderColor: isSelected ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
                color: '#1a1614',
                fontFamily: "'Crimson Pro', serif",
                fontSize: 16,
              }}
            >
              <span
                className="mt-[2px] shrink-0 w-5 h-5 rounded-full border-[1.5px] grid place-items-center transition-colors"
                style={{
                  borderColor: isSelected ? 'oklch(0.62 0.18 28)' : '#c2b9a6',
                  background: isSelected ? 'oklch(0.62 0.18 28)' : 'transparent',
                }}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full" style={{ background: '#faf7f1' }} />
                )}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
