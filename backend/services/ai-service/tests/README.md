# AI Service Test Map

This file maps thesis test-plan IDs (Chapter 6) to the current Jest test files in this directory.

## Source of Truth

- Thesis chapter: `the-final-project/latex_project/chapters/ch06_evaluation.tex`
- Backend tests directory: `backend/services/ai-service/tests/`

## Current Test Files

- `health.test.ts`
- `ai-core.test.ts`

## Thesis ID -> Test File Mapping

| Thesis Test ID(s) | Coverage area | Jest file |
| --- | --- | --- |
| TP-AVAIL-01 | Service health endpoint contract | `health.test.ts` |
| TP-ONT-01, TP-QUIZ-01, TP-QUIZ-02, TP-CONT-01, TP-CONT-04 | Core AI generation pipeline (cache + provider fallback + response parsing) | `ai-core.test.ts` |
| TP-AVAIL-02, TP-AVAIL-03 | Circuit-breaker and failover behavior primitives | `ai-core.test.ts` |
| TP-PERF-04 (cache hit behavior baseline) | Cache keying and cache read/write/invalidation logic | `ai-core.test.ts` |

## Notes

- `ai-core.test.ts` focuses on critical unit logic: cache, circuit-breaker, and provider fallback order.
- End-to-end latency and SSE streaming targets (for example TP-CONT-02, TP-STREAM-02, TP-PERF-05) are validated at integration/performance layers, not by these unit tests.

## Run

```bash
npm test -- --runTestsByPath tests/ai-core.test.ts
```
