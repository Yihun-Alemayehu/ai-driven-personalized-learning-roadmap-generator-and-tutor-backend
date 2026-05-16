# Phase 6: Quiz & Gatekeeper

**Depends on:** [Phase 5: Learn & AI Explanation](05-learn-explanation.md)  
**Next phase:** [Phase 7: Resources, Decay & Notifications](07-resources-decay-notifications.md)

---

## What to Build

The full quiz flow, displayed inline within the `LearnScreen` (swapping the explanation panel), not as a separate route. MCQ question cards with single-select answers, a progress bar, a countdown timer, submission, and a gatekeeper outcome screen with tier-specific feedback (challenge project, adapted resources, retry). This exactly mirrors the web's `InlineQuiz` component.

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `GET`  | `/nodes/:nodeId/quiz` | Returns `{id, nodeId, questions: [{id, questionText, options, orderIndex}]}` — no correct answer |
| `POST` | `/quizzes/:quizId/attempt` | `{enrollmentId, answers: [{questionId, answer}], startedAt}` → `{attempt, gatekeeper, challengeProject?, adaptedResources?}` |
| `GET`  | `/quiz-attempts` | My attempts list |
| `GET`  | `/quiz-attempts/:id` | Full attempt with per-question review |

---

## Files to Create

```
lib/
├── core/
│   ├── api/
│   │   └── quizzes_api.dart
│   ├── models/
│   │   ├── quiz.dart               # Quiz, QuizQuestion
│   │   └── attempt_result.dart     # AttemptResult, GatekeeperResult, QuizOutcome
│   └── providers/
│       └── quiz_provider.dart
└── features/
    ├── quiz/
    │   ├── quiz_panel.dart          # Inline panel rendered inside LearnScreen
    │   ├── quiz_question_card.dart  # Single MCQ question + options
    │   ├── quiz_progress_bar.dart   # "X / Y" + linear progress
    │   ├── quiz_timer.dart          # Elapsed time counter
    │   ├── outcome_screen.dart      # Result display after submission
    │   └── attempt_review_screen.dart  # Full answer review (separate route)
    └── learn/
        └── learn_screen.dart        # Update: add view toggle (explanation | quiz)
```

---

## Key Implementation Details

### Inline rendering (no route change)
The quiz is shown within `LearnScreen` using a `view` `StateProvider<LearnView>` where `LearnView` is `{explanation, quiz}`. When "Take quiz →" is tapped, the view switches to `quiz` and the `QuizPanel` replaces the `ExplanationPanel`. The `LearnAppBar` updates to show "← Explanation" back button. This matches the web's `InlineQuiz` component exactly.

### `lib/features/quiz/quiz_panel.dart`
Manages quiz state using a `StateNotifier<QuizState>`:
```dart
enum QuizPhase { loading, ready, taking, submitting, outcome }

class QuizState {
  final QuizPhase phase;
  final int currentQuestion;
  final Map<String, String> answers;   // questionId → selected answer
  final DateTime? startedAt;
  final AttemptResult? result;
}
```

Phase transitions:
- `loading` → `ready` when quiz data loads
- `ready` → `taking` when "Start quiz" is tapped
- `taking` → `submitting` when "Submit" is tapped
- `submitting` → `outcome` when result arrives
- `outcome` → `ready` on "Try again" (RETRY action)

### `lib/features/quiz/quiz_question_card.dart`
- Question text (Cormorant Garamond 20px)
- Options list: each option is an `InkWell`-wrapped `Container` with:
  - Unselected: `AppColors.surface` background, `AppColors.border` border
  - Selected: 10% terracotta tint background, terracotta border
  - A circular radio indicator on the left (matching web style)
- Shuffle options once on quiz start (same as web)

### `lib/features/quiz/quiz_progress_bar.dart`
- `Row` with `"X / Y"` in JetBrains Mono + `LinearProgressIndicator` (terracotta colour)

### `lib/features/quiz/quiz_timer.dart`
- Displays elapsed time since `startedAt`
- Updates every second using `StreamBuilder` + `Stream.periodic`
- Format: `mm:ss` in JetBrains Mono

### `lib/features/quiz/outcome_screen.dart`
Tier-specific display (same 5 tiers as web: `strong_pass`, `marginal_pass`, `fail_low`, `fail_fundamental`, `fail_severe`):

- Score card with tier label, star rating (1–5 stars), percentage, `correct/total` count
- `strong_pass`: Challenge project card with title + description
- All fail tiers: Adapted resources list (title, modality, source domain, link)
- `marginal_pass`: "Review recommended" warning banner

**Action buttons:**
- Pass: "Continue →" (calls `onContinue` → goes back to explanation view) + "Review answers →" (navigates to `/quiz-attempts/:id`)
- Fail: "Try again" (RETRY) + "Review answers" + "Back to explanation" (ghost)

### Attempt Review Screen (`/quiz-attempts/:id`)
Separate full route. Shows each question with the user's answer highlighted (correct = green, wrong = red with the right answer shown). Uses `GET /quiz-attempts/:id`.

---

## Definition of Done

- [ ] "Take quiz →" switches LearnScreen to quiz view without navigation
- [ ] "← Explanation" returns to explanation view
- [ ] Quiz loads and shows the "ready" prompt before starting
- [ ] MCQ options are tappable; selection persists while navigating between questions
- [ ] Timer counts up from quiz start
- [ ] Cannot submit until all questions are answered
- [ ] Outcome screen shows correct tier label, stars, and score
- [ ] `strong_pass` shows challenge project; fail tiers show adapted resources
- [ ] "Try again" resets and restarts the quiz
- [ ] Roadmap mastery states update after successful quiz (invalidate roadmap provider)
- [ ] Attempt review screen shows per-question correct/wrong breakdown
- [ ] `flutter analyze` zero issues
