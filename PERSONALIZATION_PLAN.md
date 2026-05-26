# Personalization Audit & Enhancement Plan

> **Project:** AI-Driven Personalized Learning Roadmap Generator and Tutor
>
> **Audit date:** 2026-05-22 · **Completed:** 2026-05-26
>
> **Purpose:** Audit the state of personalization and define a phased plan to make every roadmap, explanation, quiz, and timeline specific to each learner's state.

> [!NOTE]
> **All phases (0–4) are fully implemented as of 2026-05-26.** Part 1 is a historical audit of the gaps that existed on 2026-05-22. Part 2 describes the implementation plan that has since been executed.

---

## Part 1 — Historical Audit (State as of 2026-05-22)

> These sections describe the gaps that existed before implementation. They are kept for reference and FYP documentation. See Part 2 for the implemented solution.

### 1.1 Active Personalization Mechanisms (at audit time)

The platform had **three** active personalization mechanisms. All were reactive (post-enrollment), none were proactive (at enrollment time).

| Mechanism | File | Description |
|-----------|------|-------------|
| **Branch-path selection** | `learning-service/src/modules/enrollments/enrollments.service.ts:44` | Learner chooses a branch (e.g., frontend/backend/data_science) at enrollment. The roadmap filters nodes to the selected branch. This is the **only** user choice that changes what content is presented. |
| **Gatekeeper tiering** | `learning-service/src/modules/gatekeeper/gatekeeper.service.ts` — `classifyScore()` | Five tiers based on quiz score: strong_pass (>=80%), marginal_pass (70-79%), fail_low (50-69%), fail_fundamental (30-49%), fail_severe (<30%). Different tiers trigger adaptation events (resource_swap, prerequisite_review, instructor_escalation). |
| **Knowledge decay** | `learning-service/src/modules/decay/decay.service.ts` — `runDecayScan()` | Time-based mastery regression: mastered -> review_needed after 14 days (strong pass) or 7 days (marginal pass); review_needed -> relearn after 30 days. |

**What these didn't do (at audit time):** None influenced AI-generated content. This gap has since been closed — see Part 2.

### 1.2 Data Collected but Not Yet Consumed (at audit time)

Four enrollment fields were stored but unused. All are now consumed downstream.

| Field | Type | Status |
|-------|------|--------|
| `weeklyHours` | `Int?` | ✅ Now drives timeline estimates (`progress.service.ts:211`) |
| `familiarityLevel` | `VarChar(20)` — beginner / intermediate / advanced | ✅ Now drives explanation depth, quiz difficulty, and unlock acceleration |
| `learningGoal` | `VarChar(30)` — get_job / upskill / hobby / certification | ✅ Now slants AI prompts and triggers practice exam / portfolio project node injection |
| `aboutSelf` | `text` | ✅ Now included in AI instructor and explanation prompts |

### 1.3 Rich Per-Learner Data That Never Reaches AI

The progress system tracks detailed per-learner data. All of it now reaches the AI service via the learner context pipeline (Phase 0B).

| Data Point | Location | Now Used For |
|------------|----------|-------------|
| `attemptsCount` | `LearnerNodeProgress` | ✅ Included in `LearnerContext` — AI adjusts depth on high-attempt nodes |
| `bestQuizScore` | `LearnerNodeProgress` | ✅ Drives adaptive difficulty in `computeAdaptiveDifficulty()` |
| `masteryState` | `LearnerNodeProgress` | ✅ In `LearnerContext.currentNodeMasteryState` |
| `QuizAttempt.answers` | `QuizAttempt` table | ✅ Analyzed by `detectWeakAreas()` — identifies wrong questions, passed as `weakAreas` to quiz/explanation prompts |
| `adaptationEvents` | `AdaptationEvent` table | Displayed in attempt review (content generation not yet affected) |

### 1.4 Global Caching (at audit time) → Tiered Caching (current)

At audit time, every artifact was cached globally per node. Caching is now tiered:

```
// Current ai-service/src/modules/ai/ai.cache.ts
quiz:        quiz:ai:{nodeId}:d{difficulty}:{familiarityLevel}   // per difficulty+familiarity
explanation: explanation:{nodeId}:{familiarityLevel}              // per familiarity level
remedial:    quiz:remedial:{nodeId}:{learnerId}                   // per learner, 2h TTL
microQuiz:   micro-quiz:ai:{nodeId}                               // still global (lightweight)
```

