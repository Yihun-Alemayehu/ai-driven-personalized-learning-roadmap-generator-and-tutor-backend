# Phase 4: Roadmap Visualisation

**Depends on:** [Phase 3: Domain Catalog & Enrollment](03-domain-catalog.md)  
**Next phase:** [Phase 5: Quiz & Gatekeeper](05-quiz.md)

---

## What to Build

The core learning experience. An interactive DAG (directed acyclic graph) rendered with React Flow showing every learning node colour-coded by mastery state. Clicking a node opens a detail drawer. A progress stats sidebar shows overall completion. This is the most complex UI component in the project.

---

## Dependencies to Install

```bash
npm install @xyflow/react         # React Flow v11
```

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/v1/enrollments/:id/roadmap` | Returns `{nodes, edges, selectedBranchPath}` |
| `GET` | `/api/v1/enrollments/:id/progress/stats` | `{masteredCount, totalNodes, completionPercent}` |
| `GET` | `/api/v1/enrollments/:id/progress` | Full node progress list |

---

## File & Folder Structure

```
src/
├── api/
│   └── progress.ts                # useRoadmapQuery, useProgressStatsQuery
├── features/roadmap/
│   ├── RoadmapPage.tsx            # Page: sidebar + React Flow canvas
│   ├── components/
│   │   ├── RoadmapCanvas.tsx      # <ReactFlow> with custom node types
│   │   ├── LearningNodeCard.tsx   # Custom React Flow node component
│   │   ├── NodeDetailDrawer.tsx   # Right-side Sheet: node info + actions
│   │   ├── ProgressSidebar.tsx    # Left panel: stats + mastery breakdown
│   │   ├── BranchingBadge.tsx     # Badge shown on branching point nodes
│   │   └── MasteryBadge.tsx       # Colour-coded state chip
```

---

## Key Implementation Details

### `src/api/progress.ts`
```typescript
export interface RoadmapNode {
  id: string;
  title: string;
  slug: string;
  description?: string;
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath?: string;
  positionX?: number;
  positionY?: number;
  masteryState: MasteryState;
  unlocked: boolean;
  bestQuizScore?: number;
  attemptsCount: number;
}

export interface RoadmapEdge {
  nodeId: string;
  prerequisiteNodeId: string;
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  selectedBranchPath?: string;
}

