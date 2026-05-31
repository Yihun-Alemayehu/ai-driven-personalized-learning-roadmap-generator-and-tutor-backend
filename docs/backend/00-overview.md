# Backend Overview

This document covers the high-level architecture, service boundaries, and phase sequence for the AI-Driven Personalized Learning Roadmap Generator And Tutor backend.

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

**Service ports:**
- api-gateway: 3000
- learning-service: 3001
- ai-service: 3002

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
