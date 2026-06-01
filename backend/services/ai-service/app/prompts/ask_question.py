from app.schemas import AskQuestionInput, LearnerContext


def _learner_profile_section(ctx: LearnerContext) -> str:
    parts: list[str] = []
    level = ctx.familiarity_level or "beginner"
    parts.append(f"Level: {level}")
    if ctx.learning_goal:
        parts.append(f"Goal: {ctx.learning_goal}")
    if ctx.preferred_learning_style:
        parts.append(f"Preferred style: {ctx.preferred_learning_style}")
    if ctx.prior_skills:
        parts.append(f"Prior skills: {ctx.prior_skills}")
    if ctx.about_self:
        parts.append(f"About them: {ctx.about_self}")
    if ctx.current_node_attempts > 0:
        score = f" (best: {ctx.current_node_best_score}%)" if ctx.current_node_best_score is not None else ""
        parts.append(f"Attempts on this node: {ctx.current_node_attempts}{score}")
    if ctx.total_nodes > 0:
        parts.append(f"Progress: {ctx.nodes_completed}/{ctx.total_nodes} nodes completed")
    return "\n".join(parts)


def _context_block(input_data: AskQuestionInput) -> str:
    parts: list[str] = []
    if input_data.description:
        parts.append(f"Description: {input_data.description}")
    if input_data.learning_outcomes:
        items = "\n".join(f"  - {o}" for o in input_data.learning_outcomes)
        parts.append(f"Learning outcomes:\n{items}")
    if input_data.explanation:
        exp = input_data.explanation
        parts.append(f"AI-generated summary: {exp.summary}")
        if exp.key_points:
            items = "\n".join(f"  - {p}" for p in exp.key_points)
            parts.append(f"Key concepts covered:\n{items}")
        if exp.common_mistakes:
            items = "\n".join(f"  - {m}" for m in exp.common_mistakes)
            parts.append(f"Common mistakes to avoid:\n{items}")
    return "\n\n".join(parts)


def _depth_guidance(ctx: LearnerContext | None) -> str:
    level = ctx.familiarity_level if ctx else "beginner"
    if level == "advanced":
        return "Give a precise, technical answer. Skip basics they already know."
    elif level == "intermediate":
        return "Balance clarity with technical depth."
    return "Use simple language and concrete analogies. Be encouraging."


def build_ask_prompt(input_data: AskQuestionInput) -> str:
    ctx_block = _context_block(input_data)
    learner_block = f"\nLearner profile:\n{_learner_profile_section(input_data.learner_context)}\n" if input_data.learner_context else ""
    depth = _depth_guidance(input_data.learner_context)
    ctx_section = f"Node context:\n{ctx_block}\n\n" if ctx_block else ""

    return f"""You are a knowledgeable and encouraging AI instructor helping a learner study "{input_data.node_title}".

{ctx_section}{learner_block}
Student's question: {input_data.question}

{depth}
Answer clearly and helpfully in 2-5 sentences. Tailor depth to the question and learner profile.
Return ONLY this JSON with no extra text:
{{"answer":"<your answer here>"}}"""


def build_stream_ask_prompt(input_data: AskQuestionInput) -> str:
    """Streaming variant — plain text output so tokens stream naturally."""
    ctx_block = _context_block(input_data)
    learner_block = f"\nLearner profile:\n{_learner_profile_section(input_data.learner_context)}\n" if input_data.learner_context else ""
    depth = _depth_guidance(input_data.learner_context)
    ctx_section = f"Node context:\n{ctx_block}\n\n" if ctx_block else ""

    return f"""You are a knowledgeable and encouraging AI instructor helping a learner study "{input_data.node_title}".

{ctx_section}{learner_block}
Student's question: {input_data.question}

{depth}
Answer clearly and helpfully in 2-5 sentences. Tailor depth to the question and learner profile.
Write your answer as plain readable text. Do not use JSON, code blocks, or any special formatting."""
