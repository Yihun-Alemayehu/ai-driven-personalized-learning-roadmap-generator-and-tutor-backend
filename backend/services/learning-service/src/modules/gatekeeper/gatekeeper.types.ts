export type GatekeeperTier =
  | 'strong_pass'
  | 'marginal_pass'
  | 'fail_low'
  | 'fail_fundamental'
  | 'fail_severe';

export interface GatekeeperResult {
  tier: GatekeeperTier;
  newMasteryState: 'mastered' | 'in_progress';
  isMarginalPass: boolean;
  adaptationType?: 'resource_swap' | 'prerequisite_review' | 'instructor_escalation';
  newlyUnlockedNodes: string[];
}