### 1.5 AI Prompts (at audit time) → Fully Contextualized (current)

All three prompt builders now receive a full `LearnerContext` object in addition to node metadata.

| Prompt | Learner Context Used |
|--------|---------------------|
| `explanationGeneration.ts` | ✅ `familiarityLevel`, `preferredLearningStyle`, `learningGoal`, `priorSkills`, `aboutSelf` |
| `quizGeneration.ts` | ✅ `adaptedDifficulty`, `familiarityLevel`, `learningGoal`, `weakAreas` (from failed attempts) |
| `askQuestion.ts` | ✅ Full profile: level, goal, style, attempts, best score, progress, `aboutSelf` |

### 1.6 Missing Enrollment Parameters (at audit time) → Added

Both parameters are now collected and used:

| Parameter | Status |
|-----------|--------|
| **`preferredLearningStyle`** (visual / reading / hands_on / video) | ✅ Added to `EnrollDialog.tsx` Step 2; stored in DB; drives explanation format |
| **`priorSkills`** (free-text) | ✅ Added to `EnrollDialog.tsx` Step 2; stored in DB; drives node subtraction at enrollment |

### 1.7 What Was Completely Missing (at audit time) → Now Implemented

- ✅ **Learner context pipeline** — `learner-context.service.ts` builds a `LearnerContext` object from enrollment + progress data on every AI request
- ✅ **Estimated completion dates** — `getTimelineEstimate()` in `progress.service.ts`, velocity-adjusted, shown in RoadmapPage and InsightsPage
- ✅ **Adaptive quiz difficulty** — `computeAdaptiveDifficulty()` adjusts ±1 based on scores and overall average
- ✅ **Post-failure content targeting** — `detectWeakAreas()` extracts wrong questions; quiz and explanation prompts inject `weakAreas`
- ✅ **Roadmap shaping** — unlock acceleration (advanced/intermediate), node subtraction (priorSkills matching), node addition (primer/practice exam/portfolio nodes)
- ✅ **Learning velocity tracking** — `LearnerVelocity` model, `velocity.service.ts`, feeds timeline multiplier

### 1.8 The Core Disconnect — Resolved

The platform has a well-designed **Skeleton** (ontology DAG with prerequisites, branching, convergence, difficulty levels, estimated hours) and a functioning **Flesh** generation pipeline (Phi-4 → Ollama → Gemini fallback chain with circuit breaker).

The disconnect — **Flesh generated without knowledge of the learner** — has been closed. Every AI call now carries a `LearnerContext` built from the learner's enrollment profile and live progress data.

The enrollment form collects learner attributes, and the progress system tracks rich per-learner data — but none of this reaches the AI service. The result: a "personalized learning platform" that generates one-size-fits-all content.

---

## Part 2 — Enhancement Plan (All Phases Complete ✅)

### Phase 0 — Foundation: Learner Context Pipeline + New Parameters ✅ DONE

#### 0A: Add New Enrollment Parameters ✅

Capture a richer learner profile at enrollment time.

**Schema changes** (`learning-service/prisma/schema.prisma`):
```prisma
model Enrollment {
  // ... existing fields ...
  preferredLearningStyle  String?   @db.VarChar(20) @map("preferred_learning_style")
  // enum: 'visual' | 'reading' | 'hands_on' | 'video'
  priorSkills             String?   @map("prior_skills")
  // comma-separated or JSON array of skills the learner already knows
}
```

**Backend changes:**
- `learning-service/src/modules/enrollments/enrollments.types.ts` — add `preferredLearningStyle` and `priorSkills` to `EnrollInput` and `Enrollment` interfaces
- `learning-service/src/modules/enrollments/enrollments.service.ts` — store new fields in `enroll()`

**Frontend changes:**
- `frontend/src/features/catalog/components/EnrollDialog.tsx` — add to Step 2:
  - Learning style: radio grid with 4 options (visual / reading / hands-on / video)
  - Prior skills: tag input or textarea (e.g., "HTML, CSS, JavaScript basics")

**Migration:** `npx prisma migrate dev --name add-learner-profile-fields`

