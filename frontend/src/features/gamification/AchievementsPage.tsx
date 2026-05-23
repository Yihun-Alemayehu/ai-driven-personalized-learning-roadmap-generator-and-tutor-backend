import {
  TrophyIcon,
  ZapIcon,
  HistoryIcon,
  TargetIcon,
} from 'lucide-react';
import { useGamificationQuery, XP_SOURCE_LABELS } from '@/api/gamification';
import { XpBar } from './components/XpBar';
import { StreakBadge } from './components/StreakBadge';
import { BadgeGrid } from './components/BadgeGrid';
import { WeeklyGoalCard } from './components/WeeklyGoalCard';

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span style={{ color: 'oklch(0.62 0.18 28)' }}>{icon}</span>
        <h2
          className="text-[20px] font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ── Recent XP feed ────────────────────────────────────────────────────────────

function XpFeed({
  events,
}: {
  events: { source: string; amount: number; createdAt: string }[];
}) {
  if (events.length === 0) {
    return (
      <div
        className="text-center py-8 text-[13px]"
        style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
      >
        No XP events yet — take a quiz to start earning!
      </div>
    );
  }
  return (
    <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: '#d6cfbf' }}>
      {events.map((e, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderBottom: i < events.length - 1 ? '1px solid #e8e2d9' : undefined,
            background: i % 2 === 0 ? '#faf7f1' : '#f3efe7',
          }}
        >
          <div className="flex items-center gap-2">
            <ZapIcon size={12} style={{ color: 'oklch(0.62 0.18 28)', flexShrink: 0 }} />
            <span
              className="text-[13px]"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}
            >
              {XP_SOURCE_LABELS[e.source as keyof typeof XP_SOURCE_LABELS] ?? e.source}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] font-medium"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.52 0.18 28)' }}
            >
              +{e.amount} XP
            </span>
            <span
              className="text-[10px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
            >
              {new Date(e.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[10px] animate-pulse ${className ?? ''}`}
      style={{ background: '#e8e2d9' }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const { data, isLoading, isError } = useGamificationQuery();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="flex flex-col h-full overflow-y-auto"
        style={{ background: '#faf7f1' }}
      >
        <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#e8e2d9' }}>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="px-8 py-8 flex flex-col gap-8 max-w-3xl w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="sm:col-span-2 h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-56" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div
        className="flex flex-col h-full overflow-y-auto items-center justify-center"
        style={{ background: '#faf7f1' }}
      >
        <p
          className="text-[15px]"
          style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
        >
          Could not load achievements. Try refreshing.
        </p>
      </div>
    );
  }

  const earnedCount = data.badges.earned.length;

  // ── Loaded ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: '#faf7f1' }}
    >
      {/* ── Sticky page header ────────────────────────────────────────────── */}
      <div
        className="px-8 pt-8 pb-6 border-b shrink-0"
        style={{ borderColor: '#e8e2d9', background: '#faf7f1' }}
      >
        <div
          className="text-[9px] tracking-[0.18em] uppercase mb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
        >
          Gamification
        </div>
        <h1
          className="text-[32px] font-medium leading-tight tracking-[-0.015em]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          Achievements
        </h1>
        <p className="text-[14px] mt-1" style={{ color: '#6e645a' }}>
          Level {data.xp.level} · {data.xp.total.toLocaleString()} XP ·{' '}
          {earnedCount} badge{earnedCount !== 1 ? 's' : ''} earned ·{' '}
          {data.streak.current}-day streak
        </p>
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="px-8 py-8 flex flex-col gap-10 max-w-3xl w-full mx-auto">

        {/* XP card + Streak card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="sm:col-span-2 rounded-[14px] border px-5 py-4"
            style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
          >
            <XpBar xp={data.xp} variant="full" />
          </div>
          <StreakBadge current={data.streak.current} variant="full" />
        </div>

        {/* Weekly goal */}
        <Section icon={<TargetIcon size={18} />} title="Weekly Goal">
          <WeeklyGoalCard goal={data.weeklyGoal} variant="full" />
        </Section>

        {/* Badges */}
        <Section icon={<TrophyIcon size={18} />} title="Badges">
          <BadgeGrid badges={data.badges.all} />
        </Section>

        {/* Recent XP history */}
        <Section icon={<HistoryIcon size={18} />} title="Recent XP">
          <XpFeed events={data.recentXpEvents} />
        </Section>

        {/* bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}
