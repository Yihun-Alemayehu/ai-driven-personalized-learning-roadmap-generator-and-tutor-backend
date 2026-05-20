import { useState, useRef } from 'react';
import {
  useImportNodesMutation,
  type ImportOntologyPayload,
  type ImportNodePayload,
} from '@/api/admin';

// ── Full domain template (Frontend Development, 17 nodes) ─────────────────────

const FULL_TEMPLATE: ImportOntologyPayload = {
  nodes: [
    {
      title: 'HTML Fundamentals',
      description: 'Structure of web pages using HTML5 semantic elements.',
      learningOutcomes: [
        'Write valid, semantic HTML5 documents',
        'Use forms, tables, and media elements correctly',
        'Understand accessibility attributes (alt, aria-*)',
      ],
      estimatedHours: 6,
      difficultyLevel: 1,
    },
    {
      title: 'CSS Fundamentals',
      description: 'Styling web pages with the cascade, selectors, and the box model.',
      learningOutcomes: [
        'Apply the CSS box model (margin, border, padding)',
        'Use selectors, specificity, and the cascade',
        'Implement basic layouts with Flexbox',
      ],
      estimatedHours: 8,
      difficultyLevel: 1,
    },
    {
      title: 'JavaScript Basics',
      description: 'Core JavaScript syntax, data types, control flow, and functions.',
      learningOutcomes: [
        'Declare variables with let/const and use primitive types',
        'Write functions, loops, and conditionals',
        'Understand scope and closures',
      ],
      estimatedHours: 12,
      difficultyLevel: 2,
    },
    {
      title: 'Git & Version Control',
      description: 'Track code history with Git and collaborate via GitHub.',
      learningOutcomes: [
        'Initialise a repo and commit changes',
        'Create and merge branches',
        'Resolve merge conflicts',
      ],
      estimatedHours: 4,
      difficultyLevel: 1,
    },
    {
      title: 'Responsive Design',
      description: 'Build layouts that adapt to any screen size.',
      learningOutcomes: [
        'Use CSS Grid and Flexbox for adaptive layouts',
        'Apply media queries for breakpoints',
        'Follow a mobile-first design approach',
      ],
      estimatedHours: 6,
      difficultyLevel: 2,
    },
    {
      title: 'DOM Manipulation',
      description: 'Read and modify the live DOM with vanilla JavaScript.',
      learningOutcomes: [
        'Select, create, and remove DOM elements',
        'Handle events with addEventListener',
        'Update styles and attributes dynamically',
      ],
      estimatedHours: 8,
      difficultyLevel: 2,
    },
    {
      title: 'ES6+ Features',
      description: 'Modern JavaScript: arrow functions, destructuring, modules, and async.',
      learningOutcomes: [
        'Use destructuring, spread/rest, and template literals',
        'Write and consume ES modules (import/export)',
        'Handle async operations with Promises and async/await',
      ],
      estimatedHours: 8,
      difficultyLevel: 2,
    },
    {
      title: 'Package Managers & Tooling',
      description: 'Manage project dependencies with npm/yarn and run scripts.',
      learningOutcomes: [
        'Initialise a project with npm init',
        'Install, update, and remove packages',
        'Write and run npm scripts',
      ],
      estimatedHours: 3,
      difficultyLevel: 1,
    },
    {
      title: 'Build Tools & Bundlers',
      description: 'Bundle, transpile, and optimise assets with Vite or Webpack.',
      learningOutcomes: [
        'Configure Vite for a modern development workflow',
        'Understand code splitting and tree-shaking',
        'Set up environment variables and production builds',
      ],
      estimatedHours: 5,
      difficultyLevel: 3,
    },
    {
      title: 'TypeScript Fundamentals',
      description: 'Add static types to JavaScript for safer, self-documenting code.',
      learningOutcomes: [
        'Annotate variables, functions, and objects with types',
        'Use interfaces, type aliases, and generics',
        'Understand type narrowing and utility types',
      ],
      estimatedHours: 10,
      difficultyLevel: 3,
    },
    {
      title: 'Frontend Framework',
      description: 'Build component-based UIs with React (or an equivalent framework).',
      learningOutcomes: [
        'Create functional components with props and state',
        'Manage side-effects with useEffect',
        'Lift state and compose components',
      ],
      estimatedHours: 16,
      difficultyLevel: 3,
      isBranchingPoint: true,
    },
    {
      title: 'State Management',
      description: 'Manage global and shared state with Zustand, Redux, or Context.',
      learningOutcomes: [
        'Identify when global state is needed',
        'Implement a global store with Zustand or Redux Toolkit',
        'Connect store state to components efficiently',
      ],
      estimatedHours: 8,
      difficultyLevel: 4,
    },
    {
      title: 'API Integration',
      description: 'Fetch data from REST and GraphQL APIs and handle loading/error states.',
      learningOutcomes: [
        'Make HTTP requests with fetch or Axios',
        'Use TanStack Query for server-state management',
        'Handle pagination, error boundaries, and loading skeletons',
      ],
      estimatedHours: 8,
      difficultyLevel: 3,
    },
    {
      title: 'Frontend Testing',
      description: 'Write unit and integration tests for components and hooks.',
      learningOutcomes: [
        'Write unit tests with Vitest',
        'Test components with Testing Library',
        'Mock API calls with MSW',
      ],
      estimatedHours: 8,
      difficultyLevel: 4,
    },
    {
      title: 'CSS-in-JS & Design Systems',
      description: 'Build consistent UIs with Tailwind CSS or component libraries.',
      learningOutcomes: [
        'Apply utility-first styling with Tailwind CSS',
        'Compose a reusable component library',
        'Enforce design tokens for colour, spacing, and typography',
      ],
      estimatedHours: 6,
      difficultyLevel: 3,
    },
    {
      title: 'Performance Optimisation',
      description: 'Measure and improve page load and runtime performance.',
      learningOutcomes: [
        'Analyse bundle size and Core Web Vitals',
        'Apply lazy loading, code splitting, and caching strategies',
        'Optimise images and fonts',
      ],
      estimatedHours: 8,
      difficultyLevel: 4,
      isConvergencePoint: true,
    },
    {
      title: 'Deployment & CI/CD',
      description: 'Ship frontend apps with automated pipelines and CDN hosting.',
      learningOutcomes: [
        'Deploy a frontend app to Vercel or Netlify',
        'Configure a CI pipeline with GitHub Actions',
        'Set up environment-specific builds and previews',
      ],
      estimatedHours: 5,
      difficultyLevel: 3,
    },
  ],
  prerequisites: [
    { node: 'CSS Fundamentals',          requires: 'HTML Fundamentals' },
    { node: 'DOM Manipulation',          requires: 'HTML Fundamentals' },
    { node: 'DOM Manipulation',          requires: 'JavaScript Basics' },
    { node: 'ES6+ Features',             requires: 'JavaScript Basics' },
    { node: 'Responsive Design',         requires: 'CSS Fundamentals' },
    { node: 'Package Managers & Tooling', requires: 'Git & Version Control' },
    { node: 'Build Tools & Bundlers',    requires: 'Package Managers & Tooling' },
    { node: 'TypeScript Fundamentals',   requires: 'ES6+ Features' },
    { node: 'Frontend Framework',        requires: 'TypeScript Fundamentals' },
    { node: 'Frontend Framework',        requires: 'DOM Manipulation' },
    { node: 'State Management',          requires: 'Frontend Framework' },
    { node: 'API Integration',           requires: 'Frontend Framework' },
    { node: 'Frontend Testing',          requires: 'Frontend Framework' },
    { node: 'CSS-in-JS & Design Systems', requires: 'Responsive Design' },
    { node: 'CSS-in-JS & Design Systems', requires: 'Frontend Framework' },
    { node: 'Performance Optimisation',  requires: 'Build Tools & Bundlers' },
    { node: 'Performance Optimisation',  requires: 'Frontend Framework' },
    { node: 'Deployment & CI/CD',        requires: 'Build Tools & Bundlers' },
    { node: 'Deployment & CI/CD',        requires: 'Performance Optimisation' },
  ],
};

