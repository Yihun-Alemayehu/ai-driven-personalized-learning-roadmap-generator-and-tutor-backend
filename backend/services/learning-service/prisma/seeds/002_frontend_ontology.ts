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
  prereqs: string[]; // slugs of prerequisite nodes
}

const NODES: NodeDef[] = [
  {
    title: 'HTML Fundamentals',
    slug: 'html-fundamentals',
    description: 'Core structure of the web — elements, attributes, semantic markup, forms, and accessibility basics.',
    learningOutcomes: [
      'Write semantic HTML5 documents',
      'Use forms, inputs, and validation attributes',
      'Understand the DOM tree structure',
      'Apply ARIA roles for basic accessibility',
    ],
    estimatedHours: 8,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'JavaScript Fundamentals',
    slug: 'js-fundamentals',
    description: 'Core language concepts — variables, data types, functions, loops, and the event loop.',
    learningOutcomes: [
      'Declare variables with var, let, const',
      'Write functions and understand scope/closures',
      'Manipulate arrays and objects',
      'Understand synchronous execution and the call stack',
    ],
    estimatedHours: 15,
    difficultyLevel: 2,
    prereqs: [],
  },
  {
    title: 'CSS Fundamentals',
    slug: 'css-fundamentals',
    description: 'Selectors, the box model, specificity, colors, typography, and the cascade.',
    learningOutcomes: [
      'Apply selectors, pseudo-classes, and pseudo-elements',
      'Explain the CSS cascade and specificity rules',
      'Use the box model to control layout',
      'Style text and implement basic responsive units',
    ],
    estimatedHours: 10,
    difficultyLevel: 1,
    prereqs: ['html-fundamentals'],
  },
  {
    title: 'Git & Version Control',
    slug: 'git-version-control',
    description: 'Track changes, collaborate on code, and manage project history with Git.',
    learningOutcomes: [
      'Initialize repos and make commits',
      'Create and merge branches',
      'Resolve merge conflicts',
      'Push and pull from remote repositories',
    ],
    estimatedHours: 6,
    difficultyLevel: 1,
    prereqs: ['js-fundamentals'],
  },
  {
    title: 'JavaScript ES6+ Features',
    slug: 'js-es6-features',
    description: 'Modern JavaScript — arrow functions, destructuring, spread, modules, classes, and template literals.',
    learningOutcomes: [
      'Use arrow functions and understand lexical this',
      'Apply destructuring and spread/rest operators',
      'Write and import ES modules',
      'Use classes and class inheritance',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['js-fundamentals'],
  },
  {
    title: 'Unit Testing with Jest',
    slug: 'unit-testing',
    description: 'Write reliable unit tests using Jest — assertions, mocking, and test coverage.',
    learningOutcomes: [
      'Write describe/it test blocks',
      'Use expect matchers and custom matchers',
      'Mock modules and functions',
      'Measure and improve code coverage',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['js-fundamentals'],
  },
  {
    title: 'npm & Package Management',
    slug: 'package-management',
    description: 'Manage project dependencies with npm — install, scripts, versioning, and lock files.',
    learningOutcomes: [
      'Initialize a project with package.json',
      'Install, update, and remove packages',
      'Write npm scripts for common tasks',
      'Understand semantic versioning and lock files',
    ],
    estimatedHours: 4,
    difficultyLevel: 1,
    prereqs: ['js-fundamentals'],
  },
  {
    title: 'DOM Manipulation',
    slug: 'dom-manipulation',
    description: 'Query, modify, and respond to the DOM using vanilla JavaScript.',
    learningOutcomes: [
      'Select elements with querySelector and querySelectorAll',
      'Create, append, and remove DOM nodes',
      'Handle events with addEventListener',
      'Understand event bubbling and delegation',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['js-fundamentals', 'css-fundamentals'],
  },
  {
    title: 'CSS Flexbox',
    slug: 'css-flexbox',
    description: 'One-dimensional layouts with flexbox — flex containers, flex items, and alignment.',
    learningOutcomes: [
      'Enable flexbox with display: flex',
      'Control main-axis and cross-axis alignment',
      'Use flex-grow, flex-shrink, and flex-basis',
      'Build common navigation and card layouts',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['css-fundamentals'],
  },
  {
    title: 'CSS Grid',
    slug: 'css-grid',
    description: 'Two-dimensional layouts with CSS Grid — tracks, areas, and placement.',
    learningOutcomes: [
      'Define grid-template-columns and rows',
      'Place items using grid-area and grid-line notation',
      'Use auto-fill, minmax, and fr units',
      'Build page-level layouts with grid',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['css-fundamentals'],
  },
  {
    title: 'Web Accessibility',
    slug: 'web-accessibility',
    description: 'Build inclusive UIs — ARIA, keyboard navigation, colour contrast, and screen-reader testing.',
    learningOutcomes: [
      'Apply ARIA roles and attributes correctly',
      'Ensure keyboard navigability for all interactive elements',
      'Meet WCAG 2.1 AA colour contrast requirements',
      'Test with a screen reader',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['html-fundamentals', 'css-fundamentals'],
  },
  {
    title: 'Async JavaScript',
    slug: 'async-javascript',
    description: 'Callbacks, Promises, async/await, and the event loop for non-blocking code.',
    learningOutcomes: [
      'Chain Promises with .then/.catch',
      'Write async functions using async/await',
      'Handle errors with try/catch in async code',
      'Understand the event loop and microtask queue',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['js-es6-features'],
  },
  {
    title: 'TypeScript Fundamentals',
    slug: 'typescript-fundamentals',
    description: 'Type safety in JavaScript — basic types, interfaces, generics, and strict mode.',
    learningOutcomes: [
      'Annotate variables, parameters, and return types',
      'Define interfaces and type aliases',
      'Use union, intersection, and generic types',
      'Configure tsconfig.json and run tsc',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['js-es6-features'],
  },
  {
    title: 'Web Security Basics',
    slug: 'web-security-basics',
    description: 'Understand XSS, CSRF, CSP, CORS, and secure coding practices in the browser.',
    learningOutcomes: [
      'Explain and prevent XSS attacks',
      'Implement CSRF tokens in forms',
      'Configure Content Security Policy headers',
      'Understand same-origin policy and CORS',
    ],
    estimatedHours: 6,
    difficultyLevel: 3,
    prereqs: ['js-es6-features'],
  },
  {
    title: 'Build Tools with Vite',
    slug: 'build-tools-vite',
    description: 'Fast frontend tooling — dev server, HMR, bundling, and environment variables with Vite.',
    learningOutcomes: [
      'Scaffold a Vite project and start the dev server',
      'Configure vite.config.ts for aliases and plugins',
      'Use environment variables with import.meta.env',
      'Build and preview a production bundle',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['js-es6-features', 'package-management'],
  },
  {
    title: 'Responsive Design',
    slug: 'responsive-design',
    description: 'Media queries, fluid grids, and mobile-first design to support all screen sizes.',
    learningOutcomes: [
      'Write mobile-first CSS with media queries',
      'Use relative units (rem, em, %, vw)',
      'Build fluid layouts that reflow at breakpoints',
      'Test responsiveness with DevTools device emulation',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['css-flexbox', 'css-grid'],
  },
  {
    title: 'Tailwind CSS',
    slug: 'tailwind-css',
    description: 'Utility-first CSS — configure Tailwind, apply utility classes, and customise the design system.',
    learningOutcomes: [
      'Add Tailwind to a Vite project',
      'Apply utility classes for layout, spacing, and colour',
      'Extend the theme in tailwind.config.js',
      'Use responsive and state variants (hover, focus, sm:)',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['css-fundamentals', 'build-tools-vite'],
  },
  {
    title: 'React Fundamentals',
    slug: 'react-fundamentals',
    description: 'Component model, JSX, props, and state — building UIs with React 18.',
    learningOutcomes: [
      'Create functional components with JSX',
      'Pass and validate props',
      'Manage local state with useState',
      'Understand the component lifecycle and reconciliation',
    ],
    estimatedHours: 15,
    difficultyLevel: 3,
    prereqs: ['dom-manipulation'],
    isBranchingPoint: true,
  },
  {
    title: 'Async Data Fetching & APIs',
    slug: 'api-integration',
    description: 'Fetch REST APIs, handle loading/error states, and work with JSON in the browser.',
    learningOutcomes: [
      'Make GET/POST requests with fetch and axios',
      'Handle loading, success, and error states',
      'Parse and display JSON data in the UI',
      'Understand HTTP status codes and headers',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['async-javascript'],
  },
  {
    title: 'Progressive Web Apps',
    slug: 'progressive-web-apps',
    description: 'Service workers, Web App Manifest, offline support, and push notifications.',
    learningOutcomes: [
      'Register and manage a service worker',
      'Cache assets for offline use',
      'Add a Web App Manifest for installability',
      'Send web push notifications',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['responsive-design', 'async-javascript'],
  },
  {
    title: 'CLI Tools & Shell Scripting',
    slug: 'cli-tools',
    description: 'Navigate the terminal, write shell scripts, and automate tasks with CLI tools.',
    learningOutcomes: [
      'Navigate the filesystem with common shell commands',
      'Write basic bash scripts with variables and loops',
      'Chain commands with pipes and redirects',
      'Use common dev CLI tools (prettier, eslint, etc.)',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['package-management', 'git-version-control'],
  },
  {
    title: 'React Hooks',
    slug: 'react-hooks',
    description: 'useEffect, useRef, useCallback, useMemo, useContext, and custom hooks.',
    learningOutcomes: [
      'Manage side-effects with useEffect',
      'Optimise renders with useCallback and useMemo',
      'Share state across components with useContext',
      'Build and compose custom hooks',
    ],
    estimatedHours: 12,
    difficultyLevel: 3,
    prereqs: ['react-fundamentals'],
  },
  {
    title: 'React Router',
    slug: 'react-router',
    description: 'Client-side routing — Route, Link, navigation hooks, loaders, and nested routes.',
    learningOutcomes: [
      'Set up BrowserRouter and define routes',
      'Use Link, NavLink, and useNavigate',
      'Implement nested routes and outlet',
      'Pass and read URL params and search params',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['react-fundamentals'],
  },
  {
    title: 'Form Handling in React',
    slug: 'form-handling',
    description: 'Controlled and uncontrolled forms, validation, and libraries like React Hook Form.',
    learningOutcomes: [
      'Build controlled inputs with useState',
      'Implement client-side form validation',
      'Use React Hook Form for performant forms',
      'Handle file inputs and multi-step forms',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['react-fundamentals'],
  },
  {
    title: 'React Testing Library',
    slug: 'react-testing',
    description: 'Test React components from the user\'s perspective using Testing Library and Jest.',
    learningOutcomes: [
      'Render components with render() and query the DOM',
      'Fire events with userEvent',
      'Mock API calls in tests',
      'Write accessibility-driven assertions',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['react-fundamentals', 'unit-testing'],
  },
  {
    title: 'Component Libraries',
    slug: 'component-libraries',
    description: 'Use pre-built component libraries (shadcn/ui, MUI) and integrate them with Tailwind.',
    learningOutcomes: [
      'Install and configure a component library',
      'Override default styles with Tailwind utilities',
      'Build forms and data tables from library primitives',
      'Understand headless UI patterns',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['react-fundamentals', 'tailwind-css'],
  },
  {
    title: 'CSS-in-JS & Styled Components',
    slug: 'css-in-js',
    description: 'Co-locate styles with components using styled-components or emotion.',
    learningOutcomes: [
      'Create styled components with tagged template literals',
      'Use props to apply dynamic styles',
      'Implement theming with ThemeProvider',
      'Compare CSS-in-JS trade-offs against utility classes',
    ],
    estimatedHours: 6,
    difficultyLevel: 2,
    prereqs: ['css-fundamentals', 'react-fundamentals'],
  },
  {
    title: 'State Management with Context API',
    slug: 'state-management-context',
    description: 'Share global state in React apps using Context API and useReducer.',
    learningOutcomes: [
      'Create and consume Context with useContext',
      'Manage complex state with useReducer',
      'Structure a context provider with selectors',
      'Identify when Context is sufficient vs. a dedicated library',
    ],
    estimatedHours: 6,
    difficultyLevel: 3,
    prereqs: ['react-hooks'],
  },
  {
    title: 'State Management with Redux',
    slug: 'state-management-redux',
    description: 'Predictable global state with Redux Toolkit — slices, thunks, and RTK Query.',
    learningOutcomes: [
      'Set up a Redux store with configureStore',
      'Define slices, reducers, and actions',
      'Write async logic with createAsyncThunk',
      'Fetch and cache server state with RTK Query',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['react-hooks'],
  },
  {
    title: 'Advanced React Patterns',
    slug: 'advanced-react-patterns',
    description: 'Compound components, render props, HOCs, portals, and Suspense.',
    learningOutcomes: [
      'Implement compound component pattern',
      'Use render props and higher-order components',
      'Render with portals and handle focus trapping',
      'Apply Suspense and lazy loading',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['react-hooks'],
  },
  {
    title: 'Data Visualization',
    slug: 'data-visualization',
    description: 'Build charts and interactive visualisations with Recharts or D3 inside React.',
    learningOutcomes: [
      'Create line, bar, and pie charts with Recharts',
      'Understand D3 scales and selections',
      'Integrate D3 with the React render cycle',
      'Implement tooltips and responsive charts',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['react-hooks'],
  },
  {
    title: 'Performance Optimization',
    slug: 'performance-optimization',
    description: 'Diagnose and fix frontend performance — code splitting, lazy loading, and Core Web Vitals.',
    learningOutcomes: [
      'Analyse performance with Lighthouse and React DevTools',
      'Implement code splitting with React.lazy',
      'Optimise images and fonts',
      'Improve LCP, CLS, and INP scores',
    ],
    estimatedHours: 8,
    difficultyLevel: 4,
    prereqs: ['react-fundamentals', 'build-tools-vite'],
  },
  {
    title: 'Frontend Authentication',
    slug: 'frontend-auth',
    description: 'Implement JWT auth flows, protected routes, token refresh, and OAuth in React.',
    learningOutcomes: [
      'Store and send JWT tokens securely',
      'Implement protected routes with React Router',
      'Handle token expiry and silent refresh',
      'Integrate OAuth (Google/GitHub) in a SPA',
    ],
    estimatedHours: 8,
    difficultyLevel: 4,
    prereqs: ['api-integration', 'react-fundamentals'],
  },
  {
    title: 'Static Site Generation',
    slug: 'static-site-generation',
    description: 'Pre-render pages at build time with Next.js static generation and ISR.',
    learningOutcomes: [
      'Create pages with getStaticProps',
      'Use getStaticPaths for dynamic routes',
      'Implement Incremental Static Regeneration',
      'Deploy a statically generated Next.js site',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['react-fundamentals'],
  },
  {
    title: 'Server-Side Rendering',
    slug: 'server-side-rendering',
    description: 'Render React on the server for SEO and performance using Next.js App Router.',
    learningOutcomes: [
      'Explain the difference between SSR, SSG, and CSR',
      'Fetch data in Server Components',
      'Stream UI with React Suspense boundaries',
      'Handle hydration and avoid mismatches',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['react-fundamentals', 'api-integration'],
  },
  {
    title: 'SEO Fundamentals',
    slug: 'seo-fundamentals',
    description: 'Semantic HTML, meta tags, structured data, and SSR for search engine visibility.',
    learningOutcomes: [
      'Write SEO-friendly HTML with correct headings and meta tags',
      'Add Open Graph and Twitter Card meta tags',
      'Implement JSON-LD structured data',
      'Measure and improve Core Web Vitals for SEO',
    ],
    estimatedHours: 5,
    difficultyLevel: 2,
    prereqs: ['html-fundamentals', 'server-side-rendering'],
  },
  {
    title: 'TypeScript with React',
    slug: 'typescript-react',
    description: 'Type React components, hooks, and events — prop types, generics, and strict mode.',
    learningOutcomes: [
      'Type component props with interfaces',
      'Use generic types in custom hooks',
      'Handle React events with proper types',
      'Migrate a JS React app to TypeScript',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['typescript-fundamentals', 'react-fundamentals'],
  },
  {
    title: 'Frontend Architecture Patterns',
    slug: 'frontend-architecture',
    description: 'Feature-based folder structure, separation of concerns, and scalable React application design.',
    learningOutcomes: [
      'Organise code with feature-sliced design',
      'Separate UI components from business logic',
      'Apply the facade pattern with custom hooks',
      'Evaluate trade-offs between architecture patterns',
    ],
    estimatedHours: 8,
    difficultyLevel: 4,
    prereqs: ['advanced-react-patterns', 'state-management-redux'],
  },
  {
    title: 'Micro-frontends',
    slug: 'micro-frontends',
    description: 'Decompose large frontends into independently deployable apps using Module Federation.',
    learningOutcomes: [
      'Explain micro-frontend architecture trade-offs',
      'Set up Module Federation with Webpack/Vite',
      'Share state and routing between micro-frontends',
      'Deploy and version independent micro-apps',
    ],
    estimatedHours: 10,
    difficultyLevel: 5,
    prereqs: ['frontend-architecture'],
  },
  {
    title: 'Full-Stack Integration',
    slug: 'fullstack-integration',
    description: 'Connect a React frontend to a Node.js backend — auth, data fetching, deployment, and CI/CD.',
    learningOutcomes: [
      'Integrate a JWT auth flow end-to-end',
      'Deploy a Next.js app with a Node.js API',
      'Set up a CI/CD pipeline with GitHub Actions',
      'Monitor frontend errors with a logging service',
    ],
    estimatedHours: 15,
    difficultyLevel: 5,
    prereqs: ['server-side-rendering', 'frontend-auth', 'performance-optimization'],
    isConvergencePoint: true,
  },
];

export async function seedFrontendOntology(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'frontend-development' } });
  if (!domain) throw new Error('Domain frontend-development not found — run 001_domains first');

  // Find or create a system admin user for createdById
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

  // Check if version already seeded
  const existing = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, versionNumber: 1 },
  });
  if (existing) {
    console.log('Frontend ontology v1 already seeded — skipping');
    return;
  }

  // Create ontology version
  const version = await prisma.ontologyVersion.create({
    data: {
      domainId: domain.id,
      versionNumber: 1,
      status: 'draft',
      createdById: admin.id,
    },
  });

  // Create all nodes and build slug→id map
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

  // Create prerequisite edges
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

  // Publish the version
  await prisma.ontologyVersion.update({
    where: { id: version.id },
    data: { status: 'published', publishedAt: new Date() },
  });

  console.log(
    `Seeded Frontend Development ontology v1: ${NODES.length} nodes, ${edgeCount} edges (published)`,
  );
}
