# Academic Foundations

> **Project:** AI-Driven Personalized Learning Roadmap Generator And Tutor and Tutor
>
> **Purpose:** Every algorithmic design decision in this platform is grounded in established educational and computer science research. This document maps each core feature to its academic lineage, providing supporting evidence for evaluators and reviewers.

---

## 1. Knowledge Space Theory — The DAG Ontology (Skeleton)

### What It Is
Knowledge Space Theory (KST) is a mathematical framework for representing the structure of a knowledge domain as a partially ordered set. It models the idea that mastering certain concepts is a prerequisite for mastering others — exactly like a directed acyclic graph (DAG). In this theory, a "knowledge state" is the set of items a learner currently knows, and the space of all reachable knowledge states is constrained by prerequisite relationships.

### How It Applies to This Project
The domain ontology is a direct implementation of KST. Every learning node has a `prerequisites` array, and a node only unlocks when all its prerequisites are mastered. The DAG structure (branching paths, convergence points, root nodes) defines the valid progressions through the knowledge space. A learner cannot skip from root to advanced nodes without traversing the prerequisite chain — this is the KST "surmise relation" in practice.

### Supporting Research
- **Doignon, J.-P. & Falmagne, J.-C. (1985).** "Spaces for the assessment of knowledge." *International Journal of Man-Machine Studies*, 23(2), 175–196.
  > The foundational paper that introduced Knowledge Space Theory. Defines knowledge states, prerequisite relations, and the mathematical structure underlying competency-based progression systems.

- **Falmagne, J.-C., Koppen, M., Villano, M., Doignon, J.-P. & Johannesen, L. (1990).** "Introduction to knowledge spaces: How to build, test, and search them." *Psychological Review*, 97(2), 201–224.
  > Extends the theory with practical methods for building and querying knowledge spaces, directly applicable to automated curriculum generation.

- **Vuong, A., Nixon, T. & Towle, B. (2011).** "A method for finding prerequisites within a curriculum." *Proceedings of the 4th International Conference on Educational Data Mining (EDM 2011).*
  > Demonstrates algorithmic extraction of prerequisite chains from existing curricula — the same graph structure used by our ontology builder.

---

## 2. Mastery-Based Learning — The Gatekeeper

### What It Is
Mastery-Based Learning (MBL), pioneered by Benjamin Bloom, is an instructional philosophy asserting that all learners can achieve a high level of competence if given enough time and appropriate instruction. The core principle: a learner must demonstrate mastery of a topic before advancing to the next. Content is not time-gated (a fixed-duration course unit) but criterion-gated (a minimum performance threshold).

### How It Applies to This Project
The Gatekeeper service classifies every quiz attempt into one of five tiers based on score: `strong_pass` (≥80%), `marginal_pass` (70–79%), `fail_low` (50–69%), `fail_fundamental` (30–49%), `fail_severe` (<30%). Only a `pass` tier transitions the node to `mastered` and unlocks downstream nodes. Each tier also triggers a different adaptation event (resource swap, prerequisite review, instructor escalation), mirroring Bloom's corrective instruction loop.

### Supporting Research
- **Bloom, B. S. (1968).** "Learning for mastery." *Evaluation Comment*, 1(2), 1–12.
  > The canonical paper introducing mastery learning. Bloom argues that 95% of students can achieve mastery if instruction is individualized and corrective feedback is provided. The 80% threshold used in our `strong_pass` tier is directly derived from Bloom's recommended mastery criterion.

- **Anderson, L. W. & Block, J. H. (1975).** "Mastery learning in classroom instruction." *Teachers College Record*, 77(4), 379–406.
  > Empirical validation of mastery learning in practice, demonstrating significant achievement gains over conventional instruction — supporting the gating mechanism in this platform.

- **Guskey, T. R. (2007).** "Closing achievement gaps: Revisiting Benjamin S. Bloom's 'learning for mastery.'" *Journal of Advanced Academics*, 19(1), 8–31.
  > A modern review confirming the continued relevance of mastery learning, with evidence that formative assessment and corrective instruction (both present in this system) are the critical active ingredients.

