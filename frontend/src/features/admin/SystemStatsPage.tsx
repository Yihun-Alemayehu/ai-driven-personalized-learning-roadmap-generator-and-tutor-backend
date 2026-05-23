import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  UsersIcon,
  BookOpenIcon,
  PenLineIcon,
  TrendingUpIcon,
  AwardIcon,
} from 'lucide-react';
import { useSystemStatsQuery, useDomainStatsQuery } from '@/api/admin';
import { StatCard } from './components/StatCard';
import type { DomainStat } from '@/types';

// ── Colour palette ────────────────────────────────────────────────────────────

const MASTERY_META: {
  key: string;
  label: string;
  fill: string;
}[] = [
  { key: 'mastered',      label: 'Mastered',      fill: '#4e9a72' },
  { key: 'review_needed', label: 'Review needed',  fill: '#c07d3a' },
  { key: 'in_progress',   label: 'In progress',    fill: '#c49a3c' },
  { key: 'relearn',       label: 'Relearn',        fill: '#b85a3b' },
  { key: 'not_started',   label: 'Not started',    fill: '#c2b9a6' },
];

const DOMAIN_COMPLETION_FILL = '#4e9a72';
const DOMAIN_SCORE_FILL      = '#c07d3a';

// ── Shared recharts style helpers ─────────────────────────────────────────────

const AXIS_STYLE = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  fill: '#9a9088',
};

const GRID_STROKE = '#e8e2d9';

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[10px] border px-3 py-2.5 flex flex-col gap-1 shadow-md"
      style={{ background: '#faf7f1', borderColor: '#d6cfbf', minWidth: 140 }}
    >
      {label && (
        <div
          className="text-[11px] mb-0.5"
          style={{ fontFamily: "'Crimson Pro', serif", color: '#6e645a' }}
        >
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.fill }}
          />
          <span
            className="text-[11px]"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#3a342e' }}
          >
            {p.name}:&nbsp;
            <span style={{ color: '#1a1614', fontWeight: 600 }}>
              {typeof p.value === 'number' && p.value % 1 !== 0
                ? `${p.value.toFixed(1)}%`
                : p.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Custom pie label ──────────────────────────────────────────────────────────

function PieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}) {
  if (!cx || !cy || !midAngle || !outerRadius || !percent || !name) return null;
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 22;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#9a9088' }}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11px] tracking-[0.12em] uppercase mb-4"
      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
    >
      {children}
    </div>
  );
}

