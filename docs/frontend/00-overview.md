# Frontend — Project Overview & Tech Stack

**Backend base URL:** `http://localhost:8080` (via nginx) in dev  
**API services:** api-gateway `:3000`, learning-service `:3001`, ai-service `:3002`

---

## Product Summary

A single-page application for the Learner Roadmap platform. Three distinct user experiences on one codebase:

| Role | Primary Experience |
|------|--------------------|
| **Learner** | Browse domains → Enroll → Navigate roadmap DAG → Take quizzes → Review resources → Manage spaced-repetition |
| **Instructor** | Monitor learner cohort → View progress heatmaps → Resolve flagged nodes → Analyse domain mastery |
| **Admin** | Manage users/roles → Build/publish ontologies → System statistics → Domain config |

---

## Tech Stack Decisions

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | **React 18 + TypeScript** | Component model fits the complex DAG + quiz UI; TypeScript catches API contract mismatches early |
| Build | **Vite** | Fast HMR, native ESM, minimal config |
| Routing | **React Router v6** | Nested layouts, data loaders align with protected-route pattern |
| Server state | **TanStack Query v5** | Stale-while-revalidate, query invalidation after mutations, built-in loading/error states |
| Client state | **Zustand** | Minimal boilerplate for auth tokens + user session; no Redux overhead |
| Styling | **Tailwind CSS v3 + shadcn/ui** | Utility classes; shadcn gives accessible, composable primitives (Dialog, Sheet, Popover, etc.) |
| DAG visualisation | **React Flow v11 (`@xyflow/react`)** | Purpose-built for interactive node graphs; handles the ontology roadmap |
| Charts | **Recharts** | Declarative; works well with Tailwind; sufficient for progress/analytics charts |
| Forms | **React Hook Form + Zod** | Uncontrolled inputs (performance); Zod schema reused from runtime validation |
| HTTP | **Axios** | Interceptors for JWT injection and token-refresh retry |
| Testing | **Vitest + React Testing Library + Playwright** | Unit/integration fast; Playwright for E2E auth + roadmap flows |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/                     # Axios instance + per-feature query/mutation hooks
│   │   ├── client.ts            # Axios instance with interceptors
│   │   ├── auth.ts
│   │   ├── domains.ts
│   │   ├── enrollments.ts
│   │   ├── progress.ts
│   │   ├── quizzes.ts
│   │   ├── resources.ts
│   │   ├── notifications.ts
│   │   ├── decay.ts
│   │   ├── branching.ts
│   │   ├── instructor.ts
│   │   └── admin.ts
│   ├── components/              # Shared UI components
│   │   ├── ui/                  # shadcn/ui generated components
│   │   ├── layout/              # AppShell, Navbar, Sidebar, PageWrapper
│   │   └── common/              # Spinner, EmptyState, ErrorBoundary, ConfirmDialog
│   ├── features/                # Feature-sliced modules
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── roadmap/
│   │   ├── quiz/
│   │   ├── resources/
│   │   ├── notifications/
│   │   ├── decay/
│   │   ├── branching/
│   │   ├── instructor/
│   │   └── admin/
│   ├── hooks/                   # Reusable React hooks
│   ├── lib/                     # Utilities (cn, formatDate, etc.)
│   ├── routes/                  # React Router route definitions + layouts
│   │   ├── index.tsx            # Route tree
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── store/                   # Zustand stores
│   │   └── auth.store.ts
│   ├── types/                   # TypeScript types mirroring backend models
│   │   └── index.ts
│   ├── main.tsx
│   └── App.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Route Map

```
/                          → redirect to /dashboard or /login
/login                     → LoginPage
/register                  → RegisterPage
/auth/callback             → OAuthCallbackPage

/dashboard                 → DashboardPage (enrolled domains + decay alerts)
/catalog                   → DomainCatalogPage
/domains/:slug             → DomainDetailPage
/enrollments/:id/roadmap   → RoadmapPage  ← core experience
/quiz/:quizId              → QuizPage
/attempts/:id              → AttemptReviewPage

/notifications             → NotificationsPage
/profile                   → ProfilePage

/instructor                → InstructorLayout
/instructor/learners       → LearnerListPage
/instructor/learners/:id   → LearnerProgressPage
/instructor/domains/:id/analytics → DomainAnalyticsPage
/instructor/flagged        → FlaggedEventsPage

/admin                     → AdminLayout
/admin/users               → UserManagementPage
/admin/domains             → DomainManagementPage
/admin/domains/:id/ontology → OntologyBuilderPage
/admin/stats               → SystemStatsPage
```

---

## API Integration Pattern

All backend calls go through `src/api/client.ts` (single Axios instance). The API base URL is read from `VITE_API_BASE_URL` (defaults to `http://localhost:3000/api/v1` for the api-gateway). Learning-service endpoints proxied through nginx at `/api/v1/` in production — same base URL.

TanStack Query wraps every API call in a `useQuery` or `useMutation` hook defined in `src/api/`. Components never call Axios directly.

---

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:8080/api/v1   # nginx proxy in dev/prod
VITE_GATEWAY_URL=http://localhost:3000/api/v1    # direct in local dev
VITE_LEARNING_URL=http://localhost:3001/api/v1   # direct in local dev
```

---

## Phase Summary

| Phase | Feature | Key Deliverable |
|-------|---------|-----------------|
| 01 | Scaffold & Layout | Vite project, routing, AppShell, API client |
| 02 | Auth | Login, Register, OAuth, token refresh |
| 03 | Domain Catalog & Enrollment | Domain cards, enroll flow |
| 04 | Roadmap Visualisation | React Flow DAG with mastery-state nodes |
| 05 | Quiz & Gatekeeper | Quiz modal, MCQ flow, outcome screen |
| 06 | Resources & AI Explanation | Resource list, ratings, AI explanation panel |
| 07 | Decay, Notifications & Branching | Notification bell, micro-quiz, path selector |
| 08 | Instructor Dashboard | Learner tables, analytics, flagged event queue |
| 09 | Admin Panel & Ontology Builder | User CRUD, domain CRUD, React Flow edit mode |
| 10 | Polish, Tests & CI | E2E tests, a11y, skeleton states, deploy CI |
