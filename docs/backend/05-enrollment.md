# Phase 5: Learner Service and Enrollment

**Depends on:** [Phase 4: Ontology Service](04-ontology.md)  
**Next phase:** [Phase 6: Quiz & Gatekeeper](06-quiz-gatekeeper.md)

---

## What to Build

Enrollment in domains. Automatic initialization of learner node progress for all nodes in the enrolled ontology. Progress tracking (node states, unlock logic). Learner statistics endpoint (dashboard data).

All enrollment and progress logic lives in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
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

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /api/v1/enrollments | Yes | Learner | Enroll in a domain (creates progress rows) |
| GET | /api/v1/enrollments | Yes | Learner | List my enrollments |
| GET | /api/v1/enrollments/:id | Yes | Learner | Get enrollment details |
| DELETE | /api/v1/enrollments/:id | Yes | Learner | Unenroll (soft delete or hard) |
| GET | /api/v1/enrollments/:id/progress | Yes | Learner | Get all node progress for enrollment |
| GET | /api/v1/enrollments/:id/progress/stats | Yes | Learner | Get stats: nodes completed, avg score, time, etc. |
| GET | /api/v1/enrollments/:id/roadmap | Yes | Learner | Get DAG + progress overlay (node states, colors) |

---

## Business Logic

### Enrollment Flow

1. Verify domain has a published ontology.
2. Create enrollment row.
3. For every node in the published ontology, create a `learner_node_progress` row with `mastery_state = 'not_started'`, `unlocked = false`.
4. Identify root nodes (no prerequisites) and set `unlocked = true` for those.

### Unlock Logic

Called after quiz outcomes (built here, invoked from Phase 6):

- A node is unlockable when ALL its prerequisite nodes have `mastery_state IN ('mastered', 'review_needed')`.
- `progress.service.checkAndUnlockNodes(userId, enrollmentId)` — scans progress, unlocks newly eligible nodes.

### Stats Computation

- Total nodes, completed nodes, completion percentage
- Average quiz score (across all attempted nodes)
- Current streak (consecutive days with activity)
- Nodes in each mastery state (for color-coded roadmap)

---

## Tests to Write

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

---

## Definition of Done

- [ ] Enrollment creates progress rows for all ontology nodes
- [ ] Root nodes auto-unlocked; non-root nodes locked
- [ ] Progress and stats endpoints return correct data
- [ ] Roadmap endpoint returns DAG with learner-specific progress overlay
- [ ] Unlock logic correctly evaluates prerequisite mastery
- [ ] All tests pass
