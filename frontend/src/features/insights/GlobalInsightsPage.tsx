import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useGlobalActivityQuery, useGlobalInsightsQuery } from '@/api/progress';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { TopAchievementsPanel } from './components/TopAchievementsPanel';
import type { GlobalInsights } from '@/api/progress';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[13px] tracking-[0.12em] uppercase mb-4"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </h2>
  );
}

function StatBox({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-[12px] border px-5 py-4"
      style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
    >
      <span
        className="text-[32px] leading-none tracking-[-0.02em] font-medium"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: accent ?? 'oklch(0.62 0.18 28)' }}
      >
        {value}
      </span>
      <span
        className="text-[11px] tracking-[0.06em] uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {label}
      </span>
    </div>
  );
}

function MomentumBanner({ momentum }: { momentum: GlobalInsights['momentum'] }) {
  const { trend, recentMasteries, prevMasteries } = momentum;

  const icon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const color =
    trend === 'up'
      ? 'oklch(0.55 0.12 150)'
      : trend === 'down'
      ? 'oklch(0.62 0.18 28)'
      : '#6e645a';
  const msg =
    trend === 'up'
      ? `${recentMasteries} masteries this week — up from ${prevMasteries} last week`
      : trend === 'down'
      ? `${recentMasteries} masteries this week — down from ${prevMasteries} last week`
      : `${recentMasteries} masteries this week — steady pace`;

  return (
    <div
      className="flex items-center gap-3 rounded-[10px] border px-4 py-3"
      style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
    >
      <span className="text-[20px] leading-none" style={{ color }}>
        {icon}
      </span>
      <span className="text-[14px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#3a342e' }}>
        {msg}
      </span>
    </div>
  );
}

