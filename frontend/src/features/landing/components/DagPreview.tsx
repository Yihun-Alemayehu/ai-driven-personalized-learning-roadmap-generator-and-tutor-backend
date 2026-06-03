import { useEffect, useRef, useState } from 'react';

/* ────────────────────────────────────────────────────────────
   DagPreview — the interactive hero graph.
   Nodes are positioned with % coords inside a fixed-ratio stage;
   edges are drawn into an SVG (0–100 viewBox) after layout/font
   settle; a tooltip follows the hovered node.
──────────────────────────────────────────────────────────────── */

type State = 'not_started' | 'in_progress' | 'mastered' | 'review_needed' | 'relearn' | 'locked';

interface DagNode {
  id: string;
  label: string;
  state: State;
  left: string;
  top: string;
  branching?: boolean;
  badge?: 'check' | 'lock';
  stateLabel: string;
  title: string;
  hours: string;
  score: string;
  desc: string;
}

const NODES: DagNode[] = [
  { id: 'html',    label: 'HTML',       state: 'mastered',      left: '16%', top: '16%', badge: 'check', stateLabel: 'mastered',    title: 'HTML & Semantics', hours: '6h',     score: '92%', desc: 'Document structure, semantic elements, forms, accessibility.' },
  { id: 'css',     label: 'CSS',        state: 'mastered',      left: '16%', top: '44%', badge: 'check', stateLabel: 'mastered',    title: 'CSS Foundations',  hours: '9h',     score: '88%', desc: 'Box model, flexbox, grid, custom properties, responsive design.' },
  { id: 'js',      label: 'JavaScript', state: 'in_progress',   left: '50%', top: '30%',                 stateLabel: 'in progress', title: 'JavaScript Core',  hours: '14h',    score: '71%', desc: 'Variables, control flow, async, modules. Quiz unlocks Frameworks.' },
  { id: 'git',     label: 'Git basics', state: 'review_needed', left: '50%', top: '60%',                 stateLabel: 'review',      title: 'Version Control',  hours: '4h',     score: '62%', desc: 'Commits, branches, merge, rebase, conflict resolution.' },
  { id: 'branch',  label: 'Framework',  state: 'not_started',   left: '78%', top: '30%', branching: true, stateLabel: 'branching',  title: 'Pick a framework', hours: 'branch', score: '—',   desc: 'Choose a specialisation: Frontend, Backend, or Data.' },
  { id: 'react',   label: 'React',      state: 'locked',        left: '86%', top: '60%', badge: 'lock',  stateLabel: 'locked',      title: 'React',            hours: '—',      score: '—',   desc: 'Unlocks after the framework branching point.' },
  { id: 'testing', label: 'Testing',    state: 'locked',        left: '86%', top: '86%', badge: 'lock',  stateLabel: 'locked',      title: 'Testing',          hours: '—',      score: '—',   desc: 'Unit, integration and E2E testing.' },
];

const EDGES: [string, string][] = [
  ['html', 'js'], ['css', 'js'],
  ['css', 'git'], ['js', 'branch'],
  ['git', 'branch'],
  ['branch', 'react'], ['branch', 'testing'],
  ['react', 'testing'],
];

const PILLS = ['Frontend', 'Backend', 'Data'];

export function DagPreview() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePill, setActivePill] = useState('Frontend');
  const [tip, setTip] = useState<{ node: DagNode; x: number; y: number } | null>(null);

  // Draw curved edges into the SVG once the stage has laid out.
  useEffect(() => {
    const draw = () => {
      const stage = stageRef.current;
      const svg = svgRef.current;
      if (!stage || !svg) return;
      const sr = stage.getBoundingClientRect();
      const center = (id: string) => {
        const el = stage.querySelector<HTMLElement>(`[data-node="${id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: ((r.left + r.width / 2) - sr.left) / sr.width * 100,
          y: ((r.top + r.height / 2) - sr.top) / sr.height * 100,
        };
      };
      let out = '';
      for (const [a, b] of EDGES) {
        const A = center(a), B = center(b);
        if (!A || !B) continue;
        const mx = (A.x + B.x) / 2;
        const locked = NODES.find((n) => n.id === b)?.state === 'locked';
        out += `<path d="M ${A.x} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${B.x} ${B.y}" fill="none" stroke="${locked ? '#c2b9a6' : '#8b7e6c'}" stroke-width="${locked ? 0.35 : 0.45}" stroke-dasharray="${locked ? '1.2 1.2' : '0'}" vector-effect="non-scaling-stroke" opacity="0.7" />`;
      }
      svg.innerHTML = out;
    };

    draw();
    window.addEventListener('resize', draw);
    // Re-draw after fonts settle (node sizes can shift).
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  const showTip = (node: DagNode, e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = e.currentTarget.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    setTip({ node, x: (r.left + r.width / 2) - sr.left, y: r.top - sr.top });
  };

  return (
    <div className="dag-card">
      <div className="dag-card-head">
        <div className="dag-tab"><span className="mono">enrollment / roadmap</span></div>
        <div className="dag-tab-pills">
          {PILLS.map((p) => (
            <span
              key={p}
              className={`dag-pill${activePill === p ? ' active' : ''}`}
              onClick={() => setActivePill(p)}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="dag-stage" ref={stageRef}>
        <svg ref={svgRef} preserveAspectRatio="none" viewBox="0 0 100 100" />

        {NODES.map((n) => (
          <div
            key={n.id}
            className={`dag-node${n.branching ? ' branching' : ''}`}
            data-state={n.state}
            data-node={n.id}
            style={{ left: n.left, top: n.top }}
            onMouseEnter={(e) => showTip(n, e)}
            onMouseLeave={() => setTip(null)}
          >
            {n.branching ? <span>{n.label}</span> : n.label}
            <span className="state">{n.stateLabel}</span>
            {n.badge === 'check' && <span className="check">✓</span>}
            {n.badge === 'lock' && <span className="lock">⌬</span>}
          </div>
        ))}

        <div
          className={`dag-tip${tip ? ' show' : ''}`}
          style={tip ? { left: tip.x, top: tip.y } : undefined}
        >
          <strong>{tip?.node.title}</strong>
          <div>{tip?.node.desc}</div>
          <div className="row"><span>state</span><span>{tip?.node.state}</span></div>
          <div className="row"><span>est. hours</span><span>{tip?.node.hours}</span></div>
          <div className="row"><span>best score</span><span>{tip?.node.score}</span></div>
        </div>
      </div>

      <div className="dag-card-foot">
        <div className="dag-progress">
          <span>Progress</span>
          <div className="dag-bar"><i /></div>
          <span className="dag-foot-pct">42%</span>
        </div>
        <div className="dag-tab"><span className="mono">12 / 28 nodes</span></div>
      </div>
    </div>
  );
}
