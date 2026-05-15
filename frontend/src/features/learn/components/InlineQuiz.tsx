import { useReducer, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuizQuery, useSubmitAttemptMutation } from '@/api/quizzes';
import { QuizQuestion } from '@/features/quiz/components/QuizQuestion';
import { QuizProgressBar } from '@/features/quiz/components/QuizProgressBar';
import { QuizTimer } from '@/features/quiz/components/QuizTimer';
import { OutcomeScreen } from '@/features/quiz/components/OutcomeScreen';
import type { AttemptResult } from '@/types';

type QuizPhase = 'loading' | 'ready' | 'taking' | 'submitting' | 'outcome';

interface QuizState {
  phase: QuizPhase;
  currentQuestion: number;
  answers: Record<string, string>;
  startedAt: Date | null;
  result: AttemptResult | null;
  shuffledOptions: Record<string, string[]>;
}

type QuizAction =
  | { type: 'START'; shuffledOptions: Record<string, string[]> }
  | { type: 'SELECT'; questionId: string; answer: string }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_DONE'; result: AttemptResult }
  | { type: 'RETRY' };

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'taking', startedAt: new Date(), shuffledOptions: action.shuffledOptions, answers: {} };
    case 'SELECT':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answer } };
    case 'NEXT':
      return { ...state, currentQuestion: state.currentQuestion + 1 };
    case 'PREV':
      return { ...state, currentQuestion: Math.max(0, state.currentQuestion - 1) };
    case 'SUBMIT_START':
      return { ...state, phase: 'submitting' };
    case 'SUBMIT_DONE':
      return { ...state, phase: 'outcome', result: action.result };
    case 'RETRY':
      return { phase: 'ready', currentQuestion: 0, answers: {}, startedAt: null, result: null, shuffledOptions: {} };
    default:
      return state;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface InlineQuizProps {
  nodeId: string;
  enrollmentId: string;
  onBack: () => void;
}