function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] border px-5 py-4 ${className}`}
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      {children}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-[14px]" style={{ background: '#ebe6db' }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 rounded-[14px]" style={{ background: '#ebe6db' }} />
        <div className="h-64 rounded-[14px]" style={{ background: '#ebe6db' }} />
      </div>
      <div className="h-72 rounded-[14px]" style={{ background: '#ebe6db' }} />
    </div>
  );
}

// ── Domain inline progress row ────────────────────────────────────────────────

function DomainRow({ domain, rank }: { domain: DomainStat; rank: number }) {
  const completion = Math.round(domain.avgCompletion);
  const score = domain.avgQuizScore !== null ? Math.round(domain.avgQuizScore) : null;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: '#e8e2d9' }}
    >
      {/* Rank */}
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{
          background: rank === 1 ? '#4e9a72' : rank === 2 ? '#c07d3a' : '#ebe6db',
          color: rank <= 2 ? '#fff' : '#6e645a',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {rank}
      </span>

      {/* Name */}
      <span
        className="w-36 shrink-0 truncate text-[14px]"
        style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
      >
        {domain.name}
      </span>

      {/* Enrollments */}
      <span
        className="w-12 shrink-0 text-right text-[11px] font-semibold"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
      >
        {domain.enrollmentCount}
      </span>

      {/* Completion bar */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: '#ebe6db' }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${completion}%`,
              background: completion >= 70 ? '#4e9a72' : completion >= 40 ? '#c49a3c' : '#b85a3b',
            }}
          />
        </div>
        <span
          className="w-8 text-right text-[11px] font-semibold shrink-0"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#3a342e' }}
        >
          {completion}%
        </span>
      </div>

      {/* Avg quiz score */}
      <span
        className="w-12 shrink-0 text-right text-[11px] font-semibold"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: score !== null
            ? score >= 70 ? '#4e9a72' : score >= 50 ? '#c49a3c' : '#b85a3b'
            : '#c2b9a6',
        }}
      >
        {score !== null ? `${score}%` : '—'}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SystemStatsPage() {
  const { data: stats, isLoading: statsLoading } = useSystemStatsQuery();
  const { data: domainStats, isLoading: dsLoading } = useDomainStatsQuery();

  const isLoading = statsLoading || dsLoading;

  // Mastery donut data
  const masteryPieData = MASTERY_META.map(({ key, label, fill }) => ({
    name: label,
    value: (stats?.masteryBreakdown as Record<string, number> | undefined)?.[key] ?? 0,
    fill,
  })).filter((d) => d.value > 0);

  // Domain grouped bar data
  const domainBarData = (domainStats ?? []).map((d) => ({
    name: d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name,
    'Completion %': parseFloat(d.avgCompletion.toFixed(1)),
    'Quiz score %': d.avgQuizScore !== null ? parseFloat(d.avgQuizScore.toFixed(1)) : 0,
  }));

  // Sort domain table by avgCompletion desc
  const sortedDomains = [...(domainStats ?? [])].sort(
    (a, b) => b.avgCompletion - a.avgCompletion,
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl w-full mx-auto">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div>
        <div
          className="text-[11px] tracking-[0.12em] uppercase mb-1"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          Platform
        </div>
        <h1
          className="text-[32px] font-medium leading-tight tracking-[-0.015em]"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
        >
          System Overview
        </h1>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {/* ── KPI row ─────────────────────────────────────────────────── */}
          <section>
            <SectionLabel>Key metrics</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                icon={<UsersIcon size={16} />}
                value={stats?.users ?? 0}
                label="Total users"
              />
              <StatCard
                icon={<BookOpenIcon size={16} />}
                value={stats?.enrollments ?? 0}
                label="Enrollments"
              />
              <StatCard
                icon={<PenLineIcon size={16} />}
                value={stats?.quizAttempts ?? 0}
                label="Quiz attempts"
              />
              <StatCard
                icon={<TrendingUpIcon size={16} />}
                value={
                  stats?.avgQuizScore !== null && stats?.avgQuizScore !== undefined
                    ? `${stats.avgQuizScore.toFixed(1)}%`
                    : '—'
                }
                label="Avg quiz score"
                accent="#4e9a72"
              />
              <StatCard
                icon={<AwardIcon size={16} />}
                value={`${(stats?.avgMasteryRate ?? 0).toFixed(1)}%`}
                label="Mastery rate"
                accent="oklch(0.52 0.18 28)"
                sub="mastered + review_needed"
              />
            </div>
          </section>

          {/* ── Charts row ──────────────────────────────────────────────── */}
          <section>
            <SectionLabel>Learning distribution</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Mastery donut */}
              <Panel>
                <div
                  className="text-[13px] font-medium mb-4"
                  style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                >
                  Mastery breakdown — all nodes
                </div>
                {masteryPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={masteryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={(props) => <PieLabel {...props} />}
                      >
                        {masteryPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ReTooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="h-[220px] flex items-center justify-center text-[13px] italic"
                    style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}
                  >
                    No mastery data yet
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {MASTERY_META.filter((m) =>
                    (stats?.masteryBreakdown as Record<string, number> | undefined)?.[m.key],
                  ).map((m) => (
                    <div key={m.key} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: m.fill }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
                      >
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Domain enrollment bar */}
              <Panel>
                <div
                  className="text-[13px] font-medium mb-4"
                  style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
                >
                  Enrollments per domain
                </div>
                {(domainStats ?? []).length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(domainStats ?? []).map((d) => ({
                        name: d.name.length > 12 ? `${d.name.slice(0, 10)}…` : d.name,
                        Enrollments: d.enrollmentCount,
                      }))}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                      <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                      <ReTooltip content={<ChartTooltip />} cursor={{ fill: '#ebe6db' }} />
                      <Bar
                        dataKey="Enrollments"
                        fill="oklch(0.62 0.18 28)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="h-[220px] flex items-center justify-center text-[13px] italic"
                    style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}
                  >
                    No domain data yet
                  </div>
                )}
              </Panel>
            </div>
          </section>

          {/* ── Domain performance grouped bar ───────────────────────────── */}
          {domainBarData.length > 0 && (
            <section>
              <SectionLabel>Domain performance — completion vs. quiz score</SectionLabel>
              <Panel>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={domainBarData}
                    margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={AXIS_STYLE}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ReTooltip content={<ChartTooltip />} cursor={{ fill: '#ebe6db' }} />
                    <Legend
                      wrapperStyle={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#9a9088',
                        paddingTop: 8,
                      }}
                    />
                    <Bar
                      dataKey="Completion %"
                      fill={DOMAIN_COMPLETION_FILL}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="Quiz score %"
                      fill={DOMAIN_SCORE_FILL}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </section>
          )}

          {/* ── Domain table with inline progress ───────────────────────── */}
          {sortedDomains.length > 0 && (
            <section>
              <SectionLabel>Domain breakdown</SectionLabel>
              <div
                className="rounded-[14px] border overflow-hidden"
                style={{ borderColor: '#d6cfbf' }}
              >
                {/* Table header */}
                <div
                  className="grid px-4 py-2.5 border-b"
                  style={{
                    gridTemplateColumns: '28px 144px 48px 1fr 48px',
                    gap: '1rem',
                    borderColor: '#d6cfbf',
                    background: '#f3efe7',
                  }}
                >
                  {['#', 'Domain', 'Enrolled', 'Avg completion', 'Score'].map((h) => (
                    <div
                      key={h}
                      className="text-[10px] tracking-[0.1em] uppercase"
                      style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div style={{ background: '#faf7f1' }}>
                  {sortedDomains.map((domain, i) => (
                    <DomainRow key={domain.domainId} domain={domain} rank={i + 1} />

                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty state */}
          {!stats && !domainStats && (
            <div
              className="py-16 text-center text-[15px] italic"
              style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
            >
              No platform data available yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
