import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { LearningNodeCard } from './LearningNodeCard';
import type { RoadmapNode, RoadmapEdge } from '@/types';

const NODE_W = 160;
const NODE_H = 62;
const BRANCH_SIZE = 90;

const NODE_TYPES = { learningNode: LearningNodeCard };

// BFS from root nodes to compute hierarchy depth for each node
function computeDepths(nodes: RoadmapNode[], edges: RoadmapEdge[]): Map<string, number> {
  // Build adjacency: prerequisiteId → [dependentId, ...]
  const children = new Map<string, string[]>();
  for (const e of edges) {
    if (!children.has(e.prerequisiteNodeId)) children.set(e.prerequisiteNodeId, []);
    children.get(e.prerequisiteNodeId)!.push(e.nodeId);
  }

  // Identify roots (nodes with no prerequisites)
  const hasPrereq = new Set(edges.map((e) => e.nodeId));
  const roots = nodes.filter((n) => !hasPrereq.has(n.id)).map((n) => n.id);

  const depth = new Map<string, number>();
  const queue: Array<{ id: string; d: number }> = roots.map((id) => ({ id, d: 0 }));

  while (queue.length > 0) {
    const { id, d } = queue.shift()!;
    if (depth.has(id) && depth.get(id)! <= d) continue;
    depth.set(id, d);
    for (const child of children.get(id) ?? []) {
      queue.push({ id: child, d: d + 1 });
    }
  }
  return depth;
}

function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  // Vertical spine: generous ranksep keeps it readable top-to-bottom
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80, marginx: 40, marginy: 40 });

  nodes.forEach((n) => {
    const isBranch = (n.data as unknown as RoadmapNode).isBranchingPoint;
    g.setNode(n.id, { width: isBranch ? BRANCH_SIZE : NODE_W, height: isBranch ? BRANCH_SIZE : NODE_H });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    const isBranch = (n.data as unknown as RoadmapNode).isBranchingPoint;
    const w = isBranch ? BRANCH_SIZE : NODE_W;
    const h = isBranch ? BRANCH_SIZE : NODE_H;
    return { ...n, position: { x: x - w / 2, y: y - h / 2 } };
  });
}

function toFlowNodes(roadmapNodes: RoadmapNode[], depths: Map<string, number>): Node[] {
  return roadmapNodes.map((n) => ({
    id: n.id,
    type: 'learningNode',
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data: { ...(n as unknown as Record<string, unknown>), _level: depths.get(n.id) ?? 0 },
    draggable: false,
    selectable: n.unlocked && !n.isBranchingPoint,
  }));
}

function toFlowEdges(edges: RoadmapEdge[], nodeMap: Map<string, RoadmapNode>): Edge[] {
  return edges.map((e, i) => {
    const target = nodeMap.get(e.nodeId);
    const source = nodeMap.get(e.prerequisiteNodeId);
    const isLocked = !target?.unlocked;
    const isBranchEdge = source?.isBranchingPoint || target?.isBranchingPoint;

    return {
      id: `e-${i}`,
      source: e.prerequisiteNodeId,
      target: e.nodeId,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isLocked
          ? '#c5bcaa'
          : isBranchEdge
          ? '#6080c0'
          : '#9a8a78',
        strokeWidth: isLocked ? 1 : 1.5,
        strokeDasharray: isLocked ? '5 4' : undefined,
        opacity: isLocked ? 0.6 : 0.85,
      },
    };
  });
}

interface RoadmapCanvasProps {
  roadmapNodes: RoadmapNode[];
  roadmapEdges: RoadmapEdge[];
  onNodeClick: (node: RoadmapNode) => void;
}

export function RoadmapCanvas({ roadmapNodes, roadmapEdges, onNodeClick }: RoadmapCanvasProps) {
  const nodeMap = useMemo(() => new Map(roadmapNodes.map((n) => [n.id, n])), [roadmapNodes]);

  const depths = useMemo(() => computeDepths(roadmapNodes, roadmapEdges), [roadmapNodes, roadmapEdges]);

  const initialNodes = useMemo(() => {
    const rfNodes = toFlowNodes(roadmapNodes, depths);
    const rfEdges = toFlowEdges(roadmapEdges, nodeMap);
    // Always re-layout to maintain vertical spine (ignore stored positions)
    return autoLayout(rfNodes, rfEdges);
  }, [roadmapNodes, roadmapEdges, nodeMap, depths]);

  const initialEdges = useMemo(
    () => toFlowEdges(roadmapEdges, nodeMap),
    [roadmapEdges, nodeMap],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const data = node.data as unknown as RoadmapNode;
      if (!data.unlocked || data.isBranchingPoint) return;
      onNodeClick(data);
    },
    [onNodeClick],
  );

  return (
    <div className="flex-1 h-full" style={{ background: '#f3efe7' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.14 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#d6cfbf" />
        <Controls
          showInteractive={false}
          className="shadow-none! border! border-border! rounded-lg! overflow-hidden!"
          style={{ background: '#faf7f1' }}
        />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as unknown as { _level?: number; masteryState?: string };
            if (d.masteryState === 'mastered')      return '#60a870';
            if (d.masteryState === 'in_progress')   return '#4a7fc1';
            if (d.masteryState === 'review_needed') return '#c9a030';
            if (d.masteryState === 'locked')        return '#d0c8b8';
            // Use level color for not_started
            const levelColors = ['#d4905c', '#5aaa78', '#6080c0'];
            return levelColors[Math.min(d._level ?? 0, 2)];
          }}
          maskColor="rgba(243,239,231,0.6)"
          className="rounded-lg! border! border-border!"
          style={{ background: '#faf7f1' }}
        />
      </ReactFlow>

      {/* Color legend */}
      <div
        className="absolute bottom-4 left-4 flex flex-col gap-1.5 px-3 py-2.5 rounded-[10px] border"
        style={{ background: 'rgba(250,247,241,0.92)', borderColor: '#d6cfbf', backdropFilter: 'blur(4px)' }}
      >
        <div className="text-[9px] tracking-widest uppercase mb-1" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>Legend</div>
        {[
          { color: '#d4905c', label: 'Topics' },
          { color: '#5aaa78', label: 'Subtopics' },
          { color: '#6080c0', label: 'Deep nodes' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}>{label}</span>
          </div>
        ))}
        <div className="mt-1 pt-1 border-t flex flex-col gap-1" style={{ borderColor: '#ebe6db' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 border-t-2" style={{ borderColor: '#9a8a78' }} />
            <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}>Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 border-t-2 border-dashed" style={{ borderColor: '#c5bcaa' }} />
            <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
