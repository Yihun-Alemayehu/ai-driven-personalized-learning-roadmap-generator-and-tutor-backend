import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoadmapQuery } from '@/api/progress';
import { useEnrollmentsQuery } from '@/api/enrollments';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import { LearnSidebar } from './components/LearnSidebar';
import { LearnContent } from './components/LearnContent';
import type { RoadmapNode } from '@/types';

function Spinner() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <span
        className="text-[12px] tracking-widest animate-pulse"
        style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
      >
        loading…
      </span>
    </div>
  );
}

export default function LearnPage() {
  const { id: enrollmentId = '', nodeId = '' } = useParams<{ id: string; nodeId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: roadmap, isLoading: roadmapLoading } = useRoadmapQuery(enrollmentId);
  const { data: enrollments } = useEnrollmentsQuery();

  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumbStore();
  const enrollment = enrollments?.find((e) => e.id === enrollmentId);

  useEffect(() => {
    const crumbs = [
      { label: 'Catalog', to: '/catalog' },
      ...(enrollment ? [{ label: enrollment.domain.name, to: `/catalog/${enrollment.domain.slug}` }] : []),
      { label: 'Roadmap', to: `/enrollments/${enrollmentId}/roadmap` },
      { label: 'Learn' },
    ];
    setBreadcrumbs(crumbs);
    return () => clearBreadcrumbs();
  }, [enrollment, enrollmentId, setBreadcrumbs, clearBreadcrumbs]);

  const nodes = (roadmap?.nodes ?? []) as RoadmapNode[];
  const activeNode = nodes.find((n) => n.id === nodeId) ?? null;

  // If the nodeId isn't in the roadmap, redirect to first unlocked node
  useEffect(() => {
    if (!roadmapLoading && nodes.length > 0 && !activeNode) {
      const first = nodes.find((n) => n.unlocked) ?? nodes[0];
      navigate(`/enrollments/${enrollmentId}/learn/${first.id}`, { replace: true });
    }
  }, [roadmapLoading, nodes, activeNode, enrollmentId, navigate]);

  if (roadmapLoading) return <Spinner />;

  if (!activeNode) return null;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#faf7f1' }}>
      {/* Sidebar toggle button (mobile / collapsed) */}
      <button
        className="absolute top-4 z-10 flex items-center justify-center w-6 h-6 rounded-full border shadow-sm transition-all"
        style={{
          left: sidebarOpen ? 'calc(280px - 12px)' : '8px',
          background: '#faf7f1',
          borderColor: '#d6cfbf',
          color: '#6e645a',
          fontSize: 10,
        }}
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>

      {/* Left sidebar */}
      {sidebarOpen && (
        <aside
          className="shrink-0 border-r overflow-hidden flex flex-col"
          style={{ width: 280, borderColor: '#d6cfbf' }}
        >
          <LearnSidebar
            nodes={nodes}
            activeNodeId={nodeId}
            enrollmentId={enrollmentId}
          />
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <LearnContent node={activeNode} enrollmentId={enrollmentId} />
      </main>
    </div>
  );
}
