import type { MicroQuizInput } from '../ai.types';

export function buildMicroQuizPrompt(input: MicroQuizInput): string {
  const { nodeTitle, learningOutcomes, questionCount = 3 } = input;

  return `You are a spaced repetition tutor. Generate exactly ${questionCount} short recall questions about: "${nodeTitle}".

The learner has previously studied this topic. These questions should test retention of core concepts.
Focus on these learning outcomes:
${learningOutcomes.slice(0, 3).map((o, i) => `${i + 1}. ${o}`).join('\n')}

Rules:
- Keep questions concise and direct.
- Each question has exactly 4 options.
- The correctAnswer must be the exact text of one of the options.
- Explanation should be one sentence.

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