---

## 3. Spaced Repetition & Knowledge Decay

### What It Is
The forgetting curve, discovered by Hermann Ebbinghaus in 1885, shows that memory of learned material degrades exponentially over time without review. Spaced repetition is the counter-strategy: scheduling review sessions at increasing intervals to intercept the forgetting curve just before knowledge drops below a useful threshold. This produces much stronger long-term retention than massed practice ("cramming").

### How It Applies to This Project
The decay service implements a time-based mastery regression. A node that transitions to `mastered` via a `strong_pass` downgrades to `review_needed` after 14 days without review; a `marginal_pass` mastery degrades after 7 days. Nodes in `review_needed` state regress to `relearn` after a further 30 days. These intervals are calibrated to intercept the forgetting curve at points consistent with the spaced repetition literature.

### Supporting Research
- **Ebbinghaus, H. (1885/1913).** *Memory: A Contribution to Experimental Psychology.* Teachers College, Columbia University.
  > The foundational work. Ebbinghaus measured his own retention over time and derived the forgetting curve: R = e^(−t/S), where R is retention and S is memory stability. The decay intervals in this system are directly inspired by this model.

- **Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T. & Rohrer, D. (2006).** "Distributed practice in verbal recall tasks: A review and quantitative synthesis." *Psychological Bulletin*, 132(3), 354–380.
  > A meta-analysis of 254 studies confirming that distributed practice (spaced repetition) consistently outperforms massed practice on long-term retention tests. Provides empirical backing for the decay interval design.

- **Kornell, N. & Bjork, R. A. (2008).** "Learning concepts and categories: Is spacing the 'enemy of induction'?" *Psychological Science*, 19(6), 585–592.
  > Demonstrates that spaced practice improves conceptual learning, not just rote memorisation — relevant because this system applies decay to conceptual nodes, not just flashcard-style facts.

- **Leitner, S. (1972).** *So lernt man lernen.* Herder.
  > Introduced the Leitner box — the first practical spaced repetition system. The multi-state mastery transitions (`mastered → review_needed → relearn`) are a direct descendant of this model.

---

## 4. Intelligent Tutoring Systems — The Overall Architecture

### What It Is
An Intelligent Tutoring System (ITS) is a computer-based instructional system with models of the subject matter (domain model), the learner's knowledge state (student model), pedagogical strategies (tutoring model), and a communication interface. ITS research spans from early cognitive tutor systems in the 1980s to modern AI-driven systems, consistently showing learning gains of 1–2 standard deviations over traditional classroom instruction.

### How It Applies to This Project
This platform is an ITS with all four canonical components: the **domain model** (the ontology DAG with nodes, learning outcomes, difficulty levels, and prerequisites), the **student model** (LearnerNodeProgress tracking mastery state, attempt count, best score, and adaptation events), the **tutoring model** (the gatekeeper service implementing corrective instruction, the AI explanation/quiz pipeline, and the learner context personalization), and the **interface** (the React frontend with roadmap canvas, quiz flow, and AI instructor panel).

### Supporting Research
- **Anderson, J. R., Corbett, A. T., Koedinger, K. R. & Pelletier, R. (1995).** "Cognitive tutors: Lessons learned." *Journal of the Learning Sciences*, 4(2), 167–207.
  > Seminal paper on Carnegie Mellon's Cognitive Tutor — the most studied ITS in history. Establishes the four-component ITS model and reports 1 σ learning gains over classroom instruction.

- **VanLehn, K. (2011).** "The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems." *Educational Psychologist*, 46(4), 197–221.
  > A landmark meta-analysis comparing human tutors, ITS, and other systems. Finds that step-level ITS (systems that give feedback at each problem step, as this system does at each quiz question) approach human tutor effectiveness.

- **Woolf, B. P. (2008).** *Building Intelligent Interactive Tutors: Student-Centered Strategies for Revolutionizing E-Learning.* Morgan Kaufmann.
  > Comprehensive reference covering all aspects of ITS design including student modelling, domain modelling, and adaptive content generation — directly applicable to the architecture of this system.

