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

const NODE_W = 134;
const NODE_H = 60;
const BRANCH_SIZE = 90;

// Must be defined outside the component to prevent React Flow re-registration warnings
const NODE_TYPES = { learningNode: LearningNodeCard };

function autoLayout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 56, ranksep: 90 });

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

function toFlowNodes(roadmapNodes: RoadmapNode[]): Node[] {
  return roadmapNodes.map((n) => ({
    id: n.id,
    type: 'learningNode',
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data: n as unknown as Record<string, unknown>,
    draggable: false,
    selectable: n.unlocked && !n.isBranchingPoint,
  }));
}

function toFlowEdges(edges: RoadmapEdge[], nodeMap: Map<string, RoadmapNode>): Edge[] {
  return edges.map((e, i) => {
    const target = nodeMap.get(e.nodeId);
    const isLocked = !target?.unlocked;
    return {
      id: `e-${i}`,
      source: e.prerequisiteNodeId,
      target: e.nodeId,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: isLocked ? '#c5bcaa' : '#9a8a78',
        strokeWidth: isLocked ? 1 : 1.3,
        strokeDasharray: isLocked ? '4 3' : undefined,
        opacity: 0.75,
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

  const initialNodes = useMemo(() => {
    const rfNodes = toFlowNodes(roadmapNodes);
    const rfEdges = toFlowEdges(roadmapEdges, nodeMap);
    const needsLayout = roadmapNodes.every((n) => n.positionX == null);
    return needsLayout ? autoLayout(rfNodes, rfEdges) : rfNodes;
  }, [roadmapNodes, roadmapEdges, nodeMap]);

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
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.25}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d6cfbf" />
        <Controls
          showInteractive={false}
          className="shadow-none! border! border-border! rounded-lg! overflow-hidden!"
          style={{ background: '#faf7f1' }}
        />
        <MiniMap
          nodeColor={(n) => {
            const state = (n.data as unknown as RoadmapNode)?.masteryState;
            const cm: Record<string, string> = {
              mastered: '#60a870', in_progress: '#4a7fc1', review_needed: '#c9a030',
              not_started: '#b0a890', relearn: '#c8613a', locked: '#d0c8b8',
            };
            return cm[state] ?? '#ccc';
          }}
          maskColor="rgba(243,239,231,0.6)"
          className="rounded-lg! border! border-border!"
          style={{ background: '#faf7f1' }}
        />
      </ReactFlow>
    </div>
  );
}
