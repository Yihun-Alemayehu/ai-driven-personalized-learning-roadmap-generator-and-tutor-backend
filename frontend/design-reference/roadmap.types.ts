// ─── Roadmap feature — shared types ──────────────────────────────────────────
// These mirror the backend models from src/types/index.ts; keep in sync.

export type MasteryState =
  | 'not_started'
  | 'in_progress'
  | 'mastered'
  | 'review_needed'
  | 'relearn'
  | 'locked';

export type BranchPath = 'frontend' | 'backend' | 'data_science';

export interface RoadmapNode {
  id: string;
  title: string;
  slug: string;
  description?: string;
  estimatedHours?: number;
  difficultyLevel?: number; // 1 | 2 | 3
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath?: BranchPath;
  positionX?: number;
  positionY?: number;
  // — learner-scoped —
  masteryState: MasteryState;
  unlocked: boolean;
  bestQuizScore?: number;  // 0-100
  attemptsCount: number;
  learningOutcomes: string[];
}

export interface RoadmapEdge {
  nodeId: string;
  prerequisiteNodeId: string;
}

export interface RoadmapData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  selectedBranchPath?: BranchPath;
}

export interface ProgressStats {
  masteredCount: number;
  inProgressCount: number;
  reviewNeededCount: number;
  notStartedCount: number;
  rerelearnCount: number;
  lockedCount: number;
  totalNodes: number;
  completionPercent: number;
}
