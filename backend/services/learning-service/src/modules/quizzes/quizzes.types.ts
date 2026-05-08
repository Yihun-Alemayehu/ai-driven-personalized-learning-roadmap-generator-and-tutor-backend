export interface SubmitAttemptInput {
  enrollmentId: string;
  answers: { questionId: string; answer: string }[];
  startedAt: string; // ISO date string
}

export interface AttemptFilters {
  nodeId?: string;
  limit?: number;
  offset?: number;
}
