# Phase 9: Multi-Path Branching Logic

**Depends on:** [Phase 8: Mastery Decay](08-decay.md)  
**Next phase:** [Phase 10: Admin & Instructor](10-admin.md)

---

## What to Build

Branching point detection in the DAG. Choice presentation API (at branching nodes). Path selection and roadmap filtering. Reconvergence point handling. Path switching with prerequisite validation.

All branching logic lives in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
├── branching/
│   ├── branching.routes.ts        # GET /branching-points, POST /select-path, GET /available-paths
│   ├── branching.controller.ts
│   ├── branching.service.ts       # Path logic, validation, roadmap filtering
│   ├── branching.validation.ts
│   ├── branching.service.test.ts  # Unit tests
│   └── branching.test.ts          # Integration tests
```

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/v1/enrollments/:id/branching-points | Yes | Learner | Get reachable branching points and their options |
| GET | /api/v1/enrollments/:id/available-paths | Yes | Learner | Get available paths with descriptions and node counts |
| POST | /api/v1/enrollments/:id/select-path | Yes | Learner | Select a branch path (frontend/backend/data_science) |
| GET | /api/v1/enrollments/:id/roadmap | Yes | Learner | Updated: filters DAG to show only selected path + shared nodes |
| POST | /api/v1/enrollments/:id/switch-path | Yes | Learner | Switch to a different path (with prerequisite validation) |

---

## Business Logic

### Branching Point Detection

- Query nodes where `is_branching_point = true` in the enrolled ontology.
- For each branching point, group downstream nodes by `branch_path`.
- Return: branching point node + available paths with metadata (node count, estimated hours, description).

### Path Selection

1. Validate learner has completed all prerequisites up to the branching point.
2. Update `enrollments.selected_branch_path`.
3. Update `learner_node_progress`:
   - Nodes belonging to the selected path: keep `unlocked` logic active.
   - Nodes belonging to OTHER paths: set a `hidden` flag or exclude from roadmap queries.
   - Convergence point nodes (`is_convergence_point = true`): always visible regardless of path.

### Path Switching

1. Validate new path's prerequisites against learner's current progress.
2. If met: update `selected_branch_path`, re-show new path nodes, hide old path nodes.
3. If not met: return 400 with list of unmet prerequisites.

### Roadmap Filtering

- The `/roadmap` endpoint (from Phase 5) is updated to respect the selected path.
- Returns: shared foundational nodes + selected path nodes + convergence nodes.
- Nodes from unselected paths are excluded.

---

## Tests to Write

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

---

## Definition of Done

- [ ] Branching points detected correctly from ontology
- [ ] Path selection filters the roadmap to show only relevant nodes
- [ ] Convergence nodes always included regardless of path
- [ ] Path switching validates prerequisites and updates roadmap
- [ ] All tests pass
