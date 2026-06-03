import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, CartesianGrid, Legend, PieChart, Pie,
} from 'recharts';
import type { NodeAnalytic } from '@/api/instructor';

const MASTERY_COLOR = (rate: number) =>
  rate >= 70 ? 'oklch(0.60 0.13 150)' : rate >= 40 ? 'oklch(0.72 0.13 70)' : 'oklch(0.62 0.18 28)';

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-2xl p-5 flex flex-col gap-3" style={{ borderColor: '#d6cfbf', background: '#faf7f1' }}>
      <div className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const mono = { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fill: '#9a9088' };

// ── 1. Node mastery bar chart ─────────────────────────────────────────────────
export function NodeMasteryChart({ data }: { data: NodeAnalytic[] }) {
  const attempted = data.filter((n) => n.learnerCount > 0);
  if (attempted.length === 0) return <p className="text-[13px] italic" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}>No activity yet.</p>;

  const sorted = [...attempted].sort((a, b) => (b.masteryRate ?? 0) - (a.masteryRate ?? 0));
  const chartData = sorted.slice(0, 20).map((n) => ({
    name: n.title.length > 22 ? n.title.slice(0, 20) + '…' : n.title,
    mastery: Math.round(n.masteryRate ?? 0),
    score: n.avgQuizScore != null ? Math.round(n.avgQuizScore) : null,
  }));

  return (
    <ChartCard title="Mastery rate by node (top 20)">
      <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 26)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 32, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} tick={mono} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={150} tick={{ ...mono, textAnchor: 'end' }} />
          <Tooltip
            formatter={(v: number) => [`${v}%`, 'Mastery']}
            contentStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#faf7f1', border: '1px solid #d6cfbf', borderRadius: 8 }}
          />
          <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={MASTERY_COLOR(entry.mastery)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 2. Score distribution pie ─────────────────────────────────────────────────
export function ScoreDistributionChart({ data }: { data: NodeAnalytic[] }) {
  const attempted = data.filter((n) => n.learnerCount > 0);
  if (attempted.length === 0) return null;

  const buckets = [
    { name: 'Strong (≥80%)', value: 0, color: 'oklch(0.60 0.13 150)' },
    { name: 'Marginal (70–79%)', value: 0, color: 'oklch(0.55 0.13 250)' },
    { name: 'Struggling (40–69%)', value: 0, color: 'oklch(0.72 0.13 70)' },
    { name: 'Critical (<40%)', value: 0, color: 'oklch(0.62 0.18 28)' },
  ];
  for (const n of attempted) {
    const r = n.masteryRate ?? 0;
    if (r >= 80) buckets[0].value++;
    else if (r >= 70) buckets[1].value++;
    else if (r >= 40) buckets[2].value++;
    else buckets[3].value++;
  }
  const nonEmpty = buckets.filter((b) => b.value > 0);

  return (
    <ChartCard title="Node performance distribution">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={nonEmpty}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {nonEmpty.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            formatter={(v: number, name: string) => [v, name]}
            contentStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#faf7f1', border: '1px solid #d6cfbf', borderRadius: 8 }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 3. Difficulty vs mastery scatter ──────────────────────────────────────────
export function DifficultyMasteryScatter({ data }: { data: NodeAnalytic[] }) {
  const points = data
    .filter((n) => n.learnerCount > 0 && n.difficultyLevel != null)
    .map((n) => ({
      x: n.difficultyLevel!,
      y: Math.round(n.masteryRate ?? 0),
      name: n.title,
      attempts: n.avgAttempts,
    }));
  if (points.length === 0) return null;

  return (
    <ChartCard title="Difficulty vs. mastery rate">
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ left: 0, right: 20, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d9" />
          <XAxis
            type="number" dataKey="x" name="Difficulty" domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]} tick={mono}
            label={{ value: 'Difficulty', position: 'insideBottom', offset: -2, style: mono }}
          />
          <YAxis
            type="number" dataKey="y" name="Mastery %" domain={[0, 100]}
            tick={mono} tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              const p = payload?.[0]?.payload;
              if (!p) return null;
              return (
                <div className="rounded-[8px] border px-3 py-2" style={{ background: '#faf7f1', borderColor: '#d6cfbf', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  <div style={{ color: '#1a1614', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: '#6e645a' }}>Mastery: {p.y}%</div>
                  <div style={{ color: '#6e645a' }}>Difficulty: {p.x}</div>
                  <div style={{ color: '#6e645a' }}>Avg attempts: {p.attempts?.toFixed(1)}</div>
                </div>
              );
            }}
          />
          <Scatter name="Nodes" data={points} fill="oklch(0.55 0.13 250)" opacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ── 4. Attempts vs mastery correlation bars ───────────────────────────────────
export function AttemptsChart({ data }: { data: NodeAnalytic[] }) {
  const attempted = data.filter((n) => n.learnerCount > 0 && n.avgAttempts > 0);
  if (attempted.length === 0) return null;

  const sorted = [...attempted].sort((a, b) => (b.avgAttempts ?? 0) - (a.avgAttempts ?? 0)).slice(0, 12);
  const chartData = sorted.map((n) => ({
    name: n.title.length > 20 ? n.title.slice(0, 18) + '…' : n.title,
    attempts: parseFloat((n.avgAttempts ?? 0).toFixed(1)),
    mastery: Math.round(n.masteryRate ?? 0),
  }));

  return (
    <ChartCard title="Average attempts (highest first — signals difficulty)">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ left: 0, right: 16, top: 4, bottom: 32 }}>
          <XAxis dataKey="name" tick={{ ...mono, angle: -35, textAnchor: 'end' }} interval={0} />
          <YAxis tick={mono} />
          <Tooltip
            contentStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, background: '#faf7f1', border: '1px solid #d6cfbf', borderRadius: 8 }}
          />
          <Bar dataKey="attempts" name="Avg attempts" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.attempts > 2.5 ? 'oklch(0.62 0.18 28)' : entry.attempts > 1.5 ? 'oklch(0.72 0.13 70)' : 'oklch(0.60 0.13 150)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
