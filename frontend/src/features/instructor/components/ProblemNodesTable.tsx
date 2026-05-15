import type { NodeAnalytic } from '@/api/instructor';

interface Props { nodes: NodeAnalytic[] }

export function ProblemNodesTable({ nodes }: Props) {
  if (nodes.length === 0) {
    return <p className="text-[14px] py-4 italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>No data yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #e8e2d9' }}>
            {['Node', 'Learners', 'Mastery', 'Avg Score', 'Avg Attempts'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088', fontWeight: 500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nodes.map((n) => (
            <tr key={n.nodeId} style={{ borderBottom: '1px solid #ebe6db' }}>
              <td className="px-4 py-2.5 flex items-center gap-2">
                {n.masteryRate < 40 && <span className="text-[12px]" style={{ color: 'oklch(0.62 0.18 28)' }}>⚠</span>}
                <span className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>{n.title}</span>
              </td>
              <td className="px-4 py-2.5 text-[12px] font-mono" style={{ color: '#6e645a' }}>{n.learnerCount}</td>
              <td className="px-4 py-2.5">
                <span
                  className="text-[13px] font-mono font-semibold"
                  style={{ color: n.masteryRate >= 70 ? 'oklch(0.60 0.13 150)' : n.masteryRate >= 40 ? 'oklch(0.72 0.13 70)' : 'oklch(0.62 0.18 28)' }}
                >
                  {n.masteryRate.toFixed(0)}%
                </span>
              </td>
              <td className="px-4 py-2.5 text-[12px] font-mono" style={{ color: '#6e645a' }}>
                {n.avgQuizScore != null ? `${n.avgQuizScore.toFixed(0)}%` : '—'}
              </td>
              <td className="px-4 py-2.5 text-[12px] font-mono" style={{ color: '#6e645a' }}>
                {n.avgAttempts.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
