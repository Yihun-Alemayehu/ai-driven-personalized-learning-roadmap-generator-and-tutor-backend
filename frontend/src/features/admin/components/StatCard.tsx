interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: string;
  sub?: string;
}

export function StatCard({ icon, value, label, accent, sub }: StatCardProps) {
  return (
    <div
      className="border rounded-[14px] px-5 py-4 flex flex-col gap-2.5"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      <span
        className="w-8 h-8 rounded-[8px] flex items-center justify-center"
        style={{ background: '#ebe6db', color: accent ?? 'oklch(0.52 0.18 28)' }}
      >
        {icon}
      </span>
      <div>
        <div
          className="text-[30px] font-medium leading-none tracking-[-0.02em]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: accent ?? '#1a1614',
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="text-[11px] mt-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
          >
            {sub}
          </div>
        )}
      </div>
      <div
        className="text-[10px] tracking-[0.1em] uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {label}
      </div>
    </div>
  );
}
