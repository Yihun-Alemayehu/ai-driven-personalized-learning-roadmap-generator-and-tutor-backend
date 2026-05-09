# Phase 8: Mastery Decay and Spaced Repetition Engine

**Depends on:** [Phase 7: Resource Service](07-resources.md)  
**Next phase:** [Phase 9: Multi-Path Branching](09-branching.md)

---

## What to Build

Decay state computation based on time since last review. Scheduled job (cron) to scan mastered nodes and transition states. Micro-quiz generation triggers. Notification creation for decay reminders. Timer reset on successful micro-quiz.

All decay logic lives in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
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

---

## Decay Rules

See [shared concepts](00-shared-concepts.md#mastery-decay-thresholds) for threshold values.

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

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/enrollments/:id/decay-status | Yes | Learner | Get decay state for all mastered nodes |
| POST | /api/v1/nodes/:nodeId/micro-quiz | Yes | Learner | Get micro-quiz for a decayed node |
| POST | /api/v1/micro-quizzes/:quizId/attempt | Yes | Learner | Submit micro-quiz answers |
| GET | /api/v1/notifications | Yes | Any | Get my notifications (paginated, filterable) |
| PATCH | /api/v1/notifications/:id/read | Yes | Any | Mark notification as read |
| PATCH | /api/v1/notifications/read-all | Yes | Any | Mark all notifications as read |

---

## Scheduler

- **Technology**: `node-cron` or `bull` queue with repeating job.
- **Frequency**: Runs every 6 hours.
- **Logic per run**:
  1. Query all `learner_node_progress` where `mastery_state = 'mastered'`.
  2. For each, compute days since `last_reviewed_at`.
  3. If marginal_pass node (flagged) and days > 7 → transition to `review_needed`.
  4. If strong_pass node and days > 14 → transition to `review_needed`.
  5. If any node in `review_needed` and days > 30 → transition to `relearn`.
  6. Create notifications for transitioned nodes (deduplicate: don't re-notify within 24 hours).

---

## Tests to Write

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

---

## Definition of Done

- [ ] Decay computation correctly transitions mastered → review_needed → relearn
- [ ] Marginal pass uses 7-day threshold; strong pass uses 14-day threshold
- [ ] Micro-quiz flow works: generate, attempt, score, reset timer or re-lock
- [ ] Re-locking cascades to dependent nodes
- [ ] Scheduler runs on cron, transitions states, creates notifications
- [ ] Notification CRUD works (list, mark read)
- [ ] All tests pass