// ── Minimal single-node reference template ────────────────────────────────────

const SINGLE_TEMPLATE: ImportOntologyPayload = {
  nodes: [
    {
      title: 'Node Title',
      description: 'What this node covers (optional)',
      learningOutcomes: ['Learning outcome 1', 'Learning outcome 2'],
      estimatedHours: 4,
      difficultyLevel: 2,
      isBranchingPoint: false,
      isConvergencePoint: false,
    },
  ],
  prerequisites: [
    { node: 'Node Title', requires: 'Some Earlier Node' },
  ],
};

// ── Parse + validate ──────────────────────────────────────────────────────────

type ParsedResult =
  | { ok: true; payload: ImportOntologyPayload }
  | { ok: false; error: string };

function parseJson(raw: string): ParsedResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'Invalid JSON — check for missing commas or brackets.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'Root must be a JSON object with a "nodes" array.' };
  }

  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.nodes) || obj.nodes.length === 0) {
    return { ok: false, error: '"nodes" must be a non-empty array.' };
  }

  const errors: string[] = [];
  const seenTitles = new Set<string>();

  (obj.nodes as unknown[]).forEach((n, i) => {
    if (typeof n !== 'object' || n === null) { errors.push(`Node ${i + 1}: must be an object`); return; }
    const node = n as Record<string, unknown>;
    if (!node.title) {
      errors.push(`Node ${i + 1}: "title" is required`);
    } else {
      const t = node.title as string;
      if (seenTitles.has(t)) errors.push(`Duplicate title: "${t}"`);
      seenTitles.add(t);
    }
    if (!Array.isArray(node.learningOutcomes) || (node.learningOutcomes as unknown[]).length === 0) {
      errors.push(`Node ${i + 1} ("${node.title ?? '?'}"): "learningOutcomes" must be a non-empty array`);
    }
  });

  if (errors.length > 0) return { ok: false, error: errors.join('\n') };

  return {
    ok: true,
    payload: {
      nodes: obj.nodes as ImportNodePayload[],
      prerequisites: Array.isArray(obj.prerequisites)
        ? (obj.prerequisites as Array<{ node: string; requires: string }>)
        : [],
    },
  };
}

