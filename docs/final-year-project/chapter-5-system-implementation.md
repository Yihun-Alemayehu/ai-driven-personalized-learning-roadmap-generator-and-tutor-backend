# Chapter Five: System Implementation

## 5.1 Reviewing the Design Solution

The design solution was reviewed before implementation to confirm that it still aligns with the project objectives and remains practical given real-world constraints (performance, reliability, and maintainability). This review focused on verifying that each architectural decision supports the core learning workflow and that the system can evolve without costly redesign.

**Alignment with project objectives**

- **Personalized learning paths:** The ontology + progress model supports adaptive paths, mastery transitions, and branching without requiring monolithic logic. This aligns directly with the goal of personalized roadmaps.
- **Adaptive assessment:** The separation of quiz generation (ai-service) from quiz delivery (learning-service) ensures assessments can adapt while maintaining consistent delivery and scoring rules.
- **Resource discovery and adaptation:** The resource and adaptation subsystems align with the goal of providing targeted remediation and modality diversity.

**Architecture validity check**

- **Service separation remains justified:** The gateway isolates authentication and RBAC; the learning-service owns domain rules; the ai-service manages external AI dependencies. This avoids cross-cutting security and reliability risks.
- **Scalability assumptions hold:** AI workloads are isolated and can scale horizontally without affecting database-heavy learning flows.
- **Data integrity is preserved:** Prisma schema and constraints enforce the DAG structure, progress tracking, and versioning rules required by the ontology model (see `backend/services/learning-service/prisma/schema.prisma`).

**Design trade-offs revisited**

- **Microservices vs. monolith:** A monolith would reduce operational overhead but would couple AI latency and auth concerns to core learning logic. The current split avoids cascading failures and allows targeted scaling.
- **Relational database choice:** PostgreSQL provides strong consistency and relational constraints needed for prerequisite validation and mastery tracking. This is essential for correctness and auditability.
- **AI dependency management:** The design anticipates AI provider instability and includes circuit breakers and caching. This trade-off increases implementation complexity but improves availability.

**Implementation readiness**

- **Deployment model continuity:** The Docker Compose and Nginx routing match the deployment diagram, ensuring local development mirrors production patterns.
- **Tooling fit:** TypeScript + Express + Prisma align with the need for fast iteration, schema safety, and consistent API definitions.

**Design refinements confirmed during implementation**

- **Input validation tightened:** Validation and sanitization at the gateway were strengthened to enforce contracts and reduce security risks.
- **Caching depth increased:** AI response caching was expanded to reduce latency and improve throughput under load.
- **Error handling standardized:** Common error objects and response formats were enforced across services for consistent client behavior.

Overall, the design remains valid and aligned with the project objectives. The refinements above did not change the architecture but improved its operational robustness and implementation clarity.

## 5.2 Deciding on the Development Tools

The development toolchain was selected to balance rapid iteration, reliability, and long-term maintainability. The choices reflect the system's need for strong typing, modular services, a consistent API layer, and cross-platform client delivery.

### 5.2.1 Programming Languages

- **TypeScript:** Used across backend services and the web frontend to provide static typing, safer refactoring, and shared conventions across the codebase.
- **Dart:** Chosen for the mobile client to leverage Flutter's cross-platform UI toolkit and strong developer productivity.
- **SQL (via Prisma):** The relational model requires precise constraints and indexing; Prisma generates SQL migrations while keeping schema changes declarative.

### 5.2.2 Frameworks and Core Libraries

- **Backend (Node.js + Express):** Express provides lightweight routing and middleware, enabling clear separation of controllers, services, and validation layers.
- **ORM (Prisma):** Prisma ensures schema consistency, migration tracking, and type-safe queries across services.
- **Validation (Joi):** Input schemas enforce contract integrity and protect against malformed requests.
- **Logging (Pino):** Structured logging supports monitoring and audit trails.

### 5.2.3 AI and External Integration Tools

- **LLM Providers:** Phi-4-Multimodal (via Kaggle) is used as the primary provider; Qwen2.5-3B (via Ollama) and Gemini 2.5 Flash (API, last resort) serve as fallback tiers.
- **Circuit breaker and caching utilities:** Ensure resilience against AI provider latency and outages.
- **Search API:** Google Programmable Search Engine (PSE) enables resource discovery from pre-approved domains.

