import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { NodeAnalytic } from '@/api/instructor';

interface Props {
  data: NodeAnalytic[];
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function MasteryRateChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => (a.masteryRate ?? 0) - (b.masteryRate ?? 0));

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 36)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        barSize={18}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e8e2d9" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#9a9088' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="title"
          width={140}
          tickFormatter={(v) => truncate(v, 18)}
          tick={{ fontSize: 12, fontFamily: "'Crimson Pro', serif", fill: '#3a342e' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(210,200,185,0.15)' }}
          contentStyle={{
            background: '#faf7f1',
            border: '1px solid #d6cfbf',
            borderRadius: 8,
            fontFamily: "'Crimson Pro', serif",
            fontSize: 13,
          }}
          formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Mastery rate']}
        />
        <Bar dataKey="masteryRate" radius={[0, 4, 4, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.nodeId}
              fill={
                (entry.masteryRate ?? 0) >= 70
                  ? 'oklch(0.60 0.13 150)'
                  : (entry.masteryRate ?? 0) >= 40
                  ? 'oklch(0.72 0.13 70)'
                  : 'oklch(0.62 0.18 28)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
