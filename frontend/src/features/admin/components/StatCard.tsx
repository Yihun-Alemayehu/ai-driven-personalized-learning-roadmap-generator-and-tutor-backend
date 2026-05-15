interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div
      className="border rounded-[12px] px-5 py-4 flex flex-col gap-2"
      style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
    >
      <span className="text-[24px]">{icon}</span>
      <div
        className="text-[32px] font-medium leading-none"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614' }}
      >
        {value}
      </div>
      <div
        className="text-[11px] tracking-widest uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        {label}
      </div>
    </div>
  );
}
