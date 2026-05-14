import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { getDomainMeta } from '@/features/catalog/lib/domainIcons';
import type { EnrollmentWithCounts } from '@/api/enrollments';

interface EnrolledDomainCardProps {
  enrollment: EnrollmentWithCounts;
}

export function EnrolledDomainCard({ enrollment }: EnrolledDomainCardProps) {
  const navigate = useNavigate();
  const meta = getDomainMeta(enrollment.domain.slug);
  const totalNodes = enrollment._count.nodeProgress;
  // We don't have mastered count from the list endpoint; show total enrolled nodes
  const enrolledAgo = formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true });

  return (
    <div
      className="border rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-sm cursor-pointer group"
      style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
      onClick={() => navigate(`/enrollments/${enrollment.id}/roadmap`)}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
        style={{ background: meta.color, color: meta.accent }}
      >
        <span style={{ fontFamily: 'monospace' }}>{meta.icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-base leading-tight truncate"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a', fontSize: 17 }}
        >
          {enrollment.domain.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}>
          {totalNodes} nodes · enrolled {enrolledAgo}
        </p>

        {/* Progress bar placeholder — mastery % from roadmap endpoint in Phase 4 */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#e8e3d8' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: '0%', background: meta.accent }}
          />
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={16}
        className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: '#9a9088' }}
      />
    </div>
  );
}
