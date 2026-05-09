# Phase 7: Decay, Notifications & Branching

**Depends on:** [Phase 6: Resources & AI Explanation](06-resources-explanation.md)  
**Next phase:** [Phase 8: Instructor Dashboard](08-instructor.md)

---

## What to Build

Three related systems that complete the learner experience loop:
1. **Notifications** — bell icon in navbar with unread count badge; notifications list page; mark read
2. **Mastery Decay** — decay status on dashboard; micro-quiz flow for nodes that need review
3. **Path Branching** — UI at branching points to select/switch learning path; roadmap filters accordingly

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/notifications` | `?limit=20&offset=0`; unread first |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark one read |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all read |
| `GET` | `/api/v1/enrollments/:id/decay-status` | Nodes with decay metadata |
| `POST` | `/api/v1/nodes/:nodeId/micro-quiz` | Generate 2-3 question micro-quiz |
| `POST` | `/api/v1/micro-quizzes/:quizId/attempt` | Submit micro-quiz |
| `GET` | `/api/v1/enrollments/:id/branching-points` | Reachable branching point nodes |
| `GET` | `/api/v1/enrollments/:id/available-paths` | Available branch paths |
| `POST` | `/api/v1/enrollments/:id/select-path` | `{branchPath}` |
| `POST` | `/api/v1/enrollments/:id/switch-path` | `{branchPath}` |

---

## File & Folder Structure

```
src/
├── api/
│   ├── notifications.ts           # useNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation
│   ├── decay.ts                   # useDecayStatusQuery, useMicroQuizMutation, useSubmitMicroAttemptMutation
│   └── branching.ts               # useBranchingPointsQuery, useAvailablePathsQuery, useSelectPathMutation
├── features/
│   ├── notifications/
│   │   ├── NotificationsPage.tsx  # Full page list of all notifications
│   │   └── components/
│   │       ├── NotificationBell.tsx   # Navbar icon + unread badge + dropdown
│   │       ├── NotificationItem.tsx   # Single notification row
│   │       └── NotificationDropdown.tsx  # Popover: last 5 + "See all"
│   ├── decay/
│   │   ├── DecayStatusPanel.tsx       # Dashboard section: decaying nodes
│   │   ├── MicroQuizModal.tsx         # 2-3 question quick review quiz
│   │   └── components/
│   │       └── DecayNodeCard.tsx      # Node + days since review + "Review now" CTA
│   └── branching/
│       ├── PathSelectorModal.tsx      # Select/switch path dialog
│       └── components/
│           ├── PathCard.tsx           # Card: frontend/backend/data_science option
│           └── BranchingPointBanner.tsx  # Banner shown on roadmap when branching point reached
```

---

## Key Implementation Details

### Notifications

#### `NotificationBell.tsx`
```
Navbar right side:
  🔔 [unread count badge]

Popover on click:
  ┌────────────────────────────────┐
  │ Notifications        [Mark all]│
  │ ────────────────────────────  │
  │ 🔴 Review: Intro to JS         │
  │    "Your mastery is decaying"  │
  │    2 hours ago                 │
  │ ────────────────────────────  │
  │ ✓  Node unlocked: Closures     │
  │    Yesterday                   │
  │ ────────────────────────────  │
  │         [See all →]            │
  └────────────────────────────────┘
```

- Poll notifications every 60s with `refetchInterval: 60_000` on `useNotificationsQuery`
- Unread count shown as red badge (hidden when 0)
- Clicking a notification row marks it read + navigates to relevant page (if `data.nodeId` → roadmap, etc.)
- "Mark all" calls `useMarkAllReadMutation`; optimistic update — set all `read=true` locally immediately

#### `useNotificationsQuery`
```typescript
export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      apiClient.get<Notification[]>('/notifications?limit=20').then((r) => r.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const { data } = useNotificationsQuery();
  return data?.filter((n) => !n.read).length ?? 0;
}
```

---

### Mastery Decay

#### `src/api/decay.ts`
```typescript
export interface DecayStatus {
  nodeId: string;
  nodeTitle: string;
  masteryState: 'review_needed' | 'relearn';
  lastReviewedAt: string;
  daysSinceReview: number;
  decayThresholdDays: number;
}

export function useDecayStatusQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['decay-status', enrollmentId],
    queryFn: () =>
      apiClient.get<DecayStatus[]>(`/enrollments/${enrollmentId}/decay-status`).then((r) => r.data),
    enabled: Boolean(enrollmentId),
  });
}

export function useMicroQuizMutation() {
  return useMutation({
    mutationFn: (nodeId: string) =>
      apiClient.post<Quiz>(`/nodes/${nodeId}/micro-quiz`).then((r) => r.data),
  });
}

