export type MasteryState = 'not_started' | 'in_progress' | 'mastered' | 'review_needed' | 'relearn';

export interface NodeProgressRow {
  id: string;
  userId: string;
  nodeId: string;
  enrollmentId: string;
  masteryState: MasteryState;
  bestQuizScore: unknown;
  attemptsCount: number;
  isMarginalPass: boolean;
  masteredAt: Date | null;
  lastReviewedAt: Date | null;
  decayNotifiedAt: Date | null;
  unlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressStats {
  totalNodes: number;
  unlockedNodes: number;
  completedNodes: number;
  completionPercent: number;
  avgQuizScore: number | null;
  currentStreak: number;
  byState: Record<MasteryState, number>;
}

export interface RoadmapNode {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  estimatedHours: unknown;
  difficultyLevel: number | null;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath: string | null;
  positionX: number | null;
  positionY: number | null;
  // Progress overlay
  masteryState: MasteryState;
  unlocked: boolean;
  bestQuizScore: unknown;
  attemptsCount: number;
}

export interface RoadmapEdge {
  id: string;
  nodeId: string;
  prerequisiteNodeId: string;
}
