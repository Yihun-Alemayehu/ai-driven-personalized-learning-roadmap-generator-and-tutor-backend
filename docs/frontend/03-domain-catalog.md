# Phase 3: Domain Catalog & Enrollment

**Depends on:** [Phase 2: Auth](02-auth.md)  
**Next phase:** [Phase 4: Roadmap Visualisation](04-roadmap.md)

---

## What to Build

Domain catalog (browse all available learning domains), domain detail page, enrollment flow with confirmation, and a "My Enrollments" section on the dashboard. This is the entry point for learners choosing what to study.

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/domains` | List all published domains |
| `GET` | `/api/v1/domains/:slug` | Domain detail |
| `POST` | `/api/v1/enrollments` | `{domainId}` → creates enrollment |
| `GET` | `/api/v1/enrollments` | My enrollments list |
| `GET` | `/api/v1/enrollments/:id` | Single enrollment detail |
| `DELETE` | `/api/v1/enrollments/:id` | Unenroll |

---

## File & Folder Structure

```
src/
├── api/
│   ├── domains.ts                 # useDomainsQuery, useDomainBySlugQuery
│   └── enrollments.ts             # useEnrollmentsQuery, useEnrollMutation, useUnenrollMutation
├── features/
│   ├── catalog/
│   │   ├── DomainCatalogPage.tsx  # Grid of DomainCard components
│   │   ├── DomainDetailPage.tsx   # Domain info + enroll CTA + node count
│   │   └── components/
│   │       ├── DomainCard.tsx     # Card: icon, name, description, enroll/open button
│   │       └── EnrollDialog.tsx   # Confirm enrollment modal
│   └── dashboard/
│       ├── DashboardPage.tsx      # Enrolled domains + decay alerts (Phase 7)
│       └── components/
│           └── EnrolledDomainCard.tsx  # Shows progress % + last activity
```

---

## Key Implementation Details

### `src/api/domains.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export const domainKeys = {
  all: ['domains'] as const,
  bySlug: (slug: string) => ['domains', slug] as const,
};

export function useDomainsQuery() {
  return useQuery({
    queryKey: domainKeys.all,
    queryFn: () => apiClient.get<Domain[]>('/domains').then((r) => r.data),
  });
}

export function useDomainBySlugQuery(slug: string) {
  return useQuery({
    queryKey: domainKeys.bySlug(slug),
    queryFn: () => apiClient.get<Domain>(`/domains/${slug}`).then((r) => r.data),
    enabled: Boolean(slug),
  });
}
```

### `src/api/enrollments.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Enrollment {
  id: string;
  domainId: string;
  domain: Domain;
  enrolledAt: string;
  selectedBranchPath?: string;
}

export function useEnrollmentsQuery() {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => apiClient.get<Enrollment[]>('/enrollments').then((r) => r.data),
  });
}

export function useEnrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      apiClient.post<Enrollment>('/enrollments', { domainId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });
}

export function useUnenrollMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => apiClient.delete(`/enrollments/${enrollmentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['enrollments'] }),
  });
}
```

### `DomainCatalogPage.tsx` Layout
```
┌─────────────────────────────────────────┐
│  "Explore Learning Domains"  [search]   │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │  📦  │ │  🐍  │ │  🗄️  │ │  🤖  │  │
│  │Web   │ │Python│ │SQL   │ │ML    │  │
│  │Dev   │ │      │ │      │ │      │  │
│  │[View]│ │[View]│ │[View]│ │[View]│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

- Skeleton cards while loading
- Each card: icon (from `iconUrl` or fallback emoji), title, description (2-line truncate), node count (if available), "View" button → navigates to `/domains/:slug`
- If already enrolled: button changes to "Continue Learning" → navigates to roadmap

### `DomainDetailPage.tsx` Layout
```
┌──────────────────────────────────────────┐
│  ← Back to Catalog                       │
│  [Domain Icon] Web Development           │
│  Description paragraph...               │
│  ── Stats ──────────────────────────    │
│  📊 47 nodes  ⏱ ~120 hrs  🎯 3 paths   │
│                                          │
│  [Enroll Now] or [Continue Learning →]  │
└──────────────────────────────────────────┘
```

On "Enroll Now" → opens `EnrollDialog` for confirmation → calls `useEnrollMutation` → navigates to `/enrollments/:id/roadmap` on success.

### `DashboardPage.tsx`
```
┌──────────────────────────────────────────┐
│  "Welcome back, [Name]"                  │
│                                          │
│  My Enrollments                          │
│  ┌────────────────────┐                  │
│  │ Web Dev  ██████░ 42%│  [Continue →]  │
│  │ Python   ████░░ 31% │  [Continue →]  │
│  └────────────────────┘                  │
│                                          │
│  🔴 Decay Alerts (Phase 7)              │
│  [+ Explore More Domains]               │
└──────────────────────────────────────────┘
```

`EnrolledDomainCard` shows:
- Domain name + icon
- Progress bar (mastered nodes / total unlocked nodes)
- Last activity date
- "Continue Learning" → navigates to roadmap

---

## Tests to Write

| Test | Asserts |
|------|---------|
| DomainCatalogPage — loading | Skeleton cards rendered while query is pending |
| DomainCatalogPage — data loaded | Domain cards rendered with correct names |
| DomainCard — already enrolled | Button reads "Continue Learning" |
| EnrollDialog — confirm | Calls `useEnrollMutation` with correct domainId |
| EnrollDialog — cancel | No mutation called; dialog closes |
| DashboardPage — no enrollments | Shows "Explore More Domains" CTA |
| Unenroll | Calls DELETE /enrollments/:id; invalidates enrollments query |

---

## Definition of Done

- [ ] Catalog page shows all domains from API with icons and descriptions
- [ ] Skeleton loading state shown during initial fetch
- [ ] Clicking "View" opens domain detail page with accurate description and stats
- [ ] "Enroll Now" opens confirm dialog; confirming creates enrollment and navigates to roadmap
- [ ] Already-enrolled domains show "Continue Learning" in catalog
- [ ] Dashboard shows all active enrollments with progress bars
- [ ] Unenroll flow: confirm dialog → DELETE call → enrollment removed from list
- [ ] Empty states for both pages when no data
