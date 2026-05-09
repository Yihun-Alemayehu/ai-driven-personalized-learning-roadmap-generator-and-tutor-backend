# Phase 5: Quiz & Gatekeeper

**Depends on:** [Phase 4: Roadmap Visualisation](04-roadmap.md)  
**Next phase:** [Phase 6: Resources & AI Explanation](06-resources-explanation.md)

---

## What to Build

The full quiz flow: load questions for a node, display MCQ cards, track answers, submit attempt, and render the Gatekeeper outcome screen. The outcome screen varies significantly per tier — strong pass unlocks a challenge project, fail tiers show adapted resources.

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/nodes/:nodeId/quiz` | Returns quiz + questions (no `correctAnswer`) |
| `POST` | `/api/v1/quizzes/:quizId/attempt` | `{enrollmentId, answers, startedAt}` → `{attempt, gatekeeper, challengeProject, adaptedResources}` |
| `GET` | `/api/v1/quiz-attempts` | My attempts (with optional `?nodeId=`) |
| `GET` | `/api/v1/quiz-attempts/:id` | Full attempt record with answer details |

---

## File & Folder Structure

```
src/
├── api/
│   └── quizzes.ts                 # useQuizQuery, useSubmitAttemptMutation, useAttemptsQuery
├── features/quiz/
│   ├── QuizPage.tsx               # Full-page quiz experience
│   ├── AttemptReviewPage.tsx      # Post-attempt review with answer breakdown
│   └── components/
│       ├── QuizQuestion.tsx       # Single MCQ card with option selection
│       ├── QuizProgressBar.tsx    # "Question 2 of 4" progress indicator
│       ├── QuizTimer.tsx          # Elapsed time display (not a hard limit)
│       ├── OutcomeScreen.tsx      # Animated result screen
│       ├── OutcomeStrong.tsx      # 🎉 Strong pass — challenge project CTA
│       ├── OutcomeMarginal.tsx    # ✓ Marginal pass — "you passed but review X"
│       ├── OutcomeFail.tsx        # ✗ Fail — adapted resources + retry
│       └── AnswerReview.tsx       # Per-question correct/wrong breakdown
```

---

## Key Implementation Details

### `src/api/quizzes.ts`
```typescript
export interface QuizQuestion {
  id: string;
  questionType: string;
  questionText: string;
  options?: string[];
  explanation?: string;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  nodeId: string;
  questions: QuizQuestion[];
}

export interface AttemptAnswer { questionId: string; answer: string; }

export interface GatekeeperResult {
  tier: QuizOutcome;
  masteryState: MasteryState;
  nextNodeUnlocked: boolean;
  unlockedNodeIds?: string[];
}

export interface AttemptResult {
  attempt: { id: string; scorePercent: number; correctAnswers: number; totalQuestions: number; completedAt: string };
  gatekeeper: GatekeeperResult;
  challengeProject?: { id: string; title: string; description: string } | null;
  adaptedResources?: Resource[] | null;
}

export function useQuizQuery(nodeId: string) {
  return useQuery({
    queryKey: ['quiz', nodeId],
    queryFn: () => apiClient.get<Quiz>(`/nodes/${nodeId}/quiz`).then((r) => r.data),
    enabled: Boolean(nodeId),
    staleTime: 5 * 60 * 1000, // quiz is stable — don't refetch mid-session
  });
}

export function useSubmitAttemptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: SubmitAttemptPayload }) =>
      apiClient.post<AttemptResult>(`/quizzes/${quizId}/attempt`, payload).then((r) => r.data),
    onSuccess: (_, { payload }) => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['quiz-attempts', payload.enrollmentId] });
    },
  });
}
```

### Quiz Flow State Machine
```
LOADING → READY → [question 1 .. N] → SUBMITTING → OUTCOME
```

Use `useReducer` or Zustand local slice:
```typescript
type QuizPhase = 'loading' | 'ready' | 'taking' | 'submitting' | 'outcome';

