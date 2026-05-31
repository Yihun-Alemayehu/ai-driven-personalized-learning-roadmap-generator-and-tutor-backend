---
name: Backend implementation plan
description: 12-phase sequential backend plan for the AI-Driven Personalized Learning Roadmap Generator And Tutor, saved in BACKEND_PLAN.md at project root
type: project
---

A 12-phase sequential backend implementation plan was created on 2026-05-06 and saved to `/home/yg/dev/fyp/BACKEND_PLAN.md`.

**Why:** The user (Yegeta, AASTU final-year project team) needs a detailed, phase-by-phase backend plan to follow across multiple sessions. Frontend (React, Flutter) is out of scope for now. AI integrations (Gemini, PSE API) are intentionally deferred until after all foundational infrastructure is built.

**How to apply:** At the start of each implementation session, read BACKEND_PLAN.md to determine the current phase. Check the "Definition of Done" for the current phase before moving to the next. Never skip phases — each builds on the previous.

Key tech stack: 3 microservices (api-gateway, learning-service, ai-service), Node.js + Express + TypeScript, PostgreSQL (Prisma ORM), Redis, Docker, Joi validation, Swagger docs, Jest + Supertest, GitHub Actions CI. Updated on 2026-05-06 to replace OpenAI→Gemini, Knex→Prisma, Zod→Joi, add microservices architecture.
