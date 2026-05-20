export type OntologyStatus = 'draft' | 'in_review' | 'verified' | 'published' | 'archived';
export type BranchPath = 'frontend' | 'backend' | 'data_science';

export const STATUS_TRANSITIONS: Record<OntologyStatus, OntologyStatus[]> = {
  draft: ['in_review', 'archived'],
  in_review: ['draft', 'verified', 'archived'],
  verified: ['in_review', 'published', 'archived'],
  published: ['archived'],
  archived: [],
};

export interface OntologyVersion {
  id: string;
  domainId: string;
  versionNumber: number;
  status: OntologyStatus;
  createdById: string;
  verifiedById: string | null;
  verifiedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface LearningNode {
  id: string;
  ontologyVersionId: string;
  title: string;
  slug: string;
  description: string | null;
  learningOutcomes: unknown;
  estimatedHours: unknown;
  difficultyLevel: number | null;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath: BranchPath | null;
  positionX: number | null;
  positionY: number | null;
  createdAt: Date;
}

export interface NodePrerequisite {
  id: string;
  nodeId: string;
  prerequisiteNodeId: string;
}

export interface CreateNodeInput {
  title: string;
  slug: string;
  description?: string;
  learningOutcomes: string[];
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  branchPath?: BranchPath;
  positionX?: number;
  positionY?: number;
}

export interface ImportNodeItem {
  title: string;
  description?: string;
  learningOutcomes: string[];
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  branchPath?: BranchPath | null;
}

export interface ImportInput {
  nodes: ImportNodeItem[];
  prerequisites: Array<{ node: string; requires: string }>;
}

export interface UpdateNodeInput {
  title?: string;
  slug?: string;
  description?: string | null;
  learningOutcomes?: string[];
  estimatedHours?: number | null;
  difficultyLevel?: number | null;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  branchPath?: BranchPath | null;
  positionX?: number | null;
  positionY?: number | null;
}