function EnrollmentCard({
  breakdown,
}: {
  breakdown: GlobalInsights['enrollmentBreakdowns'][number];
}) {
  const navigate = useNavigate();
  const completion = breakdown.completionPercent;

  return (
    <button
      onClick={() => navigate(`/enrollments/${breakdown.enrollmentId}/roadmap`)}
      className="w-full rounded-[14px] border overflow-hidden text-left transition-all hover:border-stone-400 hover:shadow-sm"
      style={{ background: '#f3efe7', borderColor: '#d6cfbf' }}
    >
      {/* Progress bar strip at top */}
      <div className="h-[5px]" style={{ background: '#ebe6db' }}>
        <div
          className="h-full transition-[width] duration-500"
          style={{
            width: `${completion}%`,
            background:
              completion >= 80
                ? 'oklch(0.55 0.12 150)'
                : completion >= 40
                ? 'oklch(0.62 0.18 28)'
                : '#b0a898',
          }}
        />
      </div>
      <div className="px-4 py-4">
        <div
          className="text-[17px] font-medium leading-tight mb-2 truncate"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          {breakdown.domain.name}
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-[13px]"
            style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
          >
            {breakdown.masteredNodes} / {breakdown.totalNodes} mastered
          </span>
          <span
            className="text-[22px] leading-none tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'oklch(0.62 0.18 28)' }}
          >
            {completion}%
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {breakdown.avgScore !== null && (
            <span
              className="text-[11px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.55 0.12 150)' }}
            >
              avg {Math.round(breakdown.avgScore)}% quiz
            </span>
          )}
          {breakdown.lastActiveAt && (
            <span
              className="text-[11px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              {formatDistanceToNow(new Date(breakdown.lastActiveAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function GlobalWeakNodesPanel({
  nodes,
}: {
  nodes: GlobalInsights['globalWeakNodes'];
}) {
  const navigate = useNavigate();

  if (nodes.length === 0) {
    return (
      <div
        className="rounded-[14px] border px-4 py-8 text-center"
        style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
      >
        <div className="text-[13px]" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}>
          No knowledge decay detected — great work!
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: '#e8e2d9' }}
      >
        <span style={{ color: 'oklch(0.62 0.18 28)', fontSize: 13 }}>⚠</span>
        <span
          className="text-[11px] tracking-[0.1em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          Needs review
        </span>
      </div>
      <div className="flex flex-col">
        {nodes.map((node) => (
          <button
            key={`${node.nodeId}-${node.enrollmentId}`}
            onClick={() => navigate(`/enrollments/${node.enrollmentId}/roadmap`)}
            className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 text-left hover:bg-[#ebe6db] transition-colors"
            style={{ borderColor: '#e8e2d9' }}
          >
            <div className="flex-1 min-w-0">
              <div
                className="text-[14px] font-medium truncate"
                style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
              >
                {node.title}
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
              >
                {node.domainName} · {node.masteryState.replace('_', ' ')}
              </div>
            </div>
            {node.difficultyLevel != null && (
              <div className="flex gap-0.5 shrink-0 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: s <= (node.difficultyLevel ?? 0) ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoadingShimmer() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <span className="text-[12px] font-mono animate-pulse" style={{ color: '#9a9088' }}>
        loading insights…
      </span>
    </div>
  );
}

export default function GlobalInsightsPage() {
  const { data: activityDays, isLoading: activityLoading } = useGlobalActivityQuery();
  const { data: insights, isLoading: insightsLoading } = useGlobalInsightsQuery();

  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumbStore();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Insights' }]);
    return () => clearBreadcrumbs();
  }, [setBreadcrumbs, clearBreadcrumbs]);

  if (insightsLoading || activityLoading) return <LoadingShimmer />;
  if (!insights) return <LoadingShimmer />;

  const { overallStats, momentum, streakSummary, enrollmentBreakdowns, globalWeakNodes, globalTopNodes } =
    insights;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: '#faf7f1', fontFamily: "'Crimson Pro', Georgia, serif", color: '#1a1614' }}
    >
      {/* Page header */}
      <div
        className="px-8 pt-8 pb-6 border-b"
        style={{ borderColor: '#e8e2d9', background: '#faf7f1' }}
      >
        <div
          className="text-[11px] tracking-[0.12em] uppercase mb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          Account Overview
        </div>
        <h1
          className="text-[32px] font-medium leading-tight tracking-[-0.015em]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          Your Learning Insights
        </h1>
        <p className="text-[14px] mt-1" style={{ color: '#6e645a' }}>
          {insights.totalEnrollments} enrolled course{insights.totalEnrollments !== 1 ? 's' : ''} ·{' '}
          {overallStats.masteredNodes} nodes mastered overall
        </p>
      </div>

      <div className="px-8 py-8 flex flex-col gap-10 max-w-5xl w-full mx-auto">

        {/* ── Overall stats ──────────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Overall progress</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatBox value={`${overallStats.completionPercent}%`} label="Avg completion" />
            <StatBox value={overallStats.masteredNodes} label="Nodes mastered" />
            <StatBox
              value={overallStats.avgScore !== null ? `${Math.round(overallStats.avgScore)}%` : '—'}
              label="Avg quiz score"
              accent="oklch(0.55 0.12 150)"
            />
            <StatBox
              value={streakSummary.currentStreak}
              label="Day streak"
              accent={streakSummary.currentStreak >= 7 ? 'oklch(0.62 0.18 28)' : '#6e645a'}
            />
          </div>
          <MomentumBanner momentum={momentum} />
        </section>

        {/* ── Activity heatmap ───────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Activity — last 12 months</SectionTitle>
          <ActivityHeatmap days={activityDays ?? []} />
        </section>

        {/* ── Per-enrollment breakdown ───────────────────────────────────────── */}
        {enrollmentBreakdowns.length > 0 && (
          <section>
            <SectionTitle>Courses</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollmentBreakdowns.map((b) => (
                <EnrollmentCard key={b.enrollmentId} breakdown={b} />
              ))}
            </div>
          </section>
        )}

        {/* ── Weak areas & top achievements ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <SectionTitle>Knowledge gaps</SectionTitle>
            <GlobalWeakNodesPanel nodes={globalWeakNodes} />
          </section>

          {globalTopNodes.length > 0 && (
            <section>
              <SectionTitle>Top achievements</SectionTitle>
              <TopAchievementsPanel topNodes={globalTopNodes} />
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
