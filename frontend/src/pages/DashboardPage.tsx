import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <PageWrapper>
      <h1 className="text-[36px] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}.
      </h1>
      <p style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 16 }}>
        Your enrollments and decay alerts will appear here.
      </p>
    </PageWrapper>
  );
}