interface QuizState {
  phase: QuizPhase;
  currentQuestion: number;
  answers: Record<string, string>;   // questionId → selected option
  startedAt: Date | null;
  result: AttemptResult | null;
}
```

### `QuizPage.tsx` Layout
```
TAKING phase:
┌──────────────────────────────────────┐
│  ← Exit    Question 2 of 4  [timer] │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│  What does `const` mean in JS?       │
│                                      │
│  ○  A) Block-scoped variable         │
│  ●  B) Constant that can't reassign  │
│  ○  C) Function declaration          │
│  ○  D) Global variable               │
│                                      │
│                    [Next →]          │
└──────────────────────────────────────┘
```

- Only one answer selectable per question
- "Next" advances; last question shows "Submit"
- "Exit" shows confirm dialog ("Your progress will be lost")
- Options shuffle on first load to prevent memorisation bias

### `OutcomeScreen.tsx` — varies by tier
```
STRONG_PASS (score ≥ 90%):
┌──────────────────────────────┐
│         🎉 Excellent!        │
│    Score: 95%   ⭐⭐⭐⭐⭐   │
│    Node mastered!            │
│                              │
│  🏆 Challenge Project        │
│  Build a TODO app with...    │
│                              │
│  [View Challenge]  [→ Next]  │
└──────────────────────────────┘

MARGINAL_PASS (score 70–89%):
┌──────────────────────────────┐
│         ✓ Passed!            │
│    Score: 75%   ⭐⭐⭐       │
│    Node mastered             │
│    (review recommended)      │
│                              │
│  [Continue →]  [Review weak areas] │
└──────────────────────────────┘

FAIL_LOW / FAIL_FUNDAMENTAL / FAIL_SEVERE:
┌──────────────────────────────┐
│         ✗ Not quite          │
│    Score: 45%                │
│    Keep practising!          │
│                              │
│  📚 Recommended Resources:   │
│  [resource cards list]        │
│                              │
│  [Try Again]  [Review Answers] │
└──────────────────────────────┘
```

### Gatekeeper tier → UI mapping
```typescript
const OUTCOME_CONFIG = {
  strong_pass:        { emoji: '🎉', label: 'Excellent!',    color: 'green' },
  marginal_pass:      { emoji: '✓',  label: 'Passed',        color: 'blue'  },
  fail_low:           { emoji: '✗',  label: 'Not quite',     color: 'amber' },
  fail_fundamental:   { emoji: '✗',  label: 'Review needed', color: 'orange'},
  fail_severe:        { emoji: '✗',  label: 'Need more work',color: 'red'   },
};
```

After a pass outcome, invalidate the roadmap query so the node colour updates automatically when the user returns to the roadmap.

### `AttemptReviewPage.tsx`
Shows each question with:
- The question text
- The user's answer (red if wrong, green if correct)
- The correct answer (if different)
- The explanation text (from `question.explanation`)

---

## Tests to Write

| Test | Asserts |
|------|---------|
| QuizPage — loads questions | Correct number of QuizQuestion cards rendered |
| QuizQuestion — option selection | Selected option gets highlighted; others deselected |
| Quiz — advance to next | currentQuestion increments on "Next" |
| Quiz — submit | Calls submitAttempt with all answers and startedAt |
| OutcomeScreen — strong_pass | Renders 🎉 header; challenge project card visible |
| OutcomeScreen — fail_low | Renders adapted resources list |
| AttemptReviewPage — correct | Green indicator on correct answer |
| AttemptReviewPage — wrong | Red indicator; shows correct answer |
| Roadmap invalidation | After submit, roadmap query refetched |

---

## Definition of Done

- [ ] Quiz loads for an unlocked node; questions display with shuffled options
- [ ] Selecting an option highlights it; only one option selectable per question
- [ ] Progress bar and question counter accurate at each step
- [ ] Timer shows elapsed seconds from first question
- [ ] Submitting calls the API with correct payload; loading state shown
- [ ] `strong_pass` → outcome screen shows 🎉 + challenge project (if available)
- [ ] `marginal_pass` → outcome screen shows "Passed" + review suggestion
- [ ] `fail_*` → outcome screen shows fail + adapted resources (if available)
- [ ] Returning to roadmap after pass shows updated node colour
- [ ] AttemptReviewPage shows correct/wrong per question with explanations
