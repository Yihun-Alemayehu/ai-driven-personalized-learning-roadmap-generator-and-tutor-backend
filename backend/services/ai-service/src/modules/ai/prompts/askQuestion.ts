interface AskInput {
  nodeTitle: string;
  description?: string;
  learningOutcomes?: string[];
  question: string;
  explanation?: {
    summary: string;
    keyPoints: string[];
    commonMistakes?: string[];
  } | null;
}

export function buildAskPrompt(input: AskInput): string {
  const { nodeTitle, description, learningOutcomes, question, explanation } = input;

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

  return `You are a knowledgeable and encouraging AI instructor helping a learner study "${nodeTitle}".

${contextParts.length > 0 ? `Node context:\n${contextParts.join('\n\n')}\n\n` : ''}Student's question: ${question}

Answer clearly and helpfully in 2-5 sentences. Tailor depth to the question.
Return ONLY this JSON with no extra text:
{"answer":"<your answer here>"}`;
}
