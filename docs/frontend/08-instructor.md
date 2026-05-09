# Phase 8: Instructor Dashboard

**Depends on:** [Phase 7: Decay, Notifications & Branching](07-decay-notifications.md)  
**Next phase:** [Phase 9: Admin Panel & Ontology Builder](09-admin.md)

---

## What to Build

A separate dashboard layout for instructors (and admins viewing in instructor mode). Includes a learner cohort table, individual learner progress trees, quiz history, domain analytics with charts, and a flagged events queue for resolving escalations.

---

## Dependencies to Install

```bash
npm install recharts            # Charts for domain analytics
```

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/instructor/learners` | `?domainId=` optional filter |
| `GET` | `/api/v1/instructor/learners/:userId/progress` | Full node progress for one learner |
| `GET` | `/api/v1/instructor/learners/:userId/quiz-history` | `?limit=20&offset=0` |
| `GET` | `/api/v1/instructor/domains/:domainId/analytics` | Mastery rates, problem nodes |
| `GET` | `/api/v1/instructor/flagged` | Flagged escalation events |
| `PATCH` | `/api/v1/instructor/flagged/:eventId/resolve` | `{resolutionNotes}` |

---

## File & Folder Structure

```
src/
├── api/
│   └── instructor.ts              # All instructor query/mutation hooks
├── features/instructor/
│   ├── InstructorLayout.tsx       # Instructor-specific sidebar navigation
│   ├── LearnerListPage.tsx        # Paginated learner table with search/filter
│   ├── LearnerProgressPage.tsx    # Individual learner: progress tree + quiz history
│   ├── DomainAnalyticsPage.tsx    # Charts: mastery rates, problem nodes
│   ├── FlaggedEventsPage.tsx      # Escalation queue + resolve workflow
│   └── components/
│       ├── LearnerTable.tsx       # DataTable: learner rows with mastery %
│       ├── LearnerProgressTree.tsx  # Node list grouped by mastery state
│       ├── QuizHistoryTable.tsx   # Attempts table: date, score, outcome
│       ├── MasteryRateChart.tsx   # Bar chart: mastery % per node
│       ├── ProblemNodesTable.tsx  # Lowest mastery nodes + avg attempts
│       ├── FlaggedEventCard.tsx   # Event card: node, learner, details
│       └── ResolveDialog.tsx      # Notes input + resolve CTA
```

---

## Key Implementation Details

### `src/api/instructor.ts`
```typescript
export interface LearnerSummary {
  userId: string;
  fullName: string;
  email: string;
  enrollments: { id: string; domain: { name: string }; masteredCount: number; totalNodes: number }[];
}

export interface DomainAnalytics {
  domainId: string;
  domainName: string;
  nodeStats: {
    nodeId: string;
    nodeTitle: string;
    masteryRate: number;       // 0-100
    avgQuizScore: number;
    avgAttempts: number;
  }[];
  problemNodes: {              // lowest mastery rate nodes
    nodeId: string;
    nodeTitle: string;
    masteryRate: number;
    avgAttempts: number;
  }[];
}

export interface FlaggedEvent {
  id: string;
  userId: string;
  nodeId: string;
  adaptationType: 'instructor_escalation';
  details: {
    reason?: string;
    failCount?: number;
    resolved?: boolean;
    resolutionNotes?: string;
  };
  createdAt: string;
  user: { fullName: string; email: string };
  node: { title: string };
}

export const instructorKeys = {
  learners: (domainId?: string) => ['instructor', 'learners', domainId] as const,
  learnerProgress: (userId: string) => ['instructor', 'learners', userId, 'progress'] as const,
  quizHistory: (userId: string) => ['instructor', 'learners', userId, 'quiz-history'] as const,
  analytics: (domainId: string) => ['instructor', 'analytics', domainId] as const,
  flagged: () => ['instructor', 'flagged'] as const,
};

export function useLearnersQuery(domainId?: string) {
  return useQuery({
    queryKey: instructorKeys.learners(domainId),
    queryFn: () =>
      apiClient
        .get<LearnerSummary[]>('/instructor/learners', { params: { domainId } })
        .then((r) => r.data),
  });
}

export function useDomainAnalyticsQuery(domainId: string) {
  return useQuery({
    queryKey: instructorKeys.analytics(domainId),
    queryFn: () =>
      apiClient.get<DomainAnalytics>(`/instructor/domains/${domainId}/analytics`).then((r) => r.data),
    enabled: Boolean(domainId),
  });
}

export function useResolveEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, resolutionNotes }: { eventId: string; resolutionNotes: string }) =>
      apiClient.patch(`/instructor/flagged/${eventId}/resolve`, { resolutionNotes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: instructorKeys.flagged() }),
  });
}
```

### `InstructorLayout.tsx` — sidebar navigation
```
Sidebar links:
  🏠 Overview
  👥 Learners
  📊 Analytics     [domain picker dropdown]
  🚩 Flagged Events [unresolved count badge]
