import type { ExplanationInput } from '../ai.types';

export function buildExplanationPrompt(input: ExplanationInput): string {
  const { nodeTitle, description, learningOutcomes } = input;

  return `You are a technical educator. Write a concise learning explanation for the topic: "${nodeTitle}".

${description ? `Context: ${description}` : ''}
After reading this explanation, the learner should understand:
${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Rules:
- Write only about concepts within the listed learning outcomes.
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
