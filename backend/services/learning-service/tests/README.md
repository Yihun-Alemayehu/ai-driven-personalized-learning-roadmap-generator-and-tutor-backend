# Learning Service Test Map

This file maps thesis test-plan IDs (Chapter 6) to the current Jest test files in this directory.

## Source of Truth

- Thesis chapter: `the-final-project/latex_project/chapters/ch06_evaluation.tex`
- Backend tests directory: `backend/services/learning-service/tests/`

## Current Test Files

- `health.test.ts`
- `schema.test.ts`
- `certificates.test.ts`
- `gamification.test.ts`
- `gatekeeper.test.ts`
- `quizzes.test.ts`
- `enrollments.test.ts`
- `progress-core.test.ts`
- `ontology-core.test.ts`
- `decay-core.test.ts`
- `branching-core.test.ts`

## Thesis ID -> Test File Mapping

| Thesis Test ID(s) | Coverage area | Jest file |
| --- | --- | --- |
| TP-AVAIL-01 | Service health endpoint contract | `health.test.ts` |
| TP-ONT-03, TP-ENR-01 (constraints), TP-SEC-04/05 (sanitization-related DB safety checks) | DB integrity and schema constraints (UNIQUE/FK/CASCADE/CHECK) | `schema.test.ts` |
| TP-CERT-01, TP-CERT-02, TP-CERT-03, TP-CERT-04 | Certificate issuance, idempotency, eligibility blocking, public verify | `certificates.test.ts` |
| TP-GAME-01, TP-GAME-02, TP-GAME-03, TP-GAME-04 | XP events, level progression, streak and badge logic | `gamification.test.ts` |
| TP-GATE-01, TP-GATE-02, TP-GATE-03, TP-GATE-07 | Gatekeeper tier classification and adaptation outcomes | `gatekeeper.test.ts` |
| TP-QUIZ-03, TP-GATE-01/03 (integration point), TP-STREAM-03 (ask context assembly) | Attempt scoring pipeline, pass/fail side effects, AI ask context build | `quizzes.test.ts` |
| TP-ENR-01, TP-BRANCH-02 (enrollment-time branch persistence baseline) | Enrollment creation, personalization fields, initial progress generation, unenroll ownership/deletes | `enrollments.test.ts` |
| TP-GATE-04, TP-ANAL-03 (stats core), TP-ANAL-02 (unlock/stat foundations) | Prerequisite unlock engine and aggregate progress stats | `progress-core.test.ts` |
| TP-ONT-03, TP-ONT-04, TP-ONT-02 (publish checks) | Ontology versioning, status transitions, publish DAG checks, prerequisite cycle prevention | `ontology-core.test.ts` |
| TP-DECAY-01, TP-DECAY-02, TP-DECAY-03, TP-DECAY-05 | Decay transitions, micro-quiz generation/submission, notifications, dependent lock on fail | `decay-core.test.ts` |
| TP-BRANCH-01, TP-BRANCH-02, TP-BRANCH-04 | Branch path discovery, branching-point status, path selection/switch prerequisite validation | `branching-core.test.ts` |

## Notes

- These are unit-focused tests for critical modules, not full API/E2E replacements.
- Some thesis IDs are validated at integration/E2E level elsewhere; this map lists the unit-test coverage currently implemented here.

## Run

```bash
npm test -- --runTestsByPath tests/health.test.ts tests/schema.test.ts tests/certificates.test.ts tests/gamification.test.ts tests/gatekeeper.test.ts tests/quizzes.test.ts tests/enrollments.test.ts tests/progress-core.test.ts tests/ontology-core.test.ts tests/decay-core.test.ts tests/branching-core.test.ts
```