export function useRoadmapQuery(enrollmentId: string) {
  return useQuery({
    queryKey: ['roadmap', enrollmentId],
    queryFn: () =>
      apiClient
        .get<RoadmapData>(`/enrollments/${enrollmentId}/roadmap`)
        .then((r) => r.data),
    enabled: Boolean(enrollmentId),
  });
}
```

### Mastery State → Visual Mapping
```typescript
export const MASTERY_COLORS: Record<MasteryState, { bg: string; border: string; text: string }> = {
  not_started:   { bg: '#f1f5f9', border: '#94a3b8', text: '#64748b' },
  in_progress:   { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  mastered:      { bg: '#dcfce7', border: '#22c55e', text: '#15803d' },
  review_needed: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
  relearn:       { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' },
};
```

### `LearningNodeCard.tsx` — Custom React Flow Node
```
Each node is a rounded card (140×80px):

Locked:            Unlocked/not_started:   Mastered:
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  🔒           │   │ Intro to JS      │   │ ✓ Intro to JS   │
│  Intro to JS  │   │ ○ not started    │   │  ⭐ mastered     │
└──────────────┘   └──────────────────┘   └──────────────────┘
  (grey, no click)  (click opens drawer)   (green border)
```

Node shape encodes state:
- Border color = mastery state color
- Lock icon overlay if `unlocked = false`
- Check icon if `mastered`
- Pulsing ring animation if `review_needed` or `relearn`
- Diamond shape (rotate 45°) if `isBranchingPoint`
- Dashed border if `isConvergencePoint`

### `RoadmapCanvas.tsx`
```typescript
import ReactFlow, { Background, Controls, MiniMap } from '@xyflow/react';

// Convert backend nodes/edges to React Flow format
function toFlowNodes(roadmapNodes: RoadmapNode[]): Node[] {
  return roadmapNodes.map((n) => ({
    id: n.id,
    type: 'learningNode',
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data: n,
  }));
}

function toFlowEdges(edges: RoadmapEdge[]): Edge[] {
  return edges.map((e, i) => ({
    id: `e${i}`,
    source: e.prerequisiteNodeId,
    target: e.nodeId,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#94a3b8' },
  }));
}
```

If `positionX/positionY` are null (no layout set in ontology builder), run an auto-layout using React Flow's built-in `getLayoutedElements` with dagre algorithm:

```bash
npm install dagre @types/dagre
```

### `NodeDetailDrawer.tsx` — Side panel (shadcn Sheet)
```
┌────────────────────────────────────────┐
│  ← Close                               │
│  [MasteryBadge]  Intro to JavaScript   │
│  ─────────────────────────────────────│
│  Description:                          │
│  Covers variables, loops, functions...│
│                                        │
│  📚 Learning Outcomes:                 │
│  • Understand variable hoisting        │
│  • Write basic functions               │
│                                        │
│  ⏱ ~4 hours   🎯 Difficulty: 2/5      │
│                                        │
│  ── Your Progress ──────────────────  │
│  Attempts: 3  Best score: 72%          │
│                                        │
│  [Take Quiz]   [View Resources]        │
│  [Get AI Explanation]                  │
└────────────────────────────────────────┘
```

"Take Quiz" → navigates to `/quiz/:nodeId` (Phase 5)  
"View Resources" → opens resources tab within drawer (Phase 6)  
"Get AI Explanation" → triggers AI explanation fetch (Phase 6)  

### `ProgressSidebar.tsx`
```
┌──────────────────────┐
│  Web Development     │
│  ──────────────────  │
│  Progress: 42%       │
│  ████████░░░░░░░░░  │
│                      │
│  ● Mastered:    12   │
│  ◐ In progress:  3   │
│  ○ Not started: 32   │
│  ⚠ Review needed: 2  │
│  🔴 Relearn:    0    │
│                      │
│  [Path: Backend] ▾  │
│  (shown if branching)│
└──────────────────────┘
```

---

## Auto-Layout with Dagre (when positions not set)

```typescript
import dagre from 'dagre';

function getAutoLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });
  nodes.forEach((n) => g.setNode(n.id, { width: 150, height: 80 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x: x - 75, y: y - 40 } };
  });
}
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| RoadmapCanvas — renders nodes | Correct number of React Flow nodes rendered |
| LearningNodeCard — mastered | Green border; check icon visible |
| LearningNodeCard — locked | Lock icon visible; click does not open drawer |
| LearningNodeCard — review_needed | Amber border; pulsing ring class applied |
| NodeDetailDrawer — opens on click | Drawer visible; shows correct node title |
| NodeDetailDrawer — locked node | Drawer does NOT open (node click no-op) |
| ProgressSidebar — stats | Mastered count matches data |
| Auto-layout | No nodes overlap (rough bounds check) |

---

## Definition of Done

- [ ] Roadmap page renders the full node graph from API (no crashes on any mastery state)
- [ ] Each mastery state has correct border/background color
- [ ] Locked nodes show lock icon; clicking them does nothing
- [ ] Clicking an unlocked node opens the detail drawer with accurate data
- [ ] MiniMap and zoom controls work
- [ ] Auto-layout kicks in when node positions are null; nodes do not overlap
- [ ] Progress sidebar shows accurate mastery breakdown numbers
- [ ] "Take Quiz" button in drawer navigates to the quiz page (Phase 5 stub ok)
- [ ] Branching point nodes have a distinct visual treatment (diamond or badge)
