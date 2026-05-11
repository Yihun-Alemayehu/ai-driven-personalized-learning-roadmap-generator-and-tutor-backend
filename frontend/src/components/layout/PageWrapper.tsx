import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Remove max-width constraint — useful for full-bleed pages */
  full?: boolean;
}

export function PageWrapper({ children, className, full }: PageWrapperProps) {
  return (
    <div
      className={cn(
        'px-6 py-8',
        !full && 'max-w-5xl mx-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}
