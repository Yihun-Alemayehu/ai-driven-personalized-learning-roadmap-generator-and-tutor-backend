# Phase 11: AI-Powered Quiz and Explanation Generation (Gemini Integration)

**Depends on:** [Phase 10: Admin & Instructor](10-admin.md)  
**Next phase:** [Phase 12: Hardening & Docs](12-hardening.md)

---

## What to Build

Integrate Google Gemini API for the Tutor Model: AI-generated quizzes, explanations, and micro-quizzes. Caching layer to reduce API costs. Fallback to static content when API is unavailable.

This phase completes Phase 6B (AI-powered quiz generation, deferred from Phase 6). It depends on Phases 6 and 8 being fully operational with static content. All AI logic lives in the **ai-service**.

---

## Files and Folders

```
services/ai-service/src/
├── modules/
│   └── ai/
│       ├── gemini.client.ts           # Google AI SDK / Gemini API wrapper
│       ├── ai.service.ts              # Quiz generation, explanation generation, prompt templates
│       ├── ai.cache.ts                # Redis caching for AI-generated content
│       ├── ai.fallback.ts             # Fallback logic when API unavailable
│       ├── prompts/
│       │   ├── quizGeneration.ts      # Prompt template for generating quiz questions
│       │   ├── microQuizGeneration.ts # Prompt template for micro-quizzes
│       │   └── explanationGeneration.ts # Prompt template for node explanations
│       ├── ai.service.test.ts         # Unit tests (mocked Gemini)
│       └── ai.test.ts                 # Integration tests
```

---

## Prompt Design Principles (Skeleton & Flesh)

See [shared concepts](00-shared-concepts.md#skeleton--flesh-ai-pattern) for the full description.

All prompts are grounded in the verified ontology skeleton:
- Quiz generation prompt includes: node title, description, learning_outcomes, difficulty_level, prerequisites.
- The LLM cannot invent new concepts outside the node's scope.
- Output is structured JSON (parsed and validated before storage).

---

## Quiz Generation Flow (AI-enhanced)

1. Learner requests quiz for node.
2. Check Redis cache: `quiz:ai:{nodeId}:{hash}` — if cached and fresh (TTL: 7 days), return it.
3. If not cached, check DB for existing static quiz → use it as fallback.
4. Call Gemini API with quiz generation prompt:
   - Input: node title, learning_outcomes, difficulty_level, question count (3-5).
   - Output: structured JSON array of questions with options and correct answers.
5. Validate output schema. If invalid → fall back to static quiz.
6. Store generated quiz in DB (`generated_by = 'ai_tutor'`). Cache in Redis.
7. Return to learner (without correct answers).

---

## Explanation Generation Flow

1. Learner requests explanation for a node.
2. Check Redis cache.
3. Call Gemini with explanation prompt (grounded in node's learning_outcomes and description).
4. Return generated explanation. Cache in Redis (TTL: 24 hours).

---

## Fallback Strategy

- If Gemini API returns error or timeout (>3 seconds): serve static/cached content.
- If rate limited: queue request and serve static content immediately.
- **Circuit breaker pattern**: After 5 consecutive failures, disable AI generation for 5 minutes and serve only static content. Automatically re-enables after cooldown.

---

## Redis Cache Keys

| Content | Key Pattern | TTL |
|---------|-------------|-----|
| AI-generated quiz | `quiz:ai:{nodeId}:{hash}` | 7 days |
| Node explanation | `explanation:{nodeId}` | 24 hours |
| Micro-quiz | `micro-quiz:ai:{nodeId}` | 24 hours |

---

## Tests to Write

| Test | Asserts |
|------|---------|
| AI quiz generation (mocked Gemini) | Valid quiz returned; stored in DB and Redis |
| AI quiz output validation rejects bad schema | Fallback to static quiz |
| Cache hit returns cached quiz without API call | Redis GET called; Gemini API not called |
| API timeout triggers fallback | Static quiz returned; no error to user |
| Circuit breaker opens after 5 failures | Subsequent calls skip Gemini; serve static |
| Circuit breaker resets after cooldown | Gemini API calls resume after 5 minutes |
| Explanation generation works | Returns structured explanation text |
| Micro-quiz generation for decay | Returns 2-3 question micro-quiz targeting node outcomes |
| Cost tracking | Token usage logged per request |
| ai-service health check | Returns 200 with Gemini API connectivity status |

---

## Definition of Done

- [ ] AI-generated quizzes replace static quizzes when available
- [ ] Prompts grounded in ontology skeleton (no hallucination beyond node scope)
- [ ] Redis caching reduces API calls by >80% for repeated content
- [ ] Fallback to static content is seamless when API is down
- [ ] Circuit breaker prevents cascade failures
- [ ] Token usage tracked for cost monitoring
- [ ] ai-service communicates with learning-service via internal HTTP
- [ ] All tests pass
