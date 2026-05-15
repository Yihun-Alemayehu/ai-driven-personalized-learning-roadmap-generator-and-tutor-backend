import type { LearnerProgressEnrollment } from '@/api/instructor';

const STATE_ICON: Record<string, string> = {
  mastered:      '✓',
  in_progress:   '◑',
  review_needed: '⚠',
  not_started:   '○',
  relearn:       '↻',
  locked:        '🔒',
};

const STATE_COLOR: Record<string, string> = {
  mastered:      'oklch(0.60 0.13 150)',
  in_progress:   'oklch(0.55 0.13 250)',
  review_needed: 'oklch(0.72 0.13 70)',
  not_started:   '#9a9088',
  relearn:       'oklch(0.62 0.18 28)',
  locked:        '#c2b9a6',
};

const STATE_ORDER = ['mastered', 'in_progress', 'review_needed', 'relearn', 'not_started', 'locked'];
const STATE_LABEL: Record<string, string> = {
  mastered:      'Mastered',
  in_progress:   'In Progress',
  review_needed: 'Review Needed',
  not_started:   'Not Started',
  relearn:       'Relearn',
  locked:        'Locked',
};

interface Props {
  enrollments: LearnerProgressEnrollment[];
}

export function LearnerProgressTree({ enrollments }: Props) {
  if (enrollments.length === 0) {
    return <p className="text-[14px] py-4" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>No enrollments found.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {enrollments.map((enrollment) => {
        const byState: Record<string, typeof enrollment.nodeProgress> = {};
        for (const np of enrollment.nodeProgress) {
          (byState[np.masteryState] ??= []).push(np);
        }

        return (
          <div key={enrollment.id}>
            <h3
              className="text-[16px] font-medium mb-4 pb-2 border-b"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614', borderColor: '#e8e2d9' }}
            >
              {enrollment.domain.name}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {STATE_ORDER.filter((s) => (byState[s]?.length ?? 0) > 0).map((state) => (
                <div key={state}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[12px]" style={{ color: STATE_COLOR[state] }}>{STATE_ICON[state]}</span>
                    <span
                      className="text-[11px] tracking-[0.08em] uppercase"
                      style={{ fontFamily: 'JetBrains Mono, monospace', color: STATE_COLOR[state] }}
                    >
                      {STATE_LABEL[state]} ({byState[state].length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {byState[state].map((np) => (
                      <div key={np.node.id} className="flex items-center justify-between gap-2 py-1 px-2 rounded-[6px]" style={{ background: '#f3efe7' }}>
                        <span className="text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
                          {np.node.title}
                        </span>
                        {np.bestQuizScore && (
                          <span className="text-[11px] font-mono shrink-0" style={{ color: '#9a9088' }}>
                            {Number(np.bestQuizScore).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
