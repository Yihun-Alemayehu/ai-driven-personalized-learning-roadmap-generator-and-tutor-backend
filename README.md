# Atlas — AI-Powered Adaptive Learning Platform

> A full-stack, microservices learning platform that builds personalised roadmaps, generates AI explanations and quizzes per topic, tracks mastery over time, and adapts the learning path when a learner struggles.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Domain Model](#domain-model)
- [Core Learning Mechanics](#core-learning-mechanics)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Frontend Pages](#frontend-pages)
- [Admin & Domain Expert Panels](#admin--domain-expert-panels)
- [Flutter Mobile App](#flutter-mobile-app)
- [Roadmap](#roadmap)

---

## Overview

Atlas is an adaptive e-learning system built as a final-year project. Learners enrol in a domain (Frontend Development, Backend Development, Data Science, or DevOps Engineering), receive a personalised learning roadmap as a Directed Acyclic Graph (DAG), study topics with AI-generated explanations, take AI-generated quizzes, and unlock the next node only after demonstrating mastery.

The platform adapts in real-time: failed quizzes trigger resource swaps, prerequisite reviews, or domain expert escalation. Knowledge decay is tracked — nodes go stale over time and prompt micro-quiz reviews. Domain experts get analytics dashboards, and admins can build and publish new ontology versions through a visual React Flow canvas.

---

## Key Features

| Category | Feature |
|---|---|
| **Personalised Roadmap** | DAG generated from the domain ontology, filtered to the learner's branch path and familiarity level |
| **AI Explanations** | Ollama-powered multi-section explanations per topic node (Gemini as fallback), with caching and circuit-breaker |
| **AI Quizzes** | Ollama generates 4-question MCQs grounded in the node's learning outcomes; never invents new facts |
| **Gatekeeper** | 5-tier scoring system (strong pass → fail severe) unlocks next nodes or triggers adaptation |
| **Knowledge Decay** | Mastered nodes degrade over time; decay-due nodes surface as micro-quiz reminders |
| **Path Branching** | Learners choose a specialisation at branching points (e.g. Frontend / Backend / Data Science) |
| **Resource Discovery** | SERP API integration serves curated resources per node (videos, docs, tutorials, interactive) |
| **Resource Adaptation** | Repeated quiz failures swap resource modality (e.g. video → interactive) |
| **My Learning** | Persistent sidebar tracking of active courses with last-visited node state |
| **Domain Expert Analytics** | Per-domain mastery rate bar charts, problem nodes, learner cohort progress, flagged events |
| **Admin Ontology Builder** | Visual React Flow canvas to build/edit domain knowledge graphs with DAG validation and version pipeline |
| **Notifications** | In-app notifications for quiz results, decay reminders, and mastery achievements |
| **Challenge Projects** | Optional project prompts unlocked on strong pass |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                          │
│                  React (Vite) · Flutter (mobile)                │
└──────────────────────────────┬──────────────────────────────────┘
                               │  HTTP / REST  (all via /api/v1/*)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Nginx  :8080                              │
│              Reverse proxy + static file serving                 │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
             ▼                                  ▼
┌────────────────────────┐          ┌───────────────────────────┐
│     api-gateway :3000  │          │    ai-service :3002        │
│                        │          │                            │
│  • JWT auth (RS256)    │          │  • Ollama explanations     │
│  • Refresh tokens      │◄────────►│  • Ollama quiz generation  │
│  • RBAC middleware     │  HTTP    │  • SERP resource discovery │
│  • User management     │          │  • Redis response cache    │
│  • Admin user ops      │          │  • Circuit breaker         │
│  • Request proxying    │          │  • Gemini fallback (API)   │
└────────────┬───────────┘          └───────────────────────────┘
             │ HTTP
             ▼
┌────────────────────────┐
│  learning-service :3001 │
│                         │
│  • Domains & ontology   │
│  • Enrollments          │
│  • Roadmap generation   │
│  • Gatekeeper / scoring │
│  • Quizzes & attempts   │
│  • Knowledge decay      │
│  • Resources & ratings  │
│  • Path branching       │
│  • Domain expert analytics │
│  • Admin CRUD           │
│  • Notifications        │
└────────────┬────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌─────────┐    ┌──────────┐
│Postgres │    │  Redis   │
│  :5433  │    │  :6380   │
│ (Prisma)│    │  cache   │
└─────────┘    └──────────┘
```

All three services are built with **Express + TypeScript**, containerised with Docker Compose, and share a single PostgreSQL database with schema-per-service organisation.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 20, TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 (PostgreSQL) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Joi |
| AI | Ollama (primary) · Google Gemini API fallback (`@google/generative-ai`) |
| Resource search | SERP API (`serpapi`) |
| Caching | Redis via ioredis |
| Logging | Pino + pino-http |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Containerisation | Docker + Docker Compose |
| Reverse proxy | Nginx |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| State (server) | TanStack Query v5 |
| State (client) | Zustand (with `persist` middleware) |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| DAG visualisation | React Flow (`@xyflow/react`) + Dagre layout |
| Charts | Recharts |
| HTTP client | Axios |
| Fonts | Cormorant Garamond, Crimson Text, JetBrains Mono |
| Testing | Vitest + Testing Library + MSW |

### Infrastructure

| Component | Technology |
|---|---|
| Database | PostgreSQL 16 |
| Cache / pub-sub | Redis 7 |
| Containerisation | Docker Compose |
| Reverse proxy | Nginx Alpine |

---

## Repository Structure

```
fyp/
├── backend/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── services/
│       ├── api-gateway/          # Auth, user management, RBAC, request proxying
│       │   └── src/
│       │       ├── modules/auth/
│       │       ├── modules/users/
│       │       └── modules/admin/
│       ├── learning-service/     # Core learning domain
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   ├── seed.ts
│       │   │   └── seeds/        # 9 seed files for domains, ontologies, quizzes
│       │   └── src/
│       │       └── modules/
│       │           ├── adaptation/     # Resource modality swap
│       │           ├── admin/          # Admin stats, user/domain ops
│       │           ├── branching/      # Path selection at fork nodes
│       │           ├── decay/          # Knowledge decay scoring
│       │           ├── domains/        # Domain CRUD
│       │           ├── enrollments/    # Enrol in domain, progress init
│       │           ├── gatekeeper/     # Quiz score classification & unlock
│       │           ├── instructor/     # Instructor analytics & flagged events
│       │           ├── notifications/  # In-app notification dispatch
│       │           ├── ontology/       # Version pipeline, nodes, edges, DAG utils
│       │           ├── progress/       # Per-node mastery state machine
│       │           ├── serp/           # SERP resource discovery
│       │           ├── quizzes/        # Quiz fetch + attempt submission
│       │           └── resources/      # Manual resources + ratings
│       └── ai-service/           # AI wrapper (Ollama primary, Gemini fallback)
│           └── src/
│               └── modules/ai/
│                   ├── ollama.client.ts   # Primary inference
│                   ├── gemini.client.ts   # Fallback
│                   ├── ai.cache.ts
│                   ├── ai.circuit-breaker.ts
│                   └── prompts/           # Typed prompt builders
├── frontend/
│   └── src/
│       ├── api/              # TanStack Query hooks per domain
│       ├── components/
│       │   ├── layout/       # AppShell, Navbar, Sidebar, BottomNav
│       │   └── ui/           # Shared UI primitives
│       ├── features/
│       │   ├── admin/        # Ontology builder, domain mgmt, user mgmt, stats
│       │   ├── auth/         # Login, register pages
│       │   ├── catalog/      # Domain catalog + enrol sheet
│       │   ├── dashboard/    # Learner dashboard + enrollments
│       │   ├── instructor/   # Instructor analytics pages
│       │   ├── learn/        # Learn page, AI explanation, inline quiz
│       │   ├── quiz/         # Quiz state machine, outcome screen
│       │   ├── roadmap/      # React Flow DAG roadmap
│       │   ├── resources/    # Resource browser + ratings
│       │   ├── notifications/# Notification centre
│       │   ├── decay/        # Decay reminder UI
│       │   └── branching/    # Path branch selector
│       ├── store/            # Zustand stores (auth, myLearning)
│       └── types/            # Shared TypeScript types
└── docs/
    ├── backend/              # Phase-by-phase backend implementation docs
    ├── frontend/             # Phase-by-phase web frontend docs
    └── frontend-mobile/      # Phase-by-phase Flutter mobile docs (10 phases)
```

---

## Domain Model

```
User ─────────────────────────────────────────────────────────────┐
  │                                                                │
  │ enrolls in                                                     │
  ▼                                                                │
Enrollment ──── references ───► OntologyVersion                   │
  │                                │                              │
  │ has many                        │ has many                    │
  ▼                                ▼                              │
LearnerNodeProgress       LearningNode ◄──── NodePrerequisite     │
  │                          │                                    │
  │ (mastery state)          │ has many                           │
  │                          ├── Quiz ──► QuizQuestion            │
  │                          ├── Resource                         │
  │                          ├── ChallengeProject                 │
  │                          └── AdaptationEvent ─────────────────┘
  │
  │ has many
  ▼
QuizAttempt ──► (score, outcome, answers)
```

### Key Enums

```
MasteryState:    not_started | in_progress | mastered | review_needed | relearn
QuizOutcome:     strong_pass | marginal_pass | fail_low | fail_fundamental | fail_severe
OntologyStatus:  draft | in_review | verified | published | archived
AdaptationType:  resource_swap | prerequisite_review | instructor_escalation | decay_micro_quiz
BranchPath:      frontend | backend | data_science
UserRole:        learner | domain_expert | admin
ResourceModality: video | tutorial | documentation | interactive | reference
```

---

## Core Learning Mechanics

### 1. Ontology — Skeleton & Flesh

The knowledge graph is **human-authored** (the skeleton). Admins define nodes, their prerequisites, branching points, and convergence points through a visual React Flow canvas. Gemini generates only prose and quiz questions **grounded in the node's defined learning outcomes** — it cannot invent new topics.

The ontology goes through a 5-stage publishing pipeline:  
`draft → in_review → verified → published → archived`

### 2. Personalised Roadmap Generation

When a learner enrols, the system:
1. Loads the published ontology version for the domain
2. Applies the learner's `familiarityLevel` to mark known nodes as pre-mastered
3. Filters nodes by the learner's chosen `branchPath` (if a branching point exists)
4. Returns the DAG as a flat list of nodes with mastery states

### 3. Gatekeeper — 5-Tier Scoring

Every quiz attempt is classified:

| Score | Tier | Outcome |
|---|---|---|
| ≥ 80% | `strong_pass` | Node mastered; next nodes unlocked; challenge project offered |
| 70–79% | `marginal_pass` | Node mastered; next nodes unlocked |
| 50–69% | `fail_low` | Resources swapped (modality change) |
| 30–49% | `fail_fundamental` | Prerequisite review triggered |
| < 30% | `fail_severe` | Instructor escalation flagged |

### 4. Knowledge Decay

Mastered nodes go stale over time:

| Mastery Level | Decay Window |
|---|---|
| Strong pass | 14 days |
| Marginal pass | 7 days |
| Relearn | 30 days |

A background decay check runs on each roadmap load. Nodes past their window transition to `review_needed` and trigger an in-app notification. The learner must retake a micro-quiz (3 questions) to re-validate mastery.

### 5. AI Generation Pipeline

The **ai-service** is isolated and stateless:

```
Request → Cache lookup (Redis, 24h TTL)
        → Circuit breaker (open after 3 failures, 30s reset)
        → Ollama      (primary, local)
        → Gemini API  (fallback)
        → Structured response validation
        → Cache write
        → Response
```

Prompt builders are typed TypeScript functions that inject `nodeTitle`, `description`, `learningOutcomes`, and `difficultyLevel` — ensuring the model cannot hallucinate beyond the defined curriculum.

### 6. Resource Discovery

The **serp module** queries the SERP API with the node title + domain context. Results are normalised into `Resource` records with detected modality, stored per-node, and served with learner ratings.

---

## API Reference

All routes are prefixed `/api/v1/` and proxied through the Nginx reverse proxy.

### api-gateway (:3000)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new learner |
| `POST` | `/auth/login` | Public | Login, receive access + refresh tokens |
| `POST` | `/auth/refresh` | Public | Rotate refresh token |
| `POST` | `/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/users/me` | Bearer | Get current user |
| `PATCH` | `/users/me` | Bearer | Update profile |
| `POST` | `/users/me/change-password` | Bearer | Change password |
| `DELETE` | `/users/me` | Bearer | Delete account |
| `GET` | `/admin/users` | Admin | List all users with filters |
| `PATCH` | `/admin/users/:id/role` | Admin | Change user role |
| `DELETE` | `/admin/users/:id` | Admin | Delete user |
| `GET` | `/admin/stats` | Admin | System-wide KPIs |
| `GET` | `/admin/stats/domains` | Admin | Per-domain statistics |

### learning-service (:3001)

**Domains & Ontology**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/domains` | Bearer | List all domains |
| `POST` | `/domains` | Admin | Create domain |
| `PATCH` | `/domains/:id` | Admin | Update domain |
| `GET` | `/domains/:domainId/ontologies` | Bearer | List ontology versions |
| `POST` | `/domains/:domainId/ontologies` | Admin | Create new draft version (copies from latest published) |
| `GET` | `/ontologies/:id` | Bearer | Get version with all nodes and edges |
| `PATCH` | `/ontologies/:id/status` | Admin | Transition status (draft→in_review→verified→published) |
| `GET` | `/ontologies/:id/validate` | Admin | Run DAG validation |
| `POST` | `/ontologies/:id/nodes` | Admin | Add node to draft |
| `PATCH` | `/nodes/:id` | Admin | Update node |
| `DELETE` | `/nodes/:id` | Admin | Delete node |
| `POST` | `/nodes/:id/prerequisites` | Admin | Add prerequisite edge |
| `DELETE` | `/prerequisites/:id` | Admin | Remove prerequisite edge |

**Enrollments & Roadmap**

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/enrollments` | Bearer | Enrol in a domain |
| `GET` | `/enrollments` | Bearer | List learner's enrollments |
| `GET` | `/enrollments/:id/roadmap` | Bearer | Get personalised DAG roadmap |
| `GET` | `/enrollments/:id/branches` | Bearer | List available branch paths |
| `POST` | `/enrollments/:id/branch` | Bearer | Select or change branch path |

**Quizzes & Progress**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/nodes/:id/quiz` | Bearer | Get (or generate) quiz for a node |
| `POST` | `/nodes/:id/quiz/attempt` | Bearer | Submit quiz attempt |
| `GET` | `/nodes/:id/quiz/history` | Bearer | Quiz attempt history |
| `GET` | `/nodes/:id/progress` | Bearer | Get node mastery state |

**Resources**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/nodes/:id/resources` | Bearer | List resources for node |
| `POST` | `/nodes/:id/resources/discover` | Bearer | Trigger SERP resource discovery |
| `POST` | `/resources/:id/rate` | Bearer | Rate a resource |

**Domain Expert**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/instructor/learners` | Domain Expert | List enrolled learners |
| `GET` | `/instructor/learners/:id/progress` | Domain Expert | Per-learner node progress |
| `GET` | `/instructor/learners/:id/quiz-history` | Domain Expert | Learner quiz history |
| `GET` | `/instructor/domains/:domainId/analytics` | Domain Expert | Mastery rate chart data |
| `GET` | `/instructor/flagged` | Domain Expert | Flagged adaptation events |
| `PATCH` | `/instructor/flagged/:id/resolve` | Domain Expert | Resolve flagged event |

**Notifications**

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Bearer | List notifications |
| `PATCH` | `/notifications/:id/read` | Bearer | Mark as read |
| `PATCH` | `/notifications/read-all` | Bearer | Mark all read |

### ai-service (:3002)

| Method | Path | Description |
|---|---|---|
| `POST` | `/ai/explain` | Generate explanation for a node |
| `POST` | `/ai/quiz` | Generate quiz questions for a node |
| `POST` | `/ai/micro-quiz` | Generate 3-question decay micro-quiz |
| `GET` | `/ai/health` | Circuit breaker status + cache stats |

---

## Getting Started

### Prerequisites

- Docker ≥ 24 and Docker Compose v2
- Node.js 20 (for local frontend development)
- Ollama running locally (primary AI inference)
- A SERP API key (resource discovery)
- (Optional) A Google Gemini API key (AI fallback)

### 1. Clone and configure

```bash
git clone https://github.com/YegetaTaye/atlas.git
cd atlas/backend
cp .env.example .env
# Fill in GEMINI_API_KEY, SERPER_API_KEY, JWT_SECRET, etc.
```

### 2. Start the backend

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL, Redis, api-gateway, learning-service, ai-service, and Nginx.

### 3. Run database migrations and seed

```bash
# Migrations are applied automatically on container start via Prisma
# To seed all domains and ontologies:
docker compose exec learning-service npx prisma db seed
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

The Vite dev server proxies all `/api/v1/` requests to the Nginx reverse proxy on port 8080.

### Service ports

| Service | Host Port |
|---|---|
| Nginx (API + static) | 8080 |
| api-gateway | 3000 |
| learning-service | 3001 |
| ai-service | 3002 |
| PostgreSQL | 5433 |
| Redis | 6380 |

---

## Environment Variables

### api-gateway / learning-service

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/learner_roadmap
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-here
AI_SERVICE_URL=http://ai-service:3002
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### ai-service

```env
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434    # Primary AI inference
SERPER_API_KEY=your-serper-api-key        # SERP resource discovery
GEMINI_API_KEY=your-gemini-api-key        # Fallback AI (optional)
REDIS_URL=redis://redis:6379
```

---

## Seeding the Database

The seed pipeline in `backend/services/learning-service/prisma/seeds/` loads all initial data:

| File | Contents |
|---|---|
| `001_domains.ts` | 4 domains: Frontend, Backend, Data Science, DevOps Engineering |
| `002_frontend_ontology.ts` | ~30 nodes for Frontend Development (published) |
| `003_frontend_quizzes.ts` | Manually authored quiz questions for frontend nodes |
| `004_challenge_projects.ts` | Challenge project prompts per node |
| `005_domain_whitelist.ts` | Allowed domain slugs for SERP queries |
| `006_manual_resources.ts` | Curated initial resources per node |
| `007_backend_ontology.ts` | 30 nodes for Backend Development (published) |
| `008_data_science_ontology.ts` | 19 nodes for Data Science (published) |
| `009_devops_ontology.ts` | 16 nodes for DevOps Engineering (published) |

Run with:

```bash
docker compose exec learning-service npx prisma db seed
```

All ontology seeds are idempotent — re-running skips already-seeded versions.

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | JWT authentication |
| `/register` | Register | Account creation with role selection |
| `/dashboard` | Dashboard | Enrolled courses, progress overview |
| `/catalog` | Catalog | Domain browser with enrolment sheet |
| `/enrollments/:id/roadmap` | Roadmap | Interactive DAG with mastery badges |
| `/enrollments/:id/learn/:nodeId` | Learn | AI explanation + inline quiz |
| `/enrollments/:id/resources/:nodeId` | Resources | SERP-discovered resources with ratings |
| `/enrollments/:id/quiz-history` | Quiz History | Attempt table with scores and outcomes |
| `/profile` | Profile | Edit name, avatar, preferred language |
| `/settings` | Settings | Password change, learning defaults, danger zone |
| `/notifications` | Notifications | In-app notification centre |
| `/admin/*` | Admin | Stats, user management, domain & ontology management |
| `/instructor/*` | Domain Expert | Learner cohort, analytics, flagged events |

### My Learning (sidebar)

After a learner generates their first AI explanation, the course is added to a persistent **My Learning** section in the global sidebar, powered by Zustand's `persist` middleware (`localStorage`). It highlights the active course and remembers the last-visited node so learners can resume instantly.

---

## Admin & Domain Expert Panels

### Admin — Ontology Builder

Admins access `/admin/domains`, expand any domain, and click **Open** on an ontology version to enter the React Flow canvas editor.

**Canvas interactions:**
- Nodes are auto-laid-out into a readable DAG hierarchy on first open (topological level layout)
- Drag nodes to set positions (saved on drag-stop)
- Click a node → Edit panel slides in from the right with all current values pre-filled
- Right-click canvas → Add new node dialog (title, slug, description, learning outcomes, branch path)
- Draw edges between nodes to set prerequisites (cycle detection prevents invalid DAGs)
- Click an edge → confirm dialog to delete the prerequisite

**Version pipeline:**
Creating a new version copies all nodes and edges from the latest published version — so edits start from the known-good state, not a blank canvas. Versions flow through `draft → in_review → verified → published`.

**Validation:**
The **Validate DAG** button runs server-side checks for: self-referencing nodes, cycles, and orphan nodes (unreachable from any root).

### Domain Expert — Analytics

Domain experts see per-domain mastery rate bar charts with colour-coded thresholds (green ≥ 70%, amber ≥ 40%, red < 40%), problem node lists, enrollment counts, and a resolution workflow for flagged adaptation events.

---

## Flutter Mobile App

The Flutter mobile app is implemented in [`/flutter_mobile`](flutter_mobile/). A phase-by-phase implementation plan is documented in [`docs/frontend-mobile/`](docs/frontend-mobile/), covering 10 phases from scaffold through polish and CI/CD:

| Phase | Focus |
|---|---|
| 0 | Architecture overview, tech stack decisions |
| 1 | Project scaffold, routing, theme, auth state |
| 2 | Authentication screens |
| 3 | Catalog and enrolment |
| 4 | Roadmap DAG with `graphview` |
| 5 | Learn screen + AI explanation |
| 6 | Quiz flow + outcome screen |
| 7 | Resources, knowledge decay, notifications |
| 8 | Branching, profile, settings |
| 9 | Instructor & admin panels |
| 10 | Polish, widget tests, CI/CD (GitHub Actions) |

The Flutter app uses **Riverpod** for state management, **go_router** for navigation, **Dio** for HTTP, and **flutter_secure_storage** for token persistence.

---

## Roadmap

- [x] 4 domain ontologies (Frontend, Backend, Data Science, DevOps)
- [x] AI explanation + quiz generation with caching and circuit breaker
- [x] Gatekeeper 5-tier scoring and node unlocking
- [x] Knowledge decay tracking and micro-quiz reminders
- [x] Path branching and convergence
- [x] SERP resource discovery and resource adaptation
- [x] Domain expert analytics dashboard
- [x] Admin ontology builder (React Flow canvas, version pipeline)
- [x] My Learning persistent sidebar
- [x] In-app notification system
- [x] Flutter mobile app (see [`/flutter_mobile`](flutter_mobile/))
- [ ] WebSocket real-time notifications
- [ ] Export progress report (PDF)
- [ ] LTI integration for institutional use
- [ ] Multi-language AI explanations (ISO 639-1 preferred language)

---

## License

This project was developed as a final-year project. All rights reserved.