---

## 5. Bayesian Knowledge Tracing — Mastery State Machine

### What It Is
Bayesian Knowledge Tracing (BKT) is a probabilistic model for estimating a learner's latent knowledge state. It models learning as a two-state hidden Markov model: a learner is either in the "unlearned" or "learned" state for each skill, and quiz performance provides observable evidence to update the belief about which state they are in. BKT introduced the idea of tracking knowledge state per skill across multiple interactions — which is now the foundation of nearly all adaptive learning systems.

### How It Applies to This Project
The `masteryState` machine (`not_started → in_progress → review_needed → mastered → relearn`) is a deterministic implementation of the same concept BKT models probabilistically. The gatekeeper's five-tier scoring transitions the state based on accumulated evidence (attempts, scores), and the decay service introduces the temporal dimension BKT typically omits. The `bestQuizScore` and `attemptsCount` fields on `LearnerNodeProgress` are the direct analogues of BKT's performance observations.

### Supporting Research
- **Corbett, A. T. & Anderson, J. R. (1994).** "Knowledge tracing: Modeling the acquisition of procedural knowledge." *User Modeling and User-Adapted Interaction*, 4(4), 253–278.
  > The paper that introduced BKT. Proposes modeling each knowledge component as a two-state HMM and updating beliefs after each learner response — the theoretical basis for score-driven mastery state updates.

- **Piech, C., Bassen, J., Huang, J., Ganguli, S., Sahami, M., Guibas, L. & Sohl-Dickstein, J. (2015).** "Deep knowledge tracing." *Advances in Neural Information Processing Systems (NeurIPS) 2015.*
  > Extends BKT with recurrent neural networks, demonstrating that deep sequence models can outperform classic BKT. Validates the importance of tracking knowledge state as a sequence of interactions over time.

---

## 6. Adaptive Hypermedia & Personalised Learning

### What It Is
Adaptive hypermedia systems modify the content, structure, and navigation of a hypermedia (web-based) learning environment in response to the learner's goals, knowledge, background, and preferences. Unlike static courseware, adaptive systems build a learner model and use it to alter what content is shown, how it is presented, and what is recommended next.

### How It Applies to This Project
The learner context pipeline (`buildLearnerContext`) is the learner model component of an adaptive hypermedia system. It assembles six profile dimensions (familiarity level, learning goal, weekly hours, about self, preferred learning style, prior skills) plus live performance data, and injects this into every AI content generation call. The explanation prompt adapts depth and format; the quiz adapts difficulty and phrasing; the AI instructor adapts vocabulary and patience level. This is adaptive presentation and adaptive content generation in a single pipeline.

### Supporting Research
- **Brusilovsky, P. (1996).** "Methods and techniques of adaptive hypermedia." *User Modeling and User-Adapted Interaction*, 6(2–3), 87–129.
  > The field-defining survey. Introduces the taxonomy of adaptive hypermedia techniques — adaptive presentation, adaptive navigation, and adaptive content generation — all three of which this system implements.

- **Brusilovsky, P. & Millán, E. (2007).** "The adaptive web." In P. Brusilovsky, A. Kobsa & W. Nejdl (Eds.), *Lecture Notes in Computer Science*, 4321, 3–58.
  > A comprehensive update of the adaptive hypermedia field, covering learner modelling approaches and systems. Identifies learner profile dimensions (knowledge, goals, background, preferences) that directly correspond to the fields in `LearnerContext`.

- **Bransford, J. D., Brown, A. L. & Cocking, R. R. (Eds.) (2000).** *How People Learn: Brain, Mind, Experience, and School.* National Academy Press.
  > Foundational educational psychology text arguing that effective learning requires attending to learners' prior knowledge, motivation, and metacognition — the same three dimensions captured by `familiarityLevel`, `learningGoal`, and `aboutSelf`.

---

## 7. Learning Styles — The VARK Model

