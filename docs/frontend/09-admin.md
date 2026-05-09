# Phase 9: Admin Panel & Ontology Builder

**Depends on:** [Phase 8: Instructor Dashboard](08-instructor.md)  
**Next phase:** [Phase 10: Polish, Tests & CI](10-polish-ci.md)

---

## What to Build

The admin-only section with four areas:
1. **User Management** — list, search, change roles, delete users
2. **System Statistics** — global KPI dashboard
3. **Domain Management** — create and edit domains
4. **Ontology Builder** — the most complex admin UI: a React Flow canvas in edit mode for building the learning node DAG, adding prerequisites, configuring branching, and publishing ontology versions

---

## API Endpoints Used

### User Management (api-gateway)
| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/admin/users` | `?role=&limit=&offset=` |
| `PATCH` | `/api/v1/admin/users/:id/role` | `{role}` |
| `DELETE` | `/api/v1/admin/users/:id` | Permanent delete |

### System Stats (learning-service)
| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/admin/stats` | User counts, enrollment, avg scores |
| `GET` | `/api/v1/admin/stats/domains` | Per-domain enrollment + completion |

### Domains + Ontology (learning-service)
| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/v1/domains` | Create domain |
| `PATCH` | `/api/v1/domains/:id` | Update domain |
| `POST` | `/api/v1/domains/:domainId/ontologies` | Create new ontology version (draft) |
| `GET` | `/api/v1/domains/:domainId/ontologies` | List versions |
| `GET` | `/api/v1/ontologies/:id` | Get version with nodes + edges |
| `PATCH` | `/api/v1/ontologies/:id/status` | `{status}` — draft→in_review→verified→published |
| `POST` | `/api/v1/ontologies/:ontologyId/nodes` | Add node to draft |
| `PATCH` | `/api/v1/nodes/:id` | Update node |
| `DELETE` | `/api/v1/nodes/:id` | Remove node from draft |
| `POST` | `/api/v1/nodes/:nodeId/prerequisites` | Add edge |
| `DELETE` | `/api/v1/prerequisites/:id` | Remove edge |
| `GET` | `/api/v1/ontologies/:id/validate` | DAG validation (cycle check etc.) |

---

## File & Folder Structure

```
src/
├── api/
│   └── admin.ts                   # All admin query/mutation hooks
├── features/admin/
│   ├── AdminLayout.tsx            # Admin sidebar navigation
│   ├── SystemStatsPage.tsx        # KPI cards + domain stats table
│   ├── UserManagementPage.tsx     # User table with role editor + delete
│   ├── DomainManagementPage.tsx   # Domain list + create/edit
│   ├── OntologyBuilderPage.tsx    # React Flow edit canvas
│   └── components/
│       ├── UserTable.tsx          # Users DataTable with inline role selector
│       ├── RoleChangeDialog.tsx   # Confirm role change
│       ├── DeleteUserDialog.tsx   # Confirm delete
│       ├── StatCard.tsx           # KPI card: icon + number + label
│       ├── DomainForm.tsx         # Create/edit domain form (Sheet)
│       ├── OntologyVersionList.tsx  # Accordion: ontology versions per domain
│       ├── OntologyStatusBadge.tsx  # draft / in_review / verified / published chip
│       ├── NodeEditPanel.tsx      # Drawer: edit selected node properties
│       ├── AddNodeDialog.tsx      # Form to add new node
│       └── ValidationResultBanner.tsx  # Show DAG validation errors
```

---

## Key Implementation Details

### `SystemStatsPage.tsx` Layout
```
┌─────────────────────────────────────────────────────────┐
│  System Overview                                        │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │👥 1,240  │ │📚  892   │ │🎯  68%   │ │📊  3.8   │  │
│  │ Users    │ │Enrollments│ │Avg Mastery│ │Avg Score │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  Domain Stats Table                                     │
│  Domain       Enrollments  Avg Completion  Avg Score    │
│  Web Dev      340          72%            81%           │
│  Python       280          65%            74%           │
└─────────────────────────────────────────────────────────┘
```

### `UserManagementPage.tsx` Layout
```
┌──────────────────────────────────────────────────────────┐
│  Users                       [Search] [Filter by role ▾] │
│                                                          │
│  Name       Email        Role      Joined    Actions     │
│  ────────────────────────────────────────────────────── │
│  Alice      alice@...    learner   Jan 2026  [⚙ Role][🗑] │
│  Bob         bob@...     instructor Feb 2026  [⚙ Role][🗑] │
│                                                          │
│                                        [← 1 2 3 →]      │
└──────────────────────────────────────────────────────────┘
```

Role change → `RoleChangeDialog` with confirmation (shows current + new role).  
Delete → `DeleteUserDialog` with "This cannot be undone" warning.

### `DomainManagementPage.tsx`
```
┌────────────────────────────────────────────┐
│  Domains                [+ Create Domain]  │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ 📦 Web Development                  │  │
│  │ Ontologies: v1 (published), v2 (draft) │
│  │ [Edit Domain] [Manage Ontology]     │   │
│  └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

