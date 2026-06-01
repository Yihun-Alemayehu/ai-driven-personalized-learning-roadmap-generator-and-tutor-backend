from pydantic import BaseModel, Field


class LearnerContext(BaseModel):
    familiarity_level: str | None = None
    learning_goal: str | None = None
    weekly_hours: int | None = None
    about_self: str | None = None
    preferred_learning_style: str | None = None
    prior_skills: str | None = None
    current_node_attempts: int = 0
    current_node_best_score: float | None = None
    current_node_mastery_state: str = "not_started"
    overall_avg_score: float | None = None
    nodes_completed: int = 0
    total_nodes: int = 0


class ExplanationContext(BaseModel):
    summary: str
    key_points: list[str]
    common_mistakes: list[str] | None = None


class NodeContextInput(BaseModel):
    node_id: str
    node_title: str
    description: str | None = None
    learning_outcomes: list[str] = Field(default_factory=list)
    difficulty_level: int | None = Field(None, ge=1, le=5)
    adapted_difficulty: int | None = Field(None, ge=1, le=5)
    question_count: int | None = Field(None, ge=2, le=8)
    explanation: ExplanationContext | None = None
    weak_areas: list[str] | None = None
    learner_context: LearnerContext | None = None


class AskQuestionInput(BaseModel):
    node_id: str
    node_title: str
    question: str = Field(min_length=3, max_length=1000)
    description: str | None = None
    learning_outcomes: list[str] | None = None
    explanation: ExplanationContext | None = None
    learner_context: LearnerContext | None = None


class GeneratedQuestion(BaseModel):
    question_text: str
    options: list[str]
    correct_answer: str
    explanation: str


class GeneratedQuiz(BaseModel):
    questions: list[GeneratedQuestion]
    generated_by: str = "ai_tutor"


class GeneratedExplanation(BaseModel):
    summary: str
    key_points: list[str]
    common_mistakes: list[str] | None = None