export function InlineQuiz({ nodeId, enrollmentId, onBack }: InlineQuizProps) {
  const [exitOpen, setExitOpen] = useState(false);
  const { data: quiz, isLoading, isError } = useQuizQuery(nodeId);
  const submitMutation = useSubmitAttemptMutation();

  const [state, dispatch] = useReducer(reducer, {
    phase: 'loading',
    currentQuestion: 0,
    answers: {},
    startedAt: null,
    result: null,
    shuffledOptions: {},
  });

  const readyRef = useRef(false);
  useEffect(() => {
    if (quiz && !readyRef.current) {
      readyRef.current = true;
      dispatch({ type: 'RETRY' });
    }
  }, [quiz]);

  const handleStart = useCallback(() => {
    if (!quiz) return;
    const opts: Record<string, string[]> = {};
    quiz.questions.forEach((q) => { opts[q.id] = shuffle(q.options ?? []); });
    dispatch({ type: 'START', shuffledOptions: opts });
  }, [quiz]);

  const handleSelect = useCallback((questionId: string, answer: string) => {
    dispatch({ type: 'SELECT', questionId, answer });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !state.startedAt) return;
    dispatch({ type: 'SUBMIT_START' });
    try {
      const result = await submitMutation.mutateAsync({
        quizId: quiz.id,
        payload: {
          enrollmentId,
          answers: quiz.questions.map((q) => ({
            questionId: q.id,
            answer: state.answers[q.id] ?? '',
          })),
          startedAt: state.startedAt.toISOString(),
        },
      });
      dispatch({ type: 'SUBMIT_DONE', result });
    } catch {
      dispatch({ type: 'RETRY' });
    }
  }, [quiz, state.startedAt, state.answers, enrollmentId, submitMutation]);

  const questions = quiz?.questions ?? [];
  const currentQ = questions[state.currentQuestion];
  const isLast = state.currentQuestion === questions.length - 1;
  const hasAnswered = currentQ ? Boolean(state.answers[currentQ.id]) : false;
  const allAnswered = questions.every((q) => Boolean(state.answers[q.id]));

  const currentOptions = useMemo(() => {
    if (!currentQ) return [];
    return state.shuffledOptions[currentQ.id] ?? (currentQ.options ?? []);
  }, [currentQ, state.shuffledOptions]);

  if (isLoading || state.phase === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <span className="font-mono text-xs tracking-widest animate-pulse" style={{ color: '#9a9088' }}>
          loading quiz…
        </span>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a', fontSize: 16 }}>
          No quiz available for this topic yet.
        </p>
        <button
          className="text-[14px] underline"
          style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
          onClick={onBack}
        >
          ← Back to explanation
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Quiz header */}
      <div
        className="shrink-0 px-8 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#e8e2d9' }}
      >
        <button
          className="text-[13px] flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
          onClick={onBack}
        >
          ← Explanation
        </button>

        <span
          className="text-[10px] tracking-[0.12em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          Quiz · {questions.length} questions
        </span>

        {state.phase === 'taking' && state.startedAt && (
          <QuizTimer startedAt={state.startedAt} />
        )}
        {state.phase !== 'taking' && <span className="w-10" />}
      </div>

      {/* Quiz body */}
      <div className="flex-1 overflow-y-auto">
        {state.phase === 'ready' && (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-8 py-10">
            <div className="text-center max-w-sm">
              <div
                className="text-[10px] tracking-[0.12em] uppercase mb-3"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
              >
                Ready to begin
              </div>
              <h2
                className="text-[28px] font-medium leading-tight mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
              >
                {questions.length}-question quiz
              </h2>
              <p className="text-[15px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}>
                Select the best answer for each question. You can review before submitting.
              </p>
            </div>
            <button
              className="px-7 py-2.5 rounded-full text-[15px] transition-all hover:opacity-90"
              style={{ background: '#1a1614', color: '#f3efe7', fontFamily: "'Crimson Pro', serif" }}
              onClick={handleStart}
            >
              Start quiz →
            </button>
          </div>
        )}

        {state.phase === 'taking' && currentQ && (
          <div className="flex flex-col h-full">
            <div className="px-8 pt-5 pb-4 border-b" style={{ borderColor: '#e8e2d9' }}>
              <QuizProgressBar current={state.currentQuestion + 1} total={questions.length} />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <QuizQuestion
                question={{ ...currentQ, options: currentOptions }}
                selectedAnswer={state.answers[currentQ.id]}
                onSelect={(answer) => handleSelect(currentQ.id, answer)}
              />
            </div>

            <div className="px-8 pb-6 pt-3 border-t flex items-center gap-3" style={{ borderColor: '#e8e2d9' }}>
              {state.currentQuestion > 0 && (
                <button
                  className="px-5 py-2 rounded-full text-[14px] border transition-all hover:bg-[#ebe6db]"
                  style={{ borderColor: '#c2b9a6', fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
                  onClick={() => dispatch({ type: 'PREV' })}
                >
                  ← Back
                </button>
              )}
              <div className="flex-1" />
              {isLast ? (
                <button
                  className="px-6 py-2 rounded-full text-[15px] transition-all hover:opacity-90 disabled:opacity-40"
                  style={{
                    background: allAnswered ? '#1a1614' : '#ebe6db',
                    color: allAnswered ? '#f3efe7' : '#9a9088',
                    fontFamily: "'Crimson Pro', serif",
                  }}
                  disabled={!allAnswered || submitMutation.isPending}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              ) : (
                <button
                  className="px-6 py-2 rounded-full text-[15px] transition-all hover:opacity-90 disabled:opacity-40"
                  style={{
                    background: hasAnswered ? '#1a1614' : '#ebe6db',
                    color: hasAnswered ? '#f3efe7' : '#9a9088',
                    fontFamily: "'Crimson Pro', serif",
                  }}
                  disabled={!hasAnswered}
                  onClick={() => dispatch({ type: 'NEXT' })}
                >
                  Next →
                </button>
              )}
              <button
                className="px-4 py-2 rounded-full text-[13px] transition-all hover:opacity-70"
                style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
                onClick={() => setExitOpen(true)}
              >
                Exit
              </button>
              <Dialog open={exitOpen} onOpenChange={setExitOpen}>
                <DialogContent style={{ fontFamily: "'Crimson Pro', serif" }}>
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif" }}>Exit quiz?</DialogTitle>
                    <DialogDescription>
                      Your progress will be lost and this attempt will not be recorded.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setExitOpen(false)}>Stay</Button>
                    <Button onClick={onBack}>Exit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {state.phase === 'submitting' && (
          <div className="flex flex-1 items-center justify-center py-20">
            <span className="font-mono text-xs tracking-widest animate-pulse" style={{ color: '#9a9088' }}>
              submitting…
            </span>
          </div>
        )}

        {state.phase === 'outcome' && state.result && (
          <OutcomeScreen
            result={state.result}
            enrollmentId={enrollmentId}
            attemptId={state.result.attempt.id}
            onRetry={() => dispatch({ type: 'RETRY' })}
            onContinue={onBack}
          />
        )}
      </div>

    </div>
  );
}
