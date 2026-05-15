import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfileMutation } from '@/api/auth';
import { useEnrollmentsQuery } from '@/api/enrollments';
import { useProgressStatsQuery } from '@/api/progress';
import { getDomainMeta } from '@/features/catalog/lib/domainIcons';
import type { EnrollmentWithCounts } from '@/api/enrollments';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  learner:       'Learner',
  instructor:    'Instructor',
  admin:         'Admin',
  domain_expert: 'Domain Expert',
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin:         { bg: 'oklch(0.88 0.08 285)', color: 'oklch(0.35 0.15 285)' },
  instructor:    { bg: 'oklch(0.90 0.08 200)', color: 'oklch(0.35 0.12 200)' },
  domain_expert: { bg: 'oklch(0.90 0.08 145)', color: 'oklch(0.35 0.12 145)' },
  learner:       { bg: '#ebe6db', color: '#6e645a' },
};

const FAMILIARITY_LABELS: Record<string, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
};

const GOAL_LABELS: Record<string, string> = {
  get_job:       'Get a job',
  upskill:       'Upskill',
  hobby:         'Personal interest',
  certification: 'Certification',
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'Amharic' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Small reusable pieces ─────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] tracking-[0.12em] uppercase mb-4"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[11px] tracking-[0.08em] uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[10px] tracking-[0.08em] uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
      >
        {label}
      </span>
      <span className="text-[13px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
        {value}
      </span>
    </div>
  );
}

// ── Enrollment preference card ────────────────────────────────────────────────

