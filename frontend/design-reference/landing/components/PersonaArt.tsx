import { useMemo } from 'react';

/* ────────────────────────────────────────────────────────────
   PersonaArt — the small illustrative panels inside each persona
   card. Three variants: learner (node row), instructor (heatmap),
   admin (node-and-edge diagram).
──────────────────────────────────────────────────────────────── */

export function PersonaArt({ kind }: { kind: 'learner' | 'instructor' | 'admin' }) {
  if (kind === 'learner') return <LearnerArt />;
  if (kind === 'instructor') return <InstructorArt />;
  return <AdminArt />;
}

function LearnerArt() {
  const cells = ['mastered', 'mastered', 'in_progress', 'review', 'locked'];
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)' }} />
        web-development / roadmap
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, alignContent: 'center' }}>
        {cells.map((s, i) => (
          <div key={i} style={{ height: 32, borderRadius: 5, border: `1.2px solid var(--m-${s})`, background: `color-mix(in srgb, var(--m-${s}) 18%, var(--paper))` }} />
        ))}
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--bone-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '42%', background: 'var(--coral)' }} />
      </div>
    </div>
  );
}

function InstructorArt() {
  // Stable random heatmap — generated once.
  const cells = useMemo(
    () => Array.from({ length: 32 }, () => Math.random()),
    []
  );
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
        <span>cohort · 28 learners</span><span>heatmap</span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridAutoRows: '1fr', gap: 3 }}>
        {cells.map((v, i) => {
          const c = v > 0.7 ? 'var(--m-mastered)' : v > 0.45 ? 'var(--m-progress)' : v > 0.25 ? 'var(--m-review)' : 'var(--m-not)';
          return <div key={i} style={{ background: c, borderRadius: 2, opacity: 0.4 + v * 0.6 }} />;
        })}
      </div>
    </div>
  );
}

function AdminArt() {
  return (
    <svg viewBox="0 0 200 132" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <pattern id="dotsAdmin" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#bdb3a0" />
        </pattern>
      </defs>
      <rect width="200" height="132" fill="url(#dotsAdmin)" opacity="0.6" />
      <g stroke="#8b7e6c" strokeWidth="0.8" fill="none">
        <path d="M40 30 C 70 30, 70 66, 100 66" />
        <path d="M40 90 C 70 90, 70 66, 100 66" />
        <path d="M100 66 C 130 66, 130 30, 160 30" />
        <path d="M100 66 C 130 66, 130 90, 160 90" strokeDasharray="2 2" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="7">
        <rect x="22" y="22" width="36" height="16" rx="3" fill="#fff" stroke="#1a1614" />
        <text x="40" y="33" textAnchor="middle" fill="#1a1614">node A</text>
        <rect x="22" y="82" width="36" height="16" rx="3" fill="#fff" stroke="#1a1614" />
        <text x="40" y="93" textAnchor="middle" fill="#1a1614">node B</text>
        <rect x="82" y="58" width="36" height="16" rx="3" fill="oklch(0.92 0.05 28)" stroke="oklch(0.62 0.18 28)" />
        <text x="100" y="69" textAnchor="middle" fill="oklch(0.42 0.18 28)">branch</text>
        <rect x="142" y="22" width="36" height="16" rx="3" fill="#fff" stroke="#1a1614" />
        <text x="160" y="33" textAnchor="middle" fill="#1a1614">node C</text>
        <rect x="142" y="82" width="36" height="16" rx="3" fill="#fff" stroke="#1a1614" strokeDasharray="2 2" />
        <text x="160" y="93" textAnchor="middle" fill="#1a1614">draft</text>
      </g>
    </svg>
  );
}
