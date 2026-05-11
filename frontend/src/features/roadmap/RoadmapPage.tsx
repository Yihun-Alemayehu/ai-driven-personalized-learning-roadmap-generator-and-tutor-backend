import { useParams } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function RoadmapPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <PageWrapper>
      <h1 className="text-[32px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Roadmap</h1>
      <p className="mt-2" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif", fontSize: 15 }}>
        Enrollment {id} — React Flow DAG implemented in Phase 4.
      </p>
    </PageWrapper>
  );
}
