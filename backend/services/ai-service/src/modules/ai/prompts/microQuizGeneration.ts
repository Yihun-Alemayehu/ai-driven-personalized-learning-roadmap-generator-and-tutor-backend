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

CRITICAL: The correctAnswer field MUST be copied verbatim from the options array — not a letter like "A" or a label like "option C".

Required format:
{
  "questions": [
    {
      "questionText": "What does CSS stand for?",
      "options": ["Cascading Style Sheets", "Creative Style Syntax", "Computer Style System", "Coded Style Sheets"],
      "correctAnswer": "Cascading Style Sheets",
      "explanation": "CSS stands for Cascading Style Sheets, used to style HTML documents."
    }
  ]
}`;
}
