# Backend Implementation Plan

This document is the authoritative, sequential implementation plan for the AI-Driven Personalized Learning Roadmap Generator backend. Each phase must be completed and verified before the next begins. Frontend (React, Flutter) is out of scope.

---

## Architecture: Simple Microservices

The backend is split into **3 minimal services**, each independently deployable but sharing a single PostgreSQL database and Redis instance. Services communicate over internal HTTP calls.

| Service | Responsibility | Key Tech |
|---------|---------------|----------|
| **api-gateway** | Auth, JWT, OAuth, RBAC, user management, rate limiting, request routing to downstream services | Express, Passport.js, Joi |
| **learning-service** | Ontology CRUD, enrollment, progress tracking, quiz/gatekeeper, resources, whitelist, mastery decay, branching, admin/instructor APIs | Express, Prisma |
| **ai-service** | Gemini quiz/explanation generation, Google PSE resource discovery, response caching, circuit breaker fallbacks | Express, Google AI SDK |

**Shared infrastructure** (managed in `docker-compose.yml`):
- PostgreSQL (single database, shared by api-gateway and learning-service)
- Redis (caching, rate limiting, AI response cache)
- Nginx or Traefik reverse proxy (routes `/api/v1/auth/*` and `/api/v1/users/*` to api-gateway, `/api/v1/ai/*` to ai-service, everything else to learning-service)

**Why 3 services?** This is the minimum viable split — the AI service has fundamentally different scaling characteristics (slow external API calls, needs circuit breakers), auth is a cross-cutting concern best isolated, and the learning service contains the core business domain. Any fewer and it's a monolith; any more adds operational overhead without clear benefit at this project's scale.

---

## Phase 1: Project Scaffold and Infrastructure

### What to Build

Stand up the 3-service Node.js + Express + TypeScript backend with Docker-based local development, PostgreSQL, Redis, reverse proxy, Swagger docs, and a CI pipeline.

### Files and Folders

```
backend/
├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── app.ts                 # Express app factory (middleware, routes)
│   │   │   ├── server.ts              # Entry point (listen on port)
│   │   │   ├── config/
│   │   │   │   └── index.ts           # Env-based config loader (DB, Redis, JWT, API keys)
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts    # Global error handler
│   │   │   │   ├── requestLogger.ts   # HTTP request logging (pino)
│   │   │   │   └── rateLimiter.ts     # express-rate-limit setup
│   │   │   ├── routes/
│   │   │   │   └── health.ts          # GET /api/v1/health
│   │   │   ├── docs/
│   │   │   │   └── swagger.ts         # swagger-jsdoc + swagger-ui-express setup
│   │   │   └── utils/
│   │   │       ├── logger.ts          # Pino logger instance
│   │   │       └── ApiError.ts        # Custom error class with status codes
│   │   ├── tests/
│   │   │   ├── setup.ts               # Test DB/Redis setup and teardown
│   │   │   └── health.test.ts         # Health endpoint integration test
│   │   ├── Dockerfile                 # Multi-stage build
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.ts
│   │
│   ├── learning-service/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── config/
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   └── health.ts
│   │   │   ├── docs/
│   │   │   │   └── swagger.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── ApiError.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Prisma schema (all models)
│   │   │   └── seed.ts                # Database seeding script
│   │   ├── tests/
│   │   │   └── setup.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.ts
│   │
│   └── ai-service/
│       ├── src/
│       │   ├── app.ts
│       │   ├── server.ts
│       │   ├── config/
│       │   │   └── index.ts
│       │   ├── middleware/
│       │   │   └── errorHandler.ts
│       │   ├── routes/
│       │   │   └── health.ts
│       │   ├── docs/
│       │   │   └── swagger.ts
│       │   └── utils/
│       │       ├── logger.ts
│       │       └── ApiError.ts
│       ├── tests/
│       │   └── setup.ts
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.ts
│
├── docker-compose.yml                 # All services: api-gateway, learning-service, ai-service, postgres, redis
├── .env.example                       # Template for environment variables
├── .eslintrc.json                     # Shared ESLint config (TypeScript)
├── .prettierrc                        # Shared Prettier config
├── .github/
│   └── workflows/
│       └── ci.yml                     # Lint → Build → Test pipeline (all services)
└── README.md
```

### Key Decisions

- **ORM**: Prisma — type-safe ORM with auto-generated client, declarative schema, built-in migrations. Prisma schema lives in learning-service; api-gateway imports the generated client.
- **Validation**: Joi for all request body/param validation across services.
- **API Versioning**: All routes under `/api/v1/` from day one.
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express) set up in Phase 1 for each service. Each route file includes JSDoc Swagger annotations as it's built — docs are incremental, not bolted on at the end. Swagger UI served at `/api/docs` per service.
- **Testing**: Jest + Supertest for integration tests against a real Dockerized Postgres (no mocks for DB).
- **Logging**: Pino (structured JSON logging).

### Tests to Write

| Test | Asserts |
|------|---------|
| `GET /api/v1/health` returns 200 | Response includes `{ status: "ok", db: "connected", redis: "connected" }` |
| Health endpoint returns 503 when DB is down | Simulated DB disconnect returns 503 |
| Rate limiter blocks excessive requests | 101st request within window returns 429 |

### Definition of Done

- [ ] `docker-compose up` starts all 5 containers (api-gateway, learning-service, ai-service, postgres, redis) — all healthy
- [ ] `GET /api/v1/health` on each service returns 200 with DB and Redis status
- [ ] Swagger UI accessible at `/api/docs` on each service
- [ ] `npm run lint` passes with zero warnings across all services
- [ ] `npm run build` compiles TypeScript without errors across all services
- [ ] `npm test` passes all health endpoint tests against real Postgres/Redis
- [ ] GitHub Actions CI runs lint → build → test on push (using service containers for Postgres/Redis)

---

## Phase 2: Database Schema

### What to Build

Full PostgreSQL schema derived from the project's data model. All tables, constraints, indexes, and enums — defined in the Prisma schema and applied via Prisma migrations.

### Schema Design

#### Enums

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

#### Tables

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NULLABLE (null for OAuth-only users) |
| full_name | VARCHAR(255) | NOT NULL |
| role | user_role | NOT NULL, DEFAULT 'learner' |
| avatar_url | TEXT | NULLABLE |
| oauth_provider | VARCHAR(50) | NULLABLE ('google', 'github') |
| oauth_provider_id | VARCHAR(255) | NULLABLE |
| preferred_language | VARCHAR(10) | DEFAULT 'en' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

**domains**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL (e.g., 'Frontend Development') |
| slug | VARCHAR(100) | UNIQUE, NOT NULL (e.g., 'frontend') |
| description | TEXT | |
| icon_url | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**ontology_versions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| domain_id | UUID | FK → domains.id, NOT NULL |
| version_number | INTEGER | NOT NULL |
| status | ontology_status | DEFAULT 'draft' |
| created_by | UUID | FK → users.id |
| verified_by | UUID | FK → users.id, NULLABLE |
| verified_at | TIMESTAMPTZ | NULLABLE |
| published_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (domain_id, version_number) |

