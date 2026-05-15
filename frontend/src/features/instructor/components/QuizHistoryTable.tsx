import type { QuizAttempt } from '@/api/instructor';

const OUTCOME_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  strong_pass:       { label: 'Strong Pass',  color: 'oklch(0.60 0.13 150)', bg: 'color-mix(in srgb, oklch(0.60 0.13 150) 12%, #faf7f1)' },
  marginal_pass:     { label: 'Marginal',     color: 'oklch(0.72 0.13 70)',  bg: 'color-mix(in srgb, oklch(0.72 0.13 70) 12%, #faf7f1)' },
  fail_low:          { label: 'Fail (Low)',   color: 'oklch(0.62 0.18 28)',  bg: 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' },
  fail_fundamental:  { label: 'Fail (Fund.)', color: 'oklch(0.62 0.18 28)',  bg: 'color-mix(in srgb, oklch(0.62 0.18 28) 10%, #faf7f1)' },
  fail_severe:       { label: 'Fail (Sev.)',  color: 'oklch(0.60 0.18 28)',  bg: 'color-mix(in srgb, oklch(0.60 0.18 28) 12%, #faf7f1)' },
};

interface Props { attempts: QuizAttempt[] }

export function QuizHistoryTable({ attempts }: Props) {
  if (attempts.length === 0) {
    return <p className="text-[14px] py-4 text-center italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>No quiz attempts yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #e8e2d9' }}>
            {['Date', 'Node', 'Type', 'Score', 'Outcome'].map((h) => (
              <th key={h} className="px-4 py-3 text-[11px] tracking-[0.08em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088', fontWeight: 500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => {
            const os = OUTCOME_STYLE[a.outcome] ?? { label: a.outcome, color: '#9a9088', bg: '#f3efe7' };
            const score = Number(a.scorePercent);
            return (
              <tr key={a.id} style={{ borderBottom: '1px solid #ebe6db' }}>
                <td className="px-4 py-3 text-[12px] font-mono" style={{ color: '#9a9088' }}>
                  {new Date(a.completedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
                  {a.node.title}
                </td>
                <td className="px-4 py-3 text-[11px] font-mono" style={{ color: '#9a9088' }}>
                  {a.quiz.isMicroQuiz ? 'micro' : 'full'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[13px] font-mono"
                    style={{ color: score >= 80 ? 'oklch(0.60 0.13 150)' : score >= 60 ? 'oklch(0.72 0.13 70)' : 'oklch(0.62 0.18 28)' }}
                  >
                    {score.toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full font-mono"
                    style={{ color: os.color, background: os.bg }}
                  >
                    {os.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
