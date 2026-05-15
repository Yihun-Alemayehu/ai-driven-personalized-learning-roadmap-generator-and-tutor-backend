export type BranchPath = 'frontend' | 'backend' | 'data_science';
export type FamiliarityLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'get_job' | 'upskill' | 'hobby' | 'certification';

export interface Enrollment {
  id: string;
  userId: string;
  domainId: string;
  ontologyVersionId: string;
  selectedBranchPath: BranchPath | null;
  enrolledAt: Date;
  weeklyHours: number | null;
  familiarityLevel: FamiliarityLevel | null;
  learningGoal: LearningGoal | null;
  aboutSelf: string | null;
}

export interface EnrollInput {
  domainId: string;
  selectedBranchPath?: BranchPath;
  weeklyHours?: number;
  familiarityLevel?: FamiliarityLevel;
  learningGoal?: LearningGoal;
  aboutSelf?: string;
}
