# Phase 6: Resources & AI Explanation

**Depends on:** [Phase 5: Quiz & Gatekeeper](05-quiz.md)  
**Next phase:** [Phase 7: Decay, Notifications & Branching](07-decay-notifications.md)

---

## What to Build

The resource panel for each node: tabbed by modality, rating UI, resource discovery trigger. The AI explanation panel: summary, key points, common mistakes. Both are accessed from the Node Detail Drawer built in Phase 4.

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/nodes/:nodeId/resources` | Returns resources sorted by rating |
| `POST` | `/api/v1/nodes/:nodeId/resources/discover` | Triggers PSE search; returns new resources |
| `POST` | `/api/v1/resources/:id/rate` | `{rating: 1-5, comment?}` |
| `GET` | `/api/v1/nodes/:nodeId/explanation` | AI explanation (Ollama → Gemini) |

---

## File & Folder Structure

```
src/
├── api/
│   └── resources.ts               # useResourcesQuery, useDiscoverMutation, useRateMutation
├── features/resources/
│   ├── components/
│   │   ├── ResourcePanel.tsx      # Tab bar + resource list (used inside NodeDetailDrawer)
│   │   ├── ResourceCard.tsx       # Individual resource: title, modality badge, stars, link
│   │   ├── ResourceModalityTabs.tsx  # Filter tabs: All | Video | Tutorial | Docs | Interactive
│   │   ├── StarRating.tsx         # Interactive 1-5 star widget
│   │   ├── RateDialog.tsx         # Modal: rate + optional comment
│   │   └── DiscoverButton.tsx     # "Find more resources" button with loading state
│   └── ExplanationPanel.tsx       # AI explanation display (used inside NodeDetailDrawer)
```

---

## Key Implementation Details

### `src/api/resources.ts`
```typescript
export interface Resource {
  id: string;
  nodeId: string;
  title: string;
  url: string;
  sourceDomain: string;
  modality: ResourceModality;
  description?: string;
  isPrimary: boolean;
  avgRating: number;
  ratingCount: number;
  isValid: boolean;
}

export function useResourcesQuery(nodeId: string) {
  return useQuery({
    queryKey: ['resources', nodeId],
    queryFn: () => apiClient.get<Resource[]>(`/nodes/${nodeId}/resources`).then((r) => r.data),
    enabled: Boolean(nodeId),
  });
}

export function useDiscoverResourcesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) =>
      apiClient.post<Resource[]>(`/nodes/${nodeId}/resources/discover`).then((r) => r.data),
    onSuccess: (_, nodeId) =>
      qc.invalidateQueries({ queryKey: ['resources', nodeId] }),
  });
}

export function useRateResourceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceId, nodeId, rating, comment }: RateInput) =>
      apiClient.post(`/resources/${resourceId}/rate`, { rating, comment }),
    onSuccess: (_, { nodeId }) =>
      qc.invalidateQueries({ queryKey: ['resources', nodeId] }),
  });
}
```

### `src/api/explanation.ts`
```typescript
export interface Explanation {
  nodeId: string;
  nodeTitle: string;
  explanation: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
  fallback?: { description?: string; learningOutcomes: string[] } | null;
}