**learning_nodes**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| ontology_version_id | UUID | FK → ontology_versions.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| learning_outcomes | JSONB | NOT NULL (array of outcome strings) |
| estimated_hours | DECIMAL(4,1) | |
| difficulty_level | INTEGER | 1-5 |
| is_branching_point | BOOLEAN | DEFAULT false |
| is_convergence_point | BOOLEAN | DEFAULT false |
| branch_path | branch_path | NULLABLE (which path this node belongs to) |
| position_x | FLOAT | For DAG layout |
| position_y | FLOAT | For DAG layout |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (ontology_version_id, slug) |

**node_prerequisites** (edges of the DAG)
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| prerequisite_node_id | UUID | FK → learning_nodes.id, NOT NULL |
| UNIQUE | | (node_id, prerequisite_node_id) |
| CHECK | | node_id != prerequisite_node_id |

**enrollments**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| domain_id | UUID | FK → domains.id, NOT NULL |
| ontology_version_id | UUID | FK → ontology_versions.id, NOT NULL |
| selected_branch_path | branch_path | NULLABLE |
| enrolled_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (user_id, domain_id) |

**learner_node_progress**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| enrollment_id | UUID | FK → enrollments.id, NOT NULL |
| mastery_state | mastery_state | DEFAULT 'not_started' |
| best_quiz_score | DECIMAL(5,2) | NULLABLE (percentage) |
| attempts_count | INTEGER | DEFAULT 0 |
| mastered_at | TIMESTAMPTZ | NULLABLE |
| last_reviewed_at | TIMESTAMPTZ | NULLABLE |
| decay_notified_at | TIMESTAMPTZ | NULLABLE |
| unlocked | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (user_id, node_id) |

**quizzes**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| is_micro_quiz | BOOLEAN | DEFAULT false |
| generated_by | VARCHAR(50) | 'static', 'ai_tutor' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**quiz_questions**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| quiz_id | UUID | FK → quizzes.id, NOT NULL, ON DELETE CASCADE |
| question_type | question_type | NOT NULL |
| question_text | TEXT | NOT NULL |
| options | JSONB | NULLABLE (for MCQ: array of option objects) |
| correct_answer | TEXT | NOT NULL |
| explanation | TEXT | NULLABLE |
| order_index | INTEGER | NOT NULL |

**quiz_attempts**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| quiz_id | UUID | FK → quizzes.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| score_percent | DECIMAL(5,2) | NOT NULL |
| outcome | quiz_outcome | NOT NULL |
| answers | JSONB | NOT NULL (array of {question_id, user_answer, is_correct}) |
| started_at | TIMESTAMPTZ | NOT NULL |
| completed_at | TIMESTAMPTZ | NOT NULL |

**resources**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| url | TEXT | NOT NULL |
| source_domain | VARCHAR(255) | NOT NULL (e.g., 'freecodecamp.org') |
| modality | resource_modality | NOT NULL |
| description | TEXT | NULLABLE |
| is_primary | BOOLEAN | DEFAULT false |
| last_validated_at | TIMESTAMPTZ | NULLABLE |
| is_valid | BOOLEAN | DEFAULT true |
| avg_rating | DECIMAL(3,2) | DEFAULT 0.00 |
| rating_count | INTEGER | DEFAULT 0 |
| fetched_via | VARCHAR(50) | 'manual', 'pse_api' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**resource_ratings**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| resource_id | UUID | FK → resources.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| rating | INTEGER | NOT NULL, CHECK (1-5) |
| comment | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (resource_id, user_id) |

**domain_whitelist**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| domain_id | UUID | FK → domains.id, NOT NULL |
| source_domain | VARCHAR(255) | NOT NULL (e.g., 'developer.mozilla.org') |
| source_name | VARCHAR(255) | NOT NULL (e.g., 'MDN Web Docs') |
| default_modality | resource_modality | NOT NULL |
| added_by | UUID | FK → users.id |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE | | (domain_id, source_domain) |

**adaptation_events**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| quiz_attempt_id | UUID | FK → quiz_attempts.id, NULLABLE |
| adaptation_type | adaptation_type | NOT NULL |
| details | JSONB | (e.g., {from_resource_id, to_resource_id, reason}) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**challenge_projects**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| node_id | UUID | FK → learning_nodes.id, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | NOT NULL |
| difficulty_level | INTEGER | 1-5 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**notifications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| type | VARCHAR(50) | NOT NULL ('decay_reminder', 'quiz_available', 'path_unlocked') |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | |
| data | JSONB | NULLABLE (e.g., {node_id}) |
| read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**refresh_tokens**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL, ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Prisma Schema

All models are defined in `services/learning-service/prisma/schema.prisma`. The Prisma schema declaratively defines models, enums, relations, and indexes. Prisma generates migrations automatically from schema changes via `npx prisma migrate dev`.

The api-gateway service imports the generated Prisma Client from the learning-service (via a shared package or direct path reference) for user-related queries.

### Key Indexes (migration 011)

```sql
-- Fast lookups for learner progress
CREATE INDEX idx_learner_progress_user_enrollment ON learner_node_progress(user_id, enrollment_id);
CREATE INDEX idx_learner_progress_mastery_state ON learner_node_progress(mastery_state) WHERE mastery_state IN ('mastered', 'review_needed', 'relearn');
CREATE INDEX idx_learner_progress_last_reviewed ON learner_node_progress(last_reviewed_at) WHERE mastery_state = 'mastered';

-- DAG traversal
CREATE INDEX idx_node_prerequisites_node ON node_prerequisites(node_id);
CREATE INDEX idx_node_prerequisites_prereq ON node_prerequisites(prerequisite_node_id);

-- Quiz lookups
CREATE INDEX idx_quiz_attempts_user_node ON quiz_attempts(user_id, node_id);
CREATE INDEX idx_quizzes_node ON quizzes(node_id);

-- Resource lookups
CREATE INDEX idx_resources_node_modality ON resources(node_id, modality);
CREATE INDEX idx_domain_whitelist_domain ON domain_whitelist(domain_id);

-- Notification lookups
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read = false;
```

### Tests to Write

| Test | Asserts |
|------|---------|
| Prisma migrations apply | `npx prisma migrate dev` completes without error |
| Prisma schema reset works | `npx prisma migrate reset` completes without error |
| Foreign key constraints hold | Inserting a learner_node_progress with invalid user_id throws FK violation |
| Unique constraints hold | Duplicate (user_id, node_id) in learner_node_progress throws unique violation |
| Check constraints hold | node_prerequisites with node_id = prerequisite_node_id is rejected |
| JSONB columns accept valid data | learning_outcomes stores and retrieves an array of strings |

### Definition of Done

- [ ] Prisma schema defines all models, enums, relations, and indexes
- [ ] `npx prisma migrate dev` applies the schema successfully
- [ ] `npx prisma migrate reset` resets and re-applies cleanly
- [ ] Schema matches every entity described above — verified by inspecting `\dt` and `\d+ <table>` in psql
- [ ] All constraint tests pass
- [ ] Schema diagram (auto-generated or manual) reviewed against project UML class diagram

