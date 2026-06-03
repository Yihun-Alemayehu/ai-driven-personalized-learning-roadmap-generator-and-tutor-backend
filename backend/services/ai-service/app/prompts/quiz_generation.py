from app.schemas import NodeContextInput, LearnerContext, ExplanationContext


def _learner_section(ctx: LearnerContext) -> str:
    parts: list[str] = []
    level = ctx.familiarity_level or "beginner"
    if level == "advanced":
        parts.append("The learner is advanced — use precise technical language, nuanced distractors, and deeper application questions.")
    elif level == "intermediate":
        parts.append("The learner has intermediate knowledge — balance conceptual and applied questions.")
    else:
        parts.append("The learner is a beginner — use simpler phrasing, provide more context in options, and avoid jargon-heavy distractors.")

    if ctx.learning_goal:
        parts.append(f"Their goal is: {ctx.learning_goal}. Slant questions toward this context.")

    if ctx.current_node_attempts > 0:
        score = f" (best: {ctx.current_node_best_score}%)" if ctx.current_node_best_score is not None else ""
        parts.append(f"This is a re-attempt ({ctx.current_node_attempts} prior){score}. Vary questions from previous quizzes.")

    return "\n".join(parts)


def build_quiz_prompt(input_data: NodeContextInput, explanation: ExplanationContext | None = None) -> str:
    count = input_data.question_count or 4
    difficulty_level = input_data.adapted_difficulty or input_data.difficulty_level
    difficulty = f"Difficulty level: {difficulty_level}/5." if difficulty_level else "Difficulty level: intermediate."

    exp = input_data.explanation or explanation
    explanation_block = ""
    if exp:
        mistakes_part = ""
        if exp.common_mistakes:
            mistakes_part = f"\nCommon mistakes to test awareness of:\n" + "\n".join(f"- {m}" for m in exp.common_mistakes)
        explanation_block = (
            f"\nLearning content to base questions on:\n"
            f"Summary: {exp.summary}\n"
            f"Key points:\n" + "\n".join(f"{i+1}. {p}" for i, p in enumerate(exp.key_points))
            + mistakes_part + "\n"
        )

    learner_block = ""
    if input_data.learner_context:
        learner_block = f"\nLearner profile:\n{_learner_section(input_data.learner_context)}\n"

    weak_block = ""
    if input_data.weak_areas:
        items = "\n".join(f"{i+1}. {w}" for i, w in enumerate(input_data.weak_areas))
        half = (count + 1) // 2
        weak_block = (
            f"\nThe learner previously struggled with these areas:\n{items}\n"
            f"Ensure at least {half} of {count} questions target these weak areas while still covering other learning outcomes.\n"
        )

    outcomes = "\n".join(f"{i+1}. {o}" for i, o in enumerate(input_data.learning_outcomes))
    desc_line = f"Topic description: {input_data.description}" if input_data.description else ""

    return f"""You are a technical quiz author. Generate exactly {count} multiple-choice questions about the topic: "{input_data.node_title}".

{desc_line}
{difficulty}
Learning outcomes to test:
{outcomes}
{explanation_block}{learner_block}{weak_block}
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
{{
  "questions": [
    {{
      "questionText": "Which keyword declares a block-scoped variable in JavaScript?",
      "options": ["var", "let", "def", "dim"],
      "correctAnswer": "let",
      "explanation": "'let' declares a block-scoped variable introduced in ES6."
    }}
  ]
}}"""
