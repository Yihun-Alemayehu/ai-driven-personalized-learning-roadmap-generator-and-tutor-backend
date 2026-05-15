import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useRoadmapQuery, useProgressStatsQuery, type ProgressStats } from '@/api/progress';
import { useEnrollmentsQuery } from '@/api/enrollments';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';
import { useBranchingPointsQuery } from '@/api/branching';
import { RoadmapCanvas } from './components/RoadmapCanvas';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { ProgressSidebar } from './components/ProgressSidebar';
import { BranchingPointBanner } from '@/features/branching/components/BranchingPointBanner';
import type { RoadmapNode, BranchPath } from '@/types';

const EMPTY_STATS: ProgressStats = {
  masteredCount: 0, inProgressCount: 0, reviewNeededCount: 0,
  notStartedCount: 0, rerelearnCount: 0, lockedCount: 0,
  totalNodes: 0, completionPercent: 0, unlockedNodes: 0, avgQuizScore: null,
};

function deriveNextNode(nodes: RoadmapNode[]): RoadmapNode | null {
  return (
    nodes.find(
      (n) =>
        n.unlocked &&
        !n.isBranchingPoint &&
        (n.masteryState === 'not_started' || n.masteryState === 'review_needed'),
    ) ?? null
  );
}

function RoadmapSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ color: '#9a9088' }}>
      <span className="font-mono text-xs tracking-widest animate-pulse">loading roadmap…</span>
    </div>
  );
}

export default function RoadmapPage() {
  const { id: enrollmentId = '' } = useParams<{ id: string }>();

  const { data: roadmap, isLoading: roadmapLoading } = useRoadmapQuery(enrollmentId);
  const { data: stats } = useProgressStatsQuery(enrollmentId);
  const { data: enrollments } = useEnrollmentsQuery();
  const { data: branchingPoints } = useBranchingPointsQuery(enrollmentId);

  const enrollment = enrollments?.find((e) => e.id === enrollmentId);

  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [branchPath, setBranchPath] = useState<BranchPath>(() => roadmap?.selectedBranchPath ?? 'frontend');

  const nextNode = useMemo(() => (roadmap ? deriveNextNode(roadmap.nodes as RoadmapNode[]) : null), [roadmap]);
  const safeStats = stats ?? EMPTY_STATS;

  const handleNodeClick = useCallback((node: RoadmapNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  }, []);

  const domainName = enrollment?.domain.name ?? 'Learning Roadmap';
  const enrolledAgo = enrollment
    ? `Enrolled ${formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}`
    : '';

  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumbStore();
  useEffect(() => {
    const crumbs = [
      { label: 'Catalog', to: '/catalog' },
      ...(enrollment ? [{ label: enrollment.domain.name, to: `/catalog/${enrollment.domain.slug}` }] : []),
      { label: 'Roadmap' },
    ];
    setBreadcrumbs(crumbs);
    return () => clearBreadcrumbs();
  }, [enrollment, setBreadcrumbs, clearBreadcrumbs]);

  // Show banner for the first reached (unlocked) branching point
  const activeBranchingPoint = branchingPoints?.find((bp) => bp.isReached);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: "'Crimson Pro', Georgia, serif", color: '#1a1614' }}
    >
      {/* Branching point banner — shown above the canvas */}
      {activeBranchingPoint && (
        <BranchingPointBanner
          enrollmentId={enrollmentId}
          branchingPoint={activeBranchingPoint}
          currentPath={enrollment?.selectedBranchPath}
        />
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <ProgressSidebar
          domainName={domainName}
          enrolledAt={enrolledAgo}
          selectedBranchPath={branchPath}
          stats={safeStats}
          nextNode={nextNode}
          onBranchChange={setBranchPath}
          onNextNodeClick={handleNodeClick}
        />

        {roadmapLoading || !roadmap ? (
          <RoadmapSkeleton />
        ) : (
          <RoadmapCanvas
            roadmapNodes={roadmap.nodes as RoadmapNode[]}
            roadmapEdges={roadmap.edges}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      <NodeDetailDrawer node={selectedNode} open={drawerOpen} onClose={() => setDrawerOpen(false)} enrollmentId={enrollmentId} />
    </div>
  );
}