---

## Phase 3: Authentication and User Management

### What to Build

JWT-based authentication with access/refresh token pattern. OAuth2 social login (Google, GitHub). User registration, login, profile management. Role-based access control (RBAC) middleware.

### Files and Folders

```
src/
├── middleware/
│   ├── authenticate.ts            # Verify JWT, attach user to req
│   └── authorize.ts               # RBAC middleware factory: authorize('admin', 'instructor')
├── modules/
│   └── auth/
│       ├── auth.routes.ts         # POST /register, /login, /refresh, /logout, /oauth/google, /oauth/github
│       ├── auth.controller.ts     # Request handlers
│       ├── auth.service.ts        # Business logic (hash password, generate tokens, verify OAuth)
│       ├── auth.validation.ts     # Joi schemas for request validation
│       └── auth.test.ts           # Integration tests
│   └── users/
│       ├── users.routes.ts        # GET /me, PATCH /me, GET /:id (admin), GET / (admin list)
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.validation.ts
│       └── users.test.ts
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /api/v1/auth/register | No | — | Email + password registration |
| POST | /api/v1/auth/login | No | — | Email + password login → access + refresh tokens |
| POST | /api/v1/auth/refresh | No | — | Refresh token → new access token |
| POST | /api/v1/auth/logout | Yes | Any | Revoke refresh token |
| GET | /api/v1/auth/oauth/google | No | — | Redirect to Google OAuth consent |
| GET | /api/v1/auth/oauth/google/callback | No | — | Handle Google OAuth callback |
| GET | /api/v1/auth/oauth/github | No | — | Redirect to GitHub OAuth consent |
| GET | /api/v1/auth/oauth/github/callback | No | — | Handle GitHub OAuth callback |
| GET | /api/v1/users/me | Yes | Any | Get current user profile |
| PATCH | /api/v1/users/me | Yes | Any | Update name, avatar, preferred_language |
| GET | /api/v1/users/:id | Yes | Admin | Get any user profile |
| GET | /api/v1/users | Yes | Admin | List users with pagination and role filter |

### Implementation Details

- **Password hashing**: bcrypt (cost factor 12).
- **Access token**: JWT signed with RS256 or HS256, 15-minute expiry, contains `{ sub: userId, role }`.
- **Refresh token**: Random 256-bit token, bcrypt-hashed in DB, 7-day expiry, rotate on use.
- **OAuth flow**: Passport.js strategies for Google and GitHub. On callback, find-or-create user by `(oauth_provider, oauth_provider_id)`, issue tokens.
- **RBAC middleware**: `authorize(...roles)` checks `req.user.role` against allowed roles. Returns 403 if not authorized.
- **Input validation**: Joi schemas on all request bodies. Middleware returns 400 with structured error on validation failure.
- **Swagger annotations**: Every route file includes JSDoc Swagger annotations from the start. Docs build incrementally, not bolted on at the end.

### Tests to Write

| Test | Asserts |
|------|---------|
| Register with valid email/password | Returns 201 + access token + refresh token |
| Register with duplicate email | Returns 409 Conflict |
| Register with weak password | Returns 400 validation error |
| Login with correct credentials | Returns 200 + tokens |
| Login with wrong password | Returns 401 |
| Login with nonexistent email | Returns 401 (same error — no user enumeration) |
| Access protected route with valid token | Returns 200 |
| Access protected route with expired token | Returns 401 |
| Access protected route with no token | Returns 401 |
| Refresh token flow | New access token issued; old refresh token invalidated |
| Refresh with expired/revoked token | Returns 401 |
| Logout revokes refresh token | Subsequent refresh attempt returns 401 |
| RBAC: learner cannot access admin route | Returns 403 |
| RBAC: admin can access admin route | Returns 200 |
| PATCH /users/me updates profile | Returns 200 with updated fields |
| GET /users (admin) returns paginated list | Pagination params work; role filter works |

### Definition of Done

- [ ] All auth endpoints functional and tested
- [ ] OAuth flow works for Google and GitHub (tested manually or with mocked OAuth provider)
- [ ] JWT access/refresh token lifecycle works end-to-end
- [ ] RBAC middleware blocks unauthorized access
- [ ] No password stored in plaintext anywhere
- [ ] All auth tests pass
- [ ] Rate limiting applied to login/register endpoints (prevent brute force)

---

## Phase 4: Ontology Service (Knowledge Graph / DAG)

### What to Build

CRUD APIs for domains, ontology versions, learning nodes, and prerequisite edges. DAG validation (acyclicity check, orphan detection). Ontology versioning and expert verification workflow. Seed data for the pilot "Frontend Development" domain.

### Files and Folders

```
src/modules/
├── domains/
│   ├── domains.routes.ts          # CRUD for learning domains
│   ├── domains.controller.ts
│   ├── domains.service.ts
│   ├── domains.validation.ts
│   └── domains.test.ts
├── ontology/
│   ├── ontology.routes.ts         # CRUD for ontology versions, nodes, edges
│   ├── ontology.controller.ts
│   ├── ontology.service.ts        # Includes DAG validation logic
│   ├── ontology.validation.ts
│   ├── dag.utils.ts               # Topological sort, cycle detection, path queries
│   ├── dag.utils.test.ts          # Unit tests for DAG algorithms
│   └── ontology.test.ts           # Integration tests
seeds/
├── 001_domains.ts                 # Frontend, Backend, Data Science domains
├── 002_frontend_ontology.ts       # ~40 nodes for Frontend Development pilot
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/domains | Yes | Any | List all domains |
| GET | /api/v1/domains/:slug | Yes | Any | Get domain details |
| POST | /api/v1/domains | Yes | Admin | Create domain |
| PATCH | /api/v1/domains/:id | Yes | Admin | Update domain |
| POST | /api/v1/domains/:domainId/ontologies | Yes | Admin/Expert | Create new ontology version (draft) |
| GET | /api/v1/domains/:domainId/ontologies | Yes | Any | List ontology versions for domain |
| GET | /api/v1/ontologies/:id | Yes | Any | Get ontology version with all nodes and edges |
| PATCH | /api/v1/ontologies/:id/status | Yes | Admin/Expert | Transition status (draft → in_review → verified → published) |
| POST | /api/v1/ontologies/:ontologyId/nodes | Yes | Admin/Expert | Add learning node |
| PATCH | /api/v1/nodes/:id | Yes | Admin/Expert | Update node |
| DELETE | /api/v1/nodes/:id | Yes | Admin/Expert | Delete node (only in draft ontology) |
| POST | /api/v1/nodes/:nodeId/prerequisites | Yes | Admin/Expert | Add prerequisite edge |
| DELETE | /api/v1/prerequisites/:id | Yes | Admin/Expert | Remove prerequisite edge |
| GET | /api/v1/ontologies/:id/validate | Yes | Admin/Expert | Run DAG validation, return issues |
| GET | /api/v1/ontologies/:id/graph | Yes | Any | Get full DAG (nodes + edges) for visualization |

