import { useState } from 'react';
import { useDomainAnalyticsQuery } from '@/api/instructor';
import { useDomainsQuery } from '@/api/domains';
import { MasteryRateChart } from './components/MasteryRateChart';
import { ProblemNodesTable } from './components/ProblemNodesTable';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] tracking-[0.1em] uppercase mb-3"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-[12px] px-5 py-4 flex flex-col gap-1" style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}>
      <div className="text-[28px] font-medium leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}>
        {value}
      </div>
      <div className="text-[11px] tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        {label}
      </div>
    </div>
  );
}

export default function DomainAnalyticsPage() {
  const { data: domains } = useDomainsQuery();
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');

  const domainId = selectedDomainId || domains?.[0]?.id || '';
  const { data: analytics, isLoading } = useDomainAnalyticsQuery(domainId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + domain picker */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          {analytics?.domain.name ?? 'Domain'} Analytics
        </h1>
        <select
          value={selectedDomainId || domainId}
          onChange={(e) => setSelectedDomainId(e.target.value)}
          className="h-9 px-3 rounded-[8px] border text-[14px] outline-none"
          style={{ borderColor: '#d6cfbf', background: '#faf7f1', fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
        >
          {domains?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-[8px]" style={{ background: '#ebe6db' }} />)}
        </div>
      ) : analytics ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Enrollments" value={analytics.enrollmentCount} />
            <StatCard label="Overall mastery" value={`${(analytics.overallMasteryRate ?? 0).toFixed(0)}%`} />
            <StatCard label="Total nodes" value={analytics.nodeAnalytics.length} />
          </div>

          {/* Mastery rate chart */}
          <div className="border rounded-2xl p-5" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
            <SectionLabel>Mastery rate by node</SectionLabel>
            {analytics.nodeAnalytics.length > 0 ? (
              <MasteryRateChart data={analytics.nodeAnalytics} />
            ) : (
              <p className="text-[14px] italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
                No quiz activity yet.
              </p>
            )}
          </div>

          {/* Problem nodes */}
          {analytics.problemNodes.length > 0 && (
            <div className="border rounded-2xl overflow-hidden" style={{ borderColor: 'oklch(0.62 0.18 28)' }}>
              <div
                className="px-5 py-3 border-b flex items-center gap-2"
                style={{ borderColor: '#f0d9c8', background: 'color-mix(in srgb, oklch(0.62 0.18 28) 6%, #faf7f1)' }}
              >
                <span className="text-[14px]">⚠</span>
                <SectionLabel>Problem nodes (lowest mastery)</SectionLabel>
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