---

#### 0B: Create Learner Context Pipeline ✅

Build the infrastructure to pass learner context from learning-service to ai-service.

**New file:** `learning-service/src/modules/progress/learner-context.service.ts`

```typescript
interface LearnerContext {
  // From Enrollment
  familiarityLevel: string | null;
  learningGoal: string | null;
  weeklyHours: number | null;
  aboutSelf: string | null;
  preferredLearningStyle: string | null;
  priorSkills: string | null;

  // From LearnerNodeProgress (current node)
  currentNodeAttempts: number;
  currentNodeBestScore: number | null;
  currentNodeMasteryState: string;

  // Aggregate progress
  overallAvgScore: number | null;
  nodesCompleted: number;
  totalNodes: number;
}

async function buildLearnerContext(
  userId: string,
  enrollmentId: string,
  nodeId: string,
): Promise<LearnerContext>
```

**AI service changes** (`ai-service/src/modules/ai/ai.types.ts`):
- Add optional `learnerContext?: LearnerContext` to `QuizGenerationInput`, `ExplanationInput`, `AskQuestionInput`
- Add Joi validation for the new field (optional object)

**Learning service client changes** (`learning-service/src/lib/aiClient.ts`):
- Extend `NodeContext` interface with optional `learnerContext`
- All `requestAi*` functions forward `learnerContext` when present

**Files:**
- `learning-service/src/modules/progress/learner-context.service.ts` (new)
- `ai-service/src/modules/ai/ai.types.ts`
- `ai-service/src/modules/ai/ai.controller.ts` (Joi validation)
- `learning-service/src/lib/aiClient.ts`

---

### Phase 1 — Quick Wins: Use What We Collect ✅ DONE

#### 1A: Personalized Explanations ✅

Explanations adapted to the learner's profile. The same node produces different explanations for different learners.

**Prompt changes** (`ai-service/src/modules/ai/prompts/explanationGeneration.ts`):

Inject a `Learner Profile` section into the system prompt based on `learnerContext`:

| Field | Prompt Injection |
|-------|-----------------|
| `familiarityLevel = 'beginner'` | "Use simple language, more analogies, explain foundational concepts. Define jargon." |
| `familiarityLevel = 'advanced'` | "Go deeper into edge cases, performance implications, advanced patterns. Skip basic definitions." |
| `preferredLearningStyle = 'visual'` | "Include ASCII diagrams, flowcharts, and visual examples where possible." |
| `preferredLearningStyle = 'hands_on'` | "Include code snippets and practical exercises. Show, don't just tell." |
| `learningGoal = 'get_job'` | "Slant examples toward real-world job scenarios and interview-relevant knowledge." |
| `learningGoal = 'certification'` | "Focus on theoretical depth and exam-style precision." |
| `priorSkills` | "The learner already knows: {skills}. Skip re-explaining these; reference them as assumed knowledge." |
| `aboutSelf` | "Additional context: {aboutSelf}" (truncated to 200 chars in prompt) |

**Cache key change** (`ai-service/src/modules/ai/ai.cache.ts`):
```
explanation: (nodeId, familiarityLevel) =>
  `explanation:${nodeId}:${familiarityLevel ?? 'default'}`
```
This creates at most 4 cached variants per node (beginner, intermediate, advanced, default). The `learningGoal`, `priorSkills`, etc. add prompt variation within each tier but aren't part of the cache key — an acceptable trade-off between personalization and cost.

**Service changes** (`learning-service/src/modules/quizzes/quizzes.service.ts`):
- `getNodeExplanation()`: Call `buildLearnerContext()`, pass to `requestAiExplanation()`

**Files:**
- `ai-service/src/modules/ai/prompts/explanationGeneration.ts`
- `ai-service/src/modules/ai/ai.cache.ts`
- `learning-service/src/modules/quizzes/quizzes.service.ts`

---

#### 1B: Personalized AI Instructor ✅

The AI instructor knows who the learner is, what they've struggled with, and their background.

**Prompt changes** (`ai-service/src/modules/ai/prompts/askQuestion.ts`):

