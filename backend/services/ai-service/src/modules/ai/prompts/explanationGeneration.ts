import type { ExplanationInput } from '../ai.types';

export function buildExplanationPrompt(input: ExplanationInput): string {
  const { nodeTitle, description, learningOutcomes } = input;

  const outcomesBlock = learningOutcomes.length > 0
    ? `After reading this explanation, the learner should understand:\n${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : 'No learning outcomes were provided. Base the explanation on the topic title and available description only, and keep the explanation focused and practical.';

  return `You are a technical educator. Write a concise learning explanation for the topic: "${nodeTitle}".

${description ? `Context: ${description}` : ''}
${outcomesBlock}

Rules:
- Write only about concepts within the listed learning outcomes.
- If no learning outcomes are provided, use the title and description as the only source of truth.
- Keep the summary under 200 words.
- Provide 3-5 key points as bullet points.
- Optionally, list 1-3 common mistakes beginners make.

Respond with ONLY valid JSON. No markdown, no prose, no code blocks.

Required format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "commonMistakes": ["...", "..."]
}`;
}