### DAG Utilities (`dag.utils.ts`)

- `detectCycle(nodes, edges)` → returns `{hasCycle: boolean, cycleNodes?: string[]}`
- `topologicalSort(nodes, edges)` → returns ordered node list or throws if cyclic
- `findRootNodes(nodes, edges)` → nodes with no prerequisites (entry points)
- `findLeafNodes(nodes, edges)` → nodes with no dependents (terminal nodes)
- `findOrphanNodes(nodes, edges)` → nodes unreachable from any root
- `getPrerequisiteChain(nodeId, edges)` → all transitive prerequisites
- `getDependentChain(nodeId, edges)` → all transitive dependents
- `validateDAG(nodes, edges)` → returns a report: `{valid: boolean, issues: string[]}`

### Seed Data: Frontend Development Pilot (~40 nodes)

The seed creates a published ontology with nodes such as:
- HTML Fundamentals → CSS Fundamentals → CSS Layout (Flexbox, Grid) → Responsive Design
- JavaScript Fundamentals → JS ES6+ Features → DOM Manipulation → Async JavaScript
- React Fundamentals → React Hooks → State Management → Advanced React Patterns
- Frontend Testing → Build Tools → Performance Optimization → Full-Stack Integration (convergence point)

Each node includes: title, slug, description, learning_outcomes (3-5 items), estimated_hours, difficulty_level. Prerequisite edges encode the DAG structure.

### Tests to Write

| Test | Asserts |
|------|---------|
| Create domain | Returns 201 with domain data |
| Create ontology version | Returns 201, status = 'draft', version increments |
| Add nodes to draft ontology | Returns 201 per node |
| Cannot add nodes to published ontology | Returns 400/403 |
| Add prerequisite edge | Returns 201 |
| Adding cyclic edge is rejected | Returns 400 with cycle description |
| Self-referencing edge rejected | Returns 400 |
| DAG validation — valid graph | Returns {valid: true} |
| DAG validation — graph with cycle | Returns {valid: false, issues: [...]} |
| DAG validation — orphan node detected | Returns warning in issues |
| Status transitions (draft → in_review → verified → published) | Each transition succeeds; invalid transitions return 400 |
| Cannot transition to 'published' if validation fails | Returns 400 |
| GET /ontologies/:id/graph returns full DAG | All nodes and edges present; structure matches seed data |
| `topologicalSort` produces valid ordering | Every node appears after all its prerequisites |
| `findRootNodes` for Frontend pilot | Returns HTML Fundamentals and JavaScript Fundamentals |
| Seed data loads successfully | All ~40 nodes and edges inserted; validation passes |

### Definition of Done

- [ ] All CRUD endpoints for domains, ontologies, nodes, and edges work
- [ ] DAG validation correctly detects cycles, orphans, and structural issues
- [ ] Ontology versioning workflow (draft → published) enforced
- [ ] Seed data for Frontend Development pilot loads and validates
- [ ] Topological sort returns correct ordering for the pilot DAG
- [ ] All tests pass
- [ ] GET /ontologies/:id/graph returns a complete, valid DAG structure

---

## Phase 5: Learner Service and Enrollment

### What to Build

Enrollment in domains. Automatic initialization of learner node progress for all nodes in the enrolled ontology. Progress tracking (node states, unlock logic). Learner statistics endpoint (dashboard data).

### Files and Folders

```
src/modules/
├── enrollments/
│   ├── enrollments.routes.ts      # POST /enroll, GET /my-enrollments, DELETE (unenroll)
│   ├── enrollments.controller.ts
│   ├── enrollments.service.ts     # Enrollment + progress initialization
│   ├── enrollments.validation.ts
│   └── enrollments.test.ts
├── progress/
│   ├── progress.routes.ts         # GET /progress/:enrollmentId, GET /progress/:enrollmentId/stats
│   ├── progress.controller.ts
│   ├── progress.service.ts        # Unlock logic, state queries, stats computation
│   ├── progress.validation.ts
│   └── progress.test.ts
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /api/v1/enrollments | Yes | Learner | Enroll in a domain (creates progress rows) |
| GET | /api/v1/enrollments | Yes | Learner | List my enrollments |
| GET | /api/v1/enrollments/:id | Yes | Learner | Get enrollment details |
| DELETE | /api/v1/enrollments/:id | Yes | Learner | Unenroll (soft delete or hard) |
| GET | /api/v1/enrollments/:id/progress | Yes | Learner | Get all node progress for enrollment |
| GET | /api/v1/enrollments/:id/progress/stats | Yes | Learner | Get stats: nodes completed, avg score, time, etc. |
| GET | /api/v1/enrollments/:id/roadmap | Yes | Learner | Get DAG + progress overlay (node states, colors) |

### Business Logic

**Enrollment flow:**
1. Verify domain has a published ontology.
2. Create enrollment row.
3. For every node in the published ontology, create a `learner_node_progress` row with `mastery_state = 'not_started'`, `unlocked = false`.
4. Identify root nodes (no prerequisites) and set `unlocked = true` for those.

**Unlock logic (called after quiz outcomes — but the check is built here):**
- A node is unlockable when ALL its prerequisite nodes have `mastery_state IN ('mastered', 'review_needed')`.
- `progress.service.checkAndUnlockNodes(userId, enrollmentId)` — scans progress, unlocks newly eligible nodes.

**Stats computation:**
- Total nodes, completed nodes, completion percentage
- Average quiz score (across all attempted nodes)
- Current streak (consecutive days with activity)
- Nodes in each mastery state (for color-coded roadmap)

### Tests to Write

| Test | Asserts |
|------|---------|
| Enroll in domain | Creates enrollment + N progress rows (one per node) |
| Root nodes are unlocked on enrollment | Root nodes have unlocked = true |
| Non-root nodes are locked on enrollment | All non-root nodes have unlocked = false |
| Cannot enroll in same domain twice | Returns 409 |
| Cannot enroll in domain with no published ontology | Returns 400 |
| GET /progress returns all node states | Returns array with correct mastery_state and unlocked values |
| GET /progress/stats returns correct counts | Nodes completed, avg score, etc. match manual calculation |
| GET /roadmap returns DAG + progress overlay | Each node includes mastery_state, unlocked, score data |
| Unlock logic: node unlocks when all prereqs mastered | After marking prereqs as mastered, node becomes unlocked |
| Unlock logic: node stays locked if any prereq not mastered | Returns unlocked = false |
| Unenroll deletes enrollment and progress | Enrollment and progress rows removed |

### Definition of Done

- [ ] Enrollment creates progress rows for all ontology nodes
- [ ] Root nodes auto-unlocked; non-root nodes locked
- [ ] Progress and stats endpoints return correct data
- [ ] Roadmap endpoint returns DAG with learner-specific progress overlay
- [ ] Unlock logic correctly evaluates prerequisite mastery
- [ ] All tests pass

---

## Phase 6: Quiz Service and Gatekeeper Pattern

### What to Build

Quiz creation (static seeded quizzes for now — AI generation comes in Phase 6B). Quiz attempt flow (answer, score, record). Three-tier Gatekeeper logic. Node state transitions based on quiz outcomes. Prerequisite validation enforcement. Challenge project recommendations on strong pass.

This phase is split into two sub-phases:
- **6A**: Static quizzes + Gatekeeper logic (no AI dependency)
- **6B**: AI-powered quiz generation via Gemini (deferred until after Phase 10 — see note below)

### Files and Folders

```
src/modules/
├── quizzes/
│   ├── quizzes.routes.ts          # GET /nodes/:nodeId/quiz, POST /quizzes/:quizId/attempt
│   ├── quizzes.controller.ts
│   ├── quizzes.service.ts         # Quiz retrieval, attempt evaluation
│   ├── quizzes.validation.ts
│   └── quizzes.test.ts
├── gatekeeper/
│   ├── gatekeeper.service.ts      # Three-tier outcome logic, state transitions, adaptation triggers
│   ├── gatekeeper.service.test.ts # Unit tests for tier logic
│   └── gatekeeper.types.ts        # Outcome type definitions
seeds/
├── 003_frontend_quizzes.ts        # Static quizzes for pilot Frontend nodes (3-5 questions each)
├── 004_challenge_projects.ts      # Challenge projects for pilot nodes
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/nodes/:nodeId/quiz | Yes | Learner | Get quiz for a node (returns questions without answers) |
| POST | /api/v1/quizzes/:quizId/attempt | Yes | Learner | Submit quiz answers → score → Gatekeeper outcome |
| GET | /api/v1/quiz-attempts | Yes | Learner | List my quiz attempts (with filters) |
| GET | /api/v1/quiz-attempts/:id | Yes | Learner | Get specific attempt details |
| GET | /api/v1/nodes/:nodeId/challenge | Yes | Learner | Get challenge project for a node (if passed) |