Add a `Learner Profile` section to the system prompt:
```
Learner profile:
- Experience level: {familiarityLevel}
- Goal: {learningGoal}
- Learning style preference: {preferredLearningStyle}
- This node: {currentNodeAttempts} quiz attempts, best score {currentNodeBestScore}%
- Overall progress: {nodesCompleted}/{totalNodes} nodes completed
- Background: {aboutSelf}

Adjust your explanation depth, vocabulary, and examples accordingly.
If the learner has failed this node's quiz multiple times, be more patient
and break concepts into smaller steps.
```

**Service changes** (`learning-service/src/modules/quizzes/quizzes.service.ts`):
- `askNodeQuestion()`: Call `buildLearnerContext()`, pass to `requestAiAsk()`

**Frontend changes:**
- `frontend/src/features/learn/components/AiInstructorPanel.tsx` — accept `enrollmentId` prop
- `frontend/src/api/instructor-chat.ts` — extend mutation payload with `enrollmentId`
- `frontend/src/features/learn/LearnPage.tsx` — pass `enrollmentId` to `AiInstructorPanel`

**No caching change needed** — ask-question responses are already uncached (unique per conversation).

**Files:**
- `ai-service/src/modules/ai/prompts/askQuestion.ts`
- `learning-service/src/modules/quizzes/quizzes.service.ts`
- `frontend/src/features/learn/components/AiInstructorPanel.tsx`
- `frontend/src/api/instructor-chat.ts`
- `frontend/src/features/learn/LearnPage.tsx`

---

#### 1C: Estimated Timelines ✅

Show per-node and total completion estimates based on `weeklyHours` and `estimatedHours`.

**New function** in `learning-service/src/modules/progress/progress.service.ts`:

```typescript
async function getTimelineEstimate(enrollmentId: string, userId: string) {
  // 1. Fetch enrollment.weeklyHours (default 8 if null)
  // 2. Fetch all LearnerNodeProgress with their nodes' estimatedHours
  // 3. remainingHours = sum of estimatedHours for nodes not yet mastered
  // 4. weeksRemaining = remainingHours / weeklyHours
  // 5. estimatedCompletionDate = now + (weeksRemaining * 7 days)
  return {
    totalEstimatedHours,
    remainingHours,
    weeklyHours,
    estimatedWeeksRemaining,
    estimatedCompletionDate,
  };
}
```

**New endpoint:** `GET /enrollments/:id/timeline`

**Frontend changes:**
- `ProgressSidebar.tsx`: "Estimated completion" section with date and weekly commitment
- `LearnContent.tsx`: node header meta row shows "~X days at your pace"

**Files:**
- `learning-service/src/modules/progress/progress.service.ts`
- `learning-service/src/modules/progress/progress.controller.ts`
- `frontend/src/features/learn/components/ProgressSidebar.tsx`
- `frontend/src/features/learn/components/LearnContent.tsx`

---

### Phase 2 — Adaptive Content ✅ DONE

#### 2A: Adaptive Quiz Difficulty + Explanation-Grounded Personalized Quizzes ✅

Two changes in one: adaptive difficulty AND quizzes grounded in the learner's personalized explanation.

**Adaptive difficulty** — new function in `learning-service/src/modules/progress/learner-context.service.ts`:

```typescript
function computeAdaptiveDifficulty(
  nodeStaticDifficulty: number,
  currentNodeBestScore: number | null,
  currentNodeAttempts: number,
  overallAvgScore: number | null,
): number {
  // First attempt: use node's static difficulty
  // Previous strong_pass (>=80%): difficulty + 1 (cap at 5)
  // Previous fail_low or worse (<70%): difficulty - 1 (floor at 1)
  // Also factor overall average: consistently >85% → bias harder; <60% → bias easier
}
```

**Explanation-grounded quizzes** — the quiz must be built from the learner's personalized explanation:

In `quizzes.service.ts` `getQuizForNode()`:
1. First call `getNodeExplanation()` (which now returns personalized content from 1A)
2. Pass the personalized explanation + `learnerContext` to `requestAiQuiz()`
3. The quiz prompt already accepts an `explanation` field — just ensure the personalized version is passed, not a global cached one

**Prompt changes** (`ai-service/src/modules/ai/prompts/quizGeneration.ts`):
- Add learner context section similar to explanation prompt
- For beginners: simpler question phrasing, more context in options
- For advanced: more nuanced distractors, deeper application questions

