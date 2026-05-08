import { PrismaClient } from '@prisma/client';

interface ResourceDef {
  nodeSlug: string;
  title: string;
  url: string;
  sourceDomain: string;
  modality: 'documentation' | 'tutorial' | 'video' | 'interactive' | 'reference';
  description: string;
  isPrimary: boolean;
}

const RESOURCES: ResourceDef[] = [
  // html-fundamentals
  {
    nodeSlug: 'html-fundamentals',
    title: 'HTML: HyperText Markup Language — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
    sourceDomain: 'developer.mozilla.org',
    modality: 'reference',
    description: 'Comprehensive MDN reference for all HTML elements, attributes, and APIs.',
    isPrimary: true,
  },
  {
    nodeSlug: 'html-fundamentals',
    title: 'HTML Full Course — freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    sourceDomain: 'freecodecamp.org',
    modality: 'interactive',
    description: 'Interactive HTML and responsive design curriculum with coding challenges.',
    isPrimary: false,
  },
  {
    nodeSlug: 'html-fundamentals',
    title: 'Semantic HTML — web.dev',
    url: 'https://web.dev/learn/html',
    sourceDomain: 'web.dev',
    modality: 'tutorial',
    description: 'Google\'s structured HTML learning course covering semantic markup and accessibility.',
    isPrimary: false,
  },
  // js-fundamentals
  {
    nodeSlug: 'js-fundamentals',
    title: 'JavaScript Guide — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    sourceDomain: 'developer.mozilla.org',
    modality: 'reference',
    description: 'The definitive MDN guide to core JavaScript concepts.',
    isPrimary: true,
  },
  {
    nodeSlug: 'js-fundamentals',
    title: 'The Modern JavaScript Tutorial',
    url: 'https://javascript.info/',
    sourceDomain: 'javascript.info',
    modality: 'tutorial',
    description: 'Deep, well-structured JavaScript tutorial from basics to advanced topics.',
    isPrimary: false,
  },
  {
    nodeSlug: 'js-fundamentals',
    title: 'JavaScript Full Course for Beginners — freeCodeCamp YouTube',
    url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
    sourceDomain: 'youtube.com',
    modality: 'video',
    description: '3.5-hour complete JavaScript beginner course by freeCodeCamp.',
    isPrimary: false,
  },
  // css-fundamentals
  {
    nodeSlug: 'css-fundamentals',
    title: 'Learn CSS — web.dev',
    url: 'https://web.dev/learn/css',
    sourceDomain: 'web.dev',
    modality: 'tutorial',
    description: 'Google\'s comprehensive CSS learning course covering cascade, box model, and layout.',
    isPrimary: true,
  },
  {
    nodeSlug: 'css-fundamentals',
    title: 'CSS Reference — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference',
    sourceDomain: 'developer.mozilla.org',
    modality: 'reference',
    description: 'Complete MDN CSS property reference.',
    isPrimary: false,
  },
  {
    nodeSlug: 'css-fundamentals',
    title: 'CSS Tricks — Almanac',
    url: 'https://css-tricks.com/almanac/',
    sourceDomain: 'css-tricks.com',
    modality: 'reference',
    description: 'CSS-Tricks almanac with practical examples for every CSS property and selector.',
    isPrimary: false,
  },
  // js-es6-features
  {
    nodeSlug: 'js-es6-features',
    title: 'ES6 In Depth — javascript.info',
    url: 'https://javascript.info/js',
    sourceDomain: 'javascript.info',
    modality: 'tutorial',
    description: 'Modern JavaScript tutorial covering arrow functions, destructuring, modules and more.',
    isPrimary: true,
  },
  {
    nodeSlug: 'js-es6-features',
    title: 'ES6 Features Overview — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import',
    sourceDomain: 'developer.mozilla.org',
    modality: 'reference',
    description: 'MDN documentation for ES modules including import/export syntax.',
    isPrimary: false,
  },
  // async-javascript
  {
    nodeSlug: 'async-javascript',
    title: 'Asynchronous JavaScript — MDN Learning Area',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
    sourceDomain: 'developer.mozilla.org',
    modality: 'tutorial',
    description: 'MDN\'s hands-on guide to callbacks, promises, async/await, and the event loop.',
    isPrimary: true,
  },
  {
    nodeSlug: 'async-javascript',
    title: 'Promises, async/await — javascript.info',
    url: 'https://javascript.info/async',
    sourceDomain: 'javascript.info',
    modality: 'tutorial',
    description: 'Deep dive into async programming patterns with clear diagrams and examples.',
    isPrimary: false,
  },
  // typescript-fundamentals
  {
    nodeSlug: 'typescript-fundamentals',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    sourceDomain: 'typescriptlang.org',
    modality: 'documentation',
    description: 'The official TypeScript handbook — the definitive guide to the language.',
    isPrimary: true,
  },
  {
    nodeSlug: 'typescript-fundamentals',
    title: 'TypeScript for JavaScript Programmers',
    url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
    sourceDomain: 'typescriptlang.org',
    modality: 'tutorial',
    description: 'Quick 5-minute introduction to TypeScript for developers who already know JavaScript.',
    isPrimary: false,
  },
  // react-fundamentals
  {
    nodeSlug: 'react-fundamentals',
    title: 'Quick Start — React Docs',
    url: 'https://react.dev/learn',
    sourceDomain: 'react.dev',
    modality: 'documentation',
    description: 'Official React documentation — the best place to start learning React.',
    isPrimary: true,
  },
  {
    nodeSlug: 'react-fundamentals',
    title: 'React Tutorial: Tic-Tac-Toe — React Docs',
    url: 'https://react.dev/learn/tutorial-tic-tac-toe',
    sourceDomain: 'react.dev',
    modality: 'interactive',
    description: 'Official hands-on tutorial introducing components, state, and event handling.',
    isPrimary: false,
  },
  {
    nodeSlug: 'react-fundamentals',
    title: 'React Full Course 2024 — freeCodeCamp YouTube',
    url: 'https://www.youtube.com/watch?v=x4rFhThSX04',
    sourceDomain: 'youtube.com',
    modality: 'video',
    description: 'Comprehensive React video course covering hooks, state management, and routing.',
    isPrimary: false,
  },
  // css-flexbox
  {
    nodeSlug: 'css-flexbox',
    title: 'A Complete Guide to Flexbox — CSS-Tricks',
    url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    sourceDomain: 'css-tricks.com',
    modality: 'reference',
    description: 'The most popular visual reference for CSS Flexbox properties.',
    isPrimary: true,
  },
  {
    nodeSlug: 'css-flexbox',
    title: 'Flexbox — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox',
    sourceDomain: 'developer.mozilla.org',
    modality: 'tutorial',
    description: 'MDN tutorial on flexbox layout with interactive examples.',
    isPrimary: false,
  },
  // css-grid
  {
    nodeSlug: 'css-grid',
    title: 'A Complete Guide to CSS Grid — CSS-Tricks',
    url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    sourceDomain: 'css-tricks.com',
    modality: 'reference',
    description: 'The definitive visual reference for CSS Grid properties.',
    isPrimary: true,
  },
  {
    nodeSlug: 'css-grid',
    title: 'CSS Grid Layout — MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
    sourceDomain: 'developer.mozilla.org',
    modality: 'reference',
    description: 'MDN reference for all CSS Grid layout properties and values.',
    isPrimary: false,
  },
  // build-tools-vite
  {
    nodeSlug: 'build-tools-vite',
    title: 'Getting Started — Vite',
    url: 'https://vitejs.dev/guide/',
    sourceDomain: 'vitejs.dev',
    modality: 'documentation',
    description: 'Official Vite getting started guide covering scaffolding, config, and plugins.',
    isPrimary: true,
  },
  // react-hooks
  {
    nodeSlug: 'react-hooks',
    title: 'Built-in React Hooks — React Docs',
    url: 'https://react.dev/reference/react',
    sourceDomain: 'react.dev',
    modality: 'documentation',
    description: 'Complete API reference for all built-in React hooks.',
    isPrimary: true,
  },
  {
    nodeSlug: 'react-hooks',
    title: 'Escape Hatches — React Docs',
    url: 'https://react.dev/learn/escape-hatches',
    sourceDomain: 'react.dev',
    modality: 'tutorial',
    description: 'Official guide to useRef, useEffect, and custom hooks with practical examples.',
    isPrimary: false,
  },
  // tailwind-css
  {
    nodeSlug: 'tailwind-css',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com/docs',
    sourceDomain: 'tailwindcss.com',
    modality: 'documentation',
    description: 'Official Tailwind CSS documentation with the full utility class reference.',
    isPrimary: true,
  },
  // state-management-redux
  {
    nodeSlug: 'state-management-redux',
    title: 'Redux Toolkit Quick Start',
    url: 'https://redux-toolkit.js.org/tutorials/quick-start',
    sourceDomain: 'redux.js.org',
    modality: 'documentation',
    description: 'Official Redux Toolkit quick start tutorial covering store, slices, and React integration.',
    isPrimary: true,
  },
  // react-testing
  {
    nodeSlug: 'react-testing',
    title: 'Testing Library Docs — React Testing Library',
    url: 'https://testing-library.com/docs/react-testing-library/intro/',
    sourceDomain: 'testing-library.com',
    modality: 'documentation',
    description: 'Official React Testing Library docs with API reference and examples.',
    isPrimary: true,
  },
];

export async function seedManualResources(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'frontend-development' } });
  if (!domain) throw new Error('Domain frontend-development not found');

  const ontologyVersion = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, status: 'published' },
    orderBy: { versionNumber: 'desc' },
  });
  if (!ontologyVersion) throw new Error('No published ontology version for frontend-development');

  let created = 0;
  let skipped = 0;

  for (const res of RESOURCES) {
    const node = await prisma.learningNode.findFirst({
      where: { ontologyVersionId: ontologyVersion.id, slug: res.nodeSlug },
    });
    if (!node) { console.warn(`Node not found: ${res.nodeSlug}`); continue; }

    const existing = await prisma.resource.findFirst({
      where: { nodeId: node.id, url: res.url },
    });
    if (existing) { skipped++; continue; }

    await prisma.resource.create({
      data: {
        nodeId: node.id,
        title: res.title,
        url: res.url,
        sourceDomain: res.sourceDomain,
        modality: res.modality,
        description: res.description,
        isPrimary: res.isPrimary,
        fetchedVia: 'manual',
      },
    });
    created++;
  }

  console.log(`Manual resources: ${created} created, ${skipped} already existed`);
}