### Gatekeeper Three-Tier Logic

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

### Tests to Write

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

### Definition of Done

- [ ] Static quizzes seeded for all pilot Frontend nodes
- [ ] Quiz retrieval hides correct answers
- [ ] Quiz submission scores correctly and applies Gatekeeper tier logic
- [ ] Node mastery state transitions are correct for all five tiers
- [ ] Dependent nodes unlock only after pass/marginal_pass
- [ ] Adaptation events are created in the database for each failure tier
- [ ] Challenge projects returned on strong pass
- [ ] All tests pass (unit + integration)

---

## Phase 7: Resource Service (Including PSE API Integration)

### What to Build

Resource CRUD, domain whitelist management, learner resource ratings. Google PSE API integration for runtime resource discovery. Automated link validation (HTTP checks). Resource adaptation logic (modality swapping triggered by Gatekeeper failures).

### Files and Folders

```
src/modules/
├── resources/
│   ├── resources.routes.ts        # CRUD + ratings + fetch from PSE
│   ├── resources.controller.ts
│   ├── resources.service.ts       # Resource CRUD, rating aggregation
│   ├── resources.validation.ts
│   └── resources.test.ts
├── whitelist/
│   ├── whitelist.routes.ts        # CRUD for domain whitelist
│   ├── whitelist.controller.ts
│   ├── whitelist.service.ts
│   └── whitelist.test.ts
├── pse/
│   ├── pse.client.ts              # Google PSE API HTTP client
│   ├── pse.service.ts             # Search, filter, cache results
│   ├── pse.test.ts                # Integration test (mocked HTTP for CI, real for manual)
│   └── pse.types.ts               # PSE API response types
├── linkValidator/
│   ├── linkValidator.service.ts   # HTTP HEAD checks, freshness detection
│   └── linkValidator.test.ts
├── adaptation/
│   ├── adaptation.service.ts      # Resource swap logic (documentation → tutorial)
│   └── adaptation.test.ts
seeds/
├── 005_domain_whitelist.ts        # Whitelist entries for Frontend domain
├── 006_manual_resources.ts        # Manually curated resources for pilot nodes
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/nodes/:nodeId/resources | Yes | Learner | Get resources for a node (sorted by rating) |
| POST | /api/v1/nodes/:nodeId/resources/discover | Yes | Learner | Trigger PSE API search for this node → cache results |
| POST | /api/v1/resources | Yes | Admin/Expert | Manually add resource |
| PATCH | /api/v1/resources/:id | Yes | Admin/Expert | Update resource |
| DELETE | /api/v1/resources/:id | Yes | Admin | Delete resource |
| POST | /api/v1/resources/:id/rate | Yes | Learner | Rate resource (1-5 + optional comment) |
| GET | /api/v1/domains/:domainId/whitelist | Yes | Any | List whitelisted sources for domain |
| POST | /api/v1/domains/:domainId/whitelist | Yes | Admin/Expert | Add source to whitelist |
| DELETE | /api/v1/whitelist/:id | Yes | Admin | Remove source from whitelist |
| POST | /api/v1/resources/validate-links | Yes | Admin | Trigger bulk link validation job |

### PSE API Integration

- **Client** (`pse.client.ts`): Wraps the Google Custom Search JSON API. Accepts `query`, `siteSearch` (from whitelist), returns parsed results.
- **Service** (`pse.service.ts`):
  1. Build search query from node title + learning outcomes.
  2. Restrict search to whitelisted domains for this node's domain.
  3. Fetch top 10 results.
  4. Deduplicate against existing resources.
  5. Insert new resources with `fetched_via = 'pse_api'`.
  6. Cache results in Redis (TTL: 24 hours) to minimize API calls.

### Resource Adaptation Logic

When Gatekeeper triggers `resource_swap`:
1. Query current resources for the node, ordered by modality.
2. If learner's last attempt used `documentation` modality resources → recommend `tutorial` or `video` modality resources.
3. If no alternative modality exists → trigger PSE API search with tutorial-focused query.
4. Log adaptation_event with details: `{from_modality, to_modality, resources_swapped}`.

### Tests to Write

| Test | Asserts |
|------|---------|
| GET resources for node | Returns resources sorted by avg_rating descending |
| Add manual resource | Returns 201; resource appears in GET |
| Rate resource | Rating recorded; avg_rating recomputed |
| Rate resource twice | Updates existing rating (upsert); avg recalculated |
| PSE API search returns results | Mocked PSE response → resources inserted in DB |
| PSE API deduplicates existing URLs | Same URL not inserted twice |
| PSE results cached in Redis | Second call within TTL returns cached results without API call |
| Link validation: valid URL | Returns is_valid = true, updated last_validated_at |
| Link validation: broken URL (404) | Returns is_valid = false |
| Whitelist CRUD | Add, list, delete whitelist entries |
| Resource adaptation: swap documentation → tutorial | Returns tutorial-modality resources; adaptation_event logged |
| Resource adaptation: no alternative exists | Triggers PSE search with tutorial query |
| Only admin can manage whitelist | Learner gets 403 |

### Definition of Done

- [ ] Resources CRUD fully functional
- [ ] Domain whitelist CRUD works and restricts PSE API searches
- [ ] PSE API integration fetches and stores resources from whitelisted domains
- [ ] Results cached in Redis to minimize API cost
- [ ] Link validator checks HTTP status of stored resources
- [ ] Resource rating and aggregation works
- [ ] Resource adaptation logic swaps modalities correctly
- [ ] Seed data provides whitelist and manual resources for pilot domain
- [ ] All tests pass

---

## Phase 8: Mastery Decay and Spaced Repetition Engine

### What to Build

Decay state computation based on time since last review. Scheduled job (cron) to scan mastered nodes and transition states. Micro-quiz generation triggers. Notification creation for decay reminders. Timer reset on successful micro-quiz.

### Files and Folders

```
src/modules/
├── decay/
│   ├── decay.service.ts           # Decay computation, state transitions
│   ├── decay.scheduler.ts         # Cron job: scan all mastered nodes, transition states
│   ├── decay.routes.ts            # GET /decay-status, POST /nodes/:nodeId/micro-quiz
│   ├── decay.controller.ts
│   ├── decay.service.test.ts      # Unit tests for decay logic
│   └── decay.test.ts              # Integration tests
├── notifications/
│   ├── notifications.routes.ts    # GET /notifications, PATCH /:id/read
│   ├── notifications.controller.ts
│   ├── notifications.service.ts   # Create + query notifications
│   └── notifications.test.ts
```

### Decay Rules

```
State: MASTERED (green)
  Trigger: strong_pass → 14-day timer
           marginal_pass → 7-day timer