### 5.2.4 Frontend and Mobile Tooling

- **Frontend:** React + Vite provides fast builds and a modern component model. React Router manages page navigation.
- **Mobile:** Flutter provides a consistent UI across Android and iOS, with centralized state and theme control.

### 5.2.5 Testing and Quality Tooling

- **Jest:** Unit and integration tests for backend services.
- **Playwright:** End-to-end testing for full user journeys.
- **ESLint/Prettier:** Enforce consistent style and reduce code review friction.

### 5.2.6 Infrastructure and Runtime Tooling

- **Docker + Docker Compose:** Create consistent local environments and mirror production topology.
- **PostgreSQL:** Primary datastore for transactional integrity and query performance.
- **Redis:** Cache layer for AI responses and rate limiting.
- **Nginx:** Reverse proxy routing and request normalization.

### 5.2.7 Development Environment Setup

**Local environment requirements**

- Node.js 18 LTS or later with npm
- Docker and Docker Compose v2
- Flutter SDK 3.x (for mobile development)
- PostgreSQL 15 (optional if using Docker)
- Git for version control

**Installation and configuration**

The development environment is configured to mirror the production topology using Docker Compose. The following steps outline the setup process:

1. **Clone the repository:**
   ```
   git clone https://github.com/yegeta/ai-learning-roadmap.git
   cd ai-learning-roadmap
   ```

2. **Environment variables:**
   Copy `.env.example` to `.env` in each service directory and configure the following:
   ```
   # AI Service
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.5-flash
   PHI4_BASE_URL=  # Optional: URL to Phi-4 running on Kaggle
   OLLAMA_BASE_URL=http://host.docker.internal:11434
   OLLAMA_MODEL=qwen2.5:3b
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/learning_roadmap
   
   # Authentication
   JWT_SECRET=your-jwt-secret
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   GITHUB_CLIENT_ID=your-github-oauth-client-id
   GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
   ```

3. **Start the backend stack:**
   ```
   docker-compose up -d
   ```
   This starts PostgreSQL, Redis, Nginx, and all backend services.

4. **Run database migrations:**
   ```
   cd backend/services/learning-service
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start frontend development server:**
   ```
   cd frontend
   npm install
   npm run dev
   ```

6. **Start mobile development (Flutter):**
   ```
   cd flutter_mobile
   flutter pub get
   flutter run
   ```

**Secrets management**

- Environment variables are defined in `.env` files and injected via Docker Compose.
- OAuth keys and AI provider tokens are never stored in source code and are supplied at runtime.
- The `.env` files are excluded from version control via `.gitignore`.

**Version control and CI**

- Git is used for source control with feature branching (main, develop, feature/*, hotfix/*).
- GitHub Actions automates build, lint, and test workflows (see `.github/workflows/ci.yml`).
- Pull requests require passing CI checks and code review before merging.

### 5.2.8 Rationale Summary

The chosen stack provides strong typing, consistent APIs, scalable infrastructure, and cross-platform delivery. It also supports the project's non-functional goals by enabling test automation, reproducible environments, and resilience to external dependencies.

## 5.3 Developing the Solution

This section details how the system was implemented, the coding practices that guided development, integration strategies used across services and clients, and the most important functionality with representative code excerpts.

### 5.3.1 Coding Practices and Development Workflow

- **Layered service architecture:** Each backend service uses routes -> controller -> service -> data access, which keeps HTTP concerns separate from business logic.
- **Type safety:** Shared TypeScript types reduce runtime errors and make contracts explicit in both frontend and backend.
- **Validation at boundaries:** Requests are validated using schemas at the API boundary to avoid propagating invalid data.
- **Consistent error handling:** Errors are normalized using `ApiError` to produce predictable response formats and HTTP status codes.
- **Incremental delivery:** Features were implemented in phases (auth, ontology, enrollment, quizzes, decay, branching, admin). Each phase included tests and migrations.

### 5.3.2 Integration Strategy During Development

- **Service-to-service integration:** The learning-service calls ai-service via HTTP, and both share Redis for caching and rate limiting.
- **Client-to-service integration:** The web and mobile clients authenticate through the gateway and call the learning-service with Bearer tokens.
- **Contract testing:** Responses from ai-service are schema-validated before persistence, and OAuth flows are tested for reliability.

### 5.3.3 Major Functionality Code Excerpts

**Authentication and OAuth flow (api-gateway)**

The gateway handles registration, login, refresh tokens, and OAuth redirection.

Source: `backend/services/api-gateway/src/modules/auth/auth.controller.ts`

```ts
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const { user, tokens } = await authService.login(email, password);
    res.json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
}

