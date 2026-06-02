/* ────────────────────────────────────────────────────────────
   LegendStrip — the five mastery states, rendered declaratively.
──────────────────────────────────────────────────────────────── */

const LEGEND = [
  { state: 'not_started',   label: 'Not started',   desc: 'Visible but unattempted.',        color: 'var(--m-not)' },
  { state: 'in_progress',   label: 'In progress',   desc: 'Quiz attempted, score < pass.',   color: 'var(--m-progress)' },
  { state: 'mastered',      label: 'Mastered',      desc: 'Strong-pass on the gatekeeper.',  color: 'var(--m-mastered)' },
  { state: 'review_needed', label: 'Review needed', desc: 'Decay timer expired — pulses.',   color: 'var(--m-review)' },
  { state: 'relearn',       label: 'Relearn',       desc: 'Fundamental fail — rewinds.',     color: 'var(--m-relearn)' },
];

export function LegendStrip() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0,
        marginTop: 28,
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--paper)',
      }}
    >
      {LEGEND.map((l, i) => (
        <div key={l.state} style={{ padding: '22px 20px', borderRight: i < 4 ? '1px solid var(--hairline)' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid color-mix(in srgb, ${l.color} 70%, black)` }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>{l.state}</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, marginTop: 8, letterSpacing: '-0.005em' }}>{l.label}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>{l.desc}</div>
        </div>
      ))}
    </div>
  );
}