### What It Is
Learning style models propose that learners have preferences for how information is presented to them, and that matching instructional format to learning style improves outcomes. The VARK model (Visual, Aural, Read/Write, Kinaesthetic) classifies learners by their preferred mode of information intake. The Felder-Silverman Index extends this with four independent dimensions (active/reflective, sensing/intuitive, visual/verbal, sequential/global).

### How It Applies to This Project
The `preferredLearningStyle` enrollment field (visual / reading / hands_on / video) maps directly to VARK categories. When building AI prompts, the explanation generation service injects style-specific instructions: visual learners receive prompts requesting ASCII diagrams and flowcharts; hands-on learners receive prompts emphasising code snippets and practical exercises; reading-preference learners receive more detailed textual exposition; video-preference learners are flagged for resource prioritisation. This makes the same node's content materially different in presentation for different learners.

### Supporting Research
- **Fleming, N. D. & Mills, C. (1992).** "Not another inventory, rather a catalyst for reflection." *To Improve the Academy*, 11, 137–155.
  > The paper introducing the VARK model. Argues that identifying preferred modalities helps both learners and instructors design more effective learning experiences — the direct rationale for capturing `preferredLearningStyle` at enrollment.

- **Felder, R. M. & Silverman, L. K. (1988).** "Learning and teaching styles in engineering education." *Engineering Education*, 78(7), 674–681.
  > The Felder-Silverman model, widely adopted in STEM education. Provides empirical grounding for the active/hands-on vs. reflective/reading dimension that underlies the `hands_on` vs `reading` style options.

- **Pashler, H., McDaniel, M., Rohrer, D. & Bjork, R. (2008).** "Learning styles: Concepts and evidence." *Psychological Science in the Public Interest*, 9(3), 105–119.
  > A critical review noting that the evidence for strict learning style matching is mixed, but that presenting content in multiple formats and allowing learner preference selection consistently improves engagement — supporting preference-driven format adaptation even without strict matching.

---

## 8. Adaptive Assessment & Weak Area Targeting

### What It Is
Item Response Theory (IRT) is a psychometric framework that models the probability of a correct response as a function of both learner ability and item difficulty. Computerised Adaptive Testing (CAT) uses IRT to dynamically select questions that maximise information about the learner's ability level — harder questions for high-ability learners, easier ones for struggling learners. Weak area targeting is a complementary approach: analysing which specific items were answered incorrectly to identify knowledge gaps and retarget instructional content.

### How It Applies to This Project
The `computeAdaptiveDifficulty` function adjusts quiz difficulty ±1 from the node's static ontology value based on the learner's best score and overall average score — a simplified IRT-inspired difficulty calibration. The `detectWeakAreas` function analyses `QuizAttempt.answers` against `QuizQuestion.correctAnswer` to extract the specific questions a learner answered incorrectly. These question texts are then injected into the next quiz and explanation prompts as `weakAreas`, ensuring that re-attempts target the learner's actual knowledge gaps rather than reusing generic content.

### Supporting Research
- **Lord, F. M. (1980).** *Applications of Item Response Theory to Practical Testing Problems.* Lawrence Erlbaum Associates.
  > The foundational text for IRT. Establishes the mathematical models for item difficulty, discrimination, and guessing parameters — the theoretical basis for difficulty-adaptive quiz generation.

- **Wainer, H., Dorans, N. J., Eignor, D., Flaugher, R., Green, B. F., Mislevy, R. J., Steinberg, L. & Thissen, D. (2000).** *Computerized Adaptive Testing: A Primer.* Lawrence Erlbaum Associates.
  > The definitive reference on CAT. Directly supports the adaptive difficulty system: selecting item difficulty based on observed performance is the core CAT algorithm.

- **Lilley, M. & Barker, T. (2002).** "The development and evaluation of a computer-adaptive testing application for students with learning disabilities." *IFIP World Conference on Computers in Education.*
  > Demonstrates practical CAT deployment in an e-learning context, including formative weak-area feedback — the same dual function (adaptive difficulty + weak-area targeting) implemented in this system.

---

## 9. Gamification — XP, Streaks, Badges, Weekly Goals