export function googleRedirect(_req: Request, res: Response): void {
  if (!config.oauth.google.clientId) {
    throw ApiError.internal('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }

  const params = new URLSearchParams({
    client_id: config.oauth.google.clientId,
    redirect_uri: config.oauth.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
```

**Gatekeeper logic and mastery transitions (learning-service)**

The gatekeeper enforces three-tier progression and logs adaptation events.

Source: `backend/services/learning-service/src/modules/gatekeeper/gatekeeper.service.ts`

```ts
export function classifyScore(scorePercent: number): GatekeeperTier {
  if (scorePercent >= 80) return 'strong_pass';
  if (scorePercent >= 70) return 'marginal_pass';
  if (scorePercent >= 50) return 'fail_low';
  if (scorePercent >= 30) return 'fail_fundamental';
  return 'fail_severe';
}

export async function applyGatekeeperOutcome(params: {
  userId: string;
  nodeId: string;
  enrollmentId: string;
  quizAttemptId: string;
  scorePercent: number;
}) {
  const { userId, nodeId, enrollmentId, quizAttemptId, scorePercent } = params;
  const tier = classifyScore(scorePercent);
  const isPass = tier === 'strong_pass' || tier === 'marginal_pass';

  await prisma.learnerNodeProgress.updateMany({
    where: { userId, nodeId, enrollmentId },
    data: { masteryState: isPass ? 'mastered' : 'in_progress' },
  });

  if (tier === 'fail_low' || tier === 'fail_fundamental' || tier === 'fail_severe') {
    await prisma.adaptationEvent.create({
      data: { userId, nodeId, quizAttemptId, adaptationType: tier === 'fail_low' ? 'resource_swap' : 'prerequisite_review' },
    });
  }
}
```

**Quiz generation and fallback strategy (learning-service)**

The system attempts AI generation first, then falls back to a stored quiz if needed.

Source: `backend/services/learning-service/src/modules/quizzes/quizzes.service.ts`

```ts
const freshAiQuiz = await prisma.quiz.findFirst({
  where: {
    nodeId,
    isMicroQuiz: false,
    generatedBy: 'ai_tutor',
    createdAt: { gte: new Date(Date.now() - AI_QUIZ_STALE_DAYS * 86_400_000) },
  },
  orderBy: { createdAt: 'desc' },
  include: { questions: { orderBy: { orderIndex: 'asc' } } },
});
if (freshAiQuiz) return freshAiQuiz;

const aiResponse = await requestAiQuiz({ nodeId, nodeTitle: node.title, learningOutcomes: outcomes, questionCount: 4 });
if (aiResponse?.quiz?.questions?.length) {
  return prisma.quiz.create({
    data: { nodeId, isMicroQuiz: false, generatedBy: 'ai_tutor', questions: { create: ... } },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  });
}
```

**AI provider fallback with validation (ai-service)**

The AI service validates JSON outputs and falls back across providers.

Source: `backend/services/ai-service/src/modules/ai/ai.service.ts`

```ts
const raw = await phi4Generate(prompt);
const result = parseAndValidate<T>(raw, schema);
if (result) {
  await recordSuccess('phi4');
  return result;
}
await recordFailure('phi4');

const ollamaRaw = await ollamaGenerate(prompt);
const ollamaResult = parseAndValidate<T>(ollamaRaw, schema);
if (ollamaResult) {
  await recordSuccess('ollama');
  return ollamaResult;
}

const geminiRaw = await geminiGenerate(prompt);
return parseAndValidate<T>(geminiRaw, schema);
```

**Decay scanning and notifications (learning-service)**

Mastery decay scans update state and notify learners.

Source: `backend/services/learning-service/src/modules/decay/decay.service.ts`

```ts
if (days > threshold) {
  await prisma.learnerNodeProgress.update({
    where: { id: p.id },
    data: { masteryState: 'review_needed' },
  });
  await createNotification({
    userId: p.userId,
    type: 'decay_reminder',
    title: `Time to review: ${p.node.title}`,
    data: { nodeId: p.nodeId, enrollmentId: p.enrollmentId },
  });
}
```

**Roadmap visualization (web)**

The roadmap UI renders a DAG with auto-layout and color-coded mastery states.

Source: `frontend/src/features/roadmap/components/RoadmapCanvas.tsx`

```tsx
const depths = useMemo(() => computeDepths(roadmapNodes, roadmapEdges), [roadmapNodes, roadmapEdges]);

const initialNodes = useMemo(() => {
  const rfNodes = toFlowNodes(roadmapNodes, depths);
  const rfEdges = toFlowEdges(roadmapEdges, nodeMap);
  return autoLayout(rfNodes, rfEdges);
}, [roadmapNodes, roadmapEdges, nodeMap, depths]);

return (
  <ReactFlow
    nodes={nodes}
    edges={edges}
    onNodeClick={handleNodeClick}
    nodeTypes={NODE_TYPES}
    fitView
  >
    <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#d6cfbf" />
  </ReactFlow>
);
```

**Token refresh and API integration (web)**

The web client injects Bearer tokens and performs silent refresh on 401 responses.

Source: `frontend/src/api/client.ts`

```ts
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401) return Promise.reject(error);
    const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken });
    original.headers.Authorization = `Bearer ${data.accessToken}`;
    return apiClient(original);
  },
);
```

**Login form validation (web)**

The login UI validates input using Zod and shows actionable error messages.

Source: `frontend/src/features/auth/components/LoginForm.tsx`

```tsx
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