State: REVIEW_NEEDED (yellow)
  Trigger: last_reviewed_at + decay_threshold < NOW()
  Action:
    - Update mastery_state → 'review_needed'
    - Create micro-quiz (2-3 questions from node's learning outcomes)
    - Create notification (type: 'decay_reminder')

State: RELEARN (red)
  Trigger: last_reviewed_at + 30 days < NOW()
  Action:
    - Update mastery_state → 'relearn'
    - Create full quiz trigger
    - Create notification (type: 'decay_reminder', severity: 'high')

Micro-quiz pass (≥80%):
  - Reset last_reviewed_at → NOW()
  - mastery_state → 'mastered'
  - Clear decay notification

Micro-quiz fail (<80%):
  - mastery_state → 'in_progress' (re-locked)
  - Trigger resource adaptation
  - Dependent nodes re-locked if they depend on this node
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/enrollments/:id/decay-status | Yes | Learner | Get decay state for all mastered nodes |
| POST | /api/v1/nodes/:nodeId/micro-quiz | Yes | Learner | Get micro-quiz for a decayed node |
| POST | /api/v1/micro-quizzes/:quizId/attempt | Yes | Learner | Submit micro-quiz answers |
| GET | /api/v1/notifications | Yes | Any | Get my notifications (paginated, filterable) |
| PATCH | /api/v1/notifications/:id/read | Yes | Any | Mark notification as read |
| PATCH | /api/v1/notifications/read-all | Yes | Any | Mark all notifications as read |

### Scheduler

- **Technology**: `node-cron` or `bull` queue with repeating job.
- **Frequency**: Runs every 6 hours.
- **Logic per run**:
  1. Query all `learner_node_progress` where `mastery_state = 'mastered'`.
  2. For each, compute days since `last_reviewed_at`.
  3. If marginal_pass node (flagged) and days > 7 → transition to `review_needed`.
  4. If strong_pass node and days > 14 → transition to `review_needed`.
  5. If any node in `review_needed` and days > 30 → transition to `relearn`.
  6. Create notifications for transitioned nodes (deduplicate: don't re-notify within 24 hours).

### Tests to Write

| Test | Asserts |
|------|---------|
| Node mastered 15 days ago (strong pass) → review_needed | State transitions correctly |
| Node mastered 8 days ago (marginal pass) → review_needed | Shorter threshold triggers correctly |
| Node mastered 5 days ago → stays mastered | No transition |
| Node in review_needed for 31+ days → relearn | State transitions to relearn |
| Micro-quiz pass (≥80%) resets timer | last_reviewed_at updated; state → mastered |
| Micro-quiz fail (<80%) re-locks node | State → in_progress; adaptation event created |
| Micro-quiz fail re-locks dependent nodes | Dependents that relied on this node become locked |
| Scheduler creates notifications | Notification row created with correct type and data |
| Scheduler deduplicates notifications | Running twice within 24h doesn't create duplicate notifications |
| GET /decay-status returns correct states | All nodes with their current decay state and days-since-review |
| GET /notifications returns unread first | Sorted by created_at desc; unread flagged |
| PATCH read marks as read | Notification.read = true |

### Definition of Done

- [ ] Decay computation correctly transitions mastered → review_needed → relearn
- [ ] Marginal pass uses 7-day threshold; strong pass uses 14-day threshold
- [ ] Micro-quiz flow works: generate, attempt, score, reset timer or re-lock
- [ ] Re-locking cascades to dependent nodes
- [ ] Scheduler runs on cron, transitions states, creates notifications
- [ ] Notification CRUD works (list, mark read)
- [ ] All tests pass

---

## Phase 9: Multi-Path Branching Logic

### What to Build

Branching point detection in the DAG. Choice presentation API (at branching nodes). Path selection and roadmap filtering. Reconvergence point handling. Path switching with prerequisite validation.

### Files and Folders

```
src/modules/
├── branching/
│   ├── branching.routes.ts        # GET /branching-points, POST /select-path, GET /available-paths
│   ├── branching.controller.ts
│   ├── branching.service.ts       # Path logic, validation, roadmap filtering
│   ├── branching.validation.ts
│   ├── branching.service.test.ts  # Unit tests
│   └── branching.test.ts          # Integration tests
```

### API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/enrollments/:id/branching-points | Yes | Learner | Get reachable branching points and their options |
| GET | /api/v1/enrollments/:id/available-paths | Yes | Learner | Get available paths with descriptions and node counts |
| POST | /api/v1/enrollments/:id/select-path | Yes | Learner | Select a branch path (frontend/backend/data_science) |
| GET | /api/v1/enrollments/:id/roadmap | Yes | Learner | Updated: filters DAG to show only selected path + shared nodes |
| POST | /api/v1/enrollments/:id/switch-path | Yes | Learner | Switch to a different path (with prerequisite validation) |

### Business Logic

**Branching point detection:**
- Query nodes where `is_branching_point = true` in the enrolled ontology.
- For each branching point, group downstream nodes by `branch_path`.
- Return: branching point node + available paths with metadata (node count, estimated hours, description).

**Path selection:**
1. Validate learner has completed all prerequisites up to the branching point.
2. Update `enrollments.selected_branch_path`.
3. Update `learner_node_progress`:
   - Nodes belonging to the selected path: keep `unlocked` logic active.
   - Nodes belonging to OTHER paths: set a `hidden` flag or exclude from roadmap queries.
   - Convergence point nodes (`is_convergence_point = true`): always visible regardless of path.

**Path switching:**
1. Validate new path's prerequisites against learner's current progress.
2. If met: update `selected_branch_path`, re-show new path nodes, hide old path nodes.
3. If not met: return 400 with list of unmet prerequisites.

**Roadmap filtering:**
- The `/roadmap` endpoint (from Phase 5) is updated to respect the selected path.
- Returns: shared foundational nodes + selected path nodes + convergence nodes.
- Nodes from unselected paths are excluded.

### Tests to Write

| Test | Asserts |
|------|---------|
| GET branching-points | Returns branching nodes with downstream path options |
| GET available-paths | Returns all paths with correct node counts and estimated hours |
| Select path before reaching branching point | Returns 400 (prerequisites not met) |
| Select path after completing prerequisites | Returns 200; enrollment updated; roadmap filtered |
| Roadmap shows only selected path + shared nodes | Nodes from other paths excluded |
| Convergence nodes always visible | Regardless of path selection |
| Switch path with met prerequisites | Returns 200; roadmap updated |
| Switch path with unmet prerequisites | Returns 400 with list of missing prerequisites |
| Select path twice (same path) | Idempotent — no error |
| Path node counts match seeded ontology | Frontend path has correct number of nodes |

### Definition of Done

- [ ] Branching points detected correctly from ontology
- [ ] Path selection filters the roadmap to show only relevant nodes
- [ ] Convergence nodes always included regardless of path
- [ ] Path switching validates prerequisites and updates roadmap
- [ ] All tests pass

---

## Phase 10: Admin and Instructor Management APIs

### What to Build

Admin endpoints for user management, system configuration, and analytics. Instructor endpoints for learner progress visibility, flagged nodes, and class management.

### Files and Folders

```
src/modules/
├── admin/
│   ├── admin.routes.ts            # User management, system stats, config
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.test.ts
├── instructor/
│   ├── instructor.routes.ts       # Learner progress views, flagged nodes, class analytics
│   ├── instructor.controller.ts
│   ├── instructor.service.ts
│   └── instructor.test.ts
```

### API Endpoints — Admin

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/admin/users | Yes | Admin | List all users (paginated, filterable by role) |
| PATCH | /api/v1/admin/users/:id/role | Yes | Admin | Change user role |
| DELETE | /api/v1/admin/users/:id | Yes | Admin | Deactivate/delete user |
| GET | /api/v1/admin/stats | Yes | Admin | System-wide statistics (users, enrollments, quiz attempts, avg scores) |
| GET | /api/v1/admin/stats/domains | Yes | Admin | Per-domain statistics (enrollments, completion rates, avg quiz scores) |
| GET | /api/v1/admin/adaptation-events | Yes | Admin | List all adaptation events (filterable by type, date range) |
| GET | /api/v1/admin/flagged-nodes | Yes | Admin | Nodes flagged for instructor review (fail_severe events) |

### API Endpoints — Instructor

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/instructor/learners | Yes | Instructor | List learners (can filter by domain, enrollment status) |
| GET | /api/v1/instructor/learners/:userId/progress | Yes | Instructor | View specific learner's full progress |
| GET | /api/v1/instructor/learners/:userId/quiz-history | Yes | Instructor | View learner's quiz attempt history |
| GET | /api/v1/instructor/domains/:domainId/analytics | Yes | Instructor | Domain analytics: avg completion, problematic nodes, dropout points |
| GET | /api/v1/instructor/flagged | Yes | Instructor | Nodes flagged for review (escalated by Gatekeeper) |
| PATCH | /api/v1/instructor/flagged/:eventId/resolve | Yes | Instructor | Mark flagged event as resolved with notes |

### Tests to Write

| Test | Asserts |
|------|---------|
| Admin: list users with pagination | Returns paginated results; role filter works |
| Admin: change user role | Role updated in DB; response reflects change |
| Admin: cannot change own role to non-admin | Returns 400 (safety check) |
| Admin: system stats are accurate | Counts match DB reality |
| Admin: domain stats correct | Completion rates match actual progress data |
| Instructor: list learners | Returns learners enrolled in instructor-relevant domains |
| Instructor: view learner progress | Returns full progress for specified learner |
| Instructor: domain analytics | Returns avg completion, identifies problem nodes (highest fail rates) |
| Instructor: resolve flagged event | Event marked resolved; resolution notes stored |
| RBAC: learner cannot access admin routes | Returns 403 |
| RBAC: learner cannot access instructor routes | Returns 403 |
| RBAC: instructor cannot access admin routes | Returns 403 |

### Definition of Done

- [ ] Admin can manage users, view system stats, and see flagged nodes
- [ ] Instructor can view learner progress, quiz history, and domain analytics
- [ ] Flagged node workflow (escalation → resolution) works end-to-end
- [ ] RBAC correctly restricts all endpoints
- [ ] All tests pass

---

## Phase 11: AI-Powered Quiz and Explanation Generation (Gemini Integration)

### What to Build

Integrate Google Gemini API for the Tutor Model: AI-generated quizzes, explanations, and micro-quizzes. Caching layer to reduce API costs. Fallback to static content when API is unavailable.

This phase depends on Phases 6 and 8 being fully operational with static content. All AI logic lives in the **ai-service**.

### Files and Folders

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

### Prompt Design Principles (Skeleton & Flesh)

All prompts are grounded in the verified ontology skeleton:
- Quiz generation prompt includes: node title, description, learning_outcomes, difficulty_level, prerequisites.
- The LLM cannot invent new concepts outside the node's scope.
- Output is structured JSON (parsed and validated before storage).

### Quiz Generation Flow (AI-enhanced)

1. Learner requests quiz for node.
2. Check Redis cache: `quiz:ai:{nodeId}:{hash}` — if cached and fresh (TTL: 7 days), return it.
3. If not cached, check DB for existing static quiz → use it as fallback.
4. Call Gemini API with quiz generation prompt:
   - Input: node title, learning_outcomes, difficulty_level, question count (3-5).
   - Output: structured JSON array of questions with options and correct answers.
5. Validate output schema. If invalid → fall back to static quiz.
6. Store generated quiz in DB (`generated_by = 'ai_tutor'`). Cache in Redis.
7. Return to learner (without correct answers).

### Explanation Generation Flow

1. Learner requests explanation for a node.
2. Check Redis cache.
3. Call Gemini with explanation prompt (grounded in node's learning_outcomes and description).
4. Return generated explanation. Cache in Redis (TTL: 24 hours).

### Fallback Strategy

- If Gemini API returns error or timeout (>3 seconds): serve static/cached content.
- If rate limited: queue request and serve static content immediately.
- Track API errors in a circuit breaker pattern: after 5 consecutive failures, disable AI generation for 5 minutes and serve only static content.

### Tests to Write

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

### Definition of Done

- [ ] AI-generated quizzes replace static quizzes when available
- [ ] Prompts grounded in ontology skeleton (no hallucination beyond node scope)
- [ ] Redis caching reduces API calls by >80% for repeated content
- [ ] Fallback to static content is seamless when API is down
- [ ] Circuit breaker prevents cascade failures
- [ ] Token usage tracked for cost monitoring
- [ ] ai-service communicates with learning-service via internal HTTP
- [ ] All tests pass

---

## Phase 12: API Hardening, Documentation, and Final CI/CD

### What to Build

Security hardening, input sanitization, comprehensive OpenAPI documentation, performance optimization, final CI/CD pipeline, and production readiness.

### Security Hardening

```
src/middleware/
├── helmet.ts                      # HTTP security headers (helmet.js)
├── cors.ts                        # CORS configuration (whitelist origins)
├── inputSanitizer.ts              # Sanitize all string inputs (XSS prevention)
├── sqlInjectionGuard.ts           # Parameterized queries verified (Prisma handles this by default, but audit for raw queries)
```

**Checklist:**
- [ ] All endpoints validate input with Joi schemas (already done per phase, but audit)
- [ ] All database queries use parameterized queries (Prisma does this by default — audit for any raw queries via `$queryRaw`)
- [ ] Rate limiting on all endpoints, stricter on auth endpoints
- [ ] CORS whitelist configured (frontend origins only)
- [ ] Helmet.js for security headers (CSP, X-Frame-Options, etc.)
- [ ] All secrets loaded from environment variables (no hardcoded keys)
- [ ] JWT tokens httpOnly, secure, SameSite
- [ ] User input sanitized against XSS (DOMPurify on any user-generated text)
- [ ] SQL injection: no raw SQL with string interpolation
- [ ] Sensitive data encrypted at rest (DB-level encryption or column-level for PII)
- [ ] Error responses never leak stack traces or internal details in production

### API Documentation (Swagger — audit and finalize)

Swagger was set up in Phase 1 and annotations have been added incrementally with each route file since Phase 3. This phase audits completeness and generates the final spec.

```
services/*/src/docs/
├── swagger.ts                     # swagger-jsdoc + swagger-ui-express setup (already exists from Phase 1)
```

- Audit: every endpoint documented with description, request/response schemas, auth requirements, error codes.
- Swagger UI served at `/api/docs` per service in development.
- Generated `openapi.yaml` per service committed to repo for CI validation.

### Performance Optimization

- [ ] Redis caching for: ontology graph (TTL: 1 hour), learner progress (TTL: 5 min), PSE results (TTL: 24 hours), AI-generated content (TTL: 7 days)
- [ ] Database query optimization: EXPLAIN ANALYZE on all major queries; add missing indexes
- [ ] Connection pooling: pg-pool configured with appropriate pool size
- [ ] Response compression: gzip/brotli middleware
- [ ] Pagination on all list endpoints (cursor-based or offset-based)
- [ ] API response time target: <500ms (p95) for non-AI endpoints

### Final CI/CD Pipeline

```
.github/workflows/
├── ci.yml                         # Lint → Build → Test (on every push/PR)
├── deploy.yml                     # Build Docker image → Push to registry → Deploy (on merge to main)
```

**CI Pipeline (`ci.yml`):**
1. Checkout code
2. Install dependencies
3. Lint (`eslint`)
4. Type-check (`tsc --noEmit`)
5. Build (`tsc`)
6. Start service containers (Postgres, Redis)
7. Run migrations
8. Run all tests
9. Upload coverage report

**Deploy Pipeline (`deploy.yml`):**
1. Build Docker image (multi-stage, production)
2. Push to container registry (GitHub Container Registry or AWS ECR)
3. Deploy to staging (Docker Compose or ECS)
4. Run smoke tests against staging
5. Manual approval gate for production
6. Deploy to production

### Load Testing

- Use `k6` or `artillery` to simulate 1000 concurrent users.
- Target endpoints: health, roadmap, quiz attempt, resource fetch.
- Verify: API response <500ms (p95), no 5xx errors, DB connections don't exhaust pool.

### Tests to Write

| Test | Asserts |
|------|---------|
| XSS payload in user input | Sanitized; no script tags stored or returned |
| SQL injection attempt | Rejected or safely parameterized |
| Missing auth header | Returns 401 (not 500) |
| Invalid JSON body | Returns 400 with clear error message |
| CORS blocks unauthorized origin | Preflight returns 403 |
| Rate limiter blocks excessive requests | Returns 429 |
| OpenAPI spec validates | Generated spec passes OpenAPI 3.0 validator |
| All endpoints documented | Every route has swagger annotation |
| Compressed response | Response headers include content-encoding: gzip |
| Load test: 1000 concurrent users | p95 < 500ms; zero 5xx errors |

### Definition of Done

- [ ] Security audit checklist all green
- [ ] OpenAPI documentation covers all endpoints; Swagger UI accessible
- [ ] Redis caching applied to all high-frequency reads
- [ ] p95 response time < 500ms under load (1000 concurrent users)
- [ ] CI pipeline runs on every push: lint → build → test → coverage
- [ ] Deploy pipeline builds and pushes Docker image
- [ ] Staging deployment works end-to-end
- [ ] Load test report generated and reviewed
- [ ] All tests pass (unit + integration + load)

---

## Phase Dependency Graph

```
Phase 1 (Scaffold)
  └─→ Phase 2 (Schema)
       └─→ Phase 3 (Auth)
            └─→ Phase 4 (Ontology)
                 └─→ Phase 5 (Learner/Enrollment)
                      ├─→ Phase 6 (Quiz/Gatekeeper)
                      │    └─→ Phase 7 (Resources + PSE API)
                      │         └─→ Phase 8 (Mastery Decay)
                      │              └─→ Phase 9 (Branching)
                      │                   └─→ Phase 10 (Admin/Instructor)
                      │                        └─→ Phase 11 (AI/Gemini)
                      │                             └─→ Phase 12 (Hardening)
                      └────────────────────────────────────────────┘
```

Each phase builds on the previous. No phase should be started until the previous phase's "Definition of Done" is fully satisfied.

---

## Summary Table

| Phase | Name | Depends On | Key Deliverables |
|-------|------|------------|------------------|
| 1 | Scaffold & Infrastructure | — | Docker, Express, CI pipeline, health endpoint |
| 2 | Database Schema | 1 | All migrations, full schema, constraint tests |
| 3 | Authentication | 2 | JWT, OAuth, RBAC, user CRUD |
| 4 | Ontology Service | 3 | DAG CRUD, validation, versioning, seed data |
| 5 | Learner & Enrollment | 4 | Enrollment, progress tracking, roadmap endpoint |
| 6 | Quiz & Gatekeeper | 5 | Static quizzes, 3-tier logic, state transitions |
| 7 | Resource Service | 6 | Resources, whitelist, PSE API, adaptation |
| 8 | Mastery Decay | 7 | Decay scheduler, micro-quizzes, notifications |
| 9 | Multi-Path Branching | 8 | Path selection, roadmap filtering, switching |
| 10 | Admin & Instructor | 9 | Management APIs, analytics, flagged nodes |
| 11 | AI Integration | 10 | Gemini quiz/explanation gen, caching, fallbacks |
| 12 | Hardening & Docs | 11 | Security, OpenAPI docs, load tests, deploy pipeline |
