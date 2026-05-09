# Phase 11: AI-Powered Quiz and Explanation Generation

**Depends on:** [Phase 10: Admin & Instructor](10-admin.md)  
**Next phase:** [Phase 12: Hardening & Docs](12-hardening.md)

---

## What to Build

Two-tier AI generation for the Tutor Model: AI-generated quizzes, explanations, and micro-quizzes using a local Ollama model as the primary generator, with Google Gemini Flash as a validation fallback. Redis caching layer reduces generation calls. Automatic fallback to static content when both AI providers are unavailable.

This phase completes Phase 6B (AI-powered quiz generation, deferred from Phase 6). It depends on Phases 6 and 8 being fully operational with static content. All AI logic lives in the **ai-service**.

---

## AI Provider Architecture

| Provider | Role | When Used | Cost |
|----------|------|-----------|------|
| **Ollama (Qwen2.5-3B, local)** | Primary generator | All quiz, explanation, and micro-quiz generation | Free (local CPU) |
| **Gemini Flash (cloud)** | Validation fallback | Only when Ollama JSON output fails schema validation; circuit breaker recovery | Free tier (15 RPM) |
| **Static content (DB)** | Hard fallback | When both AI providers fail or circuit breaker is open | N/A |

**Docker networking**: The ai-service container reaches the host Ollama daemon via `host.docker.internal:11434` (configured with `extra_hosts: host.docker.internal:host-gateway` in docker-compose).

---

## Files and Folders

```
services/ai-service/src/
├── modules/
│   └── ai/
│       ├── ollama.client.ts           # Ollama API wrapper (primary)
│       ├── gemini.client.ts           # Google Gemini API wrapper (fallback)
│       ├── ai.service.ts              # Orchestration: cache → Ollama → Gemini → static
│       ├── ai.cache.ts                # Redis caching for AI-generated content
│       ├── ai.circuit-breaker.ts      # Circuit breaker for Ollama failure tracking
│       ├── ai.types.ts                # Shared types and Joi validation schemas
│       ├── prompts/
│       │   ├── quizGeneration.ts      # Prompt template for quiz questions
│       │   ├── microQuizGeneration.ts # Prompt template for micro-quizzes
│       │   └── explanationGeneration.ts # Prompt template for node explanations
│       ├── ai.controller.ts
│       └── ai.routes.ts
```

---

## Prompt Design Principles (Skeleton & Flesh)

See [shared concepts](00-shared-concepts.md#skeleton--flesh-ai-pattern) for the full description.

All prompts are grounded in the verified ontology skeleton:
- Quiz generation prompt includes: node title, description, learning_outcomes, difficulty_level.
- The model cannot invent new concepts outside the node's scope.
- Output is strictly structured JSON (validated with Joi before use).
- Prompts explicitly instruct the model to respond ONLY with JSON, no prose.

---

## Quiz Generation Flow (AI-enhanced)

1. Learning-service calls `POST /api/v1/ai/generate-quiz` with node context.
2. ai-service checks Redis cache (`quiz:ai:{nodeId}`). If fresh (TTL: 7 days), return cached.
3. Check circuit breaker state. If open → skip to Gemini or static fallback.
4. Call Ollama (`qwen2.5:3b`) with quiz generation prompt (timeout: 120s, model runs on CPU).
5. Parse and validate JSON output with Joi schema.
   - **Valid** → cache in Redis, return questions.
   - **Invalid** → call Gemini Flash with same prompt (timeout: 10s) for one retry.
   - **Gemini also fails** → return null (caller falls back to static quiz from DB).
6. Increment/reset Ollama failure counter for circuit breaker.

---

## Explanation Generation Flow

1. Learning-service calls `POST /api/v1/ai/generate-explanation` with node context.
2. Check Redis cache (`explanation:{nodeId}`, TTL: 24h). Return if hit.
3. Call Ollama → validate → cache → return.
4. On failure → try Gemini → on failure → return null (caller shows node description).

---

## Micro-Quiz Generation Flow

1. Decay engine calls `POST /api/v1/ai/generate-micro-quiz` with node context.
2. Check Redis cache (`micro-quiz:ai:{nodeId}`, TTL: 24h). Return if hit.
3. Call Ollama → validate → cache → return 2-3 targeted questions.
4. On failure → caller falls back to existing static question sampling (Phase 8 logic).

---

## Fallback Strategy

```
Request
  → Redis cache hit?         → return cached
  → Circuit breaker open?    → skip Ollama
  → Ollama (120s timeout)
      Success + valid JSON   → return + cache
      Success + invalid JSON → try Gemini (10s timeout)
      Failure/timeout        → increment fail counter
                               → try Gemini (10s timeout)
  → Gemini
      Success + valid JSON   → return (not cached — Gemini not primary)
      Failure                → return null
  → Caller uses static content from DB
```

**Circuit breaker**: After 5 consecutive Ollama failures, disable Ollama for 5 minutes. All requests go straight to Gemini during cooldown. Automatically re-enables after cooldown.

---

## Timeouts

| Provider | Timeout | Reason |
|----------|---------|--------|
| Ollama (CPU) | 120 s | 3B model on CPU takes 30–90 s for 4–5 questions |
| Gemini Flash | 10 s | Cloud API; fast; only used for fallback |

---

## Redis Cache Keys

| Content | Key Pattern | TTL |
|---------|-------------|-----|
| AI-generated quiz | `quiz:ai:{nodeId}` | 7 days |
| Node explanation | `explanation:{nodeId}` | 24 hours |
| Micro-quiz | `micro-quiz:ai:{nodeId}` | 24 hours |
| Circuit breaker state | `cb:ollama` | 5 minutes (auto-expires = auto-reset) |

---

## API Endpoints (internal — called by learning-service)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/ai/generate-quiz | Generate 4-5 MCQ questions for a node |
| POST | /api/v1/ai/generate-explanation | Generate a learning explanation for a node |
| POST | /api/v1/ai/generate-micro-quiz | Generate 2-3 review questions for decay |
| GET | /api/v1/health | Health check: Ollama reachable + Gemini key present |

**Learning-service** exposes a new endpoint calling the ai-service:

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/nodes/:nodeId/explanation | Get AI explanation for a node (learner-facing) |

---

## Environment Variables

```
# ai-service
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=qwen2.5:3b
GEMINI_API_KEY=<your-key>
GEMINI_MODEL=gemini-1.5-flash
REDIS_URL=redis://redis:6379
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| Quiz generation (mocked Ollama) | Valid quiz returned; cached in Redis |
| Ollama output validation rejects bad JSON | Falls back to Gemini |
| Cache hit returns cached quiz without Ollama call | Redis GET called; Ollama not called |
| Ollama timeout triggers Gemini fallback | Gemini called; static returned on Gemini fail too |
| Circuit breaker opens after 5 Ollama failures | Subsequent calls skip Ollama; use Gemini |
| Circuit breaker resets after 5-minute TTL expires | Ollama calls resume |
| Explanation generation works | Returns explanation text |
| Micro-quiz generation for decay | Returns 2-3 targeted questions |
| ai-service health check | Returns Ollama + Gemini status |

---

## Definition of Done

- [ ] AI-generated quizzes used when available (DB `generatedBy = 'ai_tutor'`)
- [ ] Prompts grounded in ontology skeleton (no hallucination beyond node scope)
- [ ] Redis caching reduces Ollama calls for repeated content
- [ ] Fallback to static content is seamless when both AI providers fail
- [ ] Circuit breaker prevents Ollama cascade failures
- [ ] Gemini used only as fallback — minimises free-tier RPM usage
- [ ] ai-service reachable from learning-service via internal Docker network
