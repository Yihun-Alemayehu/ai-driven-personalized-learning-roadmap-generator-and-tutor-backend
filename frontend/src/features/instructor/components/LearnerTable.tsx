import { useNavigate } from 'react-router-dom';
import type { InstructorEnrollment } from '@/api/instructor';

interface LearnerTableProps {
  learners: InstructorEnrollment[];
  search: string;
}

function MasteryBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? 'oklch(0.60 0.13 150)' : pct >= 40 ? 'oklch(0.72 0.13 70)' : 'oklch(0.62 0.18 28)';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-mono" style={{ color: '#6e645a' }}>{pct.toFixed(0)}%</span>
    </div>
  );
}

export function LearnerTable({ learners, search }: LearnerTableProps) {
  const navigate = useNavigate();

  const filtered = search.trim()
    ? learners.filter(
        (l) =>
          l.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
          l.user.email.toLowerCase().includes(search.toLowerCase()),
      )
    : learners;

  if (filtered.length === 0) {
    return (
      <div className="py-10 text-center" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
        {search ? 'No learners match your search.' : 'No learners enrolled yet.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid #e8e2d9' }}>
            {['Name', 'Email', 'Domain', 'Mastery', 'Enrolled'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[11px] tracking-[0.08em] uppercase"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088', fontWeight: 500 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => {
            const total = e._count.nodeProgress;
            return (
              <tr
                key={e.id}
                onClick={() => navigate(`/instructor/learners/${e.user.id}`)}
                className="cursor-pointer transition-colors hover:bg-[#f3efe7]"
                style={{ borderBottom: '1px solid #ebe6db' }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full grid place-items-center text-[12px] font-medium shrink-0"
                      style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {e.user.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
                      {e.user.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] font-mono" style={{ color: '#6e645a' }}>
                  {e.user.email}
                </td>
                <td className="px-4 py-3 text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                  {e.domain.name}
                </td>
                <td className="px-4 py-3">
                  <MasteryBar pct={total > 0 ? 0 : 0} />
                </td>
                <td className="px-4 py-3 text-[12px] font-mono" style={{ color: '#9a9088' }}>
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
