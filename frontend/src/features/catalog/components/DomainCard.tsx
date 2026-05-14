import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getDomainMeta } from '../lib/domainIcons';
import type { Domain } from '@/types';
import type { EnrollmentWithCounts } from '@/api/enrollments';

interface DomainCardProps {
  domain: Domain;
  enrollment?: EnrollmentWithCounts;
}

export function DomainCard({ domain, enrollment }: DomainCardProps) {
  const navigate = useNavigate();
  const meta = getDomainMeta(domain.slug);
  const isEnrolled = Boolean(enrollment);

  const handleClick = () => {
    if (isEnrolled && enrollment) {
      navigate(`/enrollments/${enrollment.id}/roadmap`);
    } else {
      navigate(`/catalog/${domain.slug}`);
    }
  };

  return (
    <div
      className="border rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
      style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold select-none"
        style={{ background: meta.color, color: meta.accent }}
      >
        {domain.iconUrl ? (
          <img src={domain.iconUrl} alt="" className="w-7 h-7 object-contain" />
        ) : (
          <span style={{ fontFamily: 'monospace' }}>{meta.icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3
          className="text-lg leading-tight mb-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          {domain.name}
        </h3>
        {domain.description && (
          <p
            className="text-sm line-clamp-2"
            style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}
          >
            {domain.description}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between pt-1">
        {isEnrolled ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: '#f0fdf4', color: '#16a34a', fontFamily: "'Crimson Pro', serif" }}>
            Enrolled
          </span>
        ) : (
          <span className="text-xs" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}>
            {enrollment ? '' : 'Not enrolled'}
          </span>
        )}
        <span
          className="flex items-center gap-1 text-sm font-medium transition-colors group-hover:text-[oklch(0.62_0.18_28)]"
          style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}
        >
          {isEnrolled ? 'Continue' : 'View'}
          <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

export function DomainCardSkeleton() {
  return (
    <div className="border rounded-2xl p-6 flex flex-col gap-4 animate-pulse"
      style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}>
      <div className="w-12 h-12 rounded-xl" style={{ background: '#e8e3d8' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-5 rounded w-3/4" style={{ background: '#e8e3d8' }} />
        <div className="h-4 rounded w-full" style={{ background: '#ede8df' }} />
        <div className="h-4 rounded w-2/3" style={{ background: '#ede8df' }} />
      </div>
      <div className="h-4 rounded w-1/3 self-end" style={{ background: '#e8e3d8' }} />
    </div>
  );
}
