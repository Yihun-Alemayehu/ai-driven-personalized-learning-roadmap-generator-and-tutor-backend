import Joi from 'joi';

export interface QuizGenerationInput {
  nodeId: string;
  nodeTitle: string;
  description?: string;
  learningOutcomes: string[];
  difficultyLevel?: number;
  questionCount?: number;
  /** Pre-generated explanation to ground quiz questions in specific content */
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] };
}

export interface ExplanationInput {
  nodeId: string;
  nodeTitle: string;
  description?: string;
  learningOutcomes: string[];
}

export interface AskQuestionInput {
  nodeId: string;
  nodeTitle: string;
  question: string;
  description?: string;
  learningOutcomes?: string[];
  explanation?: { summary: string; keyPoints: string[]; commonMistakes?: string[] } | null;
}

export interface MicroQuizInput {
  nodeId: string;
  nodeTitle: string;
  learningOutcomes: string[];
  questionCount?: number;
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
