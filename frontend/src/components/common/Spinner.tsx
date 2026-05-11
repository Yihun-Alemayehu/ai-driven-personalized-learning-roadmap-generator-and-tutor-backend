import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 16, md: 24, lg: 36 };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const s = SIZE_MAP[size];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('animate-spin', className)}
      style={{ animationDuration: '0.7s' }}
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="#d6cfbf" strokeWidth="2.5" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="oklch(0.62 0.18 28)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}
