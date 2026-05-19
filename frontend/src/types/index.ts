// ── Core enums ────────────────────────────────────────────────────────────────
export type UserRole = 'learner' | 'domain_expert' | 'admin';
export type MasteryState = 'not_started' | 'in_progress' | 'mastered' | 'review_needed' | 'relearn' | 'locked';
export type QuizOutcome = 'strong_pass' | 'marginal_pass' | 'fail_low' | 'fail_fundamental' | 'fail_severe';
export type ResourceModality = 'documentation' | 'tutorial' | 'video' | 'interactive' | 'reference';
export type BranchPath = 'frontend' | 'backend' | 'data_science';
export type OntologyStatus = 'draft' | 'in_review' | 'verified' | 'published' | 'archived';

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  preferredLanguage?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// API returns tokens flat (not nested under "tokens")
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ── Domains ───────────────────────────────────────────────────────────────────
export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  createdAt?: string;
}

// ── Enrollments ───────────────────────────────────────────────────────────────
export type FamiliarityLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'get_job' | 'upskill' | 'hobby' | 'certification';

export interface Enrollment {
  id: string;
  userId: string;
  domainId: string;
  domain: Domain;
  enrolledAt: string;
  selectedBranchPath?: BranchPath;
  weeklyHours?: number | null;
  familiarityLevel?: FamiliarityLevel | null;
  learningGoal?: LearningGoal | null;
  aboutSelf?: string | null;
}

// ── Learning nodes ────────────────────────────────────────────────────────────
export interface LearningNode {
  id: string;
  title: string;
  slug: string;
  description?: string;
  learningOutcomes: string[];
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath?: BranchPath;
  positionX?: number;
  positionY?: number;
}

// ── Roadmap (learner-scoped node) ─────────────────────────────────────────────
export interface RoadmapNode extends LearningNode {
  masteryState: MasteryState;
  unlocked: boolean;
  bestQuizScore?: number;
  attemptsCount: number;
  masteredAt?: string;
  lastReviewedAt?: string;
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

// ── Quizzes ───────────────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  questionType: string;
  questionText: string;
  options?: string[];
  explanation?: string;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  nodeId: string;
  isMicroQuiz: boolean;
  questions: QuizQuestion[];
}

export interface GatekeeperResult {
  tier: QuizOutcome;
  newMasteryState: 'mastered' | 'in_progress';
  isMarginalPass: boolean;
  adaptationType?: 'resource_swap' | 'prerequisite_review' | 'instructor_escalation';
  newlyUnlockedNodes: string[];
}

export interface AttemptResult {
  attempt: {
    id: string;
    scorePercent: number;
    correctAnswers: number;
    totalQuestions: number;
    completedAt: string;
  };
  gatekeeper: GatekeeperResult;
  challengeProject?: ChallengeProject | null;
  adaptedResources?: Resource[] | null;
}

// ── Resources ─────────────────────────────────────────────────────────────────
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
  fetchedVia: string;
  createdAt?: string;
}

export interface ChallengeProject {
  id: string;
  nodeId: string;
  title: string;
  description: string;
  difficultyLevel?: number;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminUser extends User {
  createdAt: string;
}

export interface SystemStats {
  users: number;
  enrollments: number;
  quizAttempts: number;
  masteryBreakdown: Partial<Record<MasteryState, number>>;
  avgMasteryRate: number;
  avgQuizScore: number | null;
}

export interface DomainStat {
  domainId: string;
  name: string;
  enrollmentCount: number;
  avgCompletion: number;
  avgQuizScore: number | null;
}

export interface OntologyVersion {
  id: string;
  domainId: string;
  version: number;
  status: OntologyStatus;
  createdAt: string;
  publishedAt?: string;
}

export interface OntologyNode {
  id: string;
  ontologyId: string;
  title: string;
  slug: string;
  description?: string;
  learningOutcomes: string[];
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath?: BranchPath;
  positionX?: number;
  positionY?: number;
}

export interface OntologyEdge {
  id: string;
  nodeId: string;
  prerequisiteNodeId: string;
}

export interface OntologyDetail {
  id: string;
  domainId: string;
  version: number;
  status: OntologyStatus;
  nodes: OntologyNode[];
  edges: OntologyEdge[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ── API pagination ────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ── API error ─────────────────────────────────────────────────────────────────
export interface ApiError {
  error: {
    message: string;
    details?: unknown;
  };
}
