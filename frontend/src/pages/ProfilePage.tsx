import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <PageWrapper>
      <h1 className="text-[32px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Profile</h1>
      {user && (
        <div className="mt-4 flex flex-col gap-1" style={{ color: '#3a342e', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
          <div>{user.fullName}</div>
          <div style={{ color: '#6e645a' }}>{user.email}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9a9088' }}>{user.role}</div>
        </div>
      )}
    </PageWrapper>
  );
}
