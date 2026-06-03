import { useState } from 'react';
import { useDomainAnalyticsQuery } from '@/api/instructor';
import { useDomainsQuery } from '@/api/domains';
import { MasteryRateChart } from './components/MasteryRateChart';
import { ProblemNodesTable } from './components/ProblemNodesTable';
import {
  NodeMasteryChart,
  ScoreDistributionChart,
  DifficultyMasteryScatter,
  AttemptsChart,
} from './components/PerformanceCharts';
import { AiAnalysisPanel } from './components/AiAnalysisPanel';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] tracking-widest uppercase mb-3"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </div>
  );
}

function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div
      className="border rounded-xl px-5 py-4 flex flex-col gap-1"
      style={{ borderColor: accent ? 'oklch(0.62 0.18 28)' : '#d6cfbf', background: accent ? 'color-mix(in srgb, oklch(0.62 0.18 28) 5%, #faf7f1)' : '#f3efe7' }}
    >
      <div
        className="text-[28px] font-medium leading-none"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: accent ? 'oklch(0.52 0.18 28)' : '#1a1614' }}
      >
        {value}
      </div>
      <div className="text-[11px] tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        {label}
      </div>
      {sub && <div className="text-[11px]" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>{sub}</div>}
    </div>
  );
}

export default function DomainAnalyticsPage() {
  const { data: domains } = useDomainsQuery();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');

  const domainId = selectedDomainId || domains?.[0]?.id || '';
  const { data: analytics, isLoading } = useDomainAnalyticsQuery(domainId);

  const attempted = analytics?.nodeAnalytics.filter((n) => n.learnerCount > 0) ?? [];
  const avgScore = attempted.length > 0
    ? attempted.reduce((s, n) => s + (n.avgQuizScore ?? 0), 0) / attempted.length
    : null;
  const avgAttempts = attempted.length > 0
    ? attempted.reduce((s, n) => s + n.avgAttempts, 0) / attempted.length
    : null;
  const criticalNodes = attempted.filter((n) => n.masteryRate < 40).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header + domain picker */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[28px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
          >
            {analytics?.domain.name ?? 'Domain'} Analytics
          </h1>
          <p className="text-[13px] mt-0.5" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
            Learner performance insights to guide curriculum improvements
          </p>
        </div>
        <select
          value={selectedDomainId || domainId}
          onChange={(e) => setSelectedDomainId(e.target.value)}
          className="h-9 px-3 rounded-lg border text-[14px] outline-none"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
        >
          {domains?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-lg" style={{ background: '#ebe6db' }} />)}
        </div>
      ) : analytics ? (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Enrollments" value={analytics.enrollmentCount} />
            <StatCard
              label="Overall mastery"
              value={`${(analytics.overallMasteryRate ?? 0).toFixed(0)}%`}
              accent={(analytics.overallMasteryRate ?? 0) < 50}
            />
            <StatCard label="Total nodes" value={analytics.nodeAnalytics.length} />
            <StatCard
              label="Avg quiz score"
              value={avgScore != null ? `${avgScore.toFixed(0)}%` : '—'}
            />
            <StatCard
              label="Avg attempts"
              value={avgAttempts != null ? avgAttempts.toFixed(1) : '—'}
              sub="higher = harder"
            />
            <StatCard
              label="Critical nodes"
              value={criticalNodes}
              sub="mastery < 40%"
              accent={criticalNodes > 0}
            />
          </div>

          {/* ── AI Analysis ── */}
          <AiAnalysisPanel domainId={domainId} domainName={analytics.domain.name} />

          {/* ── Charts row 1 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ScoreDistributionChart data={analytics.nodeAnalytics} />
            <DifficultyMasteryScatter data={analytics.nodeAnalytics} />
          </div>

          {/* ── Attempts chart ── */}
          <AttemptsChart data={analytics.nodeAnalytics} />

          {/* ── Full node mastery bar chart ── */}
          <NodeMasteryChart data={analytics.nodeAnalytics} />

          {/* ── Legacy mastery rate table ── */}
          <div className="border rounded-2xl p-5" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
            <SectionLabel>Detailed node performance table</SectionLabel>
            {analytics.nodeAnalytics.length > 0 ? (
              <MasteryRateChart data={analytics.nodeAnalytics} />
            ) : (
              <p className="text-[14px] italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
                No quiz activity yet.
              </p>
            )}
          </div>

          {/* ── Problem nodes ── */}
          {analytics.problemNodes.length > 0 && (
            <div className="border rounded-2xl overflow-hidden" style={{ borderColor: 'oklch(0.62 0.18 28)' }}>
              <div
                className="px-5 py-3 border-b flex items-center gap-2"
                style={{ borderColor: '#f0d9c8', background: 'color-mix(in srgb, oklch(0.62 0.18 28) 6%, #faf7f1)' }}
              >
                <span className="text-[14px]">⚠</span>
                <SectionLabel>Problem nodes — lowest mastery</SectionLabel>
              </div>
              <div style={{ background: '#faf7f1' }}>
                <ProblemNodesTable nodes={analytics.problemNodes} />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[14px] italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
          Select a domain to view analytics.
        </p>
      )}
    </div>
  );
}