// ── Download helper ───────────────────────────────────────────────────────────

function downloadJson(payload: ImportOntologyPayload, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Difficulty stars ──────────────────────────────────────────────────────────

function DiffStars({ level }: { level?: number }) {
  if (!level) return null;
  return (
    <span style={{ color: '#c8a05a', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
      {'★'.repeat(level)}{'☆'.repeat(5 - level)}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  ontologyId: string;
  onClose: () => void;
}

export function ImportJsonDialog({ ontologyId, onClose }: Props) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ImportOntologyPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<{ nodes: number; edges: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const importMut = useImportNodesMutation(ontologyId);

  function handleParse() {
    if (!text.trim()) { setParseError('Paste or load a JSON file first.'); setPreview(null); return; }
    const result = parseJson(text);
    if (!result.ok) { setParseError(result.error); setPreview(null); }
    else { setParseError(null); setPreview(result.payload); }
  }

  function handleLoadSingle() {
    setText(JSON.stringify(SINGLE_TEMPLATE, null, 2));
    setPreview(null); setParseError(null);
  }

  function handleLoadFull() {
    setText(JSON.stringify(FULL_TEMPLATE, null, 2));
    setPreview(null); setParseError(null);
  }

  function handleFileLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string ?? '');
      setPreview(null); setParseError(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImport() {
    if (!preview) return;
    importMut.mutate(preview, {
      onSuccess: (res) => {
        setImportSuccess({ nodes: res.nodes.length, edges: res.edgesCreated });
        setImportWarnings(res.warnings ?? []);
      },
    });
  }

  const MONO = { fontFamily: 'JetBrains Mono, monospace' };
  const SERIF = { fontFamily: "'Cormorant Garamond', serif" };
  const CURSIVE = { fontFamily: "'Crimson Pro', serif" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(26,22,20,0.45)' }}
    >
      <div
        className="relative flex flex-col rounded-[16px] shadow-2xl overflow-hidden"
        style={{
          background: '#faf7f1',
          border: '1px solid #d6cfbf',
          width: 'min(960px, 96vw)',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: '#d6cfbf' }}
        >
          <div>
            <div className="text-[22px]" style={{ ...SERIF, color: '#1a1614' }}>
              Import Nodes from JSON
            </div>
            <div className="text-[12px] mt-0.5" style={{ ...MONO, color: '#9a9088' }}>
              Add many nodes and edges at once — paste JSON, load a file, or start from a template
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[20px] px-2 hover:opacity-60 transition-opacity"
            style={{ color: '#9a9088' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left: editor */}
          <div
            className="flex flex-col gap-3 p-5 overflow-y-auto shrink-0"
            style={{
              width: preview ? '50%' : '100%',
              borderRight: preview ? '1px solid #d6cfbf' : 'none',
            }}
          >
            {/* Toolbar */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors"
                style={{ ...MONO, color: '#3a342e', border: '1px solid #d6cfbf' }}
              >
                📄 Load file
              </button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileLoad} />

              <button
                onClick={handleLoadSingle}
                className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors"
                style={{ ...MONO, color: '#3a342e', border: '1px solid #d6cfbf' }}
              >
                1 node template
              </button>

              <button
                onClick={handleLoadFull}
                className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors"
                style={{ ...MONO, color: '#3a342e', border: '1px solid #d6cfbf' }}
              >
                17 node template ✦
              </button>

              {text.trim() && (
                <button
                  onClick={() => downloadJson(
                    preview ?? (parseJson(text).ok ? (parseJson(text) as { ok: true; payload: ImportOntologyPayload }).payload : SINGLE_TEMPLATE),
                    'ontology-import.json',
                  )}
                  className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors ml-auto"
                  style={{ ...MONO, color: '#9a9088', border: '1px solid #d6cfbf' }}
                >
                  ↓ Download
                </button>
              )}
            </div>

            {/* Schema reference */}
            <div
              className="rounded-[8px] px-3 py-2.5 text-[11px] leading-relaxed"
              style={{ ...MONO, background: '#f3efe7', border: '1px solid #ebe6db', color: '#6e645a' }}
            >
              <div className="mb-1">
                <span style={{ color: '#3a342e', fontWeight: 600 }}>Node fields</span>
                <span style={{ color: '#9a9088' }}> (per item in "nodes" array)</span>
              </div>
              <div>
                <span style={{ color: 'oklch(0.50 0.15 285)' }}>title</span>
                <span style={{ color: '#9a9088' }}> string · required</span>
                {'   '}
                <span style={{ color: 'oklch(0.50 0.15 285)' }}>learningOutcomes</span>
                <span style={{ color: '#9a9088' }}> string[] · required · min 1</span>
              </div>
              <div className="mt-0.5" style={{ color: '#9a9088' }}>
                Optional: description · estimatedHours · difficultyLevel 1–5 ·
                isBranchingPoint · isConvergencePoint ·
                branchPath (frontend | backend | data_science)
              </div>
              <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: '#ebe6db' }}>
                <span style={{ color: '#3a342e', fontWeight: 600 }}>prerequisites</span>
                <span style={{ color: '#9a9088' }}>
                  {' '}array of {'{ "node": "Title B", "requires": "Title A" }'} — B unlocks after A
                </span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setPreview(null); setParseError(null); }}
              placeholder={'{\n  "nodes": [\n    {\n      "title": "My Node",\n      "learningOutcomes": ["outcome 1"]\n    }\n  ],\n  "prerequisites": []\n}'}
              className="flex-1 rounded-[8px] p-3 text-[12px] leading-relaxed resize-none outline-none"
              style={{
                ...MONO,
                background: '#f3efe7',
                border: `1px solid ${parseError ? 'oklch(0.62 0.18 28)' : '#d6cfbf'}`,
                color: '#1a1614',
                minHeight: 260,
              }}
            />

            {parseError && (
              <div
                className="rounded-[8px] px-3 py-2 text-[11px] whitespace-pre-wrap"
                style={{ ...MONO, background: 'oklch(0.97 0.03 28)', border: '1px solid oklch(0.85 0.10 28)', color: 'oklch(0.42 0.18 28)' }}
              >
                {parseError}
              </div>
            )}

            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="self-start px-4 py-2 rounded-[8px] text-[12px] transition-colors disabled:opacity-40 hover:opacity-90"
              style={{ ...MONO, background: '#1a1614', color: '#faf7f1' }}
            >
              Parse &amp; Preview →
            </button>
          </div>

          {/* Right: preview */}
          {preview && (
            <div className="flex flex-col gap-4 p-5 overflow-y-auto" style={{ width: '50%' }}>
              {/* Summary cards */}
              <div className="flex gap-3">
                <div
                  className="flex-1 rounded-[10px] px-4 py-3 text-center"
                  style={{ background: '#f3efe7', border: '1px solid #d6cfbf' }}
                >
                  <div className="text-[28px]" style={{ ...SERIF, color: '#1a1614' }}>
                    {preview.nodes.length}
                  </div>
                  <div className="text-[10px] tracking-widest uppercase" style={{ ...MONO, color: '#9a9088' }}>
                    Nodes
                  </div>
                </div>
                <div
                  className="flex-1 rounded-[10px] px-4 py-3 text-center"
                  style={{ background: '#f3efe7', border: '1px solid #d6cfbf' }}
                >
                  <div className="text-[28px]" style={{ ...SERIF, color: '#1a1614' }}>
                    {preview.prerequisites.length}
                  </div>
                  <div className="text-[10px] tracking-widest uppercase" style={{ ...MONO, color: '#9a9088' }}>
                    Edges
                  </div>
                </div>
                <div
                  className="flex-1 rounded-[10px] px-4 py-3 text-center"
                  style={{ background: '#f3efe7', border: '1px solid #d6cfbf' }}
                >
                  <div className="text-[28px]" style={{ ...SERIF, color: '#1a1614' }}>
                    {preview.nodes.reduce((s, n) => s + (n.estimatedHours ?? 0), 0)}
                  </div>
                  <div className="text-[10px] tracking-widest uppercase" style={{ ...MONO, color: '#9a9088' }}>
                    Total hrs
                  </div>
                </div>
              </div>

              {/* Node list */}
              <div>
                <div className="text-[10px] tracking-[0.1em] uppercase mb-2" style={{ ...MONO, color: '#9a9088' }}>
                  Nodes ({preview.nodes.length})
                </div>
                <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {preview.nodes.map((n, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-[8px]"
                      style={{ background: '#f3efe7', border: '1px solid #ebe6db' }}
                    >
                      <span className="text-[10px] mt-0.5 shrink-0 w-5 text-right" style={{ ...MONO, color: '#c0b8b0' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px]" style={{ ...CURSIVE, color: '#1a1614' }}>
                            {n.title}
                          </span>
                          {n.isBranchingPoint && (
                            <span className="text-[9px] px-1.5 rounded-full" style={{ ...MONO, background: '#1a1614', color: '#faf7f1' }}>
                              🔀 branch
                            </span>
                          )}
                          {n.isConvergencePoint && (
                            <span className="text-[9px] px-1.5 rounded-full" style={{ ...MONO, background: '#3a342e', color: '#faf7f1' }}>
                              ⊕ merge
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <DiffStars level={n.difficultyLevel} />
                          {n.estimatedHours != null && (
                            <span className="text-[10px]" style={{ ...MONO, color: '#9a9088' }}>{n.estimatedHours}h</span>
                          )}
                          {n.branchPath && (
                            <span className="text-[10px]" style={{ ...MONO, color: '#9a9088' }}>{n.branchPath}</span>
                          )}
                          <span className="text-[10px]" style={{ ...MONO, color: '#b0a898' }}>
                            {n.learningOutcomes.length} outcome{n.learningOutcomes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge list */}
              {preview.prerequisites.length > 0 && (
                <div>
                  <div className="text-[10px] tracking-[0.1em] uppercase mb-2" style={{ ...MONO, color: '#9a9088' }}>
                    Edges ({preview.prerequisites.length})
                  </div>
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {preview.prerequisites.map((p, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ ...MONO, color: '#6e645a' }}>
                        <span style={{ color: '#9a9088' }}>{p.requires}</span>
                        <span style={{ color: '#c0b8b0' }}>→</span>
                        <span>{p.node}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success */}
              {importSuccess && (
                <div
                  className="rounded-[8px] px-3 py-2.5 text-[12px]"
                  style={{ ...MONO, background: 'oklch(0.95 0.05 145)', border: '1px solid oklch(0.80 0.10 145)', color: 'oklch(0.35 0.15 145)' }}
                >
                  ✓ Imported {importSuccess.nodes} node{importSuccess.nodes !== 1 ? 's' : ''} and {importSuccess.edges} edge{importSuccess.edges !== 1 ? 's' : ''}.
                  {importWarnings.length > 0 && (
                    <div className="mt-1 text-[11px]" style={{ color: 'oklch(0.50 0.18 60)' }}>
                      {importWarnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
                    </div>
                  )}
                </div>
              )}

              {/* Import error */}
              {importMut.isError && (
                <div
                  className="rounded-[8px] px-3 py-2 text-[11px]"
                  style={{ ...MONO, background: 'oklch(0.97 0.03 28)', border: '1px solid oklch(0.85 0.10 28)', color: 'oklch(0.42 0.18 28)' }}
                >
                  {(importMut.error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Import failed.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 border-t flex justify-between items-center shrink-0"
          style={{ borderColor: '#d6cfbf' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] text-[13px] hover:bg-[#ebe6db] transition-colors"
            style={{ ...CURSIVE, color: '#6e645a' }}
          >
            {importSuccess ? 'Close' : 'Cancel'}
          </button>

          {preview && !importSuccess && (
            <button
              onClick={handleImport}
              disabled={importMut.isPending}
              className="px-5 py-2 rounded-[8px] text-[13px] transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ ...CURSIVE, background: '#1a1614', color: '#faf7f1' }}
            >
              {importMut.isPending
                ? `Importing ${preview.nodes.length} nodes…`
                : `Import ${preview.nodes.length} node${preview.nodes.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
