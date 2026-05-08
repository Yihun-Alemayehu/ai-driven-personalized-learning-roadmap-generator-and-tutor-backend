import { PrismaClient } from '@prisma/client';

interface ChallengeDef {
  nodeSlug: string;
  title: string;
  description: string;
  difficultyLevel: number;
}

const CHALLENGES: ChallengeDef[] = [
  {
    nodeSlug: 'html-fundamentals',
    title: 'Personal Portfolio Page',
    description: 'Build a single-page personal portfolio using only semantic HTML5 — no CSS or JavaScript. Include a header with nav, an about section, a projects section with at least 3 entries using <article>, a skills list, and a contact form with proper input types and validation attributes. Validate the page using the W3C Markup Validator.',
    difficultyLevel: 1,
  },
  {
    nodeSlug: 'js-fundamentals',
    title: 'Vanilla JS Calculator',
    description: 'Build a functional calculator app using pure JavaScript (no libraries). Support +, -, *, / operations, a decimal point, a clear button, and keyboard input. Handle edge cases: division by zero, chained operations, and floating-point display precision. No DOM frameworks allowed.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'css-fundamentals',
    title: 'Styled Blog Article Page',
    description: 'Take a raw HTML blog article (provided) and style it from scratch using only CSS — no frameworks. Your stylesheet must demonstrate: custom typography with Google Fonts, a consistent colour palette, a styled blockquote, a responsive image with a caption, and an inline code snippet with syntax-highlighted background.',
    difficultyLevel: 1,
  },
  {
    nodeSlug: 'git-version-control',
    title: 'Open Source Contribution Simulation',
    description: 'Fork a public GitHub repository (e.g., a simple open-source website), create a feature branch, make a meaningful change (fix a bug or improve the README), commit with a conventional commit message, push to your fork, and open a pull request. Document the workflow in a CONTRIBUTING.md file in your fork.',
    difficultyLevel: 1,
  },
  {
    nodeSlug: 'js-es6-features',
    title: 'ES6 Data Pipeline',
    description: 'Given a JSON dataset of 50 products (provided), write an ES6+ module that: imports the data, chains map/filter/reduce to compute top 5 products by revenue, uses destructuring in every transformation step, exports the result and a summary string using template literals. No loops — only higher-order array methods.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'unit-testing',
    title: 'Test-Driven Shopping Cart',
    description: 'Using TDD, implement a ShoppingCart class from tests only. The test suite (provided) covers: add/remove items, quantity updates, total calculation with discounts, and edge cases (negative quantity, empty cart). Write the implementation to make all tests pass without modifying the test file. Achieve 100% branch coverage.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'package-management',
    title: 'Custom CLI Tool',
    description: 'Build and publish a local npm package called @yourname/greet-cli that provides a bin command. Running greet --name Alice --lang es should print "Hola, Alice!" (supporting en, es, fr, de). Write proper package.json scripts, a .npmignore, and a README. Test it with npm link before submission.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'dom-manipulation',
    title: 'Interactive Todo App',
    description: 'Build a Todo app using vanilla JavaScript and the DOM API — no frameworks. Features: add/delete/complete todos, filter by status (all/active/done), persist data to localStorage, and support drag-to-reorder. All interactions must be keyboard-accessible. No innerHTML allowed — use createElement/appendChild only.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'css-flexbox',
    title: 'Flexbox Dashboard Layout',
    description: 'Recreate a provided admin dashboard screenshot using only Flexbox (no Grid). The layout includes a sticky sidebar with collapsible navigation, a top header bar with user avatar, and a main content area with 3-column card grid that collapses to 1 column on mobile. Pixel-perfect match within 5px tolerance.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'css-grid',
    title: 'Magazine-Style Article Layout',
    description: 'Build a magazine-style article layout using CSS Grid. Requirements: a 12-column grid, a spanning hero image, pull quotes that span 4 columns, a sidebar ad that spans multiple rows, and a photo gallery using auto-fill with minmax. The layout must be responsive with 3 breakpoints defined.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'web-accessibility',
    title: 'Accessibility Audit and Remediation',
    description: 'Run axe-core and Lighthouse against a provided inaccessible HTML page and produce an audit report. Then fix all issues: missing ARIA labels, colour contrast failures, keyboard traps, and missing form associations. The remediated page must score 100 on Lighthouse Accessibility and pass axe-core with zero violations.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'async-javascript',
    title: 'Concurrent API Fetcher',
    description: 'Build an async module that fetches data from 5 public APIs in parallel using Promise.allSettled, handles partial failures gracefully, retries failed requests once with exponential backoff, and returns a structured result object. Include an AbortController with a 5-second timeout per request. No external HTTP libraries.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'typescript-fundamentals',
    title: 'Type-Safe Event Emitter',
    description: 'Implement a fully type-safe EventEmitter<Events> class in TypeScript where Events is a generic map of event names to their payload types. The on(event, listener) and emit(event, payload) methods must be typed so that the payload type is inferred from the event name — no "any" or type assertions allowed. Write tests.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'web-security-basics',
    title: 'Secure Contact Form',
    description: 'Build a contact form with an Express backend that demonstrates: DOMPurify sanitisation of all user input before display, a CSRF token in a hidden field validated on the server, a Content Security Policy header that blocks inline scripts, and rate limiting (max 5 submissions per IP per minute). Document each security measure.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'build-tools-vite',
    title: 'Vite Plugin',
    description: 'Write a custom Vite plugin called vite-plugin-word-count that scans all .md files in the project and injects a virtual module (virtual:word-counts) exporting an object mapping each file path to its word count. The plugin must work in both dev and build modes. Write a small demo app that imports and displays the counts.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'responsive-design',
    title: 'Responsive News Homepage',
    description: 'Build a responsive news homepage that works across mobile (360px), tablet (768px), and desktop (1280px). Use a mobile-first approach with 4 breakpoints. The layout must use fluid typography (clamp()), a responsive image grid with srcset, and a hamburger menu on mobile. No CSS frameworks.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'tailwind-css',
    title: 'Tailwind Component Library',
    description: 'Build a mini component library with Tailwind CSS: a Button (5 variants: primary/secondary/danger/ghost/link, 3 sizes), a Card component, a Badge, and a Modal. Extend the Tailwind theme with a custom brand colour. Document each component\'s class API in a Storybook story or static HTML showcase page.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'react-fundamentals',
    title: 'React Movie Search App',
    description: 'Build a movie search app using React 18 functional components. It must: fetch from the OMDb API with a controlled search input, display results in a responsive card grid, show a loading skeleton while fetching, handle API errors with a user-friendly message, and allow clicking a card to see full movie details. No state management libraries.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'api-integration',
    title: 'GitHub Profile Explorer',
    description: 'Build a GitHub profile explorer using the GitHub REST API. Features: search users by username, display their public repos sorted by stars, show a repo\'s README rendered as HTML, implement pagination with infinite scroll, and cache responses for 5 minutes in memory. Handle rate limit errors with a countdown timer.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'progressive-web-apps',
    title: 'Offline-First Recipe App',
    description: 'Convert an existing recipe listing app (provided) into a PWA. Requirements: service worker with a cache-first strategy for assets and network-first for API calls, Web App Manifest for installability, offline fallback page, background sync for saving new recipes while offline, and push notification for "recipe of the day". Audit with Lighthouse.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'cli-tools',
    title: 'Project Scaffolding CLI',
    description: 'Build a Node.js CLI tool using commander.js that scaffolds a new frontend project. Running scaffold new --name my-app --template react|vue|vanilla should create the project directory, copy template files, run npm install, and initialize a git repo. Include a progress spinner and coloured terminal output.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'react-hooks',
    title: 'Custom Hooks Library',
    description: 'Build and document a library of 6 production-quality custom React hooks: useLocalStorage, useDebounce, useIntersectionObserver, useFetch, useMediaQuery, and useKeyPress. Each hook must have full TypeScript types, a demo component, and at least 3 Jest tests (including edge cases). Publish as a local npm package.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'react-router',
    title: 'Multi-Page SPA with Breadcrumbs',
    description: 'Build a multi-page SPA for a fictional e-commerce site using React Router v6. Include: nested routes for category > product listing > product detail, dynamic breadcrumbs generated from the route hierarchy, a protected checkout route that redirects to login, a 404 route, and URL-driven search/filter with URLSearchParams.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'form-handling',
    title: 'Multi-Step Registration Form',
    description: 'Build a 4-step registration form using React Hook Form with Zod/Joi validation. Steps: personal info, account credentials (with password strength meter), preferences (multi-select), and a review/confirm page. Each step validates independently before advancing. Show inline errors and a progress indicator. Accessible via keyboard.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'react-testing',
    title: 'Full Component Test Suite',
    description: 'Take a provided React shopping cart application with no tests and write a full test suite using React Testing Library and Jest. Cover: rendering with different prop combinations, user interactions (add, remove, update quantity), async API calls (mock with MSW), form validation, and accessibility assertions with jest-axe. Achieve 90%+ branch coverage.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'component-libraries',
    title: 'Admin Data Table with shadcn/ui',
    description: 'Build a fully-featured admin data table using shadcn/ui components: sortable columns, multi-row selection, inline editing, server-side pagination, CSV export, and column visibility toggle. All table state should be URL-driven (persist across page reload). Combine shadcn/ui DataTable with React Hook Form for the inline edit modal.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'css-in-js',
    title: 'Themed Component System',
    description: 'Build a themed component system with styled-components: implement a ThemeProvider with light/dark themes, a theme toggle stored in localStorage, 6 base components (Button, Input, Card, Badge, Alert, Spinner) that all respond to the theme, and a theme switcher demo page. Use transient props ($variant) to avoid prop forwarding to the DOM.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'state-management-context',
    title: 'Shopping Cart with Context + useReducer',
    description: 'Implement a full shopping cart feature using Context + useReducer — no Redux. The cart must support: add/remove/update quantity, apply/remove coupon codes, persist to localStorage, and expose optimistic updates. Split into CartStateContext and CartDispatchContext. Write 5 unit tests for the reducer.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'state-management-redux',
    title: 'Real-Time Dashboard with RTK Query',
    description: 'Build a real-time analytics dashboard using Redux Toolkit and RTK Query. Features: polling every 30 seconds, optimistic updates for settings changes, multiple API endpoints with shared cache tags for invalidation, a persistent "pinned panels" feature using localStorage middleware, and Immer-powered complex state updates. TypeScript throughout.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'advanced-react-patterns',
    title: 'Accessible Dropdown with Compound Components',
    description: 'Build a fully accessible dropdown menu component using the compound component pattern with React Context. API: <Dropdown><Dropdown.Trigger /><Dropdown.Menu><Dropdown.Item /></Dropdown.Menu></Dropdown>. Implement full keyboard navigation (arrow keys, Escape, Enter), ARIA attributes (role="menu", aria-expanded), focus management, and click-outside closing. Write tests.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'data-visualization',
    title: 'Interactive Sales Dashboard',
    description: 'Build an interactive sales dashboard with 4 Recharts chart types: a line chart with multiple series and a brush control for date range selection, a bar chart with click-to-drill-down, a pie chart with custom labels and animations, and a scatter plot with a trend line drawn with D3\'s linear regression. All charts must be responsive.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'performance-optimization',
    title: 'Performance Optimization Sprint',
    description: 'Take a provided slow React application (Lighthouse score < 50) and optimize it to score > 90. Required techniques: code splitting with React.lazy for all route components, virtualizing a long list with react-window, replacing heavy moment.js with date-fns, adding next/image with proper sizing, and fixing all LCP/CLS/INP issues. Document before/after metrics.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'frontend-auth',
    title: 'Full JWT Auth Flow',
    description: 'Implement a complete JWT authentication flow in a React SPA: login/register pages, access token stored in memory (not localStorage), refresh token in an HttpOnly cookie, silent refresh using an Axios interceptor that retries on 401, protected routes, a logout that clears both tokens server-side, and OAuth Google sign-in. TypeScript throughout.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'static-site-generation',
    title: 'Blog with ISR',
    description: 'Build a blog with Next.js using Static Generation and ISR. Requirements: getStaticProps + getStaticPaths for 50 posts fetched from a headless CMS (use JSONPlaceholder as mock CMS), ISR with revalidate: 60, dynamic Open Graph images using @vercel/og, a sitemap.xml generated at build time, and a tag-filtered listing page. Deploy to Vercel.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'server-side-rendering',
    title: 'SSR E-Commerce Product Page',
    description: 'Build a Next.js App Router product page that: fetches product data in a React Server Component (no client JS for the initial render), uses client components only for the cart button and image gallery, streams the page with Suspense boundaries, implements proper cache-control headers, and avoids hydration mismatches. Measure TTFB before and after.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'seo-fundamentals',
    title: 'SEO-Optimized Landing Page',
    description: 'Optimise a provided landing page to achieve a Lighthouse SEO score of 100. Tasks: add all required meta tags (title, description, canonical, OG, Twitter Card), implement JSON-LD for Organization and WebPage schema, fix heading hierarchy, add alt text to all images, generate a sitemap.xml, fix the robots.txt, and eliminate all CLS/LCP issues.',
    difficultyLevel: 2,
  },
  {
    nodeSlug: 'typescript-react',
    title: 'Migrate React App to TypeScript',
    description: 'Migrate a provided 20-component React JavaScript app to strict TypeScript. Requirements: zero "any" types, all props typed with interfaces, all hook return types annotated, all event handlers typed with proper React event generics, all API response shapes typed with Zod parsing, and strict: true in tsconfig. Document each tricky typing decision in comments.',
    difficultyLevel: 3,
  },
  {
    nodeSlug: 'frontend-architecture',
    title: 'Refactor to Feature-Sliced Design',
    description: 'Refactor a provided monolithic React app (everything in /src/components) into Feature-Sliced Design with layers: app/, pages/, features/, entities/, shared/. Draw a dependency graph before and after. Enforce layer boundaries with ESLint rules from eslint-plugin-boundaries. Write an ADR (Architecture Decision Record) documenting the migration.',
    difficultyLevel: 4,
  },
  {
    nodeSlug: 'micro-frontends',
    title: 'Module Federation Proof of Concept',
    description: 'Build a micro-frontend proof of concept with Module Federation: a Shell app (React, port 3000), a Products micro-app (React, port 3001) that exposes a ProductList component, and a Cart micro-app (React, port 3002) that exposes a CartSummary component. The shell composes both. Implement a shared auth context and a cross-app event bus. Document the deployment strategy.',
    difficultyLevel: 5,
  },
  {
    nodeSlug: 'fullstack-integration',
    title: 'Full-Stack Deployment with CI/CD',
    description: 'Deploy the learning platform frontend to Vercel and the backend to Railway (or Render). Set up a GitHub Actions CI pipeline that: runs TypeScript type checks, ESLint, Jest tests, and a Lighthouse CI check on every PR. Configure environment-specific variables, set up preview deployments for PRs, and write a post-deployment smoke test that checks 5 critical API endpoints.',
    difficultyLevel: 5,
  },
];

export async function seedChallengeProjects(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'frontend-development' } });
  if (!domain) throw new Error('Domain frontend-development not found');

  const ontologyVersion = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, status: 'published' },
    orderBy: { versionNumber: 'desc' },
  });
  if (!ontologyVersion) throw new Error('No published ontology version for frontend-development');

  // Check if already seeded
  const existing = await prisma.challengeProject.findFirst({
    where: { node: { ontologyVersionId: ontologyVersion.id } },
  });
  if (existing) {
    console.log('Challenge projects already seeded — skipping');
    return;
  }

  let count = 0;
  for (const challenge of CHALLENGES) {
    const node = await prisma.learningNode.findFirst({
      where: { ontologyVersionId: ontologyVersion.id, slug: challenge.nodeSlug },
    });
    if (!node) {
      console.warn(`Node not found: ${challenge.nodeSlug} — skipping`);
      continue;
    }

    await prisma.challengeProject.create({
      data: {
        nodeId: node.id,
        title: challenge.title,
        description: challenge.description,
        difficultyLevel: challenge.difficultyLevel,
      },
    });
    count++;
  }

  console.log(`Seeded ${count} challenge projects for Frontend Development`);
}