export function useSubmitMicroAttemptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: SubmitAttemptPayload }) =>
      apiClient.post<AttemptResult>(`/micro-quizzes/${quizId}/attempt`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap'] });
      qc.invalidateQueries({ queryKey: ['decay-status'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
```

#### `DecayStatusPanel.tsx` — Dashboard section
```
┌──────────────────────────────────────────┐
│  ⚠ Knowledge Decay Alerts               │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ ⚠ Intro to JavaScript            │   │
│  │ Last reviewed 18 days ago         │   │
│  │ [Review now — 2 min quiz]         │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 🔴 DOM Manipulation               │   │
│  │ Last reviewed 35 days ago (relearn)│  │
│  │ [Start relearning]                │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

Shown only when `decayStatus.length > 0`. Collapsed by default; "Show N alerts" expand toggle.

#### `MicroQuizModal.tsx`
Full-screen modal (not page navigate) for the 2-3 question micro-quiz:
```
┌────────────────────────────────────────┐
│  Quick Review: Intro to JavaScript     │
│  Question 1 of 3                       │
│  ──────────────────────────────────── │
│  [question text]                       │
│                                        │
│  ○ A)  ○ B)  ○ C)  ○ D)               │
│                                        │
│                         [Next →]       │
└────────────────────────────────────────┘
```

- On `≥80%`: success screen "✓ Knowledge retained! Node remains mastered."
- On `<80%`: "📚 Node moved to In Progress — revisit resources and retake the full quiz."

Reuses `QuizQuestion`, `QuizProgressBar`, `OutcomeScreen` components from Phase 5.

---

### Branching

#### `src/api/branching.ts`
```typescript
export interface BranchingPoint {
  nodeId: string;
  nodeTitle: string;
  unlocked: boolean;
}

export interface AvailablePaths {
  paths: { path: BranchPath; label: string; description: string }[];
  currentPath?: BranchPath;
}

export function useSelectPathMutation(enrollmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (branchPath: BranchPath) =>
      apiClient.post(`/enrollments/${enrollmentId}/select-path`, { branchPath }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roadmap', enrollmentId] });
      qc.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
```

#### `PathSelectorModal.tsx` — shown when learner reaches a branching node
```
┌────────────────────────────────────────────────┐
│  🔀 Choose Your Learning Path                  │
│  ─────────────────────────────────────────── │
│  You've reached a branching point!            │
│  Select a specialisation to continue:         │
│                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌────────┐│
│  │  🌐 Frontend  │ │  ⚙ Backend   │ │ 📊 Data││
│  │  React, CSS  │ │  Node, APIs  │ │ Science││
│  │  [Select]    │ │  [Select]    │ │[Select]││
│  └──────────────┘ └──────────────┘ └────────┘│
└────────────────────────────────────────────────┘
```

#### `BranchingPointBanner.tsx` — shown on roadmap when branching point reached
```
┌─────────────────────────────────────────┐
│ 🔀 Branching Point — Choose your path   │
│ [Frontend] [Backend] [Data Science]     │
└─────────────────────────────────────────┘
```

Trigger: when `selectedBranchPath === null` AND `branchingPoints` has an unlocked branching node.

Path labels:
```typescript
const PATH_LABELS: Record<BranchPath, { label: string; icon: string; description: string }> = {
  frontend:     { label: 'Frontend',     icon: '🌐', description: 'React, CSS, UI/UX' },
  backend:      { label: 'Backend',      icon: '⚙️',  description: 'Node.js, APIs, Databases' },
  data_science: { label: 'Data Science', icon: '📊', description: 'Python, ML, Statistics' },
};
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| NotificationBell — unread badge | Shows count when unread > 0; hidden when 0 |
| NotificationDropdown — mark all | Calls markAllRead mutation; all items styled as read |
| NotificationItem — click | Marks notification read; navigates based on data |
| DecayStatusPanel — hidden | Not shown when no decay alerts |
| DecayNodeCard — relearn state | Shows red indicator + "Start relearning" CTA |
| MicroQuizModal — pass | Success message; decay-status query invalidated |
| MicroQuizModal — fail | Failure message; roadmap query invalidated |
| PathSelectorModal — select | Calls selectPath; roadmap refetched; DAG filters |
| PathSelectorModal — current path | Currently selected path is highlighted |

---

## Definition of Done

- [ ] Notification bell shows red badge with unread count in navbar
- [ ] Dropdown shows last 5 notifications; "See all" → `/notifications` page
- [ ] Mark individual or all notifications as read works; badge count updates immediately
- [ ] Dashboard shows decay alerts panel when review_needed/relearn nodes exist
- [ ] Clicking "Review now" opens MicroQuizModal with 2-3 questions
- [ ] Micro-quiz pass (≥80%) → success screen → node stays mastered
- [ ] Micro-quiz fail (<80%) → fail screen → roadmap node turns in_progress
- [ ] PathSelectorModal appears automatically when learner reaches unlocked branching point
- [ ] Selecting a path calls API; roadmap re-renders showing only nodes on that path + convergence nodes
- [ ] Switching paths (already selected) uses switch-path endpoint; roadmap updates
