import type { LearningInsights } from '@/api/progress';

const FAMILIARITY_LABELS: Record<string, string> = {
  beginner: 'Beginner — new to the field',
  intermediate: 'Intermediate — some experience',
  advanced: 'Advanced — solid foundation',
};

const GOAL_LABELS: Record<string, { icon: string; label: string }> = {
  get_job:       { icon: '💼', label: 'Get a job' },
  upskill:       { icon: '📈', label: 'Upskill at work' },
  hobby:         { icon: '🎯', label: 'Personal interest' },
  certification: { icon: '🏆', label: 'Certification' },
};

const STYLE_LABELS: Record<string, { icon: string; label: string }> = {
  visual:   { icon: '🖼', label: 'Visual learner' },
  reading:  { icon: '📖', label: 'Reading / text' },
  hands_on: { icon: '🛠', label: 'Hands-on practice' },
  video:    { icon: '🎬', label: 'Video content' },
};

const BRANCH_LABELS: Record<string, string> = {
  frontend:     'Frontend',
  backend:      'Backend',
  data_science: 'Data Science',
};

interface ProfileRowProps {
  icon: string;
  label: string;
  value: string;
}

function ProfileRow({ icon, label, value }: ProfileRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-b-0" style={{ borderColor: '#e8e2d9' }}>
      <span className="text-[16px] mt-0.5 w-6 text-center shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
          {label}
        </div>
        <div className="text-[14px] leading-snug" style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

export function ProfileCard({ profile }: { profile: LearningInsights['profile'] }) {
  const rows: ProfileRowProps[] = [];

  if (profile.familiarityLevel) {
    rows.push({
      icon: '🎓',
      label: 'Experience level',
      value: FAMILIARITY_LABELS[profile.familiarityLevel] ?? profile.familiarityLevel,
    });
  }

  if (profile.learningGoal) {
    const g = GOAL_LABELS[profile.learningGoal];
    rows.push({
      icon: g?.icon ?? '🎯',
      label: 'Learning goal',
      value: g?.label ?? profile.learningGoal,
    });
  }

  if (profile.weeklyHours) {
    rows.push({
      icon: '⏱',
      label: 'Weekly commitment',
      value: `${profile.weeklyHours} hours per week`,
    });
  }

  if (profile.preferredLearningStyle) {
    const s = STYLE_LABELS[profile.preferredLearningStyle];
    rows.push({
      icon: s?.icon ?? '📚',
      label: 'Learning style',
      value: s?.label ?? profile.preferredLearningStyle,
    });
  }

  if (profile.selectedBranchPath) {
    rows.push({
      icon: '🌿',
      label: 'Selected path',
      value: BRANCH_LABELS[profile.selectedBranchPath] ?? profile.selectedBranchPath,
    });
  }

  if (profile.priorSkills) {
    const skills = profile.priorSkills
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    rows.push({
      icon: '✓',
      label: 'Prior skills',
      value: skills.join(', '),
    });
  }

  if (profile.aboutSelf) {
    rows.push({
      icon: '👤',
      label: 'About',
      value: profile.aboutSelf.length > 180 ? profile.aboutSelf.slice(0, 180) + '…' : profile.aboutSelf,
    });
  }

  if (rows.length === 0) {
    return (
      <div
        className="rounded-[14px] border px-5 py-8 flex items-center justify-center text-center"
        style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
      >
        <p className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
          No profile information provided at enrollment.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] border px-5 py-2"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      {rows.map((row) => (
        <ProfileRow key={row.label} {...row} />
      ))}
    </div>
  );
}
