import { PrismaClient } from '@prisma/client';

interface NodeDef {
  title: string;
  slug: string;
  description: string;
  learningOutcomes: string[];
  estimatedHours: number;
  difficultyLevel: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  prereqs: string[];
}

const NODES: NodeDef[] = [
  {
    title: 'JavaScript & Node.js Fundamentals',
    slug: 'be-js-fundamentals',
    description: 'Core JavaScript for server-side development — variables, functions, modules, and the event loop.',
    learningOutcomes: [
      'Use CommonJS and ES module syntax',
      'Understand the Node.js event loop and non-blocking I/O',
      'Work with the Node.js built-in modules (fs, path, os)',
      'Run scripts and use the REPL',
    ],
    estimatedHours: 12,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Git & Version Control',
    slug: 'be-git',
    description: 'Track changes, branch, and collaborate using Git and GitHub.',
    learningOutcomes: [
      'Initialize repos, stage, and commit changes',
      'Create, merge, and rebase branches',
      'Resolve merge conflicts',
      'Use pull requests and code reviews on GitHub',
    ],
    estimatedHours: 5,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Linux & Command Line',
    slug: 'be-linux-cli',
    description: 'Navigate and manage a Linux system — filesystem, permissions, processes, and shell scripting.',
    learningOutcomes: [
      'Navigate the filesystem and manage files with shell commands',
      'Set file permissions and manage users',
      'Write basic bash scripts with variables and conditionals',
      'Manage background processes and use cron',
    ],
    estimatedHours: 8,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'HTTP & Web Fundamentals',
    slug: 'be-http',
    description: 'How the web works — HTTP methods, headers, status codes, cookies, and the request-response cycle.',
    learningOutcomes: [
      'Explain HTTP/1.1 and HTTP/2 request-response cycle',
      'Use all HTTP methods correctly (GET, POST, PUT, PATCH, DELETE)',
      'Interpret status codes and response headers',
      'Understand cookies, sessions, and CORS',
    ],
    estimatedHours: 6,
    difficultyLevel: 1,
    prereqs: ['be-js-fundamentals'],
  },
  {
    title: 'npm & Package Management',
    slug: 'be-npm',
    description: 'Manage project dependencies, scripts, and package versioning with npm.',
    learningOutcomes: [
      'Initialise a project with package.json',
      'Install, update, and audit dependencies',
      'Write npm scripts for dev, build, and test',
      'Understand semantic versioning and lock files',
    ],
    estimatedHours: 4,
    difficultyLevel: 1,
    prereqs: ['be-js-fundamentals'],
  },
  {
    title: 'Async JavaScript & Promises',
    slug: 'be-async-js',
    description: 'Non-blocking code patterns — callbacks, Promises, async/await, and error handling.',
    learningOutcomes: [
      'Chain Promises and handle rejections with .catch',
      'Write async/await functions and handle errors with try/catch',
      'Use Promise.all and Promise.race for concurrent operations',
      'Understand the microtask queue and event loop timing',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['be-js-fundamentals'],
  },
  {
    title: 'TypeScript for Backend',
    slug: 'be-typescript',
    description: 'Add static types to Node.js — interfaces, generics, decorators, and strict configuration.',
    learningOutcomes: [
      'Annotate function signatures, parameters, and return types',
      'Define interfaces, type aliases, and enums',
      'Use generics for reusable typed utilities',
      'Configure tsconfig.json for a Node.js project',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['be-async-js'],
  },
  {
    title: 'Express.js Fundamentals',
    slug: 'be-express',
    description: 'Build HTTP servers with Express — routing, middleware, request parsing, and error handling.',
    learningOutcomes: [
      'Create an Express app and define routes',
      'Write and chain custom middleware',
      'Parse JSON and form bodies with built-in middleware',
      'Implement centralised error-handling middleware',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['be-http', 'be-async-js'],
  },
  {
    title: 'REST API Design',
    slug: 'be-rest-api',
    description: 'Design predictable, resource-oriented REST APIs following industry conventions.',
    learningOutcomes: [
      'Design resource-based URL structures',
      'Apply correct HTTP methods and status codes',
      'Version APIs and handle breaking changes',
      'Document APIs with OpenAPI/Swagger',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['be-express'],
  },
  {
    title: 'SQL & PostgreSQL',
    slug: 'be-sql',
    description: 'Relational databases — schema design, queries, joins, indexes, and transactions.',
    learningOutcomes: [
      'Design normalised schemas with foreign keys',
      'Write SELECT queries with JOINs, GROUP BY, and subqueries',
      'Use indexes to optimise query performance',
      'Manage transactions and understand ACID properties',
    ],
    estimatedHours: 15,
    difficultyLevel: 2,
    prereqs: ['be-js-fundamentals'],
  },
  {
    title: 'ORM with Prisma',
    slug: 'be-prisma',
    description: 'Type-safe database access with Prisma — schema definition, migrations, and query API.',
    learningOutcomes: [
      'Define Prisma schema models and relations',
      'Run migrations with prisma migrate dev',
      'Perform CRUD operations with the Prisma client',
      'Use nested writes, transactions, and raw queries',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['be-sql', 'be-typescript'],
  },
  {
    title: 'Input Validation & Error Handling',
    slug: 'be-validation',
    description: 'Validate incoming data with Joi and design consistent error responses.',
    learningOutcomes: [
      'Define Joi schemas for request bodies and query params',
      'Return structured error responses with correct status codes',
      'Distinguish between operational and programmer errors',
      'Implement a global error handler in Express',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['be-rest-api'],
  },
  {
    title: 'Authentication & JWT',
    slug: 'be-auth-jwt',
    description: 'Secure APIs with JSON Web Tokens — sign, verify, refresh tokens, and protect routes.',
    learningOutcomes: [
      'Hash passwords with bcrypt or scrypt',
      'Issue and verify JWT access tokens',
      'Implement refresh token rotation',
      'Protect routes with authentication middleware',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['be-rest-api', 'be-prisma'],
  },
  {
    title: 'Role-Based Access Control',
    slug: 'be-rbac',
    description: 'Authorise actions based on user roles and resource ownership.',
    learningOutcomes: [
      'Define roles and permissions in the database',
      'Implement role-checking middleware',
      'Apply resource-ownership guards',
      'Handle 401 vs 403 responses correctly',
    ],
    estimatedHours: 6,
    difficultyLevel: 3,
    prereqs: ['be-auth-jwt'],
  },
  {
    title: 'NoSQL & MongoDB',
    slug: 'be-mongodb',
    description: 'Document databases — collections, queries, aggregation pipeline, and schema design.',
    learningOutcomes: [
      'Model data as documents and design collections',
      'Perform CRUD operations with the MongoDB driver',
      'Use the aggregation pipeline for analytics queries',
      'Understand indexing and query explain plans',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['be-async-js'],
  },
  {
    title: 'Caching with Redis',
    slug: 'be-redis',
    description: 'Speed up responses and reduce DB load with Redis — strings, hashes, expiry, and Pub/Sub.',
    learningOutcomes: [
      'Store and retrieve values with GET/SET and expiry',
      'Use Redis hashes and sorted sets',
      'Implement a cache-aside pattern for API responses',
      'Use Pub/Sub for basic message broadcasting',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['be-auth-jwt'],
  },
  {
    title: 'Environment Config & Security',
    slug: 'be-config-security',
    description: '12-factor app configuration, secrets management, CORS, rate limiting, and security headers.',
    learningOutcomes: [
      'Load config from environment variables with dotenv',
      'Configure CORS policies for API consumers',
      'Add security headers with helmet',
      'Implement rate limiting to prevent abuse',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['be-express'],
  },
  {
    title: 'Testing Backend APIs',
    slug: 'be-testing',
    description: 'Unit and integration testing for Node.js — Jest, supertest, and test database setup.',
    learningOutcomes: [
      'Write unit tests for service functions with Jest',
      'Test HTTP endpoints with supertest',
      'Seed and tear down a test database',
      'Mock external dependencies in tests',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['be-prisma', 'be-validation'],
  },
  {
    title: 'File Uploads & Cloud Storage',
    slug: 'be-file-uploads',
    description: 'Handle multipart uploads, validate files, and store them in S3-compatible storage.',
    learningOutcomes: [
      'Parse multipart form data with multer',
      'Validate file type and size',
      'Upload files to AWS S3 or compatible storage',
      'Generate pre-signed URLs for secure file access',
    ],
    estimatedHours: 6,
    difficultyLevel: 3,
    prereqs: ['be-auth-jwt'],
  },
  {
    title: 'Email & Transactional Notifications',
    slug: 'be-email',
    description: 'Send transactional emails and push notifications via providers like SendGrid or Resend.',
    learningOutcomes: [
      'Send emails with a transactional provider SDK',
      'Template HTML emails',
      'Handle delivery failures and webhooks',
      'Queue email delivery for reliability',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['be-config-security'],
  },
  {
    title: 'WebSockets & Real-time',
    slug: 'be-websockets',
    description: 'Push data to clients in real time with WebSockets and Socket.IO.',
    learningOutcomes: [
      'Upgrade HTTP connections to WebSocket',
      'Emit and listen for events with Socket.IO',
      'Implement rooms and namespaces for multi-tenant broadcasts',
      'Scale WebSockets with a Redis adapter',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['be-redis'],
  },
  {
    title: 'Message Queues & Background Jobs',
    slug: 'be-queues',
    description: 'Decouple workloads with Bull/BullMQ — job queues, workers, retries, and scheduling.',
    learningOutcomes: [
      'Add jobs to a Bull queue',
      'Process jobs in worker processes',
      'Configure retries and exponential backoff',
      'Schedule recurring jobs with cron-like syntax',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['be-redis'],
  },
  {
    title: 'Logging & Observability',
    slug: 'be-logging',
    description: 'Structured logging with Pino, request tracing, and health-check endpoints.',
    learningOutcomes: [
      'Log structured JSON with Pino or Winston',
      'Add request correlation IDs for tracing',
      'Expose /health and /metrics endpoints',
      'Integrate with a log aggregation service',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['be-config-security'],
  },
  {
    title: 'Docker for Backend',
    slug: 'be-docker',
    description: 'Containerise Node.js applications — Dockerfiles, multi-stage builds, and docker-compose.',
    learningOutcomes: [
      'Write a production-ready multi-stage Dockerfile',
      'Use docker-compose to run app + database locally',
      'Manage environment variables and secrets in containers',
      'Push images to a container registry',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['be-linux-cli', 'be-config-security'],
  },
  {
    title: 'GraphQL API',
    slug: 'be-graphql',
    description: 'Build a flexible query API with GraphQL — schema, resolvers, mutations, and subscriptions.',
    learningOutcomes: [
      'Define a GraphQL schema with types and fields',
      'Write resolvers for queries and mutations',
      'Solve the N+1 problem with DataLoader',
      'Add authentication to GraphQL resolvers',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['be-auth-jwt'],
    isBranchingPoint: true,
  },
  {
    title: 'Microservices Architecture',
    slug: 'be-microservices',
    description: 'Decompose monoliths into services — service boundaries, inter-service communication, and API gateways.',
    learningOutcomes: [
      'Identify service boundaries using domain-driven design',
      'Implement synchronous communication with HTTP and gRPC',
      'Use an API gateway for routing and auth',
      'Handle distributed failures with circuit breakers',
    ],
    estimatedHours: 12,
    difficultyLevel: 4,
    prereqs: ['be-queues', 'be-docker'],
  },
  {
    title: 'Database Performance & Optimisation',
    slug: 'be-db-performance',
    description: 'Diagnose and fix slow queries — EXPLAIN ANALYSE, indexing strategies, and connection pooling.',
    learningOutcomes: [
      'Use EXPLAIN ANALYSE to read query plans',
      'Create composite and partial indexes',
      'Configure a connection pool (PgBouncer)',
      'Implement pagination strategies (cursor vs offset)',
    ],
    estimatedHours: 8,
    difficultyLevel: 4,
    prereqs: ['be-prisma'],
  },
  {
    title: 'CI/CD for Backend',
    slug: 'be-cicd',
    description: 'Automate testing and deployment with GitHub Actions — lint, test, build, and deploy.',
    learningOutcomes: [
      'Write a GitHub Actions workflow for a Node.js app',
      'Run tests in CI with a PostgreSQL service container',
      'Build and push Docker images in CI',
      'Deploy to a cloud provider on merge to main',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['be-docker', 'be-testing'],
  },
  {
    title: 'Cloud Deployment (AWS)',
    slug: 'be-cloud-aws',
    description: 'Deploy Node.js APIs on AWS — EC2, Elastic Beanstalk, RDS, S3, and IAM basics.',
    learningOutcomes: [
      'Launch and configure an EC2 instance',
      'Connect an app to RDS PostgreSQL',
      'Set up an Application Load Balancer',
      'Manage IAM roles and least-privilege access',
    ],
    estimatedHours: 12,
    difficultyLevel: 3,
    prereqs: ['be-cicd'],
  },
  {
    title: 'Production-Ready API',
    slug: 'be-production',
    description: 'Harden a backend service for production — graceful shutdown, health checks, secrets, and SLAs.',
    learningOutcomes: [
      'Implement graceful shutdown on SIGTERM',
      'Add comprehensive health and readiness probes',
      'Rotate secrets without downtime',
      'Define and monitor SLOs for the API',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['be-logging', 'be-cloud-aws'],
    isConvergencePoint: true,
  },
];

export async function seedBackendOntology(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'backend-development' } });
  if (!domain) throw new Error('Domain backend-development not found — run 001_domains first');

  const admin = await prisma.user.upsert({
    where: { email: 'seed-admin@system.internal' },
    update: {},
    create: {
      email: 'seed-admin@system.internal',
      fullName: 'System Seed',
      role: 'admin',
      passwordHash: null,
    },
  });

  const existing = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, versionNumber: 1 },
  });

  if (existing) {
    const nodeCount = await prisma.learningNode.count({ where: { ontologyVersionId: existing.id } });
    if (nodeCount > 0) {
      console.log('Backend ontology v1 already seeded — skipping');
      return;
    }
    // Version exists but is empty — populate it
  }

  const version = existing ?? await prisma.ontologyVersion.create({
    data: {
      domainId: domain.id,
      versionNumber: 1,
      status: 'draft',
      createdById: admin.id,
    },
  });

  const slugToId = new Map<string, string>();

  for (const nodeDef of NODES) {
    const { prereqs, ...fields } = nodeDef;
    const node = await prisma.learningNode.create({
      data: {
        ...fields,
        ontologyVersionId: version.id,
        learningOutcomes: fields.learningOutcomes,
        estimatedHours: fields.estimatedHours,
      },
    });
    slugToId.set(nodeDef.slug, node.id);
  }

  let edgeCount = 0;
  for (const nodeDef of NODES) {
    const nodeId = slugToId.get(nodeDef.slug)!;
    for (const prereqSlug of nodeDef.prereqs) {
      const prereqId = slugToId.get(prereqSlug);
      if (!prereqId) throw new Error(`Unknown prereq slug: ${prereqSlug}`);
      await prisma.nodePrerequisite.create({
        data: { nodeId, prerequisiteNodeId: prereqId },
      });
      edgeCount++;
    }
  }

  await prisma.ontologyVersion.update({
    where: { id: version.id },
    data: { status: 'published', publishedAt: new Date() },
  });

  console.log(`Seeded Backend Development ontology v1: ${NODES.length} nodes, ${edgeCount} edges (published)`);
}
