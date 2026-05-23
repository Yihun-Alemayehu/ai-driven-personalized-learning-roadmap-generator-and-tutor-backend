import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  useInsightsQuery,
  useActivityQuery,
  useProgressStatsQuery,
  useTimelineQuery,
} from '@/api/progress';
import { useEnrollmentsQuery } from '@/api/enrollments';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { ProfileCard } from './components/ProfileCard';
import { CurrentStatePanel } from './components/CurrentStatePanel';
import { WeakAreasPanel } from './components/WeakAreasPanel';
import { TopAchievementsPanel } from './components/TopAchievementsPanel';
import { VelocityCard } from './components/VelocityCard';

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

function LoadingShimmer() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <span className="text-[12px] font-mono animate-pulse" style={{ color: '#9a9088' }}>
        loading insights…
      </span>
    </div>
  );
}

export default function InsightsPage() {
  const { id: enrollmentId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: insights, isLoading: insightsLoading } = useInsightsQuery(enrollmentId);
  const { data: activityDays, isLoading: activityLoading } = useActivityQuery(enrollmentId);
  const { data: stats } = useProgressStatsQuery(enrollmentId);
  const { data: timeline } = useTimelineQuery(enrollmentId);
  const { data: enrollments } = useEnrollmentsQuery();

  const enrollment = enrollments?.find((e) => e.id === enrollmentId);
  const domainName = enrollment?.domain.name ?? 'Learning Roadmap';

  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumbStore();
  useEffect(() => {
    const crumbs = [
      { label: 'Catalog', to: '/catalog' },
      ...(enrollment ? [{ label: enrollment.domain.name, to: `/catalog/${enrollment.domain.slug}` }] : []),
      { label: 'Roadmap', to: `/enrollments/${enrollmentId}/roadmap` },
      { label: 'Insights' },
    ];
    setBreadcrumbs(crumbs);
    return () => clearBreadcrumbs();
  }, [enrollment, enrollmentId, setBreadcrumbs, clearBreadcrumbs]);

  if (insightsLoading || activityLoading) return <LoadingShimmer />;
  if (!insights) return <LoadingShimmer />;

  const enrolledAt = format(new Date(insights.profile.enrolledAt), 'MMM d, yyyy');
  const enrolledAgo = formatDistanceToNow(new Date(insights.profile.enrolledAt), { addSuffix: true });

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: '#faf7f1', fontFamily: "'Crimson Pro', Georgia, serif", color: '#1a1614' }}
    >
      {/* Page header */}
      <div
        className="px-8 pt-8 pb-6 border-b flex items-start justify-between"
        style={{ borderColor: '#e8e2d9', background: '#faf7f1' }}
      >
        <div>
          <div className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Learning Intelligence
          </div>
          <h1
            className="text-[32px] font-medium leading-tight tracking-[-0.015em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            {domainName}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: '#6e645a' }}>
            Enrolled {enrolledAt} · {enrolledAgo}
          </p>
        </div>
        <button
          onClick={() => navigate(`/enrollments/${enrollmentId}/roadmap`)}
          className="px-4 py-2 rounded-full text-[13px] border transition-all hover:bg-[#ebe6db]"
          style={{ borderColor: '#c2b9a6', color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
        >
          ← Back to roadmap
        </button>
      </div>

      <div className="px-8 py-8 flex flex-col gap-10 max-w-5xl w-full mx-auto">

        {/* ── Section 1: Current State ──────────────────────────────────────── */}
        <section>
          <SectionTitle>Where you stand</SectionTitle>
          <CurrentStatePanel
            stats={stats}
            insights={insights}
            timeline={timeline}
          />
        </section>

        {/* ── Section 2: Activity Heatmap ───────────────────────────────────── */}
        <section>
          <SectionTitle>Activity — last 12 months</SectionTitle>
          <ActivityHeatmap days={activityDays ?? []} />
        </section>

        {/* ── Section 3: Profile & Velocity side-by-side ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <SectionTitle>Your learning profile</SectionTitle>
            <ProfileCard profile={insights.profile} />
          </section>
          <section>
            <SectionTitle>Pace & velocity</SectionTitle>
            <VelocityCard timeline={timeline} insights={insights} />
          </section>
        </div>

        {/* ── Section 4: Weak areas & Top achievements ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(insights.weakNodes.length > 0 || insights.strugglingNodes.length > 0) && (
            <section>
              <SectionTitle>Needs attention</SectionTitle>
              <WeakAreasPanel
                weakNodes={insights.weakNodes}
                strugglingNodes={insights.strugglingNodes}
                enrollmentId={enrollmentId}
              />
            </section>
          )}
          {insights.topNodes.length > 0 && (
            <section>
              <SectionTitle>Top achievements</SectionTitle>
              <TopAchievementsPanel topNodes={insights.topNodes} />
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
