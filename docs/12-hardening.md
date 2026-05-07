# Phase 12: API Hardening, Documentation, and Final CI/CD

**Depends on:** [Phase 11: AI/Gemini Integration](11-ai-gemini.md)  
**Next phase:** — (final phase)

---

## What to Build

Security hardening, input sanitization, comprehensive OpenAPI documentation audit, performance optimization, final CI/CD pipeline, and production readiness.

---

## Security Hardening

```
services/*/src/middleware/
├── helmet.ts                      # HTTP security headers (helmet.js)
├── cors.ts                        # CORS configuration (whitelist origins)
├── inputSanitizer.ts              # Sanitize all string inputs (XSS prevention)
├── sqlInjectionGuard.ts           # Parameterized queries audit (Prisma handles this by default)
```

**Security Checklist:**
- [ ] All endpoints validate input with Joi schemas (already done per phase, but audit for gaps)
- [ ] All database queries use parameterized queries — Prisma does this by default, audit any raw queries via `$queryRaw`
- [ ] Rate limiting on all endpoints, stricter on auth endpoints
- [ ] CORS whitelist configured (frontend origins only)
- [ ] Helmet.js for security headers (CSP, X-Frame-Options, etc.)
- [ ] All secrets loaded from environment variables (no hardcoded keys)
- [ ] JWT tokens httpOnly, secure, SameSite
- [ ] User input sanitized against XSS (DOMPurify on any user-generated text)
- [ ] No raw SQL with string interpolation
- [ ] Sensitive data encrypted at rest (DB-level encryption or column-level for PII)
- [ ] Error responses never leak stack traces or internal details in production

---

## API Documentation (Swagger — audit and finalize)

Swagger was set up in Phase 1 and annotations have been added incrementally with each route file since Phase 3. This phase audits completeness and generates the final spec.

```
services/*/src/docs/
└── swagger.ts                     # swagger-jsdoc + swagger-ui-express setup (exists from Phase 1)
```

- Audit: every endpoint documented with description, request/response schemas, auth requirements, error codes.
- Swagger UI served at `/api/docs` per service in development.
- Generated `openapi.yaml` per service committed to repo for CI validation.

---

## Performance Optimization

- [ ] Redis caching for: ontology graph (TTL: 1 hour), learner progress (TTL: 5 min), PSE results (TTL: 24 hours), AI-generated content (TTL: 7 days)
- [ ] Database query optimization: EXPLAIN ANALYZE on all major queries; add missing indexes
- [ ] Connection pooling: pg-pool configured with appropriate pool size
- [ ] Response compression: gzip/brotli middleware
- [ ] Pagination on all list endpoints (cursor-based or offset-based)
- [ ] API response time target: <500ms (p95) for non-AI endpoints

---

## Final CI/CD Pipeline

```
.github/workflows/
├── ci.yml                         # Lint → Build → Test (on every push/PR)
└── deploy.yml                     # Build Docker image → Push to registry → Deploy (on merge to main)
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

---

## Load Testing

- Use `k6` or `artillery` to simulate 1000 concurrent users.
- Target endpoints: health, roadmap, quiz attempt, resource fetch.
- Verify: API response <500ms (p95), no 5xx errors, DB connections don't exhaust pool.

---

## Tests to Write

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

---

## Definition of Done

- [ ] Security audit checklist all green
- [ ] OpenAPI documentation covers all endpoints; Swagger UI accessible
- [ ] Redis caching applied to all high-frequency reads
- [ ] p95 response time < 500ms under load (1000 concurrent users)
- [ ] CI pipeline runs on every push: lint → build → test → coverage
- [ ] Deploy pipeline builds and pushes Docker image
- [ ] Staging deployment works end-to-end
- [ ] Load test report generated and reviewed
- [ ] All tests pass (unit + integration + load)
