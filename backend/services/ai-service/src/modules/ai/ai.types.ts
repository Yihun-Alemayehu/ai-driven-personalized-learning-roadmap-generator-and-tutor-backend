import Joi from 'joi';

export interface LearnerContext {
  familiarityLevel: string | null;
  learningGoal: string | null;
  weeklyHours: number | null;
  aboutSelf: string | null;
  preferredLearningStyle: string | null;
  priorSkills: string | null;
  currentNodeAttempts: number;
  currentNodeBestScore: number | null;
  currentNodeMasteryState: string;
  overallAvgScore: number | null;
  nodesCompleted: number;
  totalNodes: number;
}

export interface QuizGenerationInput {
  nodeId: string;
  nodeTitle: string;
  description?: string;
  learningOutcomes: string[];
  difficultyLevel?: number;
  adaptedDifficulty?: number;
  questionCount?: number;
  /** Pre-generated explanation to ground quiz questions in specific content */
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] };
  weakAreas?: string[];
  learnerContext?: LearnerContext;
}

export interface ExplanationInput {
  nodeId: string;
  nodeTitle: string;
  description?: string;
  learningOutcomes: string[];
  weakAreas?: string[];
  learnerContext?: LearnerContext;
}

export interface AskQuestionInput {
  nodeId: string;
  nodeTitle: string;
  question: string;
  description?: string;
  learningOutcomes?: string[];
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] } | null;
  learnerContext?: LearnerContext;
}

export interface MicroQuizInput {
  nodeId: string;
  nodeTitle: string;
  learningOutcomes: string[];
  questionCount?: number;
  learnerContext?: LearnerContext;
}

export interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedQuiz {
  questions: GeneratedQuestion[];
  generatedBy: 'ai_tutor';
}

export interface GeneratedExplanation {
  summary: string;
  keyPoints: string[];
  commonMistakes?: string[];
}

// Joi schema for validating LLM JSON output
export const generatedQuestionSchema = Joi.object({
  questionText: Joi.string().min(10).max(1000).required(),
  options: Joi.array().items(Joi.string().min(1).max(500)).min(2).max(6).required(),
  correctAnswer: Joi.string().min(1).required(),
  explanation: Joi.string().min(1).max(1000).required(),
});

export const generatedQuizSchema = Joi.object({
  questions: Joi.array().items(generatedQuestionSchema).min(1).max(10).required(),
});

export const generatedExplanationSchema = Joi.object({
  summary: Joi.string().min(20).max(2000).required(),
  keyPoints: Joi.array().items(Joi.string().min(5).max(500)).min(1).max(10).required(),
  commonMistakes: Joi.array().items(Joi.string().min(5).max(500)).max(5).optional(),
});
