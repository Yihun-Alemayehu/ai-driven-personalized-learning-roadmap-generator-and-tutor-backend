import type { QuizGenerationInput } from '../ai.types';

export function buildQuizPrompt(input: QuizGenerationInput): string {
  const { nodeTitle, description, learningOutcomes, difficultyLevel, questionCount = 4 } = input;
  const difficulty = difficultyLevel
    ? `Difficulty level: ${difficultyLevel}/5.`
    : 'Difficulty level: intermediate.';

  return `You are a technical quiz author. Generate exactly ${questionCount} multiple-choice questions about the topic: "${nodeTitle}".

${description ? `Topic description: ${description}` : ''}
${difficulty}
Learning outcomes to test:
${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Rules:
- Each question MUST test one of the learning outcomes above.
- Do NOT invent concepts outside the listed learning outcomes.
- Each question has exactly 4 options (A, B, C, D).
- The correctAnswer must be the exact text of one of the options.
- Write a brief explanation for why the answer is correct.

Respond with ONLY valid JSON. No markdown, no prose, no code blocks.

Required format:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "option A",
      "explanation": "..."
    }
  ]
}`;
}