**Mobile API client with refresh (Flutter)**

The mobile app mirrors the web token refresh pattern using Dio interceptors.

Source: `flutter_mobile/lib/core/api/api_client.dart`

```dart
_dio.interceptors.add(
  InterceptorsWrapper(
    onRequest: (options, handler) {
      final accessToken = _accessTokenGetter?.call();
      if (accessToken != null && accessToken.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
      handler.next(options);
    },
    onError: (error, handler) async {
      if (error.response?.statusCode != 401) return handler.next(error);
      final refreshedAccessToken = await _refreshAccessToken();
      if (refreshedAccessToken == null) return handler.next(error);
      final response = await _dio.request<dynamic>(requestOptions.path, options: Options(
        headers: {...requestOptions.headers, 'Authorization': 'Bearer $refreshedAccessToken'},
      ));
      handler.resolve(response);
    },
  ),
);
```

**Mobile roadmap view (Flutter)**

The mobile client renders the learning graph using GraphView and provides a node detail sheet.

Source: `flutter_mobile/lib/features/roadmap/roadmap_screen.dart`

```dart
child: GraphView(
  graph: _graph,
  algorithm: _algorithm,
  paint: Paint()
    ..color = const Color(0xFFB9B1A4)
    ..strokeWidth = 1.5,
  builder: (Node node) {
    final mapped = node.key?.value as RoadmapNode;
    return RoadmapNodeWidget(
      node: mapped,
      isActive: _activeNodeId == mapped.id,
      onTap: mapped.unlocked ? () => _openNodeSheet(mapped) : null,
    );
  },
),
```

### 5.3.4 Integration Challenges and Resolutions

- **AI response inconsistency:** LLM outputs varied in format. The solution was strict JSON parsing and schema validation, plus fallback providers across the three-tier chain (Phi-4 -> Qwen2.5 -> Gemini).
- **Performance bottlenecks:** AI requests were slow under load, especially the local Qwen2.5-3B model on CPU (30-90 seconds per request). Caching and staleness windows were introduced to reduce repeated calls. The circuit breaker prevents repeated failed requests to slow providers.
- **Authorization edge cases:** Some admin routes needed additional role checks; these were added at gateway and service layers.
- **Cross-platform consistency:** Web (React) and mobile (Flutter) required separate implementations of the roadmap DAG visualization. Shared API contracts ensured consistent data representation despite different rendering engines.

### 5.3.5 Summary

The implementation preserves the core architectural design while adding pragmatic safeguards such as caching, validation, and circuit breakers. The three-tier AI fallback strategy (Phi-4-Multimodal -> Qwen2.5-3B -> Gemini 2.5 Flash) ensures resilience, near-zero API cost, and graceful degradation in resource-constrained environments. The system is modular, testable, and aligned with the functional and non-functional requirements described in Chapter Four.
