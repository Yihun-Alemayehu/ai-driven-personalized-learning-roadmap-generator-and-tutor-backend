import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-8 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-1" style={{ color: '#c2b9a6' }}>
          {icon}
        </div>
      )}
      <h3
        className="text-[22px] font-medium"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3a342e' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-[14px] max-w-[320px]" style={{ color: '#6e645a' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