`DomainForm` (shadcn Sheet): `name`, `description`, `iconUrl` fields.  
"Manage Ontology" → navigates to `OntologyBuilderPage` with correct domainId.

### `OntologyBuilderPage.tsx` — the most complex admin UI

**Concept:** React Flow canvas in edit mode. Admin can:
- View existing nodes as draggable cards
- Right-click empty space → "Add Node" dialog
- Click a node → opens `NodeEditPanel` (drawer) to edit title, description, outcomes, difficulty, branchPath
- Drag from one node's handle to another → creates prerequisite edge
- Click an edge → delete it
- Run validation → see errors (cycles, disconnected nodes)
- Promote ontology version through status pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Domain   Web Development — Ontology v2 (draft)              │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [+ Add Node]  [Validate DAG]  Status: [draft ▾]  [Publish →]  │
│                                                                 │
│  ┌ ReactFlow Canvas ──────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   [Intro HTML]──→[HTML Forms]──→[CSS Basics]              │ │
│  │                        │                                  │ │
│  │                        ↓                                  │ │
│  │                   [JS Basics]──→[JS Functions]            │ │
│  │                        │                                  │ │
│  │                    [🔀 Branch]                            │ │
│  │                   ↙     ↓     ↘                           │ │
│  │           [React] [Node.js] [Pandas]                      │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────── ┘ │
│                                                                 │
│  Validation Banner (when run):                                  │
│  ✓ No cycles detected  ✓ All nodes reachable  ⚠ 2 isolated nodes│
└─────────────────────────────────────────────────────────────────┘
```

#### Node edit mode custom node type `editableNode`
Adds a delete button overlay and edge handle connectors on all sides.

#### Status pipeline
```
draft → in_review → verified → published → archived
```
Each transition is a button ("Submit for Review" / "Verify" / "Publish").  
Published ontology is immediately used for new enrollments.

#### `NodeEditPanel.tsx` (Sheet — right side)
```
Fields:
  Title *
  Slug (auto-generated from title, editable)
  Description (textarea)
  Learning Outcomes (tag input — add/remove strings)
  Estimated Hours (number)
  Difficulty Level (1-5 slider)
  Is Branching Point (toggle)
  Is Convergence Point (toggle)
  Branch Path (select: none / frontend / backend / data_science)
  
  [Save]  [Delete Node]
```

#### `AddNodeDialog.tsx`
Quick form: just Title + Description + BranchPath → calls `POST /ontologies/:id/nodes` → new node appears on canvas at a default position.

#### Auto-save positions
On node drag end in React Flow → debounced `PATCH /nodes/:id` with new `positionX/positionY`.

---

## Domain Whitelist Management
```
src/features/admin/DomainWhitelistPage.tsx

Accessible from domain detail admin view:
  ┌───────────────────────────────────────┐
  │  Allowed Resource Sources             │
  │  [+ Add Source]                       │
  │                                       │
  │  youtube.com      video    [Delete]   │
  │  mdn.mozilla.org  docs     [Delete]   │
  └───────────────────────────────────────┘
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| SystemStatsPage — renders | 4 stat cards with correct labels |
| UserManagementPage — role change | Calls PATCH /admin/users/:id/role; row updates |
| UserManagementPage — delete | Delete dialog appears; on confirm calls DELETE |
| UserManagementPage — self-delete blocked | Admin cannot delete their own account |
| DomainForm — create | POST /domains called; new domain appears in list |
| OntologyBuilder — add node | POST /ontologies/:id/nodes; node appears on canvas |
| OntologyBuilder — add edge | POST /nodes/:id/prerequisites; edge appears |
| OntologyBuilder — delete edge | DELETE /prerequisites/:id; edge removed |
| OntologyBuilder — validate | GET /ontologies/:id/validate; results banner shown |
| OntologyBuilder — status transition | PATCH /ontologies/:id/status; badge updates |
| RoleGuard admin routes | Instructor accessing /admin → redirect |

---

## Definition of Done

- [ ] System stats page shows accurate KPIs from API
- [ ] User table shows all users; search filters by name/email
- [ ] Role change dialog updates role; table row reflects new role immediately
- [ ] Delete user requires confirmation; updates table on success
- [ ] Domain list with create and edit working
- [ ] Ontology builder loads existing nodes/edges on React Flow canvas
- [ ] Dragging new connection between two nodes creates a prerequisite
- [ ] Clicking edge shows delete handle; deleting removes prerequisite
- [ ] Node edit panel saves title, description, outcomes, difficulty, branch config
- [ ] Status pipeline buttons work; badge shows current status
- [ ] DAG validation banner shows cycle/disconnected errors
- [ ] Non-admin roles cannot access any `/admin/*` route