**Cache key change:**
```
quiz: (nodeId, adaptedDifficulty, familiarityLevel) =>
  `quiz:ai:${nodeId}:d${adaptedDifficulty}:${familiarityLevel ?? 'default'}`
```
Up to 15 variants per node (5 difficulty levels x 3 familiarity levels + defaults).

**Files:**
- `learning-service/src/modules/progress/learner-context.service.ts`
- `learning-service/src/modules/quizzes/quizzes.service.ts`
- `ai-service/src/modules/ai/prompts/quizGeneration.ts`
- `ai-service/src/modules/ai/ai.cache.ts`

---

#### 2B: Adaptive Content After Failure ✅

When a learner fails a quiz, the re-explanation and re-quiz target their specific weak areas.

**Weak area detection** — in `quizzes.service.ts`:
```typescript
// On re-attempt (attemptsCount > 0), query the most recent QuizAttempt
// Join with QuizQuestion to find which questions were wrong
// Extract the learning outcomes associated with wrong questions
// Pass as weakAreas to the AI service
```

**Type changes** (`ai-service/src/modules/ai/ai.types.ts`):
- Add `weakAreas?: string[]` to `QuizGenerationInput` and `ExplanationInput`

**Prompt changes** (`ai-service/src/modules/ai/prompts/quizGeneration.ts`):
```
The learner previously struggled with these areas:
1. {weakArea1}
2. {weakArea2}
Ensure at least 50% of questions target these weak areas
while still covering other learning outcomes.
```

**Explanation prompt** (`explanationGeneration.ts`) — similar injection:
```
The learner struggled with: {weakAreas}
Focus extra detail on these areas.
```

**Remedial cache key:**
```
quiz:remedial:${nodeId}:${hash(weakAreas.sort().join(','))}
```
TTL: 2 hours (regenerate frequently as the learner improves).

**Frontend changes:**
- `OutcomeScreen` (quiz result): on failure, add "Review weak areas" button
- `LearnContent.tsx`: when accessed after failure, show a "Focused on your weak areas" banner

**Files:**
- `learning-service/src/modules/quizzes/quizzes.service.ts`
- `ai-service/src/modules/ai/ai.types.ts`
- `ai-service/src/modules/ai/prompts/quizGeneration.ts`
- `ai-service/src/modules/ai/prompts/explanationGeneration.ts`
- `ai-service/src/modules/ai/ai.cache.ts`
- `frontend/src/features/learn/components/LearnContent.tsx`

---

### Phase 3 — Roadmap Personalization ✅ DONE

#### 3A: Personalized Roadmap Generation — Unlock, Add, and Subtract Nodes ✅

The roadmap should be shaped by the learner's profile at enrollment time. Three dimensions of personalization:

##### Unlock Acceleration

Modify `enrollments.service.ts` `enroll()` — after creating progress rows:

| Familiarity Level | Behavior |
|-------------------|----------|
| `advanced` | Auto-unlock nodes with `difficultyLevel <= 2`. Auto-master `difficultyLevel === 1` nodes (skip trivial content entirely). |
| `intermediate` | Auto-unlock `difficultyLevel === 1` nodes. |
| `beginner` | Keep default — only root nodes (no prerequisites) are unlocked. |

##### Node Subtraction (Skip Redundant Nodes)

Use `priorSkills` to identify nodes the learner already knows:

1. Parse `priorSkills` into a list of skill keywords
2. For each ontology node, check if the node title, description, or learning outcomes contain any of the learner's prior skills (case-insensitive keyword matching)
3. For matched nodes: set `masteryState = 'mastered'` and `unlocked = true`
4. DAG integrity is preserved — downstream nodes still unlock based on prerequisites being mastered
5. Show skipped nodes in the roadmap UI with an "Already known" badge and greyed-out visual treatment

##### Node Addition (Supplementary Content)

Inject enrollment-specific nodes that don't exist in the base ontology:

| Condition | Supplementary Node Type |
|-----------|------------------------|
| `familiarityLevel === 'beginner'` AND node `difficultyLevel >= 4` | **Primer node** — lightweight prerequisite review covering foundational concepts the beginner may need before tackling the hard node. AI-generated at enrollment time. |
| `learningGoal === 'certification'` | **Practice exam node** — at the end of each branch, aggregates questions across all branch nodes for exam-style practice. |
| `learningGoal === 'get_job'` | **Portfolio project node** — at branch convergence points, provides a guided project that demonstrates the skills from the branch. |

