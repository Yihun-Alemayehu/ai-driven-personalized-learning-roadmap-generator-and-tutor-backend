# Phase 1: Project Scaffold and Infrastructure

**Depends on:** nothing  
**Next phase:** [Phase 2: Database Schema](02-schema.md)

---

## What to Build

Stand up the 3-service Node.js + Express + TypeScript backend with Docker-based local development, PostgreSQL, Redis, reverse proxy, Swagger docs, and a CI pipeline.

---

## Files and Folders

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
│   │   │   ├── schema.prisma          # Prisma schema (all models — placeholder in Phase 1)
│   │   │   └── seed.ts                # Database seeding script (placeholder in Phase 1)
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

---

## Key Decisions

- **ORM**: Prisma — type-safe ORM with auto-generated client, declarative schema, built-in migrations. Prisma schema lives in learning-service; api-gateway imports the generated client.
- **Validation**: Joi for all request body/param validation across services.
- **API Versioning**: All routes under `/api/v1/` from day one.
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express) set up in Phase 1 for each service. Each route file includes JSDoc Swagger annotations as it's built — docs are incremental, not bolted on at the end. Swagger UI served at `/api/docs` per service.
- **Testing**: Jest + Supertest for integration tests against a real Dockerized Postgres (no mocks for DB).
- **Logging**: Pino (structured JSON logging).

---

## Tests to Write

| Test | Asserts |
|------|---------|
| `GET /api/v1/health` returns 200 | Response includes `{ status: "ok", db: "connected", redis: "connected" }` |
| Health endpoint returns 503 when DB is down | Simulated DB disconnect returns 503 |
| Rate limiter blocks excessive requests | 101st request within window returns 429 |

---

## Definition of Done

- [ ] `docker-compose up` starts all 5 containers (api-gateway, learning-service, ai-service, postgres, redis) — all healthy
- [ ] `GET /api/v1/health` on each service returns 200 with DB and Redis status
- [ ] Swagger UI accessible at `/api/docs` on each service
- [ ] `npm run lint` passes with zero warnings across all services
- [ ] `npm run build` compiles TypeScript without errors across all services
- [ ] `npm test` passes all health endpoint tests against real Postgres/Redis
- [ ] GitHub Actions CI runs lint → build → test on push (using service containers for Postgres/Redis)