### What It Is
Gamification is the application of game design elements (points, badges, leaderboards, progress bars, streaks, challenges) to non-game contexts to increase motivation, engagement, and behaviour change. In educational settings, gamification has been shown to increase time-on-task, completion rates, and intrinsic motivation, particularly when reward structures are aligned with learning objectives rather than trivial actions.

### How It Applies to This Project
The gamification module implements four canonical game mechanics: **XP (experience points)** awarded for quiz passes (scaled by score tier and attempt efficiency), **level progression** based on cumulative XP, **streak tracking** for consecutive days of activity, and **badges** for milestone achievements (first mastery, 5-day streak, quiz ace, speed learner, completionist, etc.). A **weekly goal** system adds time-bounded challenges. All XP events are logged to `XpEvent` for history display. These mechanics are designed to reward learning behaviours (mastery, consistency, improvement) rather than mere participation.

### Supporting Research
- **Deterding, S., Dixon, D., Khaled, R. & Nacke, L. (2011).** "From game design elements to gamefulness: Defining 'gamification.'" *Proceedings of MindTrek '11*, ACM.
  > The most-cited paper in gamification research. Provides the formal definition of gamification and the taxonomy of game design elements (points, badges, leaderboards, progress, challenges) that directly maps to the features implemented in this module.

- **Hamari, J., Koivisto, J. & Sarsa, H. (2014).** "Does gamification work? A literature review of empirical studies on gamification." *Proceedings of HICSS 2014.*
  > A systematic review of 24 empirical gamification studies. Finds positive effects on engagement and motivation in the majority of studies, with the strongest effects in educational and health contexts — directly validating the use of gamification in this learning platform.

- **Denny, P. (2013).** "The effect of virtual achievements on student engagement." *Proceedings of CHI 2013*, ACM.
  > Studies badge systems in a programming education context and finds significant increases in student activity and performance — closely mirroring the educational context of this project.

- **Landers, R. N. (2014).** "Developing a theory of gamified learning: Linking serious games and gamification of learning." *Simulation & Gaming*, 45(6), 752–768.
  > Proposes a theoretical model explaining how gamification affects learning through behavioural engagement and attitudinal change — providing the theoretical mechanism that the empirical studies above observe.

---

## 10. LLM as Teacher — AI-Generated Curriculum (Flesh)

### What It Is
Large Language Models (LLMs) have emerged as a transformative tool in educational technology. As "teachers," LLMs can generate explanations, assessments, and feedback that are contextually adapted to the learner and the subject domain. The "teacher model" concept — using a large, capable model to generate instructional content consumed by learners — draws both from the Knowledge Distillation literature (using a large model to teach a smaller one) and from the broader ITS tradition of automated content generation.

### How It Applies to This Project
The AI service uses Gemini (with a Phi-4/Ollama local fallback and circuit breaker) to generate three types of content: **explanations** (conceptual walkthrough of a node's learning outcomes), **quizzes** (4-question multiple-choice assessments grounded in the node's explanation), and **instructor answers** (conversational responses to learner questions). All three calls receive a full `LearnerContext` object, making the generated content specific to each learner's profile and progress state. The circuit breaker pattern ensures resilience when the primary AI provider is unavailable.

### Supporting Research
- **Kasneci, E., Seßler, K., Küchemann, S., Bannert, M., Dementieva, D., Fischer, F., Gasser, U., Groh, G., Günnemann, S., Hüllermeier, E. & Krusche, S. (2023).** "ChatGPT for good? On opportunities and challenges of large language models for education." *Learning and Individual Differences*, 103, 102274.
  > A comprehensive review of LLM capabilities in education, covering personalised tutoring, assessment generation, and feedback — directly supporting all three uses of the AI service in this project.

