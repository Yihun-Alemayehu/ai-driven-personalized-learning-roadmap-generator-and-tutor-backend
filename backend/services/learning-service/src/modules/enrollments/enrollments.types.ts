export type BranchPath = 'frontend' | 'backend' | 'data_science';

export interface Enrollment {
  id: string;
  userId: string;
  domainId: string;
  ontologyVersionId: string;
  selectedBranchPath: BranchPath | null;
  enrolledAt: Date;
}

export interface EnrollInput {
  domainId: string;
  selectedBranchPath?: BranchPath;
}