export function useExplanationQuery(nodeId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['explanation', nodeId],
    queryFn: () =>
      apiClient.get<Explanation>(`/nodes/${nodeId}/explanation`).then((r) => r.data),
    enabled: enabled && Boolean(nodeId),
    staleTime: 10 * 60 * 1000, // AI content rarely changes
    retry: 1,
  });
}
```

### `ResourcePanel.tsx` Layout
```
┌──────────────────────────────────────────────┐
│  [All] [Video] [Tutorial] [Docs] [Interactive] │
│  ─────────────────────────────────────────── │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 📹 "JavaScript Closures Explained"   │   │
│  │ youtube.com  ★★★★☆ (24 ratings)    │   │
│  │ [Open ↗]  [Rate]                    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 📄 MDN Docs: Closures                │   │
│  │ developer.mozilla.org  ★★★★★ (41)   │   │
│  │ [Open ↗]  [Rate]                    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [🔍 Find more resources...]                 │
└──────────────────────────────────────────────┘
```

- Tabs filter by `modality` field; "All" shows everything sorted by `avgRating` desc
- `isPrimary` resources pinned to top with a "⭐ Recommended" badge
- `isValid = false` shows a "⚠️ Link may be broken" warning
- `DiscoverButton` triggers PSE search; shows spinner; count badge shows new results found

### `StarRating.tsx`
```
★★★★☆  (interactive — hover fills stars; click confirms)
```
- Read-only mode (just shows `avgRating` with count) for display
- Interactive mode inside `RateDialog` (1-5 click)
- Half-star display: round `avgRating` to nearest 0.5

### `ExplanationPanel.tsx` Layout
```
┌──────────────────────────────────────────┐
│  🤖 AI Explanation                       │
│  ─────────────────────────────────────  │
│                                          │
│  Loading state:                          │
│  ████████████ (skeleton)                │
│  ████████ (skeleton)                    │
│                                          │
│  Loaded:                                 │
│  Summary                                 │
│  Closures in JS let inner functions      │
│  access outer scope variables...         │
│                                          │
│  📌 Key Points                           │
│  • Lexical scoping                       │
│  • The function "closes over" variables  │
│  • Common in callbacks, event handlers   │
│                                          │
│  ⚠ Common Mistakes                      │
│  • Forgetting closures in loops          │
│  • Memory leaks from unclosed references │
│                                          │
│  (fallback if AI unavailable)            │
│  Description: [node.description text]   │
│  Learning outcomes: [bullet list]        │
└──────────────────────────────────────────┘
```

- Query is `enabled: false` by default; triggered when user clicks "Get AI Explanation" in NodeDetailDrawer
- Long loading (Ollama can take 30-90s): show animated skeleton with message "Generating explanation with AI... this may take up to 30 seconds"
- On success: animate in the content (fade + slide)
- If `explanation === null` and `fallback` present: render fallback gracefully

### Updated `NodeDetailDrawer.tsx` — add tabs
```
[Overview] [Resources] [AI Explanation]

Overview tab:  description, outcomes, stats
Resources tab: ResourcePanel component
AI tab:        ExplanationPanel component (lazy-load — only fetches when tab opened)
```

---

## Modality Icons Mapping
```typescript
const MODALITY_ICONS: Record<ResourceModality, string> = {
  documentation:  '📄',
  tutorial:       '📖',
  video:          '🎬',
  interactive:    '🎮',
  reference:      '🔗',
};
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| ResourcePanel — loads resources | Cards rendered with correct titles |
| ResourcePanel — tab filter | Switching to "Video" tab shows only video resources |
| ResourcePanel — primary badge | `isPrimary=true` resources show "Recommended" badge |
| ResourceCard — broken link warning | `isValid=false` shows warning chip |
| StarRating — interactive | Click on 3rd star → `rating=3` value set |
| RateDialog — submit | Calls `useRateResourceMutation` with resourceId + rating |
| DiscoverButton — loading | Spinner shown while mutation pending |
| ExplanationPanel — fetched | Summary + key points rendered |
| ExplanationPanel — AI down | Fallback (description + outcomes) rendered |
| ExplanationPanel — skeleton | Shown during long fetch |

---

## Definition of Done

- [ ] Resource panel renders within NodeDetailDrawer; tabbed by modality
- [ ] Tabs filter correctly; "All" shows all sorted by rating descending
- [ ] Primary resources pinned at top with badge
- [ ] Star rating widget works: hover fills; click submits via API
- [ ] RateDialog opens with optional comment field
- [ ] "Find more resources" triggers PSE discover; new resources appear without full page refresh
- [ ] AI explanation panel loads on demand (not pre-fetched)
- [ ] Skeleton shown during AI generation (up to ~30s)
- [ ] Explanation renders: summary + key points + common mistakes
- [ ] Fallback renders gracefully when AI explanation is null
