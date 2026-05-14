import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';
import { useEnrollmentsQuery } from '@/api/enrollments';
import { EnrolledDomainCard } from '@/features/dashboard/components/EnrolledDomainCard';

function EnrollmentsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border rounded-2xl p-5 flex items-center gap-4 animate-pulse"
          style={{ background: '#faf7f1', borderColor: '#d6cfbf' }}
        >
          <div className="w-11 h-11 rounded-xl" style={{ background: '#e8e3d8' }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 rounded w-1/2" style={{ background: '#e8e3d8' }} />
            <div className="h-3 rounded w-1/3" style={{ background: '#ede8df' }} />
            <div className="h-1.5 rounded-full w-full" style={{ background: '#e8e3d8' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useEnrollmentsQuery();

  const firstName = user?.fullName?.split(' ')[0] ?? '';

  return (
    <PageWrapper>
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-[36px] leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          Welcome back{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-1 text-[15px]" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
          Pick up where you left off or explore a new domain.
        </p>
      </div>

      {/* My Enrollments */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-[20px]"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
          >
            My Enrollments
          </h2>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
            style={{ color: 'oklch(0.62 0.18 28)', fontFamily: "'Crimson Pro', serif" }}
          >
            <Plus size={14} />
            Explore more
          </Link>
        </div>

        {isLoading ? (
          <EnrollmentsSkeleton />
        ) : !enrollments || enrollments.length === 0 ? (
          <div
            className="border rounded-2xl px-8 py-10 text-center"
            style={{ background: '#f3efe7', borderColor: '#d6cfbf', borderStyle: 'dashed' }}
          >
            <p
              className="text-[18px] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#6e645a' }}
            >
              No enrollments yet
            </p>
            <p className="text-sm mb-5" style={{ color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}>
              Choose a domain to begin your personalised learning journey.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'oklch(0.62 0.18 28)', color: '#faf7f1', fontFamily: "'Crimson Pro', serif" }}
            >
              Browse Domains →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {enrollments.map((enrollment) => (
              <EnrolledDomainCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </section>

      {/* Decay Alerts placeholder (Phase 7) */}
      <section>
        <h2
          className="text-[20px] mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
        >
          Review Reminders
        </h2>
        <div
          className="border rounded-2xl px-6 py-4 text-sm"
          style={{ background: '#faf7f1', borderColor: '#d6cfbf', color: '#9a9088', fontFamily: "'Crimson Pro', serif" }}
        >
          Decay alerts will appear here once you start mastering nodes.
        </div>
      </section>
    </PageWrapper>
  );
}
