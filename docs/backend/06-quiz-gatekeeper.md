# Phase 6: Quiz Service and Gatekeeper Pattern

**Depends on:** [Phase 5: Learner & Enrollment](05-enrollment.md)  
**Next phase:** [Phase 7: Resource Service](07-resources.md)

---

## What to Build

Quiz creation (static seeded quizzes for now — AI generation comes in Phase 11). Quiz attempt flow (answer, score, record). Five-tier Gatekeeper logic. Node state transitions based on quiz outcomes. Prerequisite validation enforcement. Challenge project recommendations on strong pass.

This phase is split into two sub-phases:
- **6A**: Static quizzes + Gatekeeper logic (no AI dependency)
- **6B**: AI-powered quiz generation via Gemini — deferred to [Phase 11](11-ai-gemini.md)

All quiz and gatekeeper logic lives in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
├── quizzes/
│   ├── quizzes.routes.ts          # GET /nodes/:nodeId/quiz, POST /quizzes/:quizId/attempt
│   ├── quizzes.controller.ts
│   ├── quizzes.service.ts         # Quiz retrieval, attempt evaluation
│   ├── quizzes.validation.ts
│   └── quizzes.test.ts
├── gatekeeper/
│   ├── gatekeeper.service.ts      # Five-tier outcome logic, state transitions, adaptation triggers
│   ├── gatekeeper.service.test.ts # Unit tests for tier logic
│   └── gatekeeper.types.ts        # Outcome type definitions

services/learning-service/prisma/seeds/
├── 003_frontend_quizzes.ts        # Static quizzes for pilot Frontend nodes (3-5 questions each)
└── 004_challenge_projects.ts      # Challenge projects for pilot nodes
```

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/nodes/:nodeId/quiz | Yes | Learner | Get quiz for a node (returns questions without answers) |
| POST | /api/v1/quizzes/:quizId/attempt | Yes | Learner | Submit quiz answers → score → Gatekeeper outcome |
| GET | /api/v1/quiz-attempts | Yes | Learner | List my quiz attempts (with filters) |
| GET | /api/v1/quiz-attempts/:id | Yes | Learner | Get specific attempt details |
| GET | /api/v1/nodes/:nodeId/challenge | Yes | Learner | Get challenge project for a node (if passed) |

---

## Gatekeeper Five-Tier Logic

See [shared concepts](00-shared-concepts.md#gatekeeper-outcome-tiers) for the full tier table.

```
score >= 80%  →  STRONG_PASS
  - mastery_state → 'mastered'
  - mastered_at → NOW()
  - last_reviewed_at → NOW()
  - Unlock dependent nodes (call progress.service.checkAndUnlockNodes)
  - Return challenge project recommendation

score 70-79%  →  MARGINAL_PASS
  - mastery_state → 'mastered'
  - mastered_at → NOW()
  - last_reviewed_at → NOW()
  - Unlock dependent nodes
  - Flag: shorter decay timer (7 days instead of 14)
  - No challenge project

score 50-69%  →  FAIL_LOW
  - mastery_state → 'in_progress'
  - Node stays locked for dependents
  - Trigger: resource_swap adaptation event
  - Response includes adapted resource recommendations

score 30-49%  →  FAIL_FUNDAMENTAL
  - mastery_state → 'in_progress'
  - Node stays locked
  - Trigger: prerequisite_review adaptation event
  - Response includes prerequisite node list to review

score < 30%  →  FAIL_SEVERE
  - mastery_state → 'in_progress'
  - Node stays locked
  - Trigger: instructor_escalation adaptation event
  - Flag for instructor review
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| GET quiz for unlocked node | Returns quiz with questions (no correct answers exposed) |
| GET quiz for locked node | Returns 403 |
| Submit quiz — score ≥ 80% | mastery_state → 'mastered', dependents unlocked, challenge project returned |
| Submit quiz — score 70-79% | mastery_state → 'mastered', dependents unlocked, flagged for shorter decay |
| Submit quiz — score 50-69% | mastery_state stays 'in_progress', adaptation event created (resource_swap) |
| Submit quiz — score 30-49% | mastery_state stays 'in_progress', adaptation event (prerequisite_review), prereqs returned |
| Submit quiz — score < 30% | mastery_state stays 'in_progress', adaptation event (instructor_escalation) |
| Cannot attempt quiz for node user is not enrolled in | Returns 403 |
| Quiz attempt records all answers | quiz_attempts row has full answers JSONB |
| Attempts count increments | After 3 attempts, attempts_count = 3 |
| Best score is tracked | best_quiz_score reflects highest score across attempts |
| GET quiz-attempts lists history | Pagination, filtering by node |
| Gatekeeper unit test: boundary at 80% | 80.00% → strong_pass, 79.99% → marginal_pass |
| Gatekeeper unit test: boundary at 70% | 70.00% → marginal_pass, 69.99% → fail_low |
| Prerequisite validation | Cannot unlock node if any prereq has mastery_state = 'not_started' or 'in_progress' |

---

## Definition of Done

- [ ] Static quizzes seeded for all pilot Frontend nodes
- [ ] Quiz retrieval hides correct answers
- [ ] Quiz submission scores correctly and applies Gatekeeper tier logic
- [ ] Node mastery state transitions are correct for all five tiers
- [ ] Dependent nodes unlock only after strong_pass or marginal_pass
- [ ] Adaptation events are created in the database for each failure tier
- [ ] Challenge projects returned on strong pass
- [ ] All tests pass (unit + integration)
