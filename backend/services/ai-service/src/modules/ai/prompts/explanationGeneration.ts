import type { ExplanationInput, LearnerContext } from '../ai.types';

function buildLearnerSection(ctx: LearnerContext): string {
  const parts: string[] = [];

  const level = ctx.familiarityLevel ?? 'beginner';
  if (level === 'advanced') {
    parts.push('The learner is advanced — skip introductory material, focus on edge cases, patterns, and deeper insights.');
  } else if (level === 'intermediate') {
    parts.push('The learner has intermediate knowledge — balance foundational concepts with practical depth.');
  } else {
    parts.push('The learner is a beginner — use simple language, concrete analogies, and step-by-step explanations.');
  }

  const style = ctx.preferredLearningStyle;
  if (style === 'visual') {
    parts.push('They prefer visual learning — include diagrams described in text, concrete examples, and comparisons.');
  } else if (style === 'hands_on') {
    parts.push('They prefer hands-on learning — include practical code snippets, exercises, and actionable steps.');
  } else if (style === 'video') {
    parts.push('They prefer video-style learning — use a conversational tone with clear, sequential walkthrough style.');
  } else if (style === 'reading') {
    parts.push('They prefer reading — use well-structured prose with clear headings-style organization.');
  }

  if (ctx.learningGoal) {
    parts.push(`Their learning goal is: ${ctx.learningGoal}. Slant examples and emphasis accordingly.`);
  }

  if (ctx.priorSkills) {
    parts.push(`They already know: ${ctx.priorSkills}. Skip re-explaining these and build on them where relevant.`);
  }

  if (ctx.aboutSelf) {
    parts.push(`Additional learner context: ${ctx.aboutSelf}`);
  }

  if (ctx.currentNodeAttempts > 0) {
    const scoreNote = ctx.currentNodeBestScore !== null
      ? ` (best score: ${ctx.currentNodeBestScore}%)`
      : '';
    parts.push(`They have attempted this node ${ctx.currentNodeAttempts} time(s)${scoreNote}. Reinforce areas they may be struggling with.`);
  }

  const progress = ctx.totalNodes > 0
    ? `${ctx.nodesCompleted}/${ctx.totalNodes} nodes completed`
    : null;
  if (progress) {
    parts.push(`Overall progress: ${progress}.`);
  }

  return parts.join('\n');
}

/**
 * Prompt for streaming text output.
 * Outputs structured sections instead of JSON so tokens can be shown progressively.
 */
export function buildStreamExplanationPrompt(input: ExplanationInput): string {
  const { nodeTitle, description, learningOutcomes, weakAreas, learnerContext } = input;

  const outcomesBlock = learningOutcomes.length > 0
    ? `After reading this explanation, the learner should understand:\n${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : 'Base the explanation on the topic title and description only.';

  const learnerBlock = learnerContext
    ? `\nLearner profile:\n${buildLearnerSection(learnerContext)}\n`
    : '';

  const weakAreasBlock = weakAreas && weakAreas.length > 0
    ? `\nThe learner previously struggled with:\n${weakAreas.map((w, i) => `${i + 1}. ${w}`).join('\n')}\nGive extra attention to these areas.\n`
    : '';

  return `You are a technical educator. Write a learning explanation for: "${nodeTitle}".

${description ? `Context: ${description}` : ''}
${outcomesBlock}
${learnerBlock}${weakAreasBlock}
Rules:
- Adapt depth and style to the learner profile above.
- Keep the summary under 150 words.
- Provide 3 to 5 key points as complete sentences.
- Optionally list 1 to 3 common mistakes (omit the section if none apply).
- Write only about the listed learning outcomes.

Output your response in EXACTLY this format with these section markers on their own lines:

[SUMMARY]
Write 2-3 sentences summarising the topic here.

[KEY_POINTS]
- Write each key point as a complete sentence starting with a dash
- Include 3 to 5 points

[COMMON_MISTAKES]
- Write each mistake starting with a dash
- Include 1 to 3 (or omit this section entirely if not applicable)`;
}

export function buildExplanationPrompt(input: ExplanationInput): string {
  const { nodeTitle, description, learningOutcomes, weakAreas, learnerContext } = input;

  const outcomesBlock = learningOutcomes.length > 0
    ? `After reading this explanation, the learner should understand:\n${learningOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : 'No learning outcomes were provided. Base the explanation on the topic title and available description only, and keep the explanation focused and practical.';

  const learnerBlock = learnerContext
    ? `\nLearner profile:\n${buildLearnerSection(learnerContext)}\n`
    : '';

  const weakAreasBlock = weakAreas && weakAreas.length > 0
    ? `\nThe learner previously struggled with these areas:\n${weakAreas.map((w, i) => `${i + 1}. ${w}`).join('\n')}\nFocus extra detail and clearer examples on these specific areas.\n`
    : '';

  return `You are a technical educator. Write a concise learning explanation for the topic: "${nodeTitle}".

${description ? `Context: ${description}` : ''}
${outcomesBlock}
${learnerBlock}${weakAreasBlock}
Rules:
- Write only about concepts within the listed learning outcomes.
- If no learning outcomes are provided, use the title and description as the only source of truth.
- Adapt the depth, tone, and style to match the learner profile above.
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
