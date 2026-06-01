from app.schemas import NodeContextInput


def build_micro_quiz_prompt(input_data: NodeContextInput) -> str:
    count = input_data.question_count or 3
    outcomes = input_data.learning_outcomes[:3]
    outcomes_block = "\n".join(f"{i+1}. {o}" for i, o in enumerate(outcomes))

    return f"""You are a spaced repetition tutor. Generate exactly {count} short recall questions about: "{input_data.node_title}".

The learner has previously studied this topic. These questions should test retention of core concepts.
Focus on these learning outcomes:
{outcomes_block}

Rules:
- Keep questions concise and direct.
- Each question has exactly 4 options.
- The correctAnswer must be the exact text of one of the options.
- Explanation should be one sentence.

Respond with ONLY valid JSON. No markdown, no prose, no code blocks.

CRITICAL: The correctAnswer field MUST be copied verbatim from the options array — not a letter like "A" or a label like "option C".

Required format:
{{
  "questions": [
    {{
      "questionText": "What does CSS stand for?",
      "options": ["Cascading Style Sheets", "Creative Style Syntax", "Computer Style System", "Coded Style Sheets"],
      "correctAnswer": "Cascading Style Sheets",
      "explanation": "CSS stands for Cascading Style Sheets, used to style HTML documents."
    }}
  ]
}}"""
