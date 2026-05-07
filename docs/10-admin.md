# Phase 10: Admin and Instructor Management APIs

**Depends on:** [Phase 9: Multi-Path Branching](09-branching.md)  
**Next phase:** [Phase 11: AI/Gemini Integration](11-ai-gemini.md)

---

## What to Build

Admin endpoints for user management, system configuration, and analytics. Instructor endpoints for learner progress visibility, flagged nodes, and class management.

Admin routes live in the **api-gateway** (user management) and **learning-service** (analytics, flagged nodes). Instructor routes live in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
├── admin/
│   ├── admin.routes.ts            # System stats, config, adaptation events, flagged nodes
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   └── admin.test.ts
├── instructor/
│   ├── instructor.routes.ts       # Learner progress views, flagged nodes, class analytics
│   ├── instructor.controller.ts
│   ├── instructor.service.ts
│   └── instructor.test.ts
```

User management admin routes (list users, change role, delete user) remain in **api-gateway** (already scaffolded in Phase 3).

---

## API Endpoints — Admin

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/admin/users | Yes | Admin | List all users (paginated, filterable by role) |
| PATCH | /api/v1/admin/users/:id/role | Yes | Admin | Change user role |
| DELETE | /api/v1/admin/users/:id | Yes | Admin | Deactivate/delete user |
| GET | /api/v1/admin/stats | Yes | Admin | System-wide statistics (users, enrollments, quiz attempts, avg scores) |
| GET | /api/v1/admin/stats/domains | Yes | Admin | Per-domain statistics (enrollments, completion rates, avg quiz scores) |
| GET | /api/v1/admin/adaptation-events | Yes | Admin | List all adaptation events (filterable by type, date range) |
| GET | /api/v1/admin/flagged-nodes | Yes | Admin | Nodes flagged for instructor review (fail_severe events) |

---

## API Endpoints — Instructor

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/instructor/learners | Yes | Instructor | List learners (can filter by domain, enrollment status) |
| GET | /api/v1/instructor/learners/:userId/progress | Yes | Instructor | View specific learner's full progress |
| GET | /api/v1/instructor/learners/:userId/quiz-history | Yes | Instructor | View learner's quiz attempt history |
| GET | /api/v1/instructor/domains/:domainId/analytics | Yes | Instructor | Domain analytics: avg completion, problematic nodes, dropout points |
| GET | /api/v1/instructor/flagged | Yes | Instructor | Nodes flagged for review (escalated by Gatekeeper) |
| PATCH | /api/v1/instructor/flagged/:eventId/resolve | Yes | Instructor | Mark flagged event as resolved with notes |

---

## Tests to Write

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

---

## Definition of Done

- [ ] Admin can manage users, view system stats, and see flagged nodes
- [ ] Instructor can view learner progress, quiz history, and domain analytics
- [ ] Flagged node workflow (escalation → resolution) works end-to-end
- [ ] RBAC correctly restricts all endpoints
- [ ] All tests pass
