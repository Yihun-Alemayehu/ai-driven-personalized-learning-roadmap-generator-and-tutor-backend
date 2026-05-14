import type { QuizGenerationInput } from '../ai.types';

export function buildQuizPrompt(input: QuizGenerationInput): string {
  const { nodeTitle, description, learningOutcomes, difficultyLevel, questionCount = 4, explanation } = input;
  const difficulty = difficultyLevel
    ? `Difficulty level: ${difficultyLevel}/5.`
    : 'Difficulty level: intermediate.';

  const explanationSection = explanation
    ? `\nLearning content to base questions on:
Summary: ${explanation.summary}
Key points:
${explanation.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}
${explanation.commonMistakes?.length ? `Common mistakes to test awareness of:\n${explanation.commonMistakes.map((m) => `- ${m}`).join('\n')}` : ''}\n`
    : '';

  return `You are a technical quiz author. Generate exactly ${questionCount} multiple-choice questions about the topic: "${nodeTitle}".

${description ? `Topic description: ${description}` : ''}
${difficulty}
Learning outcomes to test:
${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}
${explanationSection}
Rules:
- Each question MUST be grounded in the learning content above.
- Do NOT invent concepts outside the listed learning outcomes.
- Each question has exactly 4 options (A, B, C, D).
- The correctAnswer must be the exact text of one of the options.
- Write a brief explanation for why the answer is correct.

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
