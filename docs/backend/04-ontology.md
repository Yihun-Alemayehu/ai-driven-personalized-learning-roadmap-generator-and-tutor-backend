# Phase 4: Ontology Service (Knowledge Graph / DAG)

**Depends on:** [Phase 3: Authentication](03-auth.md)  
**Next phase:** [Phase 5: Learner & Enrollment](05-enrollment.md)

---

## What to Build

CRUD APIs for domains, ontology versions, learning nodes, and prerequisite edges. DAG validation (acyclicity check, orphan detection). Ontology versioning and expert verification workflow. Seed data for the pilot "Frontend Development" domain.

All ontology logic lives in the **learning-service**.

---

## Files and Folders

```
services/learning-service/src/modules/
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

services/learning-service/prisma/
├── seeds/
│   ├── 001_domains.ts             # Frontend, Backend, Data Science domains
│   └── 002_frontend_ontology.ts   # ~40 nodes for Frontend Development pilot
```

---

## API Endpoints

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

---

## DAG Utilities (`dag.utils.ts`)

- `detectCycle(nodes, edges)` → returns `{hasCycle: boolean, cycleNodes?: string[]}`
- `topologicalSort(nodes, edges)` → returns ordered node list or throws if cyclic
- `findRootNodes(nodes, edges)` → nodes with no prerequisites (entry points)
- `findLeafNodes(nodes, edges)` → nodes with no dependents (terminal nodes)
- `findOrphanNodes(nodes, edges)` → nodes unreachable from any root
- `getPrerequisiteChain(nodeId, edges)` → all transitive prerequisites
- `getDependentChain(nodeId, edges)` → all transitive dependents
- `validateDAG(nodes, edges)` → returns a report: `{valid: boolean, issues: string[]}`

---

## Seed Data: Frontend Development Pilot (~40 nodes)

The seed creates a published ontology with nodes such as:
- HTML Fundamentals → CSS Fundamentals → CSS Layout (Flexbox, Grid) → Responsive Design
- JavaScript Fundamentals → JS ES6+ Features → DOM Manipulation → Async JavaScript
- React Fundamentals → React Hooks → State Management → Advanced React Patterns
- Frontend Testing → Build Tools → Performance Optimization → Full-Stack Integration (convergence point)

Each node includes: title, slug, description, learning_outcomes (3-5 items), estimated_hours, difficulty_level. Prerequisite edges encode the DAG structure.

---

## Tests to Write

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

---

## Definition of Done

- [ ] All CRUD endpoints for domains, ontologies, nodes, and edges work
- [ ] DAG validation correctly detects cycles, orphans, and structural issues
- [ ] Ontology versioning workflow (draft → published) enforced
- [ ] Seed data for Frontend Development pilot loads and validates
- [ ] Topological sort returns correct ordering for the pilot DAG
- [ ] All tests pass
- [ ] GET /ontologies/:id/graph returns a complete, valid DAG structure