**Schema change** (`learning-service/prisma/schema.prisma`):
```prisma
model SupplementaryNode {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  enrollmentId    String      @db.Uuid
  title           String
  description     String?
  nodeType        String      @db.VarChar(30)  // 'primer' | 'practice_exam' | 'portfolio_project'
  targetNodeId    String?     @db.Uuid         // the ontology node this supplements
  position        String      @db.VarChar(10)  // 'before' | 'after' | 'end_of_branch'
  content         Json?                         // AI-generated content
  createdAt       DateTime    @default(now()) @db.Timestamptz(6)

  enrollment      Enrollment  @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  targetNode      LearningNode? @relation(fields: [targetNodeId], references: [id])

  @@map("supplementary_nodes")
}
```

**Roadmap/progress service changes** (`learning-service/src/modules/progress/progress.service.ts`):
- In `getRoadmap()`: also fetch `SupplementaryNode` records for the enrollment
- Merge them into the node list at their specified positions

**Frontend changes:**
- After enrollment, show a summary: "Skipped 3 nodes you already know. Added 2 primer nodes for fundamentals."
- Roadmap canvas: supplementary nodes have dashed borders and a distinct icon; skipped nodes are greyed out with "Already known" badge

**Files:**
- `learning-service/prisma/schema.prisma`
- `learning-service/src/modules/enrollments/enrollments.service.ts`
- `learning-service/src/modules/progress/progress.service.ts`
- `frontend/src/features/catalog/components/EnrollDialog.tsx`
- `frontend/src/features/roadmap/` components

---

### Phase 4 — Learning Intelligence ✅ DONE

#### 4A: Learning Velocity Tracking ✅

Track how fast a learner progresses vs. expected pace to refine timeline estimates.

**New model** (`learning-service/prisma/schema.prisma`):
```prisma
model LearnerVelocity {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String    @db.Uuid
  enrollmentId    String    @db.Uuid
  nodeId          String    @db.Uuid
  estimatedHours  Decimal?  @db.Decimal(4, 1)
  actualHours     Decimal   @db.Decimal(6, 2)
  startedAt       DateTime  @db.Timestamptz(6)
  completedAt     DateTime  @db.Timestamptz(6)
  velocityRatio   Decimal   @db.Decimal(4, 2)  // actual/estimated; <1 = faster

  @@map("learner_velocity")
}
```

**Velocity computation** — when a node transitions to `mastered`:
1. `startedAt` = first explanation request or first quiz start for this user+node
2. `completedAt` = mastery quiz completion timestamp
3. `actualHours` = time difference (approximation of active learning time)
4. `velocityRatio = actualHours / estimatedHours`

**Integration with timelines (1C):**
- `getTimelineEstimate()` now uses `averageVelocityRatio` as a multiplier:
  - `adjustedRemainingHours = remainingHours * avgVelocityRatio`
  - If avg < 0.8: learner is faster than expected; adjust estimates down
  - If avg > 1.3: learner is slower; adjust estimates up

**Frontend:** "You're learning 20% faster than average" indicator in the progress sidebar.

**Files:**
- `learning-service/prisma/schema.prisma`
- `learning-service/src/modules/gatekeeper/gatekeeper.service.ts`
- `learning-service/src/modules/progress/progress.service.ts`

---

#### 4B: Per-Learner Caching Strategy ✅

Replace global per-node caching with a tiered strategy that balances personalization with API cost.

| Tier | Cache Key Pattern | TTL | Use Case |
|------|-------------------|-----|----------|
| **Tier 1: Global per familiarity** | `explanation:{nodeId}:{familiarityLevel}` | 24h | Shared across all learners at the same familiarity level |
| **Tier 2: Per difficulty** | `quiz:ai:{nodeId}:d{difficulty}:{familiarityLevel}` | 7d | Shared across learners at the same difficulty + familiarity |
| **Tier 3: Per learner (remedial)** | `quiz:remedial:{nodeId}:{learnerId}` | 2h | Unique to learner's weak areas; short TTL because weak areas change as learner improves |
| **Tier 4: Uncached** | N/A | — | AI instructor chat (already uncached — each interaction is unique) |

