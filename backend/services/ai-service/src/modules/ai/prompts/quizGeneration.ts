import type { QuizGenerationInput, LearnerContext } from '../ai.types';

function buildQuizLearnerSection(ctx: LearnerContext): string {
  const parts: string[] = [];

  const level = ctx.familiarityLevel ?? 'beginner';
  if (level === 'advanced') {
    parts.push('The learner is advanced — use precise technical language, nuanced distractors, and deeper application questions.');
  } else if (level === 'intermediate') {
    parts.push('The learner has intermediate knowledge — balance conceptual and applied questions.');
  } else {
    parts.push('The learner is a beginner — use simpler phrasing, provide more context in options, and avoid jargon-heavy distractors.');
  }

  if (ctx.learningGoal) {
    parts.push(`Their goal is: ${ctx.learningGoal}. Slant questions toward this context.`);
  }

  if (ctx.currentNodeAttempts > 0) {
    const score = ctx.currentNodeBestScore !== null ? ` (best: ${ctx.currentNodeBestScore}%)` : '';
    parts.push(`This is a re-attempt (${ctx.currentNodeAttempts} prior)${score}. Vary questions from previous quizzes.`);
  }

  return parts.join('\n');
}

export function buildQuizPrompt(input: QuizGenerationInput): string {
  const {
    nodeTitle, description, learningOutcomes, difficultyLevel,
    adaptedDifficulty, questionCount = 4, explanation, weakAreas, learnerContext,
  } = input;

  const effectiveDifficulty = adaptedDifficulty ?? difficultyLevel;
  const difficulty = effectiveDifficulty
    ? `Difficulty level: ${effectiveDifficulty}/5.`
    : 'Difficulty level: intermediate.';

  const explanationSection = explanation
    ? `\nLearning content to base questions on:
Summary: ${explanation.summary}
Key points:
${explanation.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}
${explanation.commonMistakes?.length ? `Common mistakes to test awareness of:\n${explanation.commonMistakes.map((m) => `- ${m}`).join('\n')}` : ''}\n`
    : '';

  const learnerBlock = learnerContext
    ? `\nLearner profile:\n${buildQuizLearnerSection(learnerContext)}\n`
    : '';

  const weakAreasBlock = weakAreas && weakAreas.length > 0
    ? `\nThe learner previously struggled with these areas:\n${weakAreas.map((w, i) => `${i + 1}. ${w}`).join('\n')}\nEnsure at least ${Math.ceil(questionCount / 2)} of ${questionCount} questions target these weak areas while still covering other learning outcomes.\n`
    : '';

  return `You are a technical quiz author. Generate exactly ${questionCount} multiple-choice questions about the topic: "${nodeTitle}".

${description ? `Topic description: ${description}` : ''}
${difficulty}
Learning outcomes to test:
${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}
${explanationSection}${learnerBlock}${weakAreasBlock}
Rules:
- Each question MUST be grounded in the learning content above.
- Do NOT invent concepts outside the listed learning outcomes.
- Each question has exactly 4 options (A, B, C, D).
- The correctAnswer must be the exact text of one of the options.
- Write a brief explanation for why the answer is correct.
- Adapt question phrasing and complexity to the learner profile and difficulty level.

Respond with ONLY valid JSON. No markdown, no prose, no code blocks.

CRITICAL: The correctAnswer field MUST be copied verbatim from the options array — not a letter like "A" or a label like "option C".

Required format:
{
  "questions": [
    {
      "questionText": "Which keyword declares a block-scoped variable in JavaScript?",
      "options": ["var", "let", "def", "dim"],
      "correctAnswer": "let",
      "explanation": "'let' declares a block-scoped variable introduced in ES6."
    }
  ]
}`;
}