- **Macina, J., Daheim, N., Cheng, L., Soni, U., Romani, M., Sachan, M. & Schiele, B. (2023).** "Opportunities and challenges in neural dialog tutoring." *arXiv:2301.09919.*
  > Evaluates LLM-based dialogue tutoring systems, finding that contextual awareness (knowing who the learner is and what they've done) is the key differentiator for effective AI tutoring — directly motivating the learner context injection in the AI prompts.

- **Kochmar, E., Jiang, D., Rei, M., Lonsdale, A., Mudrak, R., Huang, R. & Korhonen, A. (2022).** "Automated personalized feedback improves learning gains in an intelligent tutoring system." *Proceedings of EDM 2022.*
  > Provides direct empirical evidence that AI-generated personalized feedback (as opposed to generic feedback) produces measurable learning gains — validating the core claim of this system's personalized explanation and quiz approach.

- **Hinton, G., Vinyals, O. & Dean, J. (2015).** "Distilling the knowledge in a neural network." *arXiv:1503.02531.*
  > The paper that introduced "knowledge distillation" and the teacher-student model concept in machine learning. Supports the framing of using a large capable model (teacher) to generate content that a learner consumes.

---

## 11. Learning Analytics — Velocity Tracking & Progress Dashboards

### What It Is
Learning Analytics (LA) is the measurement, collection, analysis, and reporting of data about learners and their contexts, with the purpose of understanding and optimising learning and the environments in which it occurs. LA encompasses predictive modelling (will this student pass?), descriptive dashboards (how far along is the learner?), and prescriptive systems (what should the learner do next?).

### How It Applies to This Project
The `LearnerVelocity` model records `estimatedHours`, `actualHours`, `startedAt`, `completedAt`, and `velocityRatio` for each mastered node. The `getTimelineEstimate` function uses these records to compute a velocity-adjusted completion forecast — a classic LA prediction task. The insights page (`InsightsPage.tsx`) and the velocity card (`VelocityCard.tsx`) surface this data as a descriptive dashboard. The `getAverageVelocity` function feeds a multiplier back into timeline estimates, closing the data-action loop that defines prescriptive LA.

### Supporting Research
- **Siemens, G. & Long, P. (2011).** "Penetrating the fog: Analytics in learning and education." *EDUCAUSE Review*, 46(5), 30–32.
  > The paper that coined and defined "learning analytics" as a field. Directly motivates the velocity tracking and progress dashboard features of this system.

- **Ferguson, R. (2012).** "Learning analytics: Drivers, developments and challenges." *International Journal of Technology Enhanced Learning*, 4(5/6), 304–317.
  > A systematic overview of LA goals and techniques, including prediction of completion and personalisation of learning — both implemented in this platform.

- **Verbert, K., Manouselis, N., Ochoa, X., Wolpers, M., Drachsler, H., Bosnic, I. & Duval, E. (2012).** "Learning analytics dashboard applications." *American Behavioral Scientist*, 57(10), 1500–1509.
  > Studies the effectiveness of LA dashboards in improving learner awareness and self-regulation — directly supporting the velocity card and progress sidebar components that surface analytics to learners.

---

## 12. Ontology-Based Curriculum Design — Domain Modelling

### What It Is
An ontology is a formal representation of knowledge in a domain, including concepts, their properties, and the relationships between them. In educational technology, ontologies are used to represent the structure of a subject domain — concepts, their dependencies, their difficulty, and their learning outcomes — enabling automated reasoning about curriculum structure, prerequisite inference, and content generation.

### How It Applies to This Project
The `LearningNode` model in the ontology is an educational ontology concept: it carries `title`, `description`, `learningOutcomes` (an array), `difficultyLevel`, `estimatedHours`, `branchPath`, `isBranchingPoint`, and `isConvergencePoint`. The `OntologyVersion` table allows versioning of the entire domain model, so curriculum updates can be deployed without disrupting active enrollments. The AI content generation service is ontology-aware: it receives node metadata as the domain context for every explanation and quiz, ensuring generated content is grounded in the defined knowledge structure rather than hallucinated freely.

### Supporting Research
- **Gruber, T. R. (1993).** "A translation approach to portable ontology specifications." *Knowledge Acquisition*, 5(2), 199–220.
  > The foundational paper on formal ontologies. Defines an ontology as "a specification of a conceptualization" — the precise role the `LearningNode` schema plays in representing the domain.

- **Holohan, E., Melia, M., McMullen, D. & Pahl, C. (2005).** "The generation of e-learning exercise problems from subject ontologies." *Fifth IEEE International Conference on Advanced Learning Technologies (ICALT 2005).*
  > Demonstrates using a subject-domain ontology as the basis for automated generation of e-learning exercises — directly analogous to using `learningOutcomes` from `LearningNode` as the basis for AI quiz generation.

- **Mizoguchi, R. & Bourdeau, J. (2000).** "Using ontological engineering to overcome common AI-ED problems." *International Journal of Artificial Intelligence in Education*, 11, 107–121.
  > Argues that explicit ontological representation of domain knowledge is essential for avoiding hallucination and maintaining coherence in AI-driven educational systems — supporting the design decision to ground all AI generation in ontology node metadata.

---

## Summary Reference Table

| Feature | Academic Field | Key Paper | Publication |
|---|---|---|---|
| DAG prerequisite graph | Knowledge Space Theory | Doignon & Falmagne | *IJMMS* 1985 |
| Node unlock logic | Knowledge Space Theory | Vuong, Nixon & Towle | *EDM* 2011 |
| Gatekeeper 5-tier scoring | Mastery-Based Learning | Bloom | *Evaluation Comment* 1968 |
| Adaptation events on failure | Mastery-Based Learning | Guskey | *J. Advanced Academics* 2007 |
| Decay intervals (7/14/30 days) | Spaced Repetition | Ebbinghaus | *Memory* 1885 |
| Distributed practice evidence | Spaced Repetition | Cepeda et al. | *Psych. Bulletin* 2006 |
| 4-component ITS architecture | Intelligent Tutoring Systems | Anderson et al. | *J. Learning Sciences* 1995 |
| ITS vs. human tutor efficacy | Intelligent Tutoring Systems | VanLehn | *Educ. Psychologist* 2011 |
| masteryState machine | Bayesian Knowledge Tracing | Corbett & Anderson | *UMUAI* 1994 |
| Deep sequence knowledge tracking | Bayesian Knowledge Tracing | Piech et al. | *NeurIPS* 2015 |
| Learner context pipeline | Adaptive Hypermedia | Brusilovsky | *UMUAI* 1996 |
| Profile-driven content adaptation | Adaptive Hypermedia | Brusilovsky & Millán | *Adaptive Web* 2007 |
| preferredLearningStyle field | Learning Styles (VARK) | Fleming & Mills | *To Improve the Academy* 1992 |
| Active/hands-on vs. reading | Learning Styles | Felder & Silverman | *Engineering Education* 1988 |
| computeAdaptiveDifficulty() | Adaptive Assessment / IRT | Lord | *IRT Problems* 1980 |
| detectWeakAreas() | Adaptive Assessment / CAT | Wainer et al. | *CAT: A Primer* 2000 |
| XP, levels, progress bars | Gamification | Deterding et al. | *MindTrek* 2011 |
| Badges in education | Gamification | Denny | *CHI* 2013 |
| Gamification effectiveness | Gamification | Hamari, Koivisto & Sarsa | *HICSS* 2014 |
| AI-generated explanations/quizzes | LLM as Teacher | Kasneci et al. | *Learning & Ind. Diff.* 2023 |
| Personalised AI feedback | LLM as Teacher | Kochmar et al. | *EDM* 2022 |
| Teacher-student model | Knowledge Distillation | Hinton, Vinyals & Dean | *arXiv* 2015 |
| LearnerVelocity model | Learning Analytics | Siemens & Long | *EDUCAUSE Review* 2011 |
| Progress dashboards | Learning Analytics | Verbert et al. | *American Behav. Sci.* 2012 |
| LearningNode ontology schema | Ontology Engineering | Gruber | *Knowledge Acquisition* 1993 |
| Ontology → quiz generation | Ontology-based Curriculum | Holohan et al. | *ICALT* 2005 |
| Anti-hallucination grounding | Ontology-based Curriculum | Mizoguchi & Bourdeau | *IJAIED* 2000 |
