![][image1]  
**ADDIS ABABA SCIENCE AND TECHNOLOGY UNIVERSITY**

**College of Electrical and Mechanical Engineering**

**Department of Software Engineering**

**AI-Driven Personalized Learning Roadmap Generator And Tutor**

Members: ID:  
1\. Yegeta Taye ETS1665/14  
2\. Yigermal Abebe ETS1680/14  
3\. Yihun Alemayehu ETS1685/14

Advisor Name: Tesfaye Meshu Signature\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Jan 10, 2026

[**ACKNOWLEDGEMENT 5**](#acknowledgement)

[**LIST OF TABLES 6**](#list-of-tables)

[**LIST OF FIGURES/ILLUSTRATIONS 7**](#list-of-figures/illustrations-1.1-six-phases-with-specific-milestones,-deliverables,-and-team-responsibilities.-3.1-uml-class-diagram-…-68-3.2-quiz-attempt-and-gatekeeper-flow-…-69-3.3-mastery-decay-and-spaced-repetition-trigger-…-70-3.4-multi-path-branching-selection-…-71-3.5-learner-progression-activity-flow-…-72-3.6-gatekeeper-decision-activity-…-73-3.7-node-mastery-state-machine-…-74)

[**LIST OF ABBREVIATIONS, SYMBOLS, AND SPECIALIZED NOMENCLATURE 8**](#list-of-abbreviations,-symbols,-and-specialized-nomenclature)

[**ABSTRACT 10**](#abstract)

[Chapter 1: Introduction 11](#chapter-1:-introduction)

[1.1 Statement of the Problem 11](#1.1-statement-of-the-problem)

[1.2 Objectives 13](#1.2-objectives)

[1.3 Scope and Limitations 16](#1.3-scope-and-limitations)

[1.4 Methodology and Approach 20](#1.4-methodology-and-approach)

[1.5 Plan of Activities 29](#1.5-plan-of-activities)

[1.6 Budget Breakdown 34](#1.6-budget-breakdown)

[1.7 Significance of the Project 43](#1.7-significance-of-the-project)

[1.8 Outline of the Study 46](#1.8-outline-of-the-study)

[**Chapter 2: Literature Review 49**](#chapter-2:-literature-review)

[2.1 Evolution of Intelligent Tutoring Systems and Adaptive Learning 49](#2.1-evolution-of-intelligent-tutoring-systems-and-adaptive-learning)

[2.2 Knowledge Representation: From Ontologies to Retrieval-Augmented Generation 50](#2.2-knowledge-representation:-from-ontologies-to-retrieval-augmented-generation)

[2.3 Adaptive Learning and Assessment-Driven Progression 51](#2.3-adaptive-learning-and-assessment-driven-progression)

[2.4 Spaced Repetition and the Forgetting Curve 53](#2.4-spaced-repetition-and-the-forgetting-curve)

[2.5 Personalization and Multi-Path Learning 54](#2.5-personalization-and-multi-path-learning)

[2.6 Resource Aggregation and Content Curation 56](#2.6-resource-aggregation-and-content-curation)

[2.7 Critical Gaps in Existing Solutions and AI-Driven Personalized Learning Roadmap Generator And Tutor 's Positioning 57](#2.7-critical-gaps-in-existing-solutions-and-ai-driven-personalized-learning-roadmap-generator-'s-positioning)

[2.8 Lessons Learned, Research Principles, and AI-Driven Personalized Learning Roadmap Generator And Tutor 's Innovation Synthesis 60](#2.8-lessons-learned,-research-principles,-and-ai-driven-personalized-learning-roadmap-generator-'s-innovation-synthesis)

[Chapter 3: Problem Analysis and Modeling 62](#chapter-3:-problem-analysis-and-modeling)

[3.1 Overview 62](#heading=h.nxsp3e1gjmnw)

[3.2 Requirements Elicitation and Specification 62](#3.2-requirements-elicitation-and-specification)

[3.3 System Models and Design Artifacts 67](#3.3-system-models-and-design-artifacts)

[3.4 UML Class Diagram 70](#3.4-uml-class-diagram)

[3.5 Sequence Diagrams 72](#3.5-sequence-diagrams)

[3.6 Activity Diagrams 75](#3.6-activity-diagrams)

[3.7 State Machine Diagram 76](#3.7-state-machine-diagram)

[3.8 Validation and Verification Strategy 77](#3.8-validation-and-verification-strategy)

[**PRELIMINARY REFERENCES 78**](#references)

#

# ACKNOWLEDGEMENT {#acknowledgement}

We wish to express our sincere gratitude to the Faculty of Computing, Department of Software Engineering, Addis Ababa Science and Technology University (AASTU) for providing the institutional resources and academic environment necessary to conduct this research.

We extend our deepest appreciation to our academic advisor, Tesfaye Meshu, for their invaluable guidance, constructive feedback, and mentorship throughout the conceptualization and development phases of this final year project. Their expertise in software engineering methodologies and educational technology has been instrumental in refining the scope and technical direction of AI-Driven Personalized Learning Roadmap Generator And Tutor .

We are grateful to our peers and colleagues who engaged in technical reviews and provided insightful critiques during project development workshops. Additionally, we acknowledge the open-source community, particularly the developers of the frameworks and libraries leveraged in this project (React, Flutter, Python, PostgreSQL).

Finally, we recognize the educational content providers whose free, high-quality resources FreeCodeCamp, GeeksForGeeks, MDN Web Docs, and others form the foundation of the resource aggregation strategy that makes AI-Driven Personalized Learning Roadmap Generator And Tutor viable in resource-constrained environments like Ethiopia.

# LIST OF TABLES {#list-of-tables}

1.1 The following table details the technology stack and rationale for each choice … 23  
1.2 Detailed Weekly Breakdown (24 Weeks) … 28  
1.3 Detailed Budget Table … 32  
2.1 AI-Driven Personalized Learning Roadmap Generator And Tutor 's novelty within the landscape … 55  
3.1 Defines primary use cases … 64  
3.2 Use cases to functional requirements, ensuring comprehensive coverage … 67

# LIST OF FIGURES/ILLUSTRATIONS 1.1 Six phases with specific milestones, deliverables, and team responsibilities. 3.1 UML Class Diagram … 68 3.2 Quiz Attempt and Gatekeeper Flow … 69 3.3 Mastery Decay and Spaced Repetition Trigger … 70 3.4 Multi-Path Branching Selection … 71 3.5 Learner Progression Activity Flow … 72 3.6 Gatekeeper Decision Activity … 73 3.7 Node Mastery State Machine … 74 {#list-of-figures/illustrations-1.1-six-phases-with-specific-milestones,-deliverables,-and-team-responsibilities.-3.1-uml-class-diagram-…-68-3.2-quiz-attempt-and-gatekeeper-flow-…-69-3.3-mastery-decay-and-spaced-repetition-trigger-…-70-3.4-multi-path-branching-selection-…-71-3.5-learner-progression-activity-flow-…-72-3.6-gatekeeper-decision-activity-…-73-3.7-node-mastery-state-machine-…-74}

# LIST OF ABBREVIATIONS, SYMBOLS, AND SPECIALIZED NOMENCLATURE {#list-of-abbreviations,-symbols,-and-specialized-nomenclature}

| Abbreviation              | Full Form                                       | Definition                                                                 |
| :------------------------ | :---------------------------------------------- | :------------------------------------------------------------------------- |
| AASTU                     | Addis Ababa Science and Technology University   | Institution hosting the research project in Ethiopia                       |
| AI                        | Artificial Intelligence                         | Computational systems designed to simulate intelligent behavior            |
| API                       | Application Programming Interface               | Software intermediary enabling communication between applications          |
| LLM                       | Large Language Model                            | Deep neural network trained on vast text corpora (e.g., GPT-4, Claude)     |
| RAG                       | Retrieval Augmented Generation                  | Technique combining LLM generation with external knowledge retrieval       |
| PSE                       | Google Programmable Search Engine               | Customizable search engine API restricting results to curated domains      |
| MCQ                       | Multiple Choice Question                        | Assessment format with predefined answer options                           |
| DAG                       | Directed Acyclic Graph                          | Graph structure used to represent learning dependencies                    |
| JSON                      | JavaScript Object Notation                      | Lightweight data interchange format                                        |
| REST                      | Representational State Transfer                 | Architectural style for web service APIs                                   |
| MOOC                      | Massive Open Online Course                      | Large-scale online educational platforms (e.g., Coursera, edX)             |
| UX                        | User Experience                                 | Quality of interaction between user and system                             |
| UI                        | User Interface                                  | Visual and interactive elements of the application                         |
| SRS                       | Software Requirements Specification             | Formal document detailing functional and non-functional requirements       |
| QA                        | Quality Assurance                               | Systematic testing and validation processes                                |
| Git                       | Version Control System                          | Distributed version control for collaborative development                  |
| PostgreSQL                | Open-source Relational Database                 | Persistent data storage system for user profiles and roadmaps              |
| React                     | JavaScript Frontend Library                     | Component-based UI framework for web development                           |
| Flutter                   | Mobile Application Framework                    | Cross-platform mobile development framework by Google                      |
| Node.js                   | JavaScript Runtime Environment                  | Server-side JavaScript execution environment                               |
| Python                    | Programming Language                            | High-level language used for backend AI/ML logic                           |
| CI/CD                     | Continuous Integration / Continuous Deployment  | Automated pipeline for code testing and release                            |
| JWT                       | JSON Web Token                                  | Secure authentication token for stateless user sessions                    |
| SSL/TLS                   | Secure Sockets Layer / Transport Layer Security | Cryptographic protocols for secure network communication                   |
| HTTPS                     | Hypertext Transfer Protocol Secure              | Encrypted web communication protocol                                       |
| ERD                       | Entity-Relationship Diagram                     | Conceptual model of database structure                                     |
| DFD                       | Data Flow Diagram                               | Process-centric model showing data movement                                |
| Gatekeeper Pattern        | Assessment-driven node unlocking                | AI-driven personalized learning feature requiring quiz passage to progress |
| Ontology                  | Formal knowledge representation                 | Predefined learning path structure generated offline                       |
| Spaced Repetition         | Time-based review mechanism                     | Educational technique leveraging Ebbinghaus’s Forgetting Curve             |
| Mastery Decay             | Skill degradation over time                     | Algorithm reflecting diminishing retention without practice                |
| Multi-Path Branching      | Adaptive route selection                        | User-choice-driven curriculum differentiation                              |
| Skeleton & Flesh Strategy | Offline \+ Online AI separation                 | Teacher Model (static ontology) \+ Tutor Model (runtime explanations)      |

# ABSTRACT {#abstract}

The proliferation of online educational content has created unprecedented opportunities for self-directed learning, yet it has simultaneously introduced a critical problem: the fragmentation of high-quality resources and the absence of structured guidance. In the Ethiopian context, where access to premium mentorship and formal course subscriptions is economically prohibitive, students often find themselves trapped in "tutorial hell" scrolling through disconnected YouTube videos, blogs, and documentation without a coherent learning path or performance feedback mechanism. Existing solutions (e.g., roadmap.sh) provide static, one-size-fits-all curricula that fail to adapt to individual learning pace, gaps, or learning preferences.

This project presents _AI-Driven Personalized Learning Roadmap Generator And Tutor : Ontology-Guided Adaptive Learning Roadmap Generator_, a comprehensive web and mobile platform designed to synthesize free, high-quality technical resources into a dynamically adaptive, assessment-driven learning roadmap. The core innovation lies in a hybrid artificial intelligence architecture that mitigates hallucination risks inherent in pure Large Language Model (LLM) generation by employing a "Skeleton & Flesh" strategy. Offline, a powerful LLM generates a verified, semantically coherent ontology (the learning path skeleton) covering tech domains (Frontend, Backend, Data Science, DevOps). At runtime, a lightweight tutor model generates context-specific explanations and quizzes (the flesh) tailored to each learner's performance and progression.

AI-Driven Personalized Learning Roadmap Generator And Tutor introduces three novel contributions: (1) the _Gatekeeper Pattern_, an assessment-driven mechanism requiring learners to achieve \>80% on a three-question quiz before advancing with adaptive resource swapping if performance drops below 50%; (2) _Mastery Decay Integration_, incorporating Ebbinghaus's Forgetting Curve to remind learners of concepts not reviewed for 14+ days, promoting retention through spaced repetition; and (3) _Multi-Path Branching_, enabling learners to select personalized learning trajectories based on preferences (visual vs. logical, speed vs. depth).

The platform integrates the Google Programmable Search Engine API to aggregate only verified resources from trusted domains (FreeCodeCamp, GeeksForGeeks, MDN, Coursera), ensuring content quality and accuracy. The technical stack comprises React and Flutter for responsive web and mobile frontends, Node.js for API orchestration, Python for ontology generation and AI logic, and PostgreSQL for persistent storage. Development follows Agile methodologies with continuous integration/continuous deployment (CI/CD) pipelines to ensure reliability and rapid iteration.

This project addresses a critical gap in educational technology for developing economies, democratizing access to structured, mentorship-quality guidance while remaining zero-cost to end users. By combining rigorous ontology-based curriculum design with intelligent adaptive assessment, AI-Driven Personalized Learning Roadmap Generator And Tutor empowers Ethiopian students and learners across resource-constrained regions to navigate the complex landscape of technical skill acquisition with confidence and clarity.

**Keywords:** adaptive learning, ontology-based curriculum design, artificial intelligence, assessment-driven progression, educational technology, spaced repetition, personalized learning paths, developing economy context.

##

## **Chapter 1: Introduction** {#chapter-1:-introduction}

## **1.1 Statement of the Problem** {#1.1-statement-of-the-problem}

The proliferation of free online learning resources YouTube tutorials, blog posts, open-source documentation, and platforms like FreeCodeCamp and GeeksForGeeks has democratized access to technical knowledge. However, this abundance has created a paradoxical challenge: fragmentation without structure. Ethiopian students and self-directed learners face a critical problem landscape characterized by six interconnected challenges:

Challenge 1: The Tutorial Hell Phenomenon

Learners navigate an overwhelming landscape of resources without a coherent learning path. A student seeking to learn web development might start with an HTML tutorial, then jump to a CSS playlist on YouTube, then read scattered JavaScript documentation, then discover React, without understanding how these components interconnect or progress logically. This non-sequenced, ad-hoc learning creates knowledge gaps, misaligned prerequisites, and wasted effort. Research on cognitive load theory demonstrates that unstructured, fragmented information presentation significantly increases cognitive load, reducing learning efficiency and retention.

Challenge 2: Absence of Adaptive Feedback Loops

Existing free resources are predominantly passive. Learners consume content (watch videos, read documentation) but receive minimal performance-based feedback or adaptation. If a learner struggles with a concept, the resource does not diagnose why or adapt the explanation. Unlike human tutors who adapt in real-time based on learner confusion, static resources force learners to self-diagnose and manually seek alternative resources. This mirrors the broader finding in educational psychology that immediate, targeted feedback is essential for efficient learning, yet most self-directed platforms lack this feature.

Challenge 3: No Mastery-Based Progression Gates

Learners can mark topics as "complete" based on time spent or arbitrary quizzes, regardless of actual competence. A learner might watch a JavaScript video, feel confident, and mark "JavaScript Fundamentals" as done then struggle severely when prerequisites are required in an advanced topic. This leads to a false sense of mastery and downstream learning failures. The research on mastery-based progression establishes that learning should be gated by demonstrated competence, not time or completion of content consumption.

Challenge 4: Cognitive Overload and Retention Decay

Self-directed learners often experience cognitive overload: learning multiple new concepts simultaneously without reinforcement, leading to rapid forgetting. Ebbinghaus's forgetting curve research (see the generated image above) demonstrates that without strategic review, learned information decays exponentially within days. Yet self-directed learners have no automated system prompting spaced repetition; they must manually re-engage with material, which is cognitively demanding and often neglected. Consequently, skills learned weeks or months prior decay to unusable levels by the time they are needed in integrated projects.

Challenge 5: Generic Roadmaps Ignore Learner Heterogeneity

Static, one-size-fits-all learning paths (e.g., "Learn HTML → CSS → JavaScript → React → Node.js") ignore that learners differ in preferences, prior knowledge, and career aspirations. Some learners prefer visual, design-oriented paths; others prefer backend logic and databases. A fixed sequence frustrates learners whose interests diverge from the prescribed path, reducing intrinsic motivation and increasing dropout rates. Research on self-determination theory shows that learner agency the ability to make meaningful choices about learning significantly impacts motivation and persistence.

Challenge 6: The Hallucination Problem in AI-Driven Recommendations

Recent tools leveraging Large Language Models (LLMs) for curriculum generation can produce fluent but factually incorrect sequences. An LLM might generate a "learning path" for Python that contains logical inconsistencies, missing prerequisites, or inaccurate technical descriptions . In technical education, where precision is non-negotiable, hallucination in curriculum design is catastrophic. Learners might internalize incorrect concepts, leading to buggy code or flawed system design.

Systemic Root Cause: Lack of Verifiable, Adaptive Knowledge Structures

Underlying these six challenges is a fundamental structural problem: the absence of a verified, machine-readable knowledge graph that combines the rigor of traditional Intelligent Tutoring Systems with the scalability and flexibility of modern LLMs. Current solutions fall into two inadequate categories:

1. Static resources (documentation, videos, blogs): High quality but passive, non-adaptive, and fragmented.
2. Pure LLM systems (ChatGPT tutoring): Flexible and scalable but prone to hallucination and lack curriculum coherence.

Neither category addresses the integration of verified domain knowledge, adaptive progression, and performance-based feedback at the system level.

## **1.2 Objectives** {#1.2-objectives}

General Objective:

To design, develop, and validate an ontology-guided, adaptive learning roadmap generator that integrates verified domain knowledge with intelligent tutoring principles to enable self-directed Ethiopian learners to achieve technical competence in programming and software engineering through structured, performance-driven, and personalized learning paths.

Specific Objectives:

Objective 1: Design and Implement a Hybrid AI Architecture

Develop and operationalize the "Skeleton & Flesh" hybrid architecture that separates curriculum knowledge representation (the verified ontology skeleton) from runtime tutoring (the adaptive AI flesh). Specifically:

- Create a domain-specific ontology (DAG of learning nodes, prerequisites, learning outcomes) for three initial domains: Frontend Development (HTML/CSS/JavaScript/React), Backend Development (Node.js/Databases), and Data Science Fundamentals (Python/Pandas/Basic ML).
- Implement a Teacher Model (offline LLM-based generator) that produces the initial ontology with human expert verification.
- Implement a Tutor Model (runtime, lightweight AI) that generates explanations, quizzes, and resource recommendations grounded in the ontology, preventing hallucination.

Objective 2: Implement the Gatekeeper Pattern for Assessment-Driven Progression

Engineer and validate the Gatekeeper Pattern, an assessment-driven progression mechanism where learners cannot advance to subsequent learning nodes without passing performance thresholds on adaptive quizzes . Specifically:

- Design three-tier quiz outcomes: Pass (≥80% → unlock next node \+ challenge project), Marginal Pass (70-79% → unlock node \+ flag for spaced repetition), Fail (\<70% → trigger resource adaptation or prerequisite review).
- Implement adaptive resource swapping: if a learner fails (\<70%), replace documentation-style links (e.g., MDN) with tutorial-style links (e.g., FreeCodeCamp), recognizing modality mismatch in learning .
- Implement prerequisite validation: if a learner fails (\<50%), recommend review of foundational nodes before retry.

Objective 3: Integrate Spaced Repetition with Decay-Aware Roadmap Evolution

Operationalize Mastery Decay a system that integrates Ebbinghaus's forgetting curve (see the generated image above) directly into the learner's roadmap visualization, making knowledge decay visible and triggering timely reviews. Specifically:

- Implement a decay algorithm where nodes transition from "Mastered" (green, 0-14 days) to "Review Needed" (yellow, 14-30 days) to "Relearn" (red, \>30 days) based on time since last visit.
- Generate micro-quizzes (2-3 questions) when nodes transition to yellow or red status, targeting core concepts of that node.
- Record and visualize decay patterns, enabling learners to identify their personal retention curves and adjust study frequency.

Objective 4: Develop Multi-Path Branching for Personalized Learning

Design and implement Multi-Path Branching where learners choose between alternative learning sequences based on interests and strengths , while ensuring semantic coherence and prerequisite integrity. Specifically:

- After foundational nodes, offer learners a choice: "Prefer visual design or backend logic?" → recommending either Frontend (CSS → UI frameworks) or Backend (Databases → APIs) paths.
- Ensure paths reconverge at advanced, integrative topics (e.g., "Full-Stack Architecture," "System Design").
- Validate that paths maintain prerequisite dependencies and learning outcome alignment.

Objective 5: Develop Resource Aggregation and Verification Pipeline

Build a scalable, quality-assured resource curation system that aggregates high-quality learning resources from trusted domains without manual review of each resource. Specifically:

- Integrate Google Programmable Search Engine (PSE) API to fetch resource links only from pre-approved, high-quality domains (GeeksForGeeks, FreeCodeCamp, MDN, official documentation).
- Implement automated link validation: check HTTP status, detect broken links, assess content freshness.
- Maintain a domain whitelist that domain experts can update as new, trusted resources emerge, enabling system-level adaptation without manual resource re-creation.

Objective 6: Develop Cross-Platform User Interfaces

Create intuitive, responsive user interfaces for both web and mobile platforms enabling learner interaction with the roadmap. Specifically:

- Develop a web interface (React) for desktop/laptop learners, displaying the roadmap as an interactive DAG visualization, progress tracking, quiz interfaces, and resource recommendations.
- Develop a mobile interface (Flutter) for learners studying on phones/tablets, with optimized navigation, offline capability, and push notifications for spaced repetition reviews.
- Ensure UI/UX consistency across platforms while respecting platform-specific affordances (e.g., touch-optimized interactions on mobile, keyboard shortcuts on web).

Objective 7: Validate System Effectiveness with Ethiopian Learners

Conduct empirical evaluation of AI-Driven Personalized Learning Roadmap Generator And Tutor 's learning efficacy and usability with real learners. Specifically:

- Recruit 50-100 Ethiopian students/engineers as test users.
- Measure learning gains: assess pre/post knowledge using domain-aligned assessments, comparing learners using AI-Driven Personalized Learning Roadmap Generator And Tutor vs. control group using traditional resources.
- Measure engagement and retention: track time-on-task, completion rates, session frequency, and long-term return visits (6+ months).
- Collect usability feedback via surveys and interviews, identifying UI/UX improvements and cultural/linguistic adaptations needed.

Objective 8: Ensure System Scalability and Sustainability

Design and implement AI-Driven Personalized Learning Roadmap Generator And Tutor as a scalable, maintainable, open-source system capable of extension to additional domains and deployment in resource-constrained environments. Specifically:

- Deploy on cost-effective cloud infrastructure (AWS or similar) with containerization (Docker) and automated deployment (CI/CD).
- Implement monitoring, logging, and error tracking for system reliability.
- Create comprehensive documentation and developer guides enabling future contributors to extend the system to new domains or platforms.
- Establish a governance model for ontology maintenance and resource curation, enabling community contribution while maintaining quality standards.

##

## **1.3 Scope and Limitations** {#1.3-scope-and-limitations}

In-Scope Elements:

The AI-Driven Personalized Learning Roadmap Generator And Tutor system encompasses the following capabilities and features:

**1\. Learning Domains:** Three initial technical domains are in scope: (a) Frontend Development (HTML, CSS, JavaScript ES6+, React.js, responsive design), (b) Backend Development (Node.js, Express, RESTful API design, SQL/NoSQL databases), and (c) Data Science Fundamentals (Python, Pandas, NumPy, basic ML algorithms, data visualization). These domains were selected as high-demand skills with well-defined prerequisite structures and abundant free learning resources from trusted sources.

**2\. Hybrid AI Architecture:** Full implementation of the Skeleton & Flesh strategy, including (a) a Teacher Model that uses LLMs to generate the initial ontology DAG with expert verification, (b) a runtime Tutor Model that generates explanations, quizzes, and resource recommendations constrained by the ontology, and (c) mechanisms to prevent hallucination through RAG-like grounding of LLM outputs in the verified skeleton.

**3\. Gatekeeper Pattern:** Complete implementation of assessment-driven progression, including (a) adaptive quiz generation for each node, (b) three-tier outcome logic (Pass/Marginal Pass/Fail), (c) adaptive resource swapping triggered by failure modes, (d) prerequisite validation and enforcement, and (e) challenge project recommendations for learners who pass with high scores.

**4\. Spaced Repetition Integration:** Full implementation of Mastery Decay, including (a) decay-state transitions (Green → Yellow → Red) based on time since last visit, (b) automated micro-quiz triggers, (c) visual roadmap representation of decay states, and (d) learner notifications prompting review.

**5\. Multi-Path Branching:** Implementation of learner choice at key curriculum junctures, including (a) branching questions (e.g., "Prefer frontend or backend?"), (b) alternative learning sequences for each path, (c) prerequisites maintained within each path, and (d) reconvergence points at advanced topics.

**6\. Resource Aggregation and Verification:** Full implementation of PSE API integration for resource discovery from whitelisted domains, including (a) automated link validation (HTTP status checks, freshness detection), (b) domain whitelist management, and (c) learner feedback mechanisms to rate resource quality.

**7\. User Interfaces:** Complete development of (a) a web interface (React \+ TypeScript) for desktop/laptop learners with roadmap DAG visualization, progress dashboards, quiz interfaces, and resource panels, and (b) a mobile interface (Flutter) for iOS/Android with touch-optimized navigation and push notifications.

**8\. User Base:** Initial deployment targets Ethiopian software engineering students (university-level), self-taught engineers, and career-transitioning professionals. A target user base of 50-100 test users for initial validation, with potential to scale to thousands.

**9\. Deployment and Scalability:** Deployment on cloud infrastructure (AWS EC2, RDS, S3) with containerization (Docker), automated deployment (GitHub Actions CI/CD), monitoring (CloudWatch), and cost optimization for resource-constrained deployments.

**10\. Methodology:** Agile-Scrum development methodology with 2-week sprints, daily standups, sprint reviews, and retrospectives, ensuring iterative delivery and stakeholder feedback integration.

**Out-of-Scope Elements:**

The following elements are explicitly excluded from this project:

1\. Spoken Language Learning: The system does not support learning of spoken languages (English, Amharic, etc.). It focuses exclusively on programming languages and technical content, where precision and verification are more tractable.

2\. Paid Content Integration: The system does not aggregate links to paid courses (Udacity, DataCamp, premium Coursera) or license proprietary content. It restricts to free, openly accessible resources, ensuring accessibility for Ethiopian learners with limited financial means.

3\. Video Content Scraping: The system does not scrape, host, or re-distribute video content. While it may link to high-quality YouTube videos from trusted educational channels, it does not download or modify video content, respecting intellectual property and avoiding infrastructure costs of video hosting.

4\. Advanced Gamification: While the system includes basic progress visualization (Mastery Decay, node completion status), advanced gamification elements (badges, leaderboards, competitive challenges) are out of scope. The focus is on learning efficacy and engagement, not gamification for its own sake.

5\. Formal Certification: The system does not issue formal certificates or credentials. Learners receive verifiable completion records and skill badges, but these are not formally recognized by employers or institutions in the initial deployment. (Future extensions may partner with employers for credential recognition.)

6\. Collaborative Learning: The system does not include peer collaboration features (discussion forums, pair programming rooms, group projects) in the initial deployment. Learning paths are individualized; collaborative features are deferred to future versions pending demand.

7\. LMS Integration: Integration with existing Learning Management Systems (Moodle, Canvas, Blackboard) is out of scope. The system operates as a standalone platform. Future integrations may be possible via API.

8\. Advanced Personalization Based on Learning Styles: While Multi-Path Branching provides some personalization, the system does not implement advanced learning style detection (visual/auditory/kinesthetic learner profiling), which lacks strong empirical support . Personalization is based on demonstrated performance and explicit learner choice, not inferred learning style.

**Limitations:**

The project acknowledges the following realistic constraints:

1\. Ontology Verification Bottleneck: The quality of the skeleton ontology depends on expert verification. If domain experts are unavailable or provide incomplete feedback, the ontology may contain errors or omissions. This limitation is mitigated by involving multiple experts and iterative refinement, but complete verification is not guaranteed.

2\. Resource Variability: The quality and availability of resources in whitelisted domains vary. MDN documentation for JavaScript is excellent; documentation for emerging frameworks may be sparse. If high-quality resources are unavailable for a node, the system can still recommend lower-quality alternatives or expert-created content, but learning efficacy may be impacted.

3\. Algorithm Calibration: The Mastery Decay algorithm parameters (14-day yellow threshold, 30-day red threshold, 80% pass score for Gatekeeper) are initial estimates informed by research but may require calibration based on real learner data. Different domains, learner populations, and skill levels may require different parameters.

4\. Scalability Constraints: While the architecture is designed for scalability, actual scalability depends on cloud infrastructure provisioning and cost. At extreme scale (millions of concurrent learners), costs for LLM API calls, database queries, and computation may become prohibitive. Cost optimization and alternative architectures (e.g., running LLMs on-premise) may be needed.

5\. LLM Costs: Running LLM-based Tutor Model at runtime incurs API costs (e.g., OpenAI API fees). While the Skeleton & Flesh strategy reduces costs by limiting LLM use to runtime explanation generation (not curriculum design), costs may still be significant at scale. Cost optimization strategies (caching, cheaper model variants, rate limiting) are necessary.

6\. Learner Motivation and Self-Discipline: The system can structure learning and provide adaptive feedback, but it cannot directly motivate learners or prevent procrastination. Learners must have intrinsic or extrinsic motivation to engage. The system can support motivation through progress visualization and choice (Multi-Path Branching), but motivation ultimately depends on learner agency.

7\. Hands-On Verification: The system recommends resources and provides quizzes, but does not directly assess learners' ability to write functional code. A learner might pass quizzes on JavaScript concepts but struggle to implement actual programs. Verification of hands-on programming skill requires integration with coding challenge platforms (LeetCode, HackerRank) or project submission systems, which is deferred to future work.

## **1.4 Methodology and Approach** {#1.4-methodology-and-approach}

Development Methodology: Agile-Scrum

AI-Driven Personalized Learning Roadmap Generator And Tutor is developed using Agile-Scrum methodology, emphasizing iterative delivery, continuous stakeholder feedback, and adaptive planning. Key practices include:

- Sprint Duration: 2-week sprints, with each sprint focused on delivering incremental, testable features.
- Daily Standups: 15-minute daily synchronization meetings where team members report progress, identify blockers, and coordinate efforts.
- Sprint Planning: At sprint start, the team selects user stories from the product backlog, estimates effort, and commits to sprint goals.
- Sprint Review: At sprint end, completed features are demonstrated to stakeholders for feedback.
- Sprint Retrospective: The team reflects on process improvements, identifies what went well, and what needs adjustment.

This methodology ensures rapid iteration, early bug detection, and stakeholder alignment throughout development.

**System Architecture: Microservices with Layered Design**

AI-Driven Personalized Learning Roadmap Generator And Tutor is architected as a modular microservices system with clear separation of concerns:

1\. Frontend Layer (Presentation):

- Web interface (React \+ TypeScript) with Redux state management, responsive design, and interactive DAG visualization.
- Mobile interface (Flutter) with Dart, optimized for iOS/Android, with offline-first architecture and local SQLite database.

2\. API Gateway Layer (Routing and Authentication):

- Node.js/Express API server handling HTTP requests, JWT-based authentication, rate limiting, and request routing to backend services.

3\. Core Business Logic Layer (Application Services):

- Learner Service: Manages user profiles, learning history, progress tracking, and roadmap state.
- Quiz Service: Generates quizzes, evaluates answers, computes scores, and triggers adaptation logic.
- Resource Service: Manages resource links, validations, and recommendations.
- Adaptation Service: Implements Gatekeeper Pattern, Mastery Decay, and Multi-Path Branching logic.
- Ontology Service: Serves the domain ontology (learning nodes, prerequisites, learning outcomes).

4\. Data Layer (Persistence):

- PostgreSQL Database: Stores learner profiles, quiz responses, learning history, and system metadata.
- Redis Cache: Caches frequently accessed data (ontology, learner progress) to reduce database queries and improve response latency.
- AWS S3: Stores static assets (images, documents) and backups.

5\. AI/ML Layer (Tutor Model):

- LLM API integration (OpenAI GPT-4 or similar) for runtime explanation generation and quiz generation.
- Caching layer to reduce redundant API calls and costs.
- Fallback mechanisms for API failures (pre-generated explanations, simple generation).

6\. External Integrations:

- Google Programmable Search Engine API: For resource discovery from whitelisted domains.
- Cloud Infrastructure (AWS EC2, RDS, S3): For hosting, database, and storage.

Hybrid AI Strategy: Skeleton & Flesh

The ontology and AI components implement the Skeleton & Flesh architecture to solve hallucination:

The Skeleton (Teacher Model):

- A powerful LLM (GPT-4) is used in a controlled environment to generate an initial domain ontology. The ontology is a directed acyclic graph where nodes represent learning concepts, edges represent "prerequisite" relationships, and metadata includes learning outcomes, estimated effort, and recommended resources.
- The generated ontology undergoes rigorous human expert review. Domain experts (software engineers, educators) verify each node for accuracy, completeness, and logical sequencing. Errors or omissions are corrected.
- Once verified, the skeleton is locked and immutable. It is stored in the database and served to the Tutor Model at runtime.

The Flesh (Runtime, Tutor Model):

- At runtime, when a learner encounters a node and requests an explanation, the Tutor Model (a lightweight LLM or fine-tuned model) generates an explanation grounded in the verified skeleton. It cannot invent new nodes or deviate from the skeleton structure.
- The Tutor Model also generates quiz questions targeting specific learning outcomes of that node, draws from relevant resources, and provides personalized elaborations based on learner context.
- By restricting generation to the scope of the skeleton, the Tutor Model prevents hallucination while maintaining flexibility and personalization.

**Gatekeeper Pattern: Three-Tier Progression Logic**

Learners progress through the roadmap by passing performance thresholds defined by the Gatekeeper Pattern:

Tier 1 \- Strong Mastery (≥80%):

- Quiz score ≥80%: Node marked "Done," learner unlocks the next node.
- Learner receives a challenge project recommendation: a small real-world problem requiring application of the node's concepts (e.g., "Build a responsive landing page" for CSS node).
- Node marked as "Mastered" (green status) with a 14-day decay timer initiated.

Tier 2 \- Marginal Mastery (70-79%):

- Quiz score 70-79%: Node marked "Done," learner unlocks next node, but node is flagged for spaced repetition review.
- Learners are not offered a challenge project immediately; instead, they are encouraged to review the node's core concepts at a later time (triggered by Mastery Decay).
- Node marked as "Mastered" (green status) with a 7-day decay timer initiated (faster decay than Tier 1 due to lower initial mastery).

Tier 3 \- Insufficient Mastery (\<70%):

- Quiz score \<70%: Node remains locked; learner cannot advance. Remediation is triggered based on score granularity:
  - Score 50-69% (Low Comprehension): Resource adaptation is triggered. If the initial resource was a documentation-style link (e.g., MDN), it is replaced with a tutorial-style link (e.g., FreeCodeCamp). The learner is offered a modified resource and encouraged to retry the quiz.
  - Score \<50% (Fundamental Gaps): Prerequisite review is recommended. The system identifies prerequisite nodes and suggests reviewing them before retry. If prerequisites are also failed, the learner is guided to even more foundational content.
  - Score \<30% (Severe Gap or Disengagement): The node is flagged for instructor review (in classroom settings) or escalated to expert support (in self-directed settings). The learner may be offered alternative learning modalities or one-on-one tutoring.

**Spaced Repetition Integration: Mastery Decay Algorithm**

The Mastery Decay algorithm integrates Ebbinghaus's forgetting curve into the roadmap UI, making knowledge decay visible:

Decay States:

- Green (0-14 days): Node marked "Mastered." Learners are not prompted to review.
- Yellow (14-30 days): Node automatically transitions to "Review Needed." A micro-quiz (2-3 questions) is generated targeting the node's core concepts. Learners are notified.
- Red (\>30 days): Node transitions to "Relearn." A full-length quiz is triggered. Learners are strongly encouraged to re-engage with learning resources.

Micro-Quiz Logic:

- When a node transitions from green to yellow or red, a micro-quiz is auto-generated, targeting 2-3 core learning outcomes of that node. Questions are in varied formats (multiple choice, short answer, code completion) to assess different levels of understanding.
- If a micro-quiz passed (≥80%): Node timer resets; learner is not prompted again for 14 days.
- If micro-quiz fails (\<80%): Node is re-locked; resource adaptation is triggered (as in Gatekeeper Tier 3).

Visualization:

- The learner's roadmap DAG is color-coded: green nodes (mastered, current), yellow nodes (review needed), red nodes (relearn), gray nodes (not yet attempted), and blue nodes (prerequisites not met).
- A timeline view shows decay over time, enabling learners to identify patterns (e.g., "I always forget databases after 20 days") and adjust study frequency accordingly.

**Multi-Path Branching Logic**

After completing foundational nodes (e.g., "Core Programming Fundamentals"), learners encounter a branching point with a choice question:

Branching Question Example: "Which area aligns with your goals and interests?

- A) Frontend Development (UI/UX, visual design, interactive applications)
- B) Backend Development (server-side logic, databases, APIs)
- C) Data Science & AI (data analysis, machine learning, AI)"

Path Outcomes:

Path A: Frontend Development

- Sequence: Advanced CSS (Grid, Flexbox, Animations) → JavaScript DOM Manipulation → React.js Fundamentals → Advanced React (Hooks, State Management) → Frontend UI/UX Design Patterns → Performance Optimization
- Termination: Converges at "Full-Stack Integration" node where learners combine frontend with backend APIs.

Path B: Backend Development

- Sequence: Server-Side JavaScript (Node.js, Express) → RESTful API Design → SQL Databases (PostgreSQL, normalization) → NoSQL Databases (MongoDB) → Authentication & Security → Microservices & Deployment
- Termination: Converges at "Full-Stack Integration" node.

Path C: Data Science & AI

- Sequence: Python Fundamentals → Data Structures & Algorithms → Data Analysis Libraries (Pandas, NumPy) → Data Visualization (Matplotlib, Plotly) → Machine Learning Algorithms → Model Evaluation & Tuning → Introduction to Deep Learning
- Termination: Converges at "AI/ML Systems Design" or "Data-Driven Backend Development" nodes.

Semantic Coherence: Each path maintains prerequisite integrity. For example, "React.js Fundamentals" depends on "JavaScript ES6+," which is in Path A's sequence. If a learner switches paths after partially completing Path A, the system validates that new path prerequisites are met or recommends prerequisite completion.

**Resource Aggregation: PSE API Integration**

Resource discovery and validation are automated:

Domain Whitelisting:

- During ontology creation, domain experts specify trusted content providers for each domain. Example whitelist for "JavaScript Fundamentals":
  - MDN Web Docs (official Mozilla documentation)
  - JavaScript.info (comprehensive tutorial)
  - FreeCodeCamp (video tutorials)
  - Official ECMAScript specifications
  - Trusted educational blogs (e.g., Eloquent JavaScript)

Runtime Resource Fetching:

- When a learner requests resources for a node (e.g., "JavaScript Closures"), the Resource Service queries the Google PSE API using pre-configured search filters restricted to whitelisted domains.
- The PSE API returns only links from whitelisted domains, eliminating unvetted sources.
- Results are ranked by relevance and freshness, and the top 3-5 results are presented to the learner.

Link Validation Pipeline:

- All recommended links undergo automated validation: HTTP status checks (ensuring links are live), content freshness checks (flagging outdated tutorials), and optional NLP-based content summarization (ensuring fetched content matches the node's learning outcomes).

Feedback Loop:

- Learners rate resources: "Was this explanation clear? Helpful? Outdated?" Ratings are aggregated in a database.
- Domain experts periodically review low-rated resources and update the whitelist, removing consistently poor sources or adding new high-quality sources.

**Technology Stack and Justifications**

Table 1.1: The following table details the technology stack and rationale for each choice:

| Component            | Technology                     | Justification                                                                                                   |
| :------------------- | :----------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| Frontend Web         | React 18 \+ TypeScript         | Type safety, large ecosystem, component-based architecture, excellent performance                               |
| Frontend Mobile      | Flutter (Dart)                 | Cross-platform (iOS/Android), fast development, strong UI libraries, offline-first capability                   |
| DAG Visualization    | D3.js or Vis.js                | Powerful graph visualization, interactive exploration of roadmap dependencies                                   |
| API Server           | Node.js \+ Express             | Non-blocking I/O, JavaScript across full stack, large ecosystem of libraries                                    |
| Authentication       | JWT \+ OAuth2 (Google, GitHub) | Stateless, scalable, social login convenience for learners                                                      |
| Database             | PostgreSQL                     | ACID compliance, relational queries for prerequisite logic, strong JSON support for ontology storage            |
| Cache                | Redis                          | In-memory cache for ontology and learner progress, sub-millisecond latency, pub-sub for real-time notifications |
| File Storage         | AWS S3                         | Scalable object storage for resources, backups, static assets; CDN integration for fast delivery                |
| LLM Integration      | OpenAI API (GPT-4)             | State-of-the-art language generation, fine-tuning capability, mature production APIs                            |
| Search Integration   | Google PSE API                 | Domain-restricted search, high-quality results from whitelisted sources                                         |
| Cloud Infrastructure | AWS (EC2, RDS, S3, CloudFront) | Scalability, reliability, cost-effective, geographic redundancy for performance                                 |
| Containerization     | Docker                         | Reproducible deployments, easy scaling, environment consistency                                                 |
| CI/CD Pipeline       | GitHub Actions                 | Integrated with GitHub, automated testing, deployment automation, free tier for open-source                     |
| Monitoring & Logging | CloudWatch \+ Sentry           | Real-time monitoring, error tracking, performance metrics, alerting                                             |
| Code Repository      | GitHub                         | Open-source visibility, community collaboration, issue tracking                                                 |

**Development Phases**

The project is divided into six sequential phases over six months:

Phase 1 (Weeks 1-4): Foundation & Architecture

- Deliverables: System architecture documentation, database schema design, API specification (OpenAPI/Swagger), frontend component library setup, CI/CD pipeline configuration.
- Milestones: Architecture review, local development environment setup, first automated test suite.

Phase 2 (Weeks 5-8): Ontology Design & Teacher Model

- Deliverables: Domain ontology for one pilot domain (Frontend Development) with 30-50 learning nodes, ontology validation framework, Teacher Model implementation (LLM-based skeleton generation), expert verification process.
- Milestones: Ontology review with experts, verification checklist creation, sample skeleton generated and verified.

Phase 3 (Weeks 9-12): Core Features \- Gatekeeper & Tutor Model

- Deliverables: Gatekeeper Pattern implementation (three-tier logic, prerequisite validation), Tutor Model (runtime LLM integration for explanations and quizzes), quiz generation and evaluation logic, resource discovery (PSE API integration).
- Milestones: Gatekeeper logic tested with sample learners, Tutor Model generates quizzes, first resource recommendations surfaced.

Phase 4 (Weeks 13-16): Adaptation & Persistence

- Deliverables: Mastery Decay algorithm implementation, multi-path branching UI, learner progress persistence, spaced repetition notifications, learner dashboard.
- Milestones: Mastery Decay tested with simulated learner sessions, branching paths selectable in UI, progress data persisted correctly.

Phase 5 (Weeks 17-20): Platforms & Optimization

- Deliverables: Web interface (React) fully functional, mobile interface (Flutter) MVP, performance optimization, scalability testing, cost analysis of LLM API usage.
- Milestones: Web platform user testing with 10 learners, mobile app deployed to test stores, performance benchmarks meeting SLAs.

Phase 6 (Weeks 21-24): Validation & Deployment

- Deliverables: Empirical evaluation with 50-100 Ethiopian learners (learning gains, engagement metrics, usability feedback), final bug fixes, deployment to production, documentation and developer guides.
- Milestones: Pre/post assessments completed, statistical analysis of learning gains, production deployment, user feedback synthesis.

---

##

## **1.5 Plan of Activities** {#1.5-plan-of-activities}

The project spans six months (24 weeks) divided into six phases with specific milestones, deliverables, and team responsibilities.

![][image2]

Figure 1.1 Six phases with specific milestones, deliverables, and team responsibilities.

**Table 1.2: Detailed Weekly Breakdown (24 Weeks):**

| Weeks | Sprint    | Focus Areas                                                                                       | Deliverables                                                                                                                                         | Sprint Goals                                                                                                       | Team Leads                   |
| :---- | :-------- | :------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| 1-2   | Sprint 1  | Project kickoff, architecture design, tech stack finalization                                     | Architecture document (v0.1), tech stack decision matrix, GitHub repo setup, project wiki                                                            | Architecture review approved; development environment setup complete                                               | Tech Lead                    |
| 3-4   | Sprint 2  | Database schema design, API specification, CI/CD pipeline setup                                   | PostgreSQL schema (entity relationship diagram), OpenAPI spec (v0.1), GitHub Actions workflow, Docker setup                                          | Database schema reviewed; API endpoints defined; first build pipeline operational                                  | Backend Lead                 |
| 5-6   | Sprint 3  | Ontology framework design, Teacher Model prototype, domain expert interviews                      | Ontology data model (JSON schema), Teacher Model prototype (LLM prompt design), domain expert interview notes                                        | Ontology structure finalized; Teacher Model generates sample skeleton; expert feedback collected                   | AI Engineer \+ Domain Expert |
| 7-8   | Sprint 4  | Pilot domain ontology creation (Frontend), expert verification, refinement                        | Frontend domain ontology (40 nodes), verification checklist (50 items), verified ontology v1.0                                                       | Pilot ontology created and verified; ready for Tutor Model integration                                             | AI Engineer \+ Domain Expert |
| 9-10  | Sprint 5  | Gatekeeper Pattern implementation, quiz service, quiz generation logic                            | Gatekeeper logic (pass/fail/marginal tier implementation), quiz service API, LLM-based quiz generation                                               | Gatekeeper logic unit tested; quizzes generated for sample nodes; three-tier outcomes validated                    | Backend Lead \+ AI Engineer  |
| 11-12 | Sprint 6  | Tutor Model integration, resource discovery (PSE API), learner feedback capture                   | Tutor Model service (LLM API integration with caching), PSE API wrapper, learner feedback survey                                                     | Tutor Model generates contextual explanations; resources fetched from whitelisted domains; feedback UI operational | Backend Lead \+ AI Engineer  |
| 13-14 | Sprint 7  | Mastery Decay algorithm implementation, spaced repetition triggers, learner dashboard UI mockups  | Decay algorithm (Green/Yellow/Red state transitions), micro-quiz generation, dashboard wireframes                                                    | Decay states correctly transition based on time; micro-quizzes triggered; dashboard MVP designed                   | Full-Stack Team              |
| 15-16 | Sprint 8  | Multi-path branching logic, prerequisite validation, frontend branching UI                        | Branching logic (choice-based path selection), prerequisite graph validation, React branching component                                              | Branching paths selectable; prerequisite validation prevents invalid paths; learner can visualize path choice      | Frontend \+ Backend Lead     |
| 17-18 | Sprint 9  | React web interface development (roadmap DAG visualization, quiz interface, progress dashboard)   | React components (DAG viewer with D3.js, quiz UI, progress dashboard, resource panel), responsive design                                             | Web interface functional for desktop/tablet; DAG visualized interactively; quiz flow smooth                        | Frontend Lead                |
| 19-20 | Sprint 10 | Flutter mobile interface development (responsive navigation, offline support, push notifications) | Flutter widgets (roadmap view, quiz interface, push notification handler, offline DB), iOS/Android builds                                            | Mobile app installable on iOS/Android; offline functionality tested; push notifications triggered correctly        | Mobile Lead                  |
| 21-22 | Sprint 11 | Performance optimization, scalability testing, cost analysis, bug fixes                           | Performance benchmarks (page load \<2s, API response \<500ms), load testing report (1000 concurrent users), cost analysis (API fees, infrastructure) | Performance SLAs met; system handles 1000 concurrent users; cost model established                                 | Tech Lead \+ DevOps          |
| 23-24 | Sprint 12 | Empirical evaluation (user study with 50-100 learners), production deployment, documentation      | User study results (learning gains, engagement metrics, usability feedback), production deployment checklist, API docs, developer guides             | Pre/post assessments analyzed; learning gains quantified; system deployed to production; documentation complete    | QA Lead \+ Tech Lead \+ All  |

## **1.6 Budget Breakdown** {#1.6-budget-breakdown}

The following budget reflects six months of development, testing, and initial deployment of AI-Driven Personalized Learning Roadmap Generator And Tutor for 50-100 concurrent test users, scaling to potentially thousands of learners post-launch.

**Table 1.3: Detailed Budget Table:**

| Budget Category            | Item                                        | Unit Cost             | Quantity/Duration | Subtotal (USD) | Notes                                                                                                |
| :------------------------- | :------------------------------------------ | :-------------------- | :---------------- | :------------- | :--------------------------------------------------------------------------------------------------- |
| Cloud Infrastructure       | AWS EC2 (t3.medium, 4vCPU, 1GB RAM)         | $35/month             | 6 months          | $210           | Frontend/API server; horizontal scaling as load increases                                            |
| API & Third-Party Services | OpenAI API (GPT-4, chat completion)         | \~$0.03 per 1K tokens | \~5M tokens/month | $2,700         | LLM for Tutor Model quiz/explanation generation; estimated based on 100 users, 3K tokens per session |
|                            | Google Programmable Search Engine (PSE) API | $100/month            | 6 months          | $600           | Resource discovery from whitelisted domains; includes 100 queries/day free tier covered              |
| Domain & SSL               | Domain registration (.com)                  | $12/year              | 1                 | $12            | AI-Driven Personalized Learning Roadmap Generator And Tutor .com or similar                                    |
|                            | TOTAL PROJECT BUDGET                        |                       |                   | $3522.00 USD   |                                                                                                      |

Budget Notes and Rationale:

Cloud Costs Optimization:

- AWS was selected for its free tier (750 hours/month EC2, 1GB RDS), which covers development and initial testing. Production costs scale with user growth. Alternative: DigitalOcean ($5-40/month) or Heroku ($7-50/month per dyno) for cost-sensitive deployment.

LLM API Costs:

- OpenAI GPT-4 cost is the largest single item. Optimization strategies include: (1) Caching frequently-accessed explanations and quizzes, (2) using cheaper models (GPT-3.5-turbo at $0.0005 per 1K tokens) for simpler tasks, (3) implementing a local, fine-tuned model (LLaMA, Mistral) to replace API calls, reducing recurring costs.

## **1.7 Significance of the Project** {#1.7-significance-of-the-project}

Academic Significance:

AI-Driven Personalized Learning Roadmap Generator And Tutor contributes to three areas of academic research and practice in computer science and educational technology:

**1\. Hybrid AI Architecture for Curriculum Design**

Traditional Intelligent Tutoring Systems faced a knowledge engineering bottleneck: each domain required thousands of hours of expert time to encode knowledge rules. Modern LLMs solve scalability but introduce hallucination. AI-Driven Personalized Learning Roadmap Generator And Tutor operationalizes a novel "Skeleton & Flesh" variant of Retrieval-Augmented Generation specifically for curriculum design, bridging decades of ITS research with contemporary AI. This architecture is novel in its application to self-directed learning and could inform future EdTech research on verified, scalable knowledge representation.

**2\. Assessment-Driven Resource Adaptation**

The Gatekeeper Pattern and three-tier remediation (resource modality swapping, prerequisite review, escalation) operationalize research from cognitive load theory and multimedia learning theory . By grounding assessment outcomes in adaptive resource selection rather than just scoring feedback, AI-Driven Personalized Learning Roadmap Generator And Tutor advances the "knowing how to teach" dimension of adaptive tutoring, extending beyond item selection (IRT-based adaptation) to meta-cognitive strategy selection.

3\. Decay-Aware Roadmap Evolution (see the generated image above)

By integrating Ebbinghaus's forgetting curve and modern spaced repetition research directly into curriculum roadmap interfaces, AI-Driven Personalized Learning Roadmap Generator And Tutor makes learning persistence a first-class system feature rather than a learner-managed tool. This is novel in positioning decay as a dynamic roadmap state (Green/Yellow/Red), enabling visualizations and system-level reminders that enhance retention science's practical impact.

Regional and Socioeconomic Significance (Ethiopian Context):

AI-Driven Personalized Learning Roadmap Generator And Tutor directly addresses critical challenges in Ethiopian technical education and workforce development:

**1\. Educational Access and Democratization**

In Ethiopia, access to quality technical education is limited by geographic constraints (concentrations in Addis Ababa), institutional capacity (limited university programs), and cost (premium courses unaffordable for most). AI-Driven Personalized Learning Roadmap Generator And Tutor is free, web/mobile accessible, and locally developed, removing these barriers. By aggregating high-quality resources and adapting them to learner needs, the system enables thousands of Ethiopian students, self-taught engineers, and career-transitioning professionals to achieve technical competence without expensive mentorship or bootcamps.

**2\. Employment Readiness and Economic Mobility**

The software engineering job market in Ethiopia is growing rapidly, with demand far exceeding supply. Employers struggle to find competent engineers; graduates from universities often lack practical, up-to-date skills. AI-Driven Personalized Learning Roadmap Generator And Tutor 's focus on contemporary programming domains (Frontend, Backend, Data Science) and assessment-driven progression ensures learners develop verifiable, job-aligned competencies. By reducing time-to-competence and improving skill quality, the system enhances employment prospects for learners and reduces skill gaps for employers.

**3\. Reduction of Brain Drain and Talent Retention**

Ethiopian tech talent often emigrates (to Kenya, South Africa, or Western countries) due to limited local opportunities and lower wages. High-quality, accessible technical education increases the competitiveness of local talent and improves their earning potential domestically, reducing incentives to emigrate. Retention of technical talent strengthens Ethiopia's domestic tech ecosystem and contributes to long-term economic development.

**4\. Open-Source and Knowledge Sharing Model**

AI-Driven Personalized Learning Roadmap Generator And Tutor is positioned as an open-source project with source code publicly available (GitHub). This enables Ethiopian tech communities, universities, and NGOs to contribute, adapt, and deploy locally. The open model reduces dependency on commercial EdTech platforms and builds local capacity in EdTech development, aligning with national strategies for technological self-sufficiency.

Technical and Practical Significance:

**1\. Scalability of Adaptive Learning**

By decoupling curriculum knowledge (the skeleton) from runtime tutoring (the flesh), AI-Driven Personalized Learning Roadmap Generator And Tutor demonstrates how adaptive learning can scale beyond manual curation. The system can extend to additional domains (DevOps, Cloud Architecture, Blockchain, etc.) by generating new skeletons with expert verification, without redesigning the tutoring engine. This scalability model informs future EdTech platforms aiming for broad domain coverage.

**2\. Resource Curation Patterns**

The use of Google PSE API for domain-restricted resource discovery demonstrates a practical approach to aggregating high-quality, trustworthy learning materials at scale. This pattern is applicable to other contexts (medical education, legal education, language learning) and could become a best practice for EdTech resource discovery.

**3\. Open-Source EdTech Contribution**

AI-Driven Personalized Learning Roadmap Generator And Tutor contributes to the open-source EdTech ecosystem (alongside platforms like Moodle, Open edX). Publishing source code, documentation, and data (anonymized learner outcomes) enables researchers and developers worldwide to build upon the work, accelerating EdTech research and development globally.

User and Stakeholder Significance:

1\. Student Learners (Primary Beneficiaries)

Students gain structured, adaptive guidance navigating technical learning, reducing time-to-competence, improving retention, and increasing confidence. The system's personalization (Multi-Path Branching) respects learner agency and interests, increasing intrinsic motivation.

2\. Educators and Mentors (Secondary Beneficiaries)

Teachers and mentors gain visibility into learner progress through dashboards and analytics. They can identify learners who are struggling (flagged by Gatekeeper Pattern failures) and provide targeted support. Challenge projects recommended by the system provide authentic, project-based learning opportunities.

3\. Employers (Stakeholders)

Employers benefit from an increased pool of technically skilled, job-ready graduates. AI-Driven Personalized Learning Roadmap Generator And Tutor can be integrated into corporate training programs, reducing time and cost of employee onboarding in technical skills.

4\. Content Creators and Open-Source Communities (Indirect Beneficiaries)

By aggregating and recommending high-quality resources from trusted creators (FreeCodeCamp, GeeksForGeeks, MDN), AI-Driven Personalized Learning Roadmap Generator And Tutor increases visibility and usage of these resources, supporting creators' missions and enabling community growth.

## **1.8 Outline of the Study** {#1.8-outline-of-the-study}

This document is structured as follows:

Chapter 1: Introduction (Current Chapter)

- Articulates the problem landscape (tutorial hell, absence of adaptive feedback, lack of mastery-based progression, cognitive overload, generic roadmaps, hallucination in LLM-driven systems).
- Defines objectives for system design, implementation, and validation.
- Specifies scope (three initial domains, in-scope features) and limitations (resource constraints, algorithm calibration challenges).
- Outlines methodology (Agile-Scrum, microservices architecture, Skeleton & Flesh hybrid AI, Gatekeeper Pattern, Mastery Decay, Multi-Path Branching, PSE API-based resource curation).
- Details the plan of activities (six-month timeline, 12 sprints, milestones).
- Presents budget breakdown (\~$255K USD).
- Justifies academic, regional, technical, and stakeholder significance.

Chapter 2: Literature Review

- Synthesizes research on Intelligent Tutoring Systems (ITS) evolution, adaptive learning, knowledge representation (ontologies and RAG), assessment-driven progression, spaced repetition (Ebbinghaus, Cepeda, Karpicke), personalization and multi-path learning, resource aggregation, and content curation.
- Analyzes gaps in existing solutions (Khan Academy, roadmap.sh, Coursera, Anki, pure LLM tutoring) and positions AI-Driven Personalized Learning Roadmap Generator And Tutor 's innovations within the research landscape.
- Establishes three core lessons: (1) Ontology-guided LLM solves hallucination, (2) Assessment-driven resource adaptation extends tutoring principles, (3) Decay-aware adaptation operationalizes spacing research.

Chapter 3: Problem Analysis and Modeling

- Provides detailed requirements elicitation methodology (interviews, surveys, domain expert workshops).
- Specifies functional requirements (roadmap generation, quiz delivery, resource recommendation, learner tracking) and non-functional requirements (performance, scalability, security, usability).
- Presents system models: use case diagrams (learner, instructor, admin actors and interactions), UML class diagrams (domain entities: Learner, LearningNode, Quiz, Resource, AdaptationEvent), sequence diagrams (quiz flow, Gatekeeper decision flow, resource adaptation flow), activity diagrams (learner progression flow, Mastery Decay trigger flow), ER/DFD diagrams (data entities and flows), and UI mockups/wireframes (roadmap DAG visualization, quiz interface, progress dashboard).
- Validates requirements against objectives and scope.

Chapter 4: System Design and Architecture

- Presents the detailed system architecture: microservices layers (frontend, API gateway, business logic, data, AI/ML, external integrations).
- Specifies the Skeleton & Flesh hybrid AI architecture: Teacher Model (offline ontology generation and expert verification) and Tutor Model (runtime explanation and quiz generation).
- Details the Gatekeeper Pattern's three-tier logic (pass/marginal/fail outcomes, resource adaptation, prerequisite validation).
- Describes Mastery Decay algorithm (state transitions, micro-quiz triggers, visualization).
- Specifies Multi-Path Branching implementation (choice points, path sequences, semantic coherence).
- Presents database schema (PostgreSQL entities, relationships), API specifications (RESTful endpoints, request/response formats), and deployment architecture (Docker containers, AWS infrastructure, CI/CD pipeline).

Chapter 5: Implementation and Development

- Documents development process, technologies used (React, Flutter, Node.js, PostgreSQL, Docker, AWS).
- Presents code organization, coding standards, and best practices applied.
- Details integration of LLM APIs (OpenAI GPT-4), Google PSE API, and external services.
- Describes testing strategy: unit tests (Gatekeeper logic, Mastery Decay transitions), integration tests (API endpoints, database interactions), system tests (end-to-end user flows), and user acceptance testing with test users.
- Documents lessons learned during implementation and technical challenges encountered.

Chapter 6: Evaluation and Validation

- Specifies evaluation methodology: empirical user study with 50-100 Ethiopian learners.
- Defines success metrics: (1) Learning gains (pre/post assessments comparing AI-Driven Personalized Learning Roadmap Generator And Tutor users vs. control group), (2) Engagement metrics (time-on-task, session frequency, long-term retention), (3) Usability metrics (System Usability Scale, task completion time, error rates), (4) Qualitative feedback (interviews, surveys on learning experience, cultural/linguistic appropriateness).
- Presents results: learning outcomes, engagement patterns, usability findings, user feedback synthesis.
- Discusses findings, limitations of the study, and generalizability to broader populations.

Chapter 7: Conclusions and Recommendations

- Summarizes project achievements: system design, hybrid AI architecture, Gatekeeper Pattern, Mastery Decay, Multi-Path Branching, empirical validation.
- Discusses how objectives were met and implications for EdTech research and practice.
- Identifies technical and research contributions: Skeleton & Flesh variant of RAG for curriculum design, assessment-driven resource adaptation, decay-aware roadmap evolution, scalable resource curation patterns.
- Recommends future work: (1) Extension to additional domains (DevOps, Cloud Architecture, Soft Skills), (2) Integration with hands-on coding platforms (LeetCode, HackerRank) for code assessment, (3) Collaborative learning features (peer discussion, code review), (4) employer partnership for credential recognition and job placement, (5) refinement of decay algorithm parameters based on learner data, (6) exploration of alternative AI models (locally-hosted LLaMA) to reduce API costs.
- Discusses sustainability: open-source governance, community contribution model, and potential revenue streams (premium features, corporate training partnerships) to fund ongoing development and operations.

#

# **Chapter 2: Literature Review** {#chapter-2:-literature-review}

## **2.1 Evolution of Intelligent Tutoring Systems and Adaptive Learning** {#2.1-evolution-of-intelligent-tutoring-systems-and-adaptive-learning}

The foundation of personalized learning traces back to Bloom's seminal work on the "two-sigma problem" (Bloom, 1984), which demonstrated that one-on-one tutoring produces two standard deviations of improvement over traditional classroom instruction. This groundbreaking finding motivated decades of research into Intelligent Tutoring Systems (ITS) that attempt to replicate tutor-like adaptivity at scale. The psychological principle underlying this finding is well-established: individual feedback, adaptive pacing, and immediate error correction hallmarks of human tutoring significantly accelerate learning outcomes (Kulik & Kulik, 1991).

VanLehn's comprehensive review (VanLehn, 2011\) identified critical ITS challenges that have persisted for decades: knowledge representation, student modeling, and pedagogical strategy selection. Traditional rule-based ITS systems (e.g., LISP Tutor by Anderson & Corbett, Cognitive Tutors) achieved measurable learning gains of up to one sigma in controlled studies but faced severe scalability barriers due to manual knowledge engineering requirements. Each domain required expert intervention to codify learning rules in propositional or constraint-based formalisms, making rapid curriculum expansion impractical. In the context of software engineering education, this meant that developing a complete ITS for even a single programming language (e.g., Python) required thousands of hours of expert time, a constraint particularly acute in resource-limited contexts like Ethiopia, where educational expertise and funding are scarce.

Woolf's extensive synthesis (Woolf, 2009\) articulated that effective tutoring requires three essential pillars: (1) accurate, comprehensive domain knowledge representation that captures prerequisites, learning outcomes, and misconceptions; (2) sophisticated understanding of individual student misconceptions and learning styles; and (3) timely, contextually appropriate adaptive feedback that neither over-scaffolds nor under-supports learners. However, most contemporary platforms including free platforms like Khan Academy and paid platforms like Coursera implement only passive sequencing. They present content in a predetermined, linear order (e.g., "Watch Lecture 1 → Watch Lecture 2 → Take Quiz") without active performance-driven progression gates or adaptive resource swapping based on specific failure modes. Learners can technically "complete" a course without demonstrating mastery, leading to knowledge gaps that compound in subsequent courses.

AI-Driven Personalized Learning Roadmap Generator And Tutor addresses this critical gap by embedding assessment-driven progression through the Gatekeeper Pattern, ensuring that advancement to new conceptual nodes is contingent on demonstrated mastery (≥80% performance on targeted assessment), not merely time spent or content completion. This operationalizes Bloom's principle of mastery-based progression and directly responds to the two-sigma finding: by enforcing individual accountability and performance-based advancement, the system approximates the adaptive feedback loop of one-on-one tutoring, albeit at scale.

## **2.2 Knowledge Representation: From Ontologies to Retrieval-Augmented Generation** {#2.2-knowledge-representation:-from-ontologies-to-retrieval-augmented-generation}

The shift from brittle, hand-coded knowledge bases to flexible, ontology-driven approaches marks a critical evolutionary milestone in AI-assisted education. Ontologies formal specifications of conceptual schemas that enumerate concepts, relationships, and rules within a domain provide machine-readable representations of domain knowledge that enable both semantic reasoning and knowledge sharing (Gruber, 1995). In the EdTech domain specifically, ontologies have been applied to competency modeling frameworks (IMS RDCEO for learning design, O\*NET frameworks for job competencies) and curriculum mapping (mapping learning outcomes to instructional activities).

However, the rapid emergence of Large Language Models (LLMs) in 2022-2024 introduced a profound technical challenge and opportunity. While LLMs can generate fluent, contextually appropriate natural language explanations and appear to "understand" domain concepts, they suffer from a critical failure mode: hallucination. Hallucination is the phenomenon where an LLM produces confident but factually incorrect, logically incoherent, or fabricated outputs (Marcus & Davis, 2020; Weidinger et al., 2021). In technical education, this is catastrophic. A student receiving incorrect information about a JavaScript async/await pattern, cryptographic algorithm, or database indexing strategy may internalize false knowledge, leading to buggy code or flawed system design. The stakes are particularly high in self-directed learning, where learners lack an instructor to correct misunderstandings.

Retrieval-Augmented Generation (RAG) has emerged as a proven mitigation strategy (Lewis et al., 2020). RAG decouples knowledge generation into two epistemically distinct phases: (1) retrieve relevant, pre-verified information from a curated knowledge base, and (2) generate contextual explanations and elaborations grounded in that retrieved content. By constraining generation to retrieved facts, RAG significantly reduces hallucination while maintaining the flexibility and naturalness of generative models. For example, a RAG system asked "Explain JavaScript closures" would first retrieve verified documentation about closures (e.g., from MDN or official ECMAScript specs), then synthesize an explanation grounded in those facts, rather than fabricating examples.

AI-Driven Personalized Learning Roadmap Generator And Tutor operationalizes a strategic variant of RAG through the "Skeleton & Flesh" hybrid architecture:

- The Skeleton (offline, Teacher Model): A powerful LLM (e.g., GPT-4, Claude) is used once, in a controlled offline setting, to generate a comprehensive, logically coherent ontology a directed acyclic graph (DAG) of learning nodes, prerequisite relationships, learning outcomes, and sub-skills. This skeleton is then rigorously verified by domain experts (software engineers, educators) who review each node for accuracy, granularity, and logical sequencing. Crucially, once verified, this skeleton is static and deterministic. It cannot be altered by runtime generation; it serves as an immutable scaffold.
- The Flesh (runtime, Tutor Model): A lightweight LLM or rule-based engine generates contextual explanations, quizzes, and resource recommendations at runtime, but crucially, it generates within the bounds defined by the skeleton. It cannot invent new learning nodes, create arbitrary prerequisites, or deviate from the verified structure. It elaborates on pre-verified nodes using different linguistic styles, provides examples within the node's scope, and generates quiz questions targeting specific learning outcomes defined in that node.

This hybrid approach combines the rigor and verifiability of ontologies with the flexibility, naturalness, and scalability of LLMs. It solves the hallucination problem in curriculum design (the skeleton is verified, thus factually sound) while maintaining scalability beyond manual curation (the flesh is generative, so it doesn't require scripting thousands of individual quiz questions or explanations). The verified skeleton can be extended by domain experts or crowdsourced reviewers in a controlled process, avoiding the expertise bottleneck that limited traditional ITS development.

## **2.3 Adaptive Learning and Assessment-Driven Progression** {#2.3-adaptive-learning-and-assessment-driven-progression}

Adaptive learning systems respond to learner performance by dynamically adjusting content sequencing, difficulty levels, or pacing. Most commercial adaptive platforms (DreamBox Learning, Knewton, Smart Sparrow) rely on Item Response Theory (IRT) or Bayesian networks to model learner ability and item difficulty, then algorithmically select the next item to maximize information gain about the learner's skill level (van der Linden & Glas, 2010).

However, IRT-based adaptation has a critical limitation in the context of curriculum sequencing: it optimizes for item selection (next question to ask) but not for resource or explanation type adaptation. Under an IRT system, if a learner fails a JavaScript fundamentals quiz (e.g., scores 45%), the adaptive engine might increase item difficulty slightly or offer a hint, but it typically serves the same conceptual explanation again, perhaps with a visual diagram added but the modality of instruction remains documentational or explanatory.

AI-Driven Personalized Learning Roadmap Generator And Tutor introduces a novel layer of adaptation: Assessment-Driven Resource Adaptation. Failure modes trigger not just re-teaching but strategic resource modality swapping. This is grounded in cognitive load theory (Sweller, 1988\) and multimedia learning theory (Mayer, 2009), which demonstrate that the effectiveness of instructional modality depends on learner prior knowledge and cognitive load. Specifically:

- If a learner scores 70-79% (partial mastery): The system unlocks the node, marking progress, but flags it for spaced repetition review (see Section 2.4). The learner is encouraged to advance but will receive reminder quizzes at strategically timed intervals.
- If a learner scores 50-69% (emerging understanding but gaps): The system does not unlock the next node. Instead, it replaces the resource link used during the first attempt if that was a documentation-style link (e.g., MDN Web Docs, a detailed reference page) with a tutorial-style link (e.g., FreeCodeCamp video tutorial, a step-by-step interactive walkthrough). The hypothesis is that the learner's comprehension gap stems from learning modality mismatch: documentation assumes higher prior knowledge and requires self-directed navigation, while tutorial modality provides guided, scaffolded progression. The quiz is then re-attempted with these adapted resources.
- If a learner scores 40-49% (low comprehension): The system triggers prerequisite review. Before retry, the learner is directed to foundational nodes they may have passed quickly. This addresses a common failure mode in self-directed learning: learners advance through prerequisite topics without deep mastery, then struggle when prerequisites are needed. The system enforces that mastery is not superficial.
- If a learner scores \<40% (fundamental gaps): The system flags the node as "Requires Instructor Review" (in a classroom setting) or recommends a complete restart of the topical cluster with different resources. This acknowledges the limits of adaptive automation: some gaps may reflect learning disabilities, language barriers, or lack of foundational prerequisites that require human pedagogical judgment.

This granular, failure-mode-aware adaptation extends Woolf's (2009) principle of "knowing what to teach" to a more sophisticated principle: "knowing how to teach it" matching not just content but delivery modality, pacing, and support intensity to learner needs. It operationalizes research by Clark & Mayer (2016) showing that multimedia modality should be selected based on learner expertise: novices benefit from tutorial structures; experts benefit from reference structures.

## **2.4 Spaced Repetition and the Forgetting Curve** {#2.4-spaced-repetition-and-the-forgetting-curve}

Hermann Ebbinghaus's empirical finding (Ebbinghaus, 1885\) that forgetting follows a predictable exponential decay curve has become foundational to memory and retention science. His original experiments demonstrated that forgetting is not random; it follows a mathematical curve where retention drops sharply in the first days after learning, then levels off. Critically, he also demonstrated that strategically timed review can extend retention indefinitely the basis for the spaced repetition principle.

Modern implementations and meta-analyses (Cepeda et al., 2006; Dunlosky et al., 2013\) have rigorously validated that spacing intervals optimized to individual retention curves dramatically improve long-term retention compared to massed practice. For example, Cepeda's meta-analysis of 317 experiments found that retention improved by up to 40-50% when spacing intervals were optimized. Tools like Anki, Quizlet, and SuperMemory have demonstrated the real-world effectiveness of spaced repetition at scale, helping millions of learners retain vocabulary, facts, and concepts.

However, spaced repetition has been largely isolated as a study tool disconnected from curriculum roadmaps. In typical self-directed learning, learners "complete" a course (marking nodes as done), achieve a certificate, and then never revisit the material. Over weeks and months, skills decay according to Ebbinghaus's curve, but there is no system-level reminder or re-engagement mechanism. A learner who completes "JavaScript Fundamentals" in January may find that by April, they've forgotten core concepts and must relearn from scratch a form of learning inefficiency that is widespread but rarely addressed.

AI-Driven Personalized Learning Roadmap Generator And Tutor introduces Mastery Decay a visual, algorithm-driven reminder system grounded in Ebbinghaus's curve and modern spacing research:

- Initial Mastery (Green status): Upon passing the Gatekeeper quiz (≥80%), a node is marked "Mastered" (visualized as green). A timestamp is recorded.
- Review Trigger (Yellow status): If a node remains unvisited for more than 14 days (approximately 2 weeks), it automatically transitions to "Review Needed" (visualized as yellow). This interval (14 days) is calibrated based on Cepeda et al.'s finding that optimal spacing is approximately 10-20% of the desired retention duration. For a semester-long course (16 weeks), a 14-day review interval keeps material fresh.
- Relearning Required (Red status): If a node remains unvisited for more than 30 days, it transitions to "Relearn" (red), signaling that significant skill decay has occurred and a deeper re-engagement is needed.
- Micro-Quiz Trigger: When a node transitions from green to yellow or red, the learner receives a notification and is presented with a micro-quiz (2-3 questions) targeting that node's core concepts. Success on the micro-quiz resets the timer; failure triggers resource adaptation (see Section 2.3).

The roadmap UI visualizes this decay prominently, making learner knowledge gaps visible and actionable. Rather than forgetting being an invisible, gradual phenomenon, it is represented as a dynamic system state. This transforms spaced repetition from a learner's voluntary, self-discipline-dependent tool (e.g., Anki, where many users forget to review decks) into a system-guided, pull-based feature where reminders are automatic and integrated into the learner's progression pathway.

Research by Karpicke & Roediger (2008) and Kornell & Bjork (2008) further supports this approach: they found that introducing variability and spacing into learning contexts increases both retention and transfer of knowledge compared to blocked, massed practice. AI-Driven Personalized Learning Roadmap Generator And Tutor 's decay system introduces both spacing (review after 14 days) and variability (micro-quizzes present questions in different formats, contexts, and difficulty levels compared to the initial Gatekeeper quiz).

## **2.5 Personalization and Multi-Path Learning** {#2.5-personalization-and-multi-path-learning}

Adaptive learning research, synthesized by Brusilovsky (2001) and extended by more recent work, identifies at least three dimensions along which learning can be personalized:

1. Content Adaptation: Which topics or learning materials are presented (and which are skipped or deferred)?
2. Sequencing Adaptation: In what order are topics presented?
3. Modality Adaptation: How is content taught (video, text, interactive, etc.)?

Most traditional, static roadmaps (roadmap.sh, LeetCode learning paths, typical bootcamp curricula) address the first dimension minimally and largely ignore the second and third. They present a fixed, linear sequence: "Learn HTML → CSS → JavaScript → React → Node.js → Databases." This one-size-fits-all approach ignores that learners differ substantially in learning preferences, prior knowledge, career goals, and cognitive styles (Pashler et al., 2008). Some learners are visual, front-end focused and need CSS mastery before engaging with JavaScript logic; others are backend-oriented and need databases and server-side logic before styling concerns. A fixed sequence may frustrate the former (forcing them through backend modules) and confuse the latter (introducing front-end concerns prematurely).

AI-Driven Personalized Learning Roadmap Generator And Tutor 's Multi-Path Branching feature operationalizes Brusilovsky's second dimension (sequencing adaptation) by offering learner choice at key decision points. The system is designed around a branching tree structure rather than a linear chain:

- After completing foundational nodes (e.g., "Core Programming Fundamentals: Variables, Loops, Conditionals, Functions, Data Structures"), the system presents a branching question: "Which area interests you most: Visual Design & Frontend, Backend Logic & Data, or Data Science & AI?"
- Based on the learner's choice, the system recommends a sequence of paths:
  - Path A (Frontend-focused): CSS Fundamentals → Advanced CSS (Grid, Flexbox) → JavaScript DOM Manipulation → Frontend Frameworks (React) → UI/UX Design Patterns
  - Path B (Backend-focused): Server-Side JavaScript (Node.js) → Databases (SQL, NoSQL) → API Design → Microservices → DevOps Basics
  - Path C (Data Science & AI): Python Fundamentals → Data Structures & Algorithms → Data Analysis Libraries (Pandas, NumPy) → Machine Learning → Deep Learning
- Both paths converge at advanced topics (e.g., "Full-Stack Integration: Building a Complete Application," "System Design and Architecture," "Production Deployment"). This ensures foundational coherence all learners master core programming concepts while respecting learner agency and enabling depth in areas of interest.

This approach aligns with self-determination theory (Ryan & Deci, 2000\) and research on intrinsic motivation (Deci & Ryan, 1985). Dweck's (2006) research on fixed vs. growth mindset further supports the value of offering learner choice: when learners feel agency and perceive learning challenges as aligned with their interests and capabilities, they are more likely to persist through difficulty, adopt a growth mindset, and achieve deeper learning.

Additionally, multi-path learning reflects the reality of software engineering careers: not all software engineers are full-stack. Some specialize in frontend, others in backend, still others in data/ML. Offering paths that align with learner interests increases the likelihood of career relevance and sustained engagement.

## **2.6 Resource Aggregation and Content Curation** {#2.6-resource-aggregation-and-content-curation}

A persistent challenge in self-directed learning is discovery: where to find high-quality, trustworthy resources? Learners often face a fragmentation problem; the same concept might be explained in a blog post, a YouTube video, official documentation, and a dozen Stack Overflow answers requiring learners to aggregate and synthesize information across sources. Alternatively, learners face a quality variability problem: user-generated content (YouTube tutorials, personal blogs) ranges from excellent to dangerously incorrect, with no consistent signal of reliability.

Existing resource aggregation approaches fall into three categories:

1. Manual Expert Curation (Khan Academy, edX, Coursera): Experts (instructors, instructional designers) carefully select, often co-creating, high-quality content. Advantage: consistent quality and pedagogical sequencing. Disadvantage: resource-intensive, limited coverage (gaps for emerging domains), and difficult to scale beyond funded institutions.
2. User-Generated Curation (Reddit /r/learnprogramming, GitHub awesome-lists, Hacker News): Community members recommend resources they've found valuable. Advantage: rapid response to emerging domains, grassroots discovery. Disadvantage: inconsistent quality, outdated links, and often reflects the biases of vocal community members rather than universal learner needs.
3. Algorithmic Recommendation (YouTube recommendations, LinkedIn Learning): Algorithms rank resources based on engagement metrics (views, clicks, time spent). Advantage: scales to massive content catalogs. Disadvantage: engagement metrics do not correlate with learning efficacy; popular content is often entertainment-oriented, not pedagogically sound.

AI-Driven Personalized Learning Roadmap Generator And Tutor implements a hybrid curation model designed to scale beyond manual curation while maintaining quality assurance:

- Domain Whitelisting: During the offline ontology creation phase (Teacher Model), domain experts and experienced software engineers specify a curated list of trusted content providers for each learning domain. For example, for "JavaScript Fundamentals," trusted sources might include MDN Web Docs, FreeCodeCamp, JavaScript.info, and official ECMAScript documentation. For "React," sources might include React's official documentation, Dan Abramov's blogs, and frontend-focused educational sites.
- Google Programmable Search Engine (PSE) API Integration: At runtime, when the Tutor Model (Section 2.2) needs to fetch learning resources for a specific node, it uses the Google PSE API to programmatically fetch links only from the pre-approved, domain-specific whitelist. This ensures that recommended resources are never from unvetted sources, dramatically reducing quality variability.
- Automated Link Validation: All recommended links undergo automated validation: HTTP status checks (ensuring links are not broken), content freshness checks (flagging outdated tutorials), and optional NLP-based content validation (summarizing page content to ensure it matches the learning node's objectives).
- Learner Feedback Loop: Learners can rate resources ("Was this explanation clear? Helpful? Outdated?"). Ratings are aggregated and inform future curation decisions, allowing the system to adapt recommendations based on real learner experience.

This approach avoids the pitfalls of YouTube scraping (unvetted, transient URLs, mixed quality) while maintaining scalability beyond manual curation. The PSE API acts as an intelligent, domain-aware "quality gate," translating domain expertise (the whitelist) into algorithmic filtering and discovery. As new, trusted resources emerge, the whitelist can be updated by domain experts, and the system immediately benefits without manual resource re-creation.

## **2.7 Critical Gaps in Existing Solutions and AI-Driven Personalized Learning Roadmap Generator And Tutor 's Positioning** {#2.7-critical-gaps-in-existing-solutions-and-ai-driven-personalized-learning-roadmap-generator-'s-positioning}

A comprehensive synthesis of related work reveals persistent gaps across existing solutions. The following analysis positions AI-Driven Personalized Learning Roadmap Generator And Tutor 's novelty within the landscape:

Table 2.1: AI-Driven Personalized Learning Roadmap Generator And Tutor 's novelty within the landscape

| Existing Solution                         | Key Strengths                                                                                             | Critical Gaps                                                                                                                                                                                                                 | AI-Driven Personalized Learning Roadmap Generator And Tutor Innovation                                                                                                                                                             |
| :---------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Khan Academy                              | High-quality, sequenced content; evidence-based pedagogy; free; mastery-based progression for some topics | Passive sequencing for most courses; no multi-path options; no assessment-driven resource adaptation; no decay-aware reminders; limited domain coverage (focuses on K-12, math, science)                                      | Assessment-driven Gatekeeper Pattern; Mastery Decay with spaced repetition; Multi-Path Branching; resource adaptation triggered by failure modes                                                                         |
| roadmap.sh                                | Tech-focused, community-curated, visual; free; reflects real developer workflows                          | Purely static/linear sequencing; no adaptive response to learner performance; no quizzes or assessment gates; no resource verification; no personalization                                                                    | Ontology-guided sequencing; Gatekeeper Pattern enforcing mastery; adaptive resource curation; Multi-Path Branching                                                                                                       |
| Coursera/Udemy                            | Diverse content; large scale; structured courses with deadlines                                           | High hallucination in recommendations; lacks rigorous, verifiable knowledge graph; 70%+ dropout rates; no decay-aware retention mechanics; expensive; not adapted to resource-constrained contexts                            | Skeleton & Flesh hybrid architecture (verified ontology \+ LLM); Gatekeeper Pattern reducing dropout; Mastery Decay addressing retention; free/low-cost positioning for Ethiopian learners                               |
| Anki / Spaced Repetition Tools            | Powerful spaced repetition proven effective at scale; flexible to any domain                              | Standalone, not integrated into curriculum; no semantic sequencing of prerequisites; no visual roadmap; requires learner self-discipline; no adaptive modality                                                                | Decay-aware roadmap UI; spaced repetition integrated into curriculum progression; Gatekeeper quizzes enforced, not optional; visualizes forgetting dynamically                                                           |
| Pure LLM Tutoring (ChatGPT, Claude)       | Flexible, natural dialogue; fast; scales to any domain instantly; no initial content creation overhead    | Hallucination (generates confident but false information); no curriculum coherence (no prerequisites enforced); no persistence (each conversation is isolated); no learning path validation; user must discover what to learn | Skeleton & Flesh hybrid: LLM generates only within verified ontology bounds; prevents hallucination while retaining flexibility; persistent learner state and roadmap visibility; expert-verified prerequisite structure |
| Proprietary ITS (Cognitive Tutors, ALEKS) | Proven learning gains; sophisticated student modeling; pedagogically sound                                | High cost; limited domain coverage; long development time per domain; closed-source; not available in resource-constrained regions                                                                                            | Hybrid architecture reduces development cost; open-source philosophy; adaptable to Ethiopian context; lower barrier to extending to new domains                                                                          |

##

## **2.8 Lessons Learned, Research Principles, and AI-Driven Personalized Learning Roadmap Generator And Tutor 's Innovation Synthesis** {#2.8-lessons-learned,-research-principles,-and-ai-driven-personalized-learning-roadmap-generator-'s-innovation-synthesis}

From this comprehensive literature synthesis, three overarching lessons emerge, each directly informing AI-Driven Personalized Learning Roadmap Generator And Tutor 's design:

Lesson 1: Ontology-Guided LLM (RAG Variant) Solves Hallucination While Maintaining Scalability

Traditional ITS faced a scaling problem: knowledge engineering bottleneck. LLMs solved the scaling problem but introduced hallucination. AI-Driven Personalized Learning Roadmap Generator And Tutor 's Skeleton & Flesh strategy operationalizes a variant of Retrieval-Augmented Generation specifically for curriculum design: the skeleton (verified ontology) constrains what the flesh (runtime LLM) can generate, preventing hallucination while maintaining the scalability and flexibility of LLM-based tutoring. This bridges decades of ITS research with modern AI capabilities.

Lesson 2: Assessment-Driven Progression, Extended to Resource Adaptation, Addresses the "Knowing How to Teach" Gap

Bloom's mastery principle established that progress should be contingent on demonstrated competence. However, Bloom did not specify _how_ to teach when a learner fails. AI-Driven Personalized Learning Roadmap Generator And Tutor 's Gatekeeper Pattern operationalizes mastery-based progression with three tiers of remediation (resource modality swapping, prerequisite review, instructor escalation), grounded in cognitive load theory and multimedia learning theory. This transforms assessment from a summative evaluation tool (pass/fail) into a diagnostic, adaptive tool that informs instructional design in real-time.

Lesson 3: Decay-Aware Adaptation Transforms Spaced Repetition from Learner-Managed to System-Guided

Ebbinghaus and modern spacing research established that forgetting is predictable and remediable through strategic review. However, spaced repetition tools (Anki) remain learner-managed: learners must remember to review, consistently use the tool, and self-select review intervals. AI-Driven Personalized Learning Roadmap Generator And Tutor integrates decay directly into the roadmap UI and progression model, making forgetting visible and triggering system-level reminders. This addresses a real failure mode of self-directed learning: skill decay and knowledge gaps that accumulate invisibly until they cause failures in advanced topics.

AI-Driven Personalized Learning Roadmap Generator And Tutor 's novelty lies not in inventing fundamentally new components but in thoughtfully integrating proven principles ontology-guided RAG, assessment-driven progression grounded in mastery learning, spaced repetition informed by Ebbinghaus and modern cognitive science, multi-path learning respecting learner agency, and scalable resource curation via domain whitelisting into a cohesive, context-aware system optimized for Ethiopian learners and resource-constrained environments.

Specifically, AI-Driven Personalized Learning Roadmap Generator And Tutor addresses the distinct challenge of tutorial hell and resource fragmentation endemic to self-directed learning in regions with limited mentorship infrastructure. By combining structured, verified curricula (the ontology) with adaptive, intelligent tutoring (the Tutor Model), the system approximates the benefits of one-on-one mentorship (Bloom's two-sigma finding) at scale and low cost, making high-quality technical education accessible to Ethiopian students, engineers, and professionals.

## **Chapter 3: Problem Analysis and Modeling** {#chapter-3:-problem-analysis-and-modeling}

Chapter 3 bridges the problem landscape articulated in Chapter 1 and the research foundations established in Chapter 2 with concrete system specifications and models. This chapter presents a detailed analysis of requirements, functional and non-functional specifications, and comprehensive system models (use cases, UML class diagrams, sequence diagrams, activity diagrams, state machines, entity-relationship diagrams, and user interface wireframes) that collectively define what AI-Driven Personalized Learning Roadmap Generator And Tutor must achieve and how its components interact.

The modeling approach follows standard software engineering practices , ensuring that requirements are comprehensive, testable, and verifiable. Models serve dual purposes: (1) communicating system intent to stakeholders and team members, and (2) providing a blueprint for implementation in Chapter 5\.

**3.1** **Existing System and Its Problems**

The current landscape of self-directed learning systems, particularly for technical skill acquisition in resource-constrained environments like Ethiopia, is dominated by a mix of free online resources, static roadmaps, MOOCs, spaced repetition tools, and emerging LLM-based tutors. Platforms such as Khan Academy, roadmap.sh, Coursera/Udemy, Anki, and pure LLM tutoring (e.g., ChatGPT, Claude) represent the primary existing systems. While these have democratized access to knowledge, they exhibit systemic limitations rooted in design philosophies that prioritize scalability and content volume over personalization, retention, and adaptive feedback. This section provides a detailed examination of these systems, identifying their limitations, underlying causes, affected stakeholders, and impacts. It employs analytical tools such as competitive analysis, stakeholder interviews, learner surveys, and gap mapping (via tabular synthesis) to dissect the problem's complexity.

#### **Overview of Existing Systems**

Existing systems can be categorized into three broad types based on their approach to content delivery and learner support:

1. **Curated Content Platforms (e.g., Khan Academy, Coursera/Udemy)**: These provide structured courses with videos, quizzes, and sequenced modules, often backed by expert curation.
2. **Static Roadmap Tools (e.g., roadmap.sh)**: Community-driven visual guides outlining linear learning paths for tech domains, focusing on real-world workflows.
3. **Retention and AI Tools (e.g., Anki for spaced repetition, ChatGPT/Claude for on-demand tutoring)**: These emphasize memory reinforcement or instant query resolution without a holistic curriculum structure.

These systems leverage free resources like YouTube tutorials, blog posts (e.g., GeeksForGeeks), and documentation (e.g., MDN Web Docs), but their aggregation and delivery mechanisms often exacerbate fragmentation rather than resolve it.

#### **Limitations and Underlying Causes**

The limitations stem from architectural, pedagogical, and economic constraints, leading to inefficiencies in learner progression and retention. Key shortcomings include:

1. **Fragmentation and Lack of Coherent Structure (Tutorial Hell Phenomenon)** Underlying Cause: Most systems rely on passive, non-sequenced content delivery. For instance, YouTube recommendations and roadmap.sh provide disjointed resources without enforcing prerequisites or logical progression. This is caused by algorithmic biases favoring engagement metrics (views, clicks) over pedagogical soundness, as seen in YouTube's recommendation engine. Critical Analysis: Cognitive load theory (Sweller, 1988\) explains how unstructured information overwhelms working memory, leading to reduced retention. In competitive analysis, 92% of surveyed learners reported difficulty finding coherent paths, highlighting how ad-hoc navigation creates knowledge gaps (e.g., jumping from HTML to React without JavaScript fundamentals). Analytical Tools Used: Learner surveys (n=30) and focus groups dissected this via pain-point mapping, revealing a cycle of trial-and-error that wastes effort.
2. **Absence of Adaptive Feedback and Personalization** Underlying Cause: Platforms like Khan Academy and Coursera use fixed sequences without runtime adaptation to learner performance or preferences (e.g., visual vs. logical styles). Pure LLM tutors hallucinate responses due to unverified knowledge bases, while Anki requires manual card creation. Economic factors—prioritizing broad scalability over individualized AI logic—exacerbate this. Critical Analysis: Educational psychology research (e.g., Deci & Ryan's self-determination theory) shows that lack of agency reduces motivation. Surveys indicated 85% of learners face insufficient feedback, leading to false mastery (e.g., marking topics "complete" without competence verification). This results in high dropout rates (70%+ on Coursera). Analytical Tools Used: Semi-structured interviews with domain experts (n=5) and gap analysis tables identified how static designs fail to address multi-path branching or resource modality swapping.
3. **No Mastery-Based Progression Gates and Retention Mechanisms** Underlying Cause: Systems like roadmap.sh lack quizzes or gates, relying on self-assessment, while Anki isolates repetition from curriculum context. Ebbinghaus's Forgetting Curve is ignored, causing skill decay over time (e.g., 78% of learners forget concepts after 14 days without review). Proprietary ITS (e.g., ALEKS) gate progression but are closed-source and costly to develop. Critical Analysis: Mastery learning principles (Bloom, 1968\) advocate competence-based gates, yet existing tools lead to downstream failures (e.g., struggling in advanced topics due to unaddressed gaps). In resource-constrained contexts, this amplifies economic barriers, as learners cannot afford premium alternatives. Analytical Tools Used: Competitive gap mapping (Table 2.1 below) and temporal analysis of learner progress tracked decay patterns.
4. **Quality Variability and Resource Overload** Underlying Cause: Algorithmic curation (e.g., LinkedIn Learning) prioritizes popularity over accuracy, leading to unreliable content. Manual curation (Khan Academy) is resource-intensive, limiting coverage to established domains. Critical Analysis: This creates cognitive overload, as learners sift through mixed-quality sources, reducing efficiency. Focus groups revealed biases toward "entertainment-oriented" content, misaligning with deep learning needs. Analytical Tools Used: Domain whitelisting simulations and NLP-based content validation prototypes dissected quality signals.

#### **Stakeholders and Impacts**

- **Primary Stakeholders: Learners (Ethiopian Students, Junior Developers, Career-Changers)** Impacts: Frustration from "tutorial hell" leads to demotivation, skill gaps, and delayed career progression. In Ethiopia, where premium mentorship is prohibitive, this perpetuates economic inequality—learners waste time (e.g., 85% report inefficient paths), experience high dropout, and face retention decay, hindering employability in tech sectors.
- **Secondary Stakeholders: Educators and Institutions (e.g., AASTU Faculty)** Impacts: Overburdened with remedial teaching due to self-directed gaps; limited tools for integrating adaptive systems into curricula, reducing institutional efficacy.
- **Tertiary Stakeholders: Content Providers and Communities (e.g., FreeCodeCamp, Reddit)** Impacts: Underutilized high-quality resources due to discovery barriers; community biases amplify unreliable content, eroding trust.

Overall, these limitations create a vicious cycle: fragmentation increases cognitive load, lack of feedback fosters false confidence, and decay causes repeated failures, impacting motivation and long-term skill acquisition. In developing economies, this widens the digital divide, as learners cannot compete with those in resource-rich environments.

#### **Utilization of Analytical Tools and Techniques**

To understand complexity, we employed:

- **Stakeholder Engagement**: Interviews and surveys quantified pain points (e.g., 78% skill decay rate).
- **Competitive Gap Analysis**: Synthesized via Table 2.1, mapping strengths/gaps against our innovations.
- **Cognitive and Pedagogical Frameworks**: Applied theories (e.g., Forgetting Curve, Mastery Learning) to model impacts.
- **Prototyping and Simulation**: Early wireframes and decay algorithms validated assumptions.

## **3.2 Requirements Elicitation and Specification** {#3.2-requirements-elicitation-and-specification}

Elicitation Methodology

Requirements were gathered through multi-stakeholder engagement:

1\. Domain Expert Interviews

Semi-structured interviews with five software engineering educators, industry practitioners, and experienced self-taught engineers were conducted to understand learning challenges, effective pedagogical strategies, and domain-specific sequencing principles. Key insights: learners struggle with unstructured, non-sequential content; assessment-driven progression increases motivation; resource modality (documentation vs. tutorial) significantly affects learning outcomes.

2\. Learner Surveys and Feedback Sessions

An online survey (30 respondents: Ethiopian students, junior developers, career-changers) identified pain points: tutorial fragmentation (92% reported difficulty finding coherent learning paths), lack of feedback (85% noted insufficient guidance on mastery), skill decay (78% forgot concepts after weeks of non-practice). Focus group discussions (two sessions, 15 participants) validated proposed solutions and identified usability priorities.

3\. Competitive Analysis

Analysis of existing platforms (Khan Academy, roadmap.sh, Coursera, Anki, ChatGPT tutoring) identified gaps and best practices, informing feature prioritization and differentiation.

Functional Requirements

Functional requirements specify _what_ the system must do. They are organized by use case and subsystem:

FR1: Ontology Management

- FR1.1: The system shall generate a learning ontology (DAG of learning nodes) for a given domain using the Teacher Model (offline LLM), producing a JSON structure with node identifiers, learning outcomes, prerequisites, and estimated effort.
- FR1.2: The system shall support expert verification workflows, enabling domain experts to review generated ontologies, flag errors, and approve for production deployment.
- FR1.3: The system shall persist and version ontologies, maintaining a history of changes and enabling rollback if necessary.

FR2: Learner Management

- FR2.1: The system shall enable user registration (email, social login via Google/GitHub) and profile creation.
- FR2.2: The system shall track learner progress, including node completion status, quiz scores, attempts, and timestamps.
- FR2.3: The system shall compute and display learner statistics (total nodes completed, average quiz score, time spent, learning pace).

FR3: Quiz Generation and Delivery

- FR3.1: The system shall generate domain-specific quizzes using the Tutor Model (runtime LLM), producing 3-5 questions per node, grounded in the node's learning outcomes.
- FR3.2: The system shall support multiple question types: multiple-choice, short-answer, code-completion, true-false, matching.
- FR3.3: The system shall evaluate quiz responses, compute scores, and provide immediate feedback on correctness.
- FR3.4: The system shall generate micro-quizzes (2-3 questions) triggered by Mastery Decay transitions (Section 3.3.4.2).

FR4: Gatekeeper Pattern Implementation

- FR4.1: The system shall enforce three-tier progression logic (Pass ≥80% → unlock next node; Marginal Pass 70-79% → unlock but flag for review; Fail \<70% → lock and trigger remediation).
- FR4.2: The system shall validate prerequisites before unlocking nodes, preventing progression if prerequisites are not mastered.
- FR4.3: Upon Pass (≥80%), the system shall recommend a challenge project relevant to the node's outcomes.
- FR4.4: Upon Fail (\<70%), the system shall trigger resource adaptation or prerequisite review based on failure severity.

FR5: Resource Recommendation and Curation

- FR5.1: The system shall integrate the Google Programmable Search Engine (PSE) API to fetch resource links from pre-approved whitelisted domains.
- FR5.2: The system shall validate recommended links via automated checks (HTTP status, content freshness, relevance).
- FR5.3: The system shall support learner feedback on resource quality (rating, comments) and use ratings to inform future recommendations.
- FR5.4: Upon resource adaptation (triggered by Gatekeeper Fail), the system shall recommend alternative resources with different modalities (e.g., swap documentation for tutorial).

FR6: Mastery Decay and Spaced Repetition

- FR6.1: The system shall track the time since a node was last reviewed and compute decay state (Green ≤14 days, Yellow 14-30 days, Red \>30 days).
- FR6.2: Upon transition to Yellow or Red, the system shall automatically generate and present a micro-quiz to the learner.
- FR6.3: The system shall visualize decay states in the learner's roadmap (color-coded nodes).
- FR6.4: The system shall send notifications (in-app or email) alerting learners to nodes requiring review.

FR7: Multi-Path Branching

- FR7.1: The system shall identify branching points in the ontology where learners can choose alternative paths (e.g., "Frontend vs. Backend").
- FR7.2: Upon reaching a branching point, the system shall present a choice question and path recommendations.
- FR7.3: After learner selection, the system shall dynamically adjust the roadmap to display the selected path and its prerequisites.
- FR7.4: The system shall ensure paths reconverge at advanced nodes, maintaining semantic coherence.

FR8: User Interfaces

- FR8.1: The web interface (React) shall display the ontology as an interactive DAG visualization with zoom, pan, and filtering capabilities.
- FR8.2: The web interface shall include quiz delivery UI, progress dashboard, resource panel, and learner settings.
- FR8.3: The mobile interface (Flutter) shall provide touch-optimized navigation, offline support (cached roadmap data), and push notifications.
- FR8.4: Both interfaces shall be responsive, adapting to different screen sizes (mobile, tablet, desktop).

Non-Functional Requirements

Non-functional requirements specify quality attributes and constraints:

NFR1: Performance

- NFR1.1: Page load time for roadmap visualization shall not exceed 2 seconds on typical internet connections (\>5 Mbps).
- NFR1.2: API response time for quiz delivery and scoring shall not exceed 500 milliseconds (p95).
- NFR1.3: LLM-based quiz generation shall complete within 3 seconds of user request, leveraging caching to accelerate repeated requests.

NFR2: Scalability

- NFR2.1: The system shall support 1,000 concurrent users without degradation in performance (load testing baseline).
- NFR2.2: Database and cache layers shall scale horizontally (read replicas, sharding) to support 10,000+ daily active users.
- NFR2.3: The system shall support efficient multi-tenancy (future feature), enabling independent deployments per institution or community.

NFR3: Availability and Reliability

- NFR3.1: System uptime shall be ≥99.5% (measured monthly).
- NFR3.2: Critical data (learner progress, quiz responses) shall be backed up daily, with recovery capability within 4 hours.
- NFR3.3: The system shall implement graceful degradation: if LLM API is unavailable, fallback to pre-generated quizzes and explanations.

NFR4: Security

- NFR4.1: User authentication shall use JWT tokens with secure token storage (httpOnly cookies).
- NFR4.2: Sensitive data (user profiles, quiz responses) shall be encrypted in transit (HTTPS) and at rest (database encryption).
- NFR4.3: The system shall implement role-based access control (RBAC): learner, instructor, admin, system administrator roles with distinct permissions.
- NFR4.4: The system shall sanitize user inputs and API responses to prevent SQL injection and XSS attacks.
- NFR4.5: Learner data shall be treated as confidential; no personal data shall be shared with third-party services without explicit consent.

NFR5: Usability

- NFR5.1: Learners shall complete onboarding (account creation, path selection) in \<5 minutes.
- NFR5.2: Quiz interface shall be intuitive, with clear instructions and immediate feedback.
- NFR5.3: Roadmap visualization shall be interpretable by non-technical learners, with intuitive legend and help tooltips.
- NFR5.4: System error messages shall be clear and actionable, guiding learners toward resolution.

NFR6: Maintainability and Extensibility

- NFR6.1: Code shall follow established standards (JavaScript/TypeScript style guides, REST API conventions) and include comprehensive documentation.
- NFR6.2: The system architecture shall enable addition of new domains without redesigning core components.
- NFR6.3: API endpoints shall be versioned (v1, v2) to support backward compatibility during upgrades.

NFR7: Localization and Cultural Adaptation

- NFR7.1: The UI shall support Amharic, English, and Oromo languages initially, with extensibility to other Ethiopian languages.
- NFR7.2: Content and examples shall reflect Ethiopian context (e.g., local tech companies, Ethiopian learner profiles, culturally appropriate imagery).
- NFR7.3: The system shall work reliably on low-bandwidth networks (\<2 Mbps), common in rural Ethiopia.

---

## **3.3 System Models and Design Artifacts** {#3.3-system-models-and-design-artifacts}

3.3.1 Use Case Model

Use cases capture interactions between actors (users) and the system. The following table defines primary use cases:

Table 3.1: Defines primary use cases

| Use Case                                | Primary Actor        | Preconditions                                      | Main Flow                                                                                                                                                                                                    | Postconditions                                       |
| :-------------------------------------- | :------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| UC1: Browse Roadmap                     | Learner              | Learner logged in; ontology loaded                 | 1\. System displays DAG visualization 2\. Learner explores nodes, clicks to view details 3\. System shows node description, learning outcomes, prerequisites                                                 | Learner understands learning path and requirements   |
| UC2: Attempt Quiz                       | Learner              | Node unlocked; learner selected "Take Quiz"        | 1\. System generates quiz (3-5 questions) 2\. Learner answers questions 3\. System evaluates responses, computes score                                                                                       | Quiz score recorded; Gatekeeper logic triggered      |
| UC3: Receive Resource Recommendation    | Learner              | Quiz failed (\<70%); resource adaptation triggered | 1\. System identifies adapted resources (e.g., tutorial links) 2\. System presents 3-5 resource links with descriptions 3\. Learner selects resources to view                                                | Learner accesses alternative learning materials      |
| UC4: Receive Spaced Repetition Reminder | Learner              | Node in Yellow or Red decay state                  | 1\. System generates micro-quiz notification 2\. The system presents micro-quiz (2-3 questions) 3\. Learner attempts; system scores                                                                          | Decay state updated; learner re-engages with content |
| UC5: Select Learning Path               | Learner              | Reached branching point in ontology                | 1\. The system presents choice questions and path descriptions 2\. Learner selects preferred path 3\. System updates roadmap with selected path nodes                                                        | Roadmap personalized to learner choice               |
| UC6: Verify Ontology                    | Domain Expert        | Ontology generated by Teacher Model                | 1\. Expert reviews nodes, prerequisites, learning outcomes 2\. Experts mark nodes as correct or flags for revision 3\. System aggregates feedback; expert confirms final version                             | Verified ontology deployed to production             |
| UC7: Manage Domain Whitelist            | Admin/Domain Curator | Need to update trusted content providers           | 1\. Curator views current whitelist (e.g., GeeksForGeeks, MDN) 2\. Curator adds/removes domains based on quality assessment 3\. System applies whitelist to PSE API queries                                  | Resource discovery restricted to approved domains    |
| UC8: View Progress Dashboard            | Learner              | Learner logged in                                  | 1\. System displays learner statistics (nodes completed, average quiz score, time spent) 2\. System shows decay state visualization (Green/Yellow/Red nodes) 3\. Learner can filter by domain or time period | Learner gains visibility into learning progress      |

**3.3.2 Functional Requirements Traceability**

The following table maps use cases to functional requirements, ensuring comprehensive coverage:

Table 3.2: Use cases to functional requirements, ensuring comprehensive coverage

| Use Case                                | Functional Requirements           |
| :-------------------------------------- | :-------------------------------- |
| UC1: Browse Roadmap                     | FR1.1, FR1.3, FR8.1               |
| UC2: Attempt Quiz                       | FR3.1, FR3.2, FR3.3, FR4.1, FR4.2 |
| UC3: Receive Resource Recommendation    | FR5.1, FR5.2, FR5.4, FR4.4        |
| UC4: Receive Spaced Repetition Reminder | FR6.1, FR6.2, FR6.3, FR6.4        |
| UC5: Select Learning Path               | FR7.1, FR7.2, FR7.3, FR7.4        |
| UC6: Verify Ontology                    | FR1.2, FR1.3                      |
| UC7: Manage Domain Whitelist            | FR5.1                             |
| UC8: View Progress Dashboard            | FR2.3, FR6.3                      |

##

## **3.4 UML Class Diagram** {#3.4-uml-class-diagram}

![][image3]Figure 3.1: UML Class Diagram

## **3.5 Sequence Diagrams** {#3.5-sequence-diagrams}

3.5.1 Quiz Attempt and Gatekeeper Flow

![][image4]

Figure 3.2: Quiz Attempt and Gatekeeper Flow

3.5.2 Mastery Decay and Spaced Repetition Trigger

![][image5]

Figure 3.3: Mastery Decay and Spaced Repetition Trigger

**3.5.3 Multi-Path Branching Selection**

![][image6]

Figure 3.4: Multi-Path Branching Selection

## **3.6 Activity Diagrams** {#3.6-activity-diagrams}

3.6.1 Learner Progression Activity Flow

![][image7]

Figure 3.5: Learner Progression Activity Flow

3.6.2 Gatekeeper Decision Activity

![][image8]

## Figure 3.6: Gatekeeper Decision Activity

##

## **3.7 State Machine Diagram** {#3.7-state-machine-diagram}

3.7.1 Node Mastery State Machine

# ![][image9]

# Figure 3.7: Node Mastery State Machine

## **3.8 Validation and Verification Strategy** {#3.8-validation-and-verification-strategy}

Requirements are validated through:

1\. Requirements Review with Stakeholders

Domain experts, learners, and team members review requirements specifications, ensuring completeness and feasibility.

2\. Traceability Analysis

Functional requirements are traced to use cases, and use cases are traced back to problems (Chapter 1\) and research foundations (Chapter 2), ensuring all requirements are justified.

3\. Testability Assessment

Each requirement is reviewed for testability: is there a measurable criterion for success? Non-testable requirements are refined. For example, "Quiz interface shall be intuitive" is too vague; it is refined to "Quiz interface shall support task completion by 95% of users within 2 minutes on first attempt" (testable).

4\. Feasibility and Risk Analysis

Requirements are assessed for technical feasibility within scope and budget. High-risk requirements (e.g., real-time LLM generation under load) are flagged and mitigation strategies identified (caching, fallbacks, pre-generation).

#

# REFERENCES {#references}

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. _Cognitive Science_, 12(2), 257–285.

Hattie, J., & Timperley, H. (2007). The power of feedback. _Review of Educational Research_, 77(1), 81–112.

Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. _Educational Researcher_, 13(6), 4–16.

(see the generated image above) Ebbinghaus, H. (1885). _Memory: A contribution to experimental psychology_. Columbia University Press.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. _American Psychologist_, 55(1), 68–78.

Marcus, G., & Davis, E. (2020). Commonsense reasoning for natural language processing. _arXiv preprint arXiv:1909.07143_.

VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. _Educational Psychology Review_, 23(3), 309–342.

Lewis, P., Perez, E., Piktus, A., Schwenk, H., Schwab, D., Kiela, D., & Riedel, S. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. _Advances in Neural Information Processing Systems_, 33, 9459–9474.

Gruber, T. R. (1995). Toward principles for the design of ontologies used for knowledge sharing. _International Journal of Human-Computer Studies_, 43(5–6), 907–928.

Gagne, R. M. (1985). _The conditions of learning and theory of instruction_ (4th ed.). Holt, Rinehart & Winston.

Mayer, R. E. (2009). _Multimedia learning_ (2nd ed.). Cambridge University Press.

Brusilovsky, P. (2001). Adaptive hypermedia. _User Modeling and User-Adapted Interaction_, 11(1), 87–110.

Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. _Psychological Science in the Public Interest_, 9(3), 105–119.

Clark, R. C., & Mayer, R. E. (2016). _E-learning and the science of instruction: Proven guidelines for consumers and designers of multimedia learning_ (4th ed.). John Wiley & Sons.

Vandewaetere, M., Desmet, P., & Clarebout, G. (2011). Adaptive learning environments and learner modeling: Current research and future prospects. _Journal of Educational Technology & Society_, 14(4), 172–185.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. _Psychological Bulletin_, 132(3), 354–380.

Karpentier, G., & Salehi, R. (2021). Access to quality education in sub-Saharan Africa: Barriers and opportunities. _Journal of Education in Developing Areas_, 15(2), 45–67.

UNESCO. (2020). _Global education monitoring report: Inclusion and education_. UNESCO Publishing.

World Bank. (2019). _Skills and employment in Ethiopia: Current status and future prospects_. World Bank Regional Office.

Oucho, J. O. (2017). Migration and human capital in Africa. _Adonis & Abbey Publishers Ltd_.

Weller, M. (2011). _The digital scholar: How technology is transforming scholarly practice_. Bloomsbury Academic.

Siemens, G., & Long, P. (2011). Penetrating the fog: Analytics in learning and education. _EDUCAUSE Review_, 46(5), 30–40.

Carroll, M. D., Roman, B., & Sinha, P. (2017). A practical approach to curation in digital libraries. _Information Technology and Libraries_, 36(1), 29–42.

Liyanagunawardena, T. R., Williams, S. A., & Adams, A. A. (2013). The impact and reach of open access peer-reviewed research from a predominantly teaching institution. _Open Learning_, 28(3), 220–235.

Anderson, J. R., Corbett, A. T., Koedinger, K. R., & Pelletier, R. (1995). Cognitive tutors: Lessons learned. _The Journal of the Learning Sciences_, 4(2), 167–207.

Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. _Educational Researcher_, 13(6), 4–16.

Brusilovsky, P. (2001). Adaptive hypermedia. _User Modeling and User-Adapted Interaction_, 11(1), 87–110.

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. _Psychological Bulletin_, 132(3), 354–380.

Clark, R. C., & Mayer, R. E. (2016). _E-learning and the science of instruction: Proven guidelines for consumers and designers of multimedia learning_ (4th ed.). John Wiley & Sons.

Deci, E. L., & Ryan, R. M. (1985). _Intrinsic motivation and self-determination in human behavior_. Plenum Press.

Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. _Psychological Science in the Public Interest_, 14(1), 4–58.

Dweck, C. S. (2006). _Mindset: The new psychology of success_. Random House.

Ebbinghaus, H. (1885). _Memory: A contribution to experimental psychology_ (H. A. Ruger & C. E. Bussenius, Trans.). Columbia University Press.

Gruber, T. R. (1995). Toward principles for the design of ontologies used for knowledge sharing. _International Journal of Human-Computer Studies_, 43(5–6), 907–928.

Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval practice for learning. _Psychological Review_, 115(1), 213–243.

Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the "enemy of induction"? _Psychological Science_, 19(6), 585–592.

Kulik, C. L. C., & Kulik, J. A. (1991). Effectiveness of computer-based instruction: An updated analysis. _Computers in Human Behavior_, 7(1), 75–94.

Lewis, P., Perez, E., Piktus, A., Schwenk, H., Schwab, D., Kiela, D., & Riedel, S. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. _Advances in Neural Information Processing Systems_, 33, 9459–9474.

Marcus, G., & Davis, E. (2020). Commonsense reasoning for natural language processing. _arXiv preprint arXiv:1909.07143_.

Mayer, R. E. (2009). _Multimedia learning_ (2nd ed.). Cambridge University Press.

Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. _Psychological Science in the Public Interest_, 9(3), 105–119.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. _American Psychologist_, 55(1), 68–78.

Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. _Cognitive Science_, 12(2), 257–285.

van der Linden, W. J., & Glas, C. A. (Eds.). (2010). _Elements of adaptive testing_. Springer.

VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. _Educational Psychology Review_, 23(3), 309–342.

Weidinger, L., Mellor, J., Rauh, M., Griffin, C., Uesato, J., Huang, P.-S., ... & Gabriel, I. (2021). _Ethical and social risks of harm from language models_. arXiv preprint arXiv:2112.04359.

Woolf, B. P. (2009). _Building intelligent interactive tutors: Student-centered strategies for smart e-learning_. Morgan Kaufmann.

IEEE. (1998). _IEEE Recommended Practice for Software Requirements Specifications_ (IEEE Std 830-1998). IEEE Computer Society.

Kvale, S., & Brinkmann, S. (2009). _InterViews: Learning the craft of qualitative research interviewing_ (2nd ed.). Sage Publications.

Creswell, J. W. (2014). _Research design: Qualitative, quantitative, and mixed methods approaches_ (4th ed.). Sage Publications.

Porter, M. E. (2008). _Competitive strategy: Techniques for analyzing industries and competitors_. Free Press.

Sommerville, I. (2015). _Software engineering_ (10th ed.). Pearson.

Bass, L., Clements, P., & Kazman, R. (2012). _Software architecture in practice_ (3rd ed.). Addison-Wesley Professional.

Leffingwell, D., & Widrig, D. (2003). _Managing software requirements: A use case approach_ (2nd ed.). Addison-Wesley Professional.
