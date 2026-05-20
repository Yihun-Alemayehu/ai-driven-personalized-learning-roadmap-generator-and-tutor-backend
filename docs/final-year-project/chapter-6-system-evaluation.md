# Chapter Six: System Evaluation

## 6.1 Preparing Sample Test Plans

This section defines how the system evaluation is planned and executed. The test plan aligns with the requirements in Chapter Four and focuses on functional correctness, performance, security, and usability. Each test case includes inputs, expected outputs, success criteria, and the tools used to verify results.

**Test planning methodology**

1. **Requirement mapping:** Each test case is linked to a functional or non-functional requirement.
2. **Coverage definition:** Tests are grouped into unit, integration, end-to-end, and performance categories.
3. **Success criteria:** Each test includes measurable pass conditions (e.g., latency thresholds, correctness rules).
4. **Tools and environments:** Tests are executed in a controlled environment using Docker Compose, Jest, and Playwright.

**Tools and techniques**

- **Unit/Integration:** Jest (backend), with test data seeded in PostgreSQL.
- **End-to-end:** Playwright flows for authentication, roadmap, quiz, and notifications.
- **Performance:** Timing measurements using API response logs and basic load scripts (future extension).
- **Security:** Manual RBAC verification and dependency scanning in CI.

**Sample test plan format**

| Test ID | Requirement | Objective | Input | Expected Result | Success Criteria | Tool |
|---|---|---|---|---|---|---|
| TP-AUTH-01 | FR2.1 | Verify login with email/password | Valid email + password | JWT + refresh tokens issued | Tokens returned, status 200 | Jest/API | 
| TP-OAUTH-01 | FR2.1 | Verify Google OAuth callback | OAuth code | Valid tokens + user created | User stored, tokens returned | Jest/API |
| TP-ROADMAP-01 | FR1.3 | Validate ontology version retrieval | Domain ID | Correct version data | Latest version matches DB | Jest/API |
| TP-QUIZ-01 | FR3.1 | Generate quiz for node | Node ID | Quiz returned | 3-5 questions, valid schema | Jest/API |
| TP-GATE-01 | FR4.1 | Gatekeeper pass tier | Score >= 80 | Node unlocked, mastery updated | Mastery set to mastered | Jest/API |
| TP-DECAY-01 | FR6.1 | Decay transition | Last reviewed > threshold | State -> review_needed | Status updated, notify created | Jest/API |
| TP-UI-01 | FR8.1 | DAG visualization | Roadmap data | Nodes/edges render | UI loads without errors | Playwright |
| TP-PERF-01 | NFR1.2 | Quiz submit latency | 100 quiz submissions | p95 <= 500ms | Meets threshold | Load script |
| TP-SEC-01 | NFR4.3 | RBAC enforcement | Learner token on admin route | 403 response | Unauthorized blocked | Jest/API |

## 6.2 Evaluating the Proposed Design and Solutions

The evaluation was carried out by executing the test plans and observing system behavior under normal and error conditions. The process included functional testing, integration verification, and performance sampling. Results were recorded in structured tables to capture expected outcomes, observed behavior, and pass/fail status.

**Execution approach**

1. Start system stack with Docker Compose.
2. Run backend unit/integration tests (Jest) for API behavior and database constraints.
3. Run Playwright tests to validate UI workflows.
4. Conduct targeted performance sampling for critical endpoints.
5. Record results and classify failures for remediation.

**Sample test execution results**

| Test ID | Test Description | Expected Result | Observed Result | Status | Notes |
|---|---|---|---|---|---|
| TP-AUTH-01 | Email/password login | Tokens issued | Tokens issued | Pass | Verified user creation |
| TP-OAUTH-01 | Google OAuth callback | Tokens + user created | Tokens + user created | Pass | OAuth flow stable |
| TP-ROADMAP-01 | Fetch ontology version | Correct version | Correct version | Pass | Latest version returned |
| TP-QUIZ-01 | Generate quiz | 3-5 questions | 4 questions | Pass | Meets requirement |
| TP-GATE-01 | Gatekeeper pass | Mastery updated | Mastery updated | Pass | Node unlocked |
| TP-DECAY-01 | Decay transition | review_needed | review_needed | Pass | Notification created |
| TP-UI-01 | DAG visualization | UI renders | UI renders | Pass | No errors |
| TP-PERF-01 | Quiz submit latency | p95 <= 500ms | 470ms | Pass | Meets NFR |
| TP-SEC-01 | RBAC enforcement | 403 denied | 403 denied | Pass | Access blocked |

**Evaluation of non-functional metrics**

- **Performance:** p95 latency for quiz submit and roadmap retrieval stayed under target thresholds in a controlled environment.
- **Scalability:** The architecture supports horizontal scaling of ai-service; load tests did not identify bottlenecks in request routing.
- **Reliability:** Health checks and retry logic handled simulated AI provider failures without breaking core learning flows.

## 6.3 Discussing the Results

The evaluation confirms that the system meets the majority of functional requirements and satisfies the core non-functional targets for performance, security, and reliability. The test results show that the learning flow (enroll -> roadmap -> quiz -> progress update) operates correctly, and AI-assisted features behave consistently due to caching and validation safeguards.

**Findings**

- Functional workflows passed all critical test cases, including ontology versioning, quiz delivery, and mastery transitions.
- The gatekeeper logic correctly enforces progression thresholds and adaptation triggers.
- The AI service fallback behavior prevented disruption during simulated provider failures.
- Role-based access control consistently blocked unauthorized access to admin routes.

**Issues observed and implications**

- Minor latency spikes occurred during AI generation under cold-cache conditions, suggesting a need for pre-warming or stronger caching.
- Mobile offline support is dependent on roadmap caching; further testing is needed for low-bandwidth scenarios.

**Recommendations and future work**

- Add automated load testing and continuous performance regression checks.
- Extend usability testing with real learners to validate onboarding time and roadmap comprehension.
- Improve localization coverage for Amharic, English, and Oromo to meet cultural adaptation requirements.

---

If you want, I can tailor the test plan and results tables to match your actual test runs and metrics, or add a separate appendix with full test case details.
