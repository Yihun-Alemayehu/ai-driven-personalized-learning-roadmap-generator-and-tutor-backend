# Shared Concepts

Concepts, conventions, and patterns that are referenced across multiple phases. Read this before diving into any individual phase doc.

---

## Tech Stack Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| Language | TypeScript (Node.js) | Type safety across all services |
| Framework | Express | Lightweight, well-known, minimal overhead |
| ORM | Prisma | Type-safe, declarative schema, auto-generated client, built-in migrations |
| Validation | Joi | Request body/param validation on all inputs |
| Auth | JWT + Passport.js | Access/refresh token pattern; OAuth via Passport strategies |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) | Set up in Phase 1; annotations added incrementally per route file |
| Logging | Pino | Structured JSON logging; pino-pretty in dev |
| Testing | Jest + Supertest | Integration tests against real Dockerized Postgres/Redis — no DB mocks |
| AI | Google AI SDK (Gemini) | Quiz/explanation generation with ontology-grounded prompts |
| Resource Discovery | Google PSE API | Domain-whitelisted resource search, Redis-cached 24h |
| Cache/Queue | Redis | Rate limiting, AI response cache, PSE cache, session |
| Database | PostgreSQL | Single DB shared by api-gateway and learning-service |
| Container | Docker Compose | All 5 containers: api-gateway, learning-service, ai-service, postgres, redis |

---

## Database Enums

All enums are defined in `services/learning-service/prisma/schema.prisma`.

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('learner', 'instructor', 'admin', 'domain_expert');

-- Node mastery/decay states
CREATE TYPE mastery_state AS ENUM ('not_started', 'in_progress', 'mastered', 'review_needed', 'relearn');

-- Gatekeeper quiz outcome tiers
CREATE TYPE quiz_outcome AS ENUM ('strong_pass', 'marginal_pass', 'fail_low', 'fail_fundamental', 'fail_severe');

-- Question types
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'code_completion', 'true_false', 'matching');

-- Resource modality
CREATE TYPE resource_modality AS ENUM ('documentation', 'tutorial', 'video', 'interactive', 'reference');

-- Ontology status
CREATE TYPE ontology_status AS ENUM ('draft', 'in_review', 'verified', 'published', 'archived');

-- Adaptation event type
CREATE TYPE adaptation_type AS ENUM ('resource_swap', 'prerequisite_review', 'instructor_escalation', 'decay_micro_quiz');

-- Learning path selection
CREATE TYPE branch_path AS ENUM ('frontend', 'backend', 'data_science');
```

---

## API Conventions

- **Versioning**: All routes under `/api/v1/` from day one.
- **Error format**: `{ error: { message: string, details?: unknown } }` — consistent across all services.
- **Auth header**: `Authorization: Bearer <access_token>` on all protected routes.
- **Pagination**: All list endpoints support `page` + `limit` (or cursor) query params.
- **HTTP status codes**:
  - 200 OK — successful read/update
  - 201 Created — successful create
  - 400 Bad Request — validation error or invalid input
  - 401 Unauthorized — missing or invalid token
  - 403 Forbidden — authenticated but insufficient role
  - 404 Not Found — resource does not exist
  - 409 Conflict — duplicate resource
  - 429 Too Many Requests — rate limited
  - 503 Service Unavailable — health check failure

---

## RBAC Roles

| Role | Capabilities |
|------|-------------|
| `learner` | Enroll, view roadmap, take quizzes, rate resources, manage own profile |
| `instructor` | All learner capabilities + view learner progress, resolve flagged nodes, domain analytics |
| `domain_expert` | All instructor capabilities + create/edit ontology versions and nodes |
| `admin` | Full access — user management, role assignment, system stats, all CRUD |

RBAC is enforced via `authorize(...roles)` middleware in api-gateway. Every protected route explicitly declares its required roles.

---

## JWT / Auth Pattern

- **Access token**: JWT (HS256), 15-minute expiry, payload `{ sub: userId, role }`.
- **Refresh token**: Random 256-bit token, bcrypt-hashed in `refresh_tokens` table, 7-day expiry. Rotated on every use (old token invalidated, new token issued).
- **OAuth**: Passport.js strategies for Google and GitHub. On callback, find-or-create user by `(oauth_provider, oauth_provider_id)`, then issue JWT tokens.
- **Revocation**: Logout deletes the refresh token from the DB. Expired/revoked refresh tokens return 401.

---

## Service Communication

Services communicate over internal HTTP (not a message broker). The api-gateway forwards authenticated requests to downstream services, attaching the decoded user identity in request headers (`x-user-id`, `x-user-role`). Downstream services trust these headers on internal network calls.

```
Client → Nginx → api-gateway (auth, rate limit) → learning-service or ai-service
                                                  ↑
                                 learning-service ─┘ (for AI requests, calls ai-service internally)
```

---

## Swagger / API Docs

- Set up in Phase 1 for each service: `src/docs/swagger.ts` with `swagger-jsdoc` + `swagger-ui-express`.
- Served at `/api/docs` per service.
- **Annotations are added incrementally** — every route file includes JSDoc Swagger comments as it is written, not bolted on at the end.
- Phase 12 audits completeness and generates the final `openapi.yaml` spec per service.

---

## Prisma Workflow

- Schema defined in `services/learning-service/prisma/schema.prisma`.
- `npx prisma migrate dev` — apply schema changes and generate migrations.
- `npx prisma migrate reset` — drop and re-apply all migrations (use in test setup).
- `npx prisma generate` — re-generate the Prisma Client after schema changes.
- The api-gateway imports the generated Prisma Client from the learning-service for user-related queries (via shared package or direct path reference).

---

## Gatekeeper Outcome Tiers

Used in Phase 6 (quiz scoring), Phase 8 (micro-quiz), and referenced throughout.

| Score Range | Outcome | mastery_state | Unlock Dependents | Notes |
|-------------|---------|---------------|-------------------|-------|
| ≥ 80% | `strong_pass` | `mastered` | Yes | 14-day decay timer; challenge project returned |
| 70–79% | `marginal_pass` | `mastered` | Yes | 7-day decay timer (shorter); no challenge project |
| 50–69% | `fail_low` | `in_progress` | No | Triggers `resource_swap` adaptation event |
| 30–49% | `fail_fundamental` | `in_progress` | No | Triggers `prerequisite_review` adaptation event |
| < 30% | `fail_severe` | `in_progress` | No | Triggers `instructor_escalation` adaptation event |

---

## Mastery Decay Thresholds

| Pass Type | Green → Yellow (review_needed) | Yellow → Red (relearn) |
|-----------|-------------------------------|------------------------|
| `strong_pass` | 14 days since `last_reviewed_at` | 30 days since `last_reviewed_at` |
| `marginal_pass` | 7 days since `last_reviewed_at` | 30 days since `last_reviewed_at` |

Decay is evaluated by a cron job running every 6 hours.

---

## Skeleton & Flesh AI Pattern

All Gemini prompts are grounded in the verified ontology (the "skeleton"):
- Quiz generation includes: node title, description, `learning_outcomes`, `difficulty_level`, prerequisite nodes.
- The LLM cannot invent concepts outside the node's defined scope.
- Output is structured JSON — validated before storage. Invalid output falls back to static content.
- This prevents hallucination at the domain knowledge level while still leveraging LLM fluency.