function EnrollmentPreferenceCard({ enrollment }: { enrollment: EnrollmentWithCounts }) {
  const meta = getDomainMeta(enrollment.domain.slug);
  const { data: stats } = useProgressStatsQuery(enrollment.id);

  const completionPct = stats?.completionPercent ?? 0;
  const mastered = stats?.masteredCount ?? 0;
  const total = stats?.totalNodes ?? enrollment._count.nodeProgress ?? 0;

  const hasPrefs = enrollment.familiarityLevel || enrollment.learningGoal ||
    enrollment.weeklyHours != null || enrollment.aboutSelf;

  return (
    <div
      className="border rounded-[14px] overflow-hidden"
      style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
    >
      {/* Domain header row */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b"
        style={{ borderColor: '#ebe6db', background: '#f3efe7' }}
      >
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[16px] shrink-0"
          style={{ background: meta.color }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[15px] font-medium leading-snug truncate"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            {enrollment.domain.name}
          </div>
          {enrollment.selectedBranchPath && (
            <div
              className="text-[11px] capitalize"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              {enrollment.selectedBranchPath.replace('_', ' ')} path
            </div>
          )}
        </div>
        <Link
          to={`/enrollments/${enrollment.id}/roadmap`}
          className="text-[12px] px-3 py-1.5 rounded-[8px] hover:opacity-90 transition-opacity shrink-0"
          style={{ background: '#1a1614', color: '#faf7f1', fontFamily: 'JetBrains Mono, monospace' }}
        >
          Roadmap →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[11px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            {mastered} / {total} nodes mastered
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.50 0.15 145)' }}
          >
            {completionPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(completionPct, completionPct > 0 ? 2 : 0)}%`, background: 'oklch(0.62 0.18 28)' }}
          />
        </div>
      </div>

      {/* Preferences */}
      <div className="px-5 pt-2 pb-4">
        {hasPrefs ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {enrollment.familiarityLevel && (
              <Pref label="Starting level" value={FAMILIARITY_LABELS[enrollment.familiarityLevel] ?? enrollment.familiarityLevel} />
            )}
            {enrollment.learningGoal && (
              <Pref label="Goal" value={GOAL_LABELS[enrollment.learningGoal] ?? enrollment.learningGoal} />
            )}
            {enrollment.weeklyHours != null && (
              <Pref label="Weekly hours" value={`${enrollment.weeklyHours}h / week`} />
            )}
            {enrollment.aboutSelf && (
              <div className="col-span-2">
                <Pref label="About yourself" value={enrollment.aboutSelf} />
              </div>
            )}
          </div>
        ) : (
          <p
            className="text-[13px] italic mt-1"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#b0a898' }}
          >
            No preferences recorded at enrollment.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollmentsQuery();
  const update = useUpdateProfileMutation();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [language, setLanguage] = useState(user?.preferredLanguage ?? 'en');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAvatarUrl(user.avatarUrl ?? '');
      setLanguage(user.preferredLanguage ?? 'en');
    }
  }, [user?.id]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload: { fullName?: string; avatarUrl?: string | null; preferredLanguage?: string } = {};
    if (fullName !== user?.fullName) payload.fullName = fullName;
    const currentAvatar = user?.avatarUrl ?? '';
    if (avatarUrl !== currentAvatar) payload.avatarUrl = avatarUrl || null;
    if (language !== (user?.preferredLanguage ?? 'en')) payload.preferredLanguage = language;
    if (Object.keys(payload).length === 0) return;

    update.mutate(payload, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    });
  }

  const roleStyle = ROLE_COLORS[user?.role ?? 'learner'];
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-7 max-w-2xl">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <div
          className="border rounded-[16px] p-6 flex items-center gap-5"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: '#d6cfbf' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-[24px] font-medium select-none"
              style={{
                background: 'oklch(0.90 0.06 60)',
                color: 'oklch(0.40 0.10 60)',
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {user ? initials(user.fullName) : '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-[26px] leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
              >
                {user?.fullName}
              </h1>
              {user?.role && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: roleStyle.bg, color: roleStyle.color, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              )}
            </div>
            <p
              className="text-[13px] mt-1"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              {user?.email}
            </p>
            {joined && (
              <p
                className="text-[13px] mt-0.5"
                style={{ fontFamily: "'Crimson Pro', serif", color: '#b0a898' }}
              >
                Member since {joined}
              </p>
            )}
          </div>
        </div>

        {/* ── Account settings ──────────────────────────────────────────── */}
        <div
          className="border rounded-[16px] p-6"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}
        >
          <SectionHeader>Account Settings</SectionHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Field label="Display name">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 px-3.5 rounded-[8px] border outline-none w-full transition-colors focus:border-[oklch(0.62_0.18_28)]"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614', fontSize: 15 }}
                placeholder="Your full name"
              />
            </Field>

            <Field label="Avatar URL">
              <div className="flex gap-2 items-center">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 border"
                    style={{ borderColor: '#d6cfbf' }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-[8px] border outline-none transition-colors focus:border-[oklch(0.62_0.18_28)]"
                  style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', fontSize: 12 }}
                  placeholder="https://…"
                />
              </div>
            </Field>

            <Field label="Preferred Language">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-10 px-3.5 rounded-[8px] border outline-none w-full transition-colors focus:border-[oklch(0.62_0.18_28)]"
                style={{ borderColor: '#d6cfbf', background: '#fff', fontFamily: "'Crimson Pro', serif", color: '#1a1614', fontSize: 15 }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={update.isPending}
                className="px-5 py-2 rounded-[8px] text-[14px] transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#1a1614', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
              >
                {update.isPending ? 'Saving…' : 'Save changes'}
              </button>
              {saved && (
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.50 0.14 145)' }}
                >
                  ✓ Saved
                </span>
              )}
              {update.isError && (
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.50 0.18 28)' }}
                >
                  Failed to save — try again
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ── Roadmap preferences ───────────────────────────────────────── */}
        <div>
          <SectionHeader>Roadmap Preferences</SectionHeader>
          <p
            className="text-[13px] -mt-2 mb-4"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
          >
            Captured at enrollment — these guide how the AI tailors your learning experience for each domain.
          </p>

          {enrollmentsLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-[14px]" style={{ background: '#ebe6db' }} />
              ))}
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {enrollments.map((e) => (
                <EnrollmentPreferenceCard key={e.id} enrollment={e} />
              ))}
            </div>
          ) : (
            <div
              className="border rounded-[14px] px-8 py-10 text-center"
              style={{ borderColor: '#d6cfbf', borderStyle: 'dashed', background: '#f3efe7' }}
            >
              <p
                className="text-[16px] italic"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#6e645a' }}
              >
                No enrollments yet.
              </p>
              <Link
                to="/catalog"
                className="inline-block mt-3 text-[13px] underline"
                style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.62 0.18 28)' }}
              >
                Browse the catalog →
              </Link>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