**Cache invalidation rules:**
- When a learner passes a previously failed quiz: invalidate their Tier 3 remedial entries for that node
- When a learner's `familiarityLevel` is updated: no invalidation needed (rare; they'd re-enroll)

**Files:**
- `ai-service/src/modules/ai/ai.cache.ts`

---

## Dependency Graph

```
[0A: New Enrollment Params]
  |
  v
[0B: Learner Context Pipeline]  <-- depends on 0A (reads new fields)
  |
  +----------+-----------+
  v          v           v
[1A]       [1B]        [1C]  <-- independent of 0B
  |          |           |
  v          v           v
[2A] <--- [1A]        [4A]  <-- depends on 1C
(quiz uses explanation)
  |          |
  v          v
[2B]       [4B]  <-- depends on 1A, 2A, 2B

[3A]  <-- depends on 0A (needs priorSkills for node subtraction)
```

### Implementation Sequencing (Completed)

| Phase | Enhancements | Status |
|-------|-------------|--------|
| **Phase 0** | 0A (New Params), 0B (Context Pipeline) | ✅ Complete |
| **Phase 1** | 1A (Explanations), 1B (AI Instructor), 1C (Timelines) | ✅ Complete |
| **Phase 2** | 2A (Adaptive Quiz), 2B (Failure Targeting) | ✅ Complete |
| **Phase 3** | 3A (Roadmap Shaping) | ✅ Complete |
| **Phase 4** | 4A (Velocity), 4B (Caching) | ✅ Complete |

---

## Risk Considerations

| Risk | Mitigation |
|------|------------|
| **AI cost increase** — per-learner content generation increases API calls | Tiered caching (4B) groups learners by familiarity level. Tier 1+2 cover the common case; Tier 3 is only for remedial content. |
| **Prompt length** — learner context adds tokens | Keep learner context section under 100 tokens. Truncate `aboutSelf` to 200 chars. `priorSkills` to 300 chars. |
| **Cold start** — new learners have no performance history | `familiarityLevel` from enrollment provides the initial signal. After 2-3 quiz attempts, the adaptive system has enough data. |
| **Backward compatibility** — existing learners have no new fields | All `learnerContext` fields are optional in the AI service. If not provided, AI falls back to current behavior. Existing enrollments continue to work. |
| **DAG integrity** — node subtraction/addition could break prerequisites | Subtraction: auto-mastered nodes still count as "mastered" for prerequisite checks. Addition: supplementary nodes are parallel to the DAG, not in the critical path. |
| **Database migration** — new tables and columns | Phase 0A (2 columns on Enrollment) and Phase 3A (SupplementaryNode table) and Phase 4A (LearnerVelocity table) require migrations. All are additive — no column drops or renames. |

---

## Summary

All four phases are fully implemented as of 2026-05-26. The platform now delivers end-to-end personalization across every layer:

1. ✅ **Foundation:** Learner context pipeline (`learner-context.service.ts`) passes enrollment profile + live progress data to every AI call. Two new enrollment parameters (`preferredLearningStyle`, `priorSkills`) are collected in the 3-step dialog and stored.
2. ✅ **Quick wins:** Explanations adapt to familiarity level, learning style, and goal. The AI instructor knows the learner's progress and history. Timeline estimates use `weeklyHours` + `estimatedHours` + velocity multiplier.
3. ✅ **Adaptive content:** Quiz difficulty adjusts ±1 from the static ontology value based on scores. On re-attempt, `detectWeakAreas()` targets the learner's specific wrong answers. Quizzes are grounded in the learner's personalized explanation.
4. ✅ **Roadmap shaping:** The roadmap changes at enrollment — advanced learners skip trivial nodes, `priorSkills` auto-masters known content, beginners get primer nodes, certification goal gets a practice exam, job-seeker goal gets portfolio projects.
5. ✅ **Intelligence:** `LearnerVelocity` tracks actual vs estimated hours per node. `getAverageVelocity()` feeds a multiplier into timeline estimates. AI cost is balanced by a four-tier cache strategy keyed on difficulty + familiarity level.
