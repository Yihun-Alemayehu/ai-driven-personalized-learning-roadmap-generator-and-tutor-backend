import type { AskQuestionInput, LearnerContext } from '../ai.types';

function buildLearnerProfileSection(ctx: LearnerContext): string {
  const parts: string[] = [];

  const level = ctx.familiarityLevel ?? 'beginner';
  parts.push(`Level: ${level}`);

  if (ctx.learningGoal) parts.push(`Goal: ${ctx.learningGoal}`);
  if (ctx.preferredLearningStyle) parts.push(`Preferred style: ${ctx.preferredLearningStyle}`);
  if (ctx.priorSkills) parts.push(`Prior skills: ${ctx.priorSkills}`);
  if (ctx.aboutSelf) parts.push(`About them: ${ctx.aboutSelf}`);

  if (ctx.currentNodeAttempts > 0) {
    const score = ctx.currentNodeBestScore !== null ? ` (best: ${ctx.currentNodeBestScore}%)` : '';
    parts.push(`Attempts on this node: ${ctx.currentNodeAttempts}${score}`);
  }

  if (ctx.totalNodes > 0) {
    parts.push(`Progress: ${ctx.nodesCompleted}/${ctx.totalNodes} nodes completed`);
  }

  return parts.join('\n');
}

export function buildAskPrompt(input: AskQuestionInput): string {
  const { nodeTitle, description, learningOutcomes, question, explanation, learnerContext } = input;

  const contextParts: string[] = [];

  if (description) {
    contextParts.push(`Description: ${description}`);
  }

  if (learningOutcomes && learningOutcomes.length > 0) {
    contextParts.push(`Learning outcomes:\n${learningOutcomes.map((o) => `  - ${o}`).join('\n')}`);
  }

  if (explanation) {
    contextParts.push(`AI-generated summary: ${explanation.summary}`);
    if (explanation.keyPoints.length > 0) {
      contextParts.push(
        `Key concepts covered:\n${explanation.keyPoints.map((p) => `  - ${p}`).join('\n')}`,
      );
    }
    if (explanation.commonMistakes && explanation.commonMistakes.length > 0) {
      contextParts.push(
        `Common mistakes to avoid:\n${explanation.commonMistakes.map((m) => `  - ${m}`).join('\n')}`,
      );
    }
  }

  const learnerBlock = learnerContext
    ? `\nLearner profile:\n${buildLearnerProfileSection(learnerContext)}\n`
    : '';

  const depthGuidance = learnerContext?.familiarityLevel === 'advanced'
    ? 'Give a precise, technical answer. Skip basics they already know.'
    : learnerContext?.familiarityLevel === 'intermediate'
      ? 'Balance clarity with technical depth.'
      : 'Use simple language and concrete analogies. Be encouraging.';

  return `You are a knowledgeable and encouraging AI instructor helping a learner study "${nodeTitle}".

${contextParts.length > 0 ? `Node context:\n${contextParts.join('\n\n')}\n\n` : ''}${learnerBlock}
Student's question: ${question}

${depthGuidance}
Answer clearly and helpfully in 2-5 sentences. Tailor depth to the question and learner profile.
Return ONLY this JSON with no extra text:
{"answer":"<your answer here>"}`;
}

/**
 * Streaming variant — identical context but instructs the model to respond
 * in plain readable text so tokens can be streamed word-by-word.
 */
export function buildStreamAskPrompt(input: AskQuestionInput): string {
  const { nodeTitle, description, learningOutcomes, question, explanation, learnerContext } = input;

  const contextParts: string[] = [];

  if (description) {
    contextParts.push(`Description: ${description}`);
  }

  if (learningOutcomes && learningOutcomes.length > 0) {
    contextParts.push(`Learning outcomes:\n${learningOutcomes.map((o) => `  - ${o}`).join('\n')}`);
  }

  if (explanation) {
    contextParts.push(`AI-generated summary: ${explanation.summary}`);
    if (explanation.keyPoints.length > 0) {
      contextParts.push(
        `Key concepts covered:\n${explanation.keyPoints.map((p) => `  - ${p}`).join('\n')}`,
      );
    }
    if (explanation.commonMistakes && explanation.commonMistakes.length > 0) {
      contextParts.push(
        `Common mistakes to avoid:\n${explanation.commonMistakes.map((m) => `  - ${m}`).join('\n')}`,
      );
    }
  }

  const learnerBlock = learnerContext
    ? `\nLearner profile:\n${buildLearnerProfileSection(learnerContext)}\n`
    : '';

  const depthGuidance = learnerContext?.familiarityLevel === 'advanced'
    ? 'Give a precise, technical answer. Skip basics they already know.'
    : learnerContext?.familiarityLevel === 'intermediate'
      ? 'Balance clarity with technical depth.'
      : 'Use simple language and concrete analogies. Be encouraging.';

  return `You are a knowledgeable and encouraging AI instructor helping a learner study "${nodeTitle}".

${contextParts.length > 0 ? `Node context:\n${contextParts.join('\n\n')}\n\n` : ''}${learnerBlock}
Student's question: ${question}

${depthGuidance}
Answer clearly and helpfully in 2-5 sentences. Tailor depth to the question and learner profile.
Write your answer as plain readable text. Do not use JSON, code blocks, or any special formatting.`;
}