```

RoleGuard protects all `/instructor/*` routes — only `instructor` and `admin` roles can access.

### `LearnerListPage.tsx` Layout
```
┌──────────────────────────────────────────────────────┐
│  Learners                    [Search...] [Filter ▾]  │
│                                                      │
│  Name          Email          Domain      Mastery    │
│  ──────────────────────────────────────────────────  │
│  Alice Smith   alice@...      Web Dev     ████ 67%   │
│  Bob Jones     bob@...        Python      ██░░ 34%   │
│  ...                                                 │
│                                    [← 1 2 3 →]      │
└──────────────────────────────────────────────────────┘
```

Clicking a learner row → `/instructor/learners/:userId`.

Progress bar = mastered nodes / total nodes for the enrolled domain.

### `LearnerProgressPage.tsx` Layout
```
┌────────────────────────────────────────────┐
│  ← Back    Alice Smith — Web Development   │
│                                            │
│  [Progress Tree tab] [Quiz History tab]    │
│  ───────────────────────────────────────  │
│                                            │
│  Progress Tree tab:                        │
│  Mastered (12)         In Progress (3)     │
│  ✓ Intro to HTML       ◐ CSS Flexbox       │
│  ✓ HTML Forms          ◐ JS Functions      │
│  ...                   ...                 │
│                                            │
│  Review Needed (2)     Not Started (30)    │
│  ⚠ JS Closures         ○ React             │
│  ...                   ...                 │
│                                            │
│  Quiz History tab:                         │
│  Date         Node          Score  Outcome │
│  2026-05-01  Intro HTML    92%   strong   │
│  2026-04-28  HTML Forms    78%   marginal │
└────────────────────────────────────────────┘
```

### `DomainAnalyticsPage.tsx` Layout
```
┌────────────────────────────────────────────────────┐
│  Web Development Analytics  [domain picker]        │
│                                                    │
│  Mastery Rate by Node                              │
│  ┌────────────────────────────────────────────┐   │
│  │  Intro HTML  ████████████████████  95%     │   │
│  │  HTML Forms  ████████████████░░░  82%      │   │
│  │  CSS Basics  ████████████░░░░░░░  68%      │   │
│  │  JS Closures ████░░░░░░░░░░░░░░░  32% ⚠   │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ⚠ Problem Nodes (lowest mastery)                 │
│  Node           Mastery  Avg Attempts  Avg Score   │
│  JS Closures    32%      4.2           54%         │
│  Async/Await    41%      3.8           61%         │
└────────────────────────────────────────────────────┘
```

Recharts `BarChart` for mastery rate per node (sorted ascending). Problem nodes highlighted in red.

### `FlaggedEventsPage.tsx` Layout
```
┌───────────────────────────────────────────────────────┐
│  Flagged Events (3 unresolved)                        │
│  [All] [Unresolved] [Resolved]                        │
│  ─────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 🚩 Bob Jones — JS Closures            1 day ago │ │
│  │  Failed 3 consecutive times (avg 38%)            │ │
│  │  [View Progress]   [Resolve]                     │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ ✓ Alice Smith — Async/Await         RESOLVED    │ │
│  │  "Referred to extra materials"                  │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

`ResolveDialog`:
```
┌──────────────────────────────┐
│  Resolve Flag                │
│  Node: JS Closures           │
│  Learner: Bob Jones          │
│  ──────────────────────────  │
│  Resolution notes:           │
│  [textarea]                  │
│                              │
│  [Cancel]  [Mark Resolved]   │
└──────────────────────────────┘
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| LearnerListPage — renders | Correct number of learner rows |
| LearnerListPage — search | Filters by name/email substring |
| LearnerProgressPage — progress tab | Nodes grouped correctly by mastery state |
| LearnerProgressPage — quiz tab | Attempts sorted by date desc |
| DomainAnalyticsPage — bar chart | Bar heights correspond to mastery rates |
| DomainAnalyticsPage — problem nodes | Sorted by mastery rate ascending |
| FlaggedEventsPage — unresolved filter | Only shows unresolved events |
| ResolveDialog — submit | Calls resolve mutation with notes; event moves to resolved tab |
| RoleGuard | Learner accessing /instructor → redirect to /unauthorized |

---

## Definition of Done

- [ ] `/instructor` redirects to `/instructor/learners`
- [ ] LearnerListPage shows paginated learner table with search
- [ ] Clicking a learner row opens their progress + quiz history
- [ ] Progress tree groups nodes by mastery state correctly
- [ ] Domain analytics bar chart renders mastery rate per node
- [ ] Problem nodes table highlights lowest mastery nodes
- [ ] Flagged events shows unresolved count badge in sidebar
- [ ] ResolveDialog accepts notes + calls resolve endpoint
- [ ] Resolved events show resolution notes in details
- [ ] Learner role cannot access any `/instructor/*` route
