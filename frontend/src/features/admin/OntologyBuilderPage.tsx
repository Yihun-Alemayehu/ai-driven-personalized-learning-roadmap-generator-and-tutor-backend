import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  useOntologyDetailQuery,
  useUpdateOntologyStatusMutation,
  useAddPrerequisiteMutation,
  useDeletePrerequisiteMutation,
  useValidateOntologyQuery,
  useUpdateNodeMutation,
} from '@/api/admin';
import type { OntologyNode, OntologyEdge, OntologyStatus } from '@/types';
import { OntologyStatusBadge } from './components/OntologyStatusBadge';

// ── Auto-layout (topological level-based) ─────────────────────────────────────

const NODE_W = 180;
const NODE_H = 70;
const H_GAP  = 50;
const V_GAP  = 110;

function computeAutoLayout(
  nodeIds: string[],
  edges: OntologyEdge[],
): Map<string, { x: number; y: number }> {
  // Build: prerequisiteNodeId → [nodeIds that depend on it]
  const children = new Map<string, string[]>();
  const inDegree  = new Map<string, number>();
  for (const id of nodeIds) { children.set(id, []); inDegree.set(id, 0); }

  for (const e of edges) {
    children.get(e.prerequisiteNodeId)?.push(e.nodeId);
    inDegree.set(e.nodeId, (inDegree.get(e.nodeId) ?? 0) + 1);
  }

  // BFS from roots to assign max depth per node
  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const id of nodeIds) {
    if ((inDegree.get(id) ?? 0) === 0) { depth.set(id, 0); queue.push(id); }
  }
  while (queue.length) {
    const cur = queue.shift()!;
    const d   = depth.get(cur) ?? 0;
    for (const child of (children.get(cur) ?? [])) {
      if ((depth.get(child) ?? -1) < d + 1) {
        depth.set(child, d + 1);
        queue.push(child);
      }
    }
  }

  // Group by depth level
  const byLevel = new Map<number, string[]>();
  for (const id of nodeIds) {
    const lvl = depth.get(id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(id);
  }

  // Compute positions — centre each level horizontally
  const maxCount  = Math.max(...Array.from(byLevel.values()).map((g) => g.length));
  const totalW    = maxCount * (NODE_W + H_GAP) - H_GAP;
  const positions = new Map<string, { x: number; y: number }>();

  for (const [lvl, ids] of byLevel) {
    const rowW   = ids.length * (NODE_W + H_GAP) - H_GAP;
    const startX = (totalW - rowW) / 2;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: startX + i * (NODE_W + H_GAP),
        y: lvl * (NODE_H + V_GAP),
      });
    });
  }

  return positions;
}
import { NodeEditPanel } from './components/NodeEditPanel';
import { AddNodeDialog } from './components/AddNodeDialog';
import { ValidationResultBanner } from './components/ValidationResultBanner';

// ── Editable node type ────────────────────────────────────────────────────────

const BRANCH_COLORS: Record<string, string> = {
  frontend:     '#d8e4f8',
  backend:      '#d8f0e0',
  data_science: '#fdecd4',
  __default__:  '#f3efe7',
};

const BRANCH_BORDER: Record<string, string> = {
  frontend:     '#6080c0',
  backend:      '#5aaa78',
  data_science: '#d4905c',
  __default__:  '#c8c0b2',
};

function EditableNode({ data, selected }: { data: Record<string, unknown>; selected: boolean }) {
  const bg = BRANCH_COLORS[(data.branchPath as string) ?? '__default__'] ?? BRANCH_COLORS.__default__;
  const border = BRANCH_BORDER[(data.branchPath as string) ?? '__default__'] ?? BRANCH_BORDER.__default__;
  const isBranching = Boolean(data.isBranchingPoint);

  return (
    <div
      className="relative rounded-[10px] px-3 py-2.5 flex flex-col gap-0.5 select-none"
      style={{
        background: bg,
        border: `2px solid ${selected ? '#1a1614' : border}`,
        minWidth: 140,
        boxShadow: selected ? '0 0 0 3px rgba(26,22,20,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {isBranching && (
        <div
          className="absolute -top-2 right-2 text-[10px] px-1.5 rounded-full"
          style={{ background: '#1a1614', color: '#faf7f1', fontFamily: 'JetBrains Mono, monospace' }}
        >
          🔀
        </div>
      )}

      <Handle type="target" position={Position.Top} style={{ background: border, width: 8, height: 8 }} />

      <div
        className="text-[13px] font-medium leading-snug"
        style={{ fontFamily: "'Crimson Pro', serif", color: '#1a1614' }}
      >
        {data.label as string}
      </div>

      {data.difficultyLevel != null && (
        <div className="text-[10px]" style={{ color: border, fontFamily: 'JetBrains Mono, monospace' }}>
          {'★'.repeat(data.difficultyLevel as number)}{'☆'.repeat(5 - (data.difficultyLevel as number))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: border, width: 8, height: 8 }} />
    </div>
  );
}

const NODE_TYPES = { editableNode: EditableNode };

// ── Status pipeline ────────────────────────────────────────────────────────────

const STATUS_NEXT: Partial<Record<OntologyStatus, { next: OntologyStatus; label: string }>> = {
  draft:     { next: 'in_review', label: 'Submit for Review →' },
  in_review: { next: 'verified',  label: 'Verify →' },
  verified:  { next: 'published', label: 'Publish →' },
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OntologyBuilderPage() {
  const { ontologyId = '' } = useParams<{ ontologyId: string }>();

  const { data: ontology, isLoading } = useOntologyDetailQuery(ontologyId);
  const updateStatus = useUpdateOntologyStatusMutation();
  const addPrereq = useAddPrerequisiteMutation(ontologyId);
  const deletePrereq = useDeletePrerequisiteMutation(ontologyId);
  const updateNode = useUpdateNodeMutation(ontologyId);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addPosition, setAddPosition] = useState({ x: 100, y: 100 });
  const [runValidation, setRunValidation] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const { data: validation } = useValidateOntologyQuery(ontologyId, runValidation);
  const flowRef = useRef<HTMLDivElement>(null);

  const isDraft = ontology?.status === 'draft' || ontology?.status === 'in_review' || ontology?.status === 'verified';

  // Sync backend data → React Flow state
  useEffect(() => {
    if (!ontology) return;

    // Auto-layout when no nodes have saved positions
    const needsLayout = ontology.nodes.every((n) => n.positionX == null && n.positionY == null);
    const autoPositions = needsLayout
      ? computeAutoLayout(ontology.nodes.map((n) => n.id), ontology.edges)
      : null;

    const nodes: Node[] = ontology.nodes.map((n) => ({
      id: n.id,
      type: 'editableNode',
      position: autoPositions?.get(n.id) ?? { x: n.positionX ?? 0, y: n.positionY ?? 0 },
      data: {
        label: n.title,
        branchPath: n.branchPath,
        difficultyLevel: n.difficultyLevel,
        isBranchingPoint: n.isBranchingPoint,
        _raw: n,
      },
      draggable: isDraft,
    }));

    // Build edge map: edgeId is the prerequisite record id
    const edges: Edge[] = ontology.edges.map((e) => ({
      id: e.id,
      source: e.prerequisiteNodeId,
      target: e.nodeId,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9a9088' },
      style: { stroke: '#9a9088', strokeWidth: 1.5 },
      deletable: isDraft,
    }));

    setRfNodes(nodes);
    setRfEdges(edges);
  }, [ontology, isDraft]);

  // Create prerequisite edge on connect
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isDraft) return;
      addPrereq.mutate(
        { nodeId: params.target!, prerequisiteNodeId: params.source! },
        {
          onSuccess: () => {
            // React Flow optimistically adds the edge; the query refetch will sync ids
            setRfEdges((eds) => addEdge({ ...params }, eds));
          },
        },
      );
    },
    [isDraft, addPrereq],
  );

  // Delete edge = delete prerequisite
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      if (!isDraft) return;
      if (!window.confirm('Delete this prerequisite connection?')) return;
      deletePrereq.mutate(edge.id, {
        onSuccess: () => setRfEdges((eds) => eds.filter((e) => e.id !== edge.id)),
      });
    },
    [isDraft, deletePrereq],
  );

  // Click node → open edit panel
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const raw = (node.data as Record<string, unknown>)._raw as OntologyNode;
      setSelectedNode(raw);
    },
    [],
  );

  // Drag node end → save position
  const onNodeDragStop: NodeMouseHandler = useCallback(
    (_, node) => {
      if (!isDraft) return;
      updateNode.mutate({
        nodeId: node.id,
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
      });
    },
    [isDraft, updateNode],
  );

  // Right-click canvas → open add dialog
  function onPaneContextMenu(e: React.MouseEvent | MouseEvent) {
    if (!isDraft) return;
    e.preventDefault();
    const rect = flowRef.current?.getBoundingClientRect();
    setAddPosition({
      x: rect ? e.clientX - rect.left : e.clientX,
      y: rect ? e.clientY - rect.top : e.clientY,
    });
    setShowAddDialog(true);
  }

  function handleValidate() {
    setRunValidation(true);
    setShowValidation(true);
  }

  function handleStatusAdvance() {
    const next = STATUS_NEXT[ontology?.status as OntologyStatus];
    if (!next) return;
    updateStatus.mutate({ ontologyId, status: next.next });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse p-8">
        <div className="h-8 w-64 rounded-[8px]" style={{ background: '#ebe6db' }} />
        <div className="h-[500px] rounded-[12px]" style={{ background: '#ebe6db' }} />
      </div>
    );
  }

  if (!ontology) {
    return (
      <div className="p-8 text-center" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
        Ontology not found.
      </div>
    );
  }

  const nextAction = STATUS_NEXT[ontology.status as OntologyStatus];

  return (
    <div className="flex flex-col h-full gap-0" style={{ background: '#faf7f1' }}>
      {/* Header bar */}
      <div
        className="flex items-center gap-3 px-6 py-3 border-b shrink-0 flex-wrap"
        style={{ borderColor: '#d6cfbf' }}
      >
        <Link
          to="/admin/domains"
          className="text-[12px] hover:underline"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
        >
          ← Domains
        </Link>

        <div
          className="flex items-center gap-2 flex-1"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1614', fontSize: 18 }}
        >
          Ontology v{ontology.version}
          <OntologyStatusBadge status={ontology.status as OntologyStatus} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isDraft && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1a1614', border: '1px solid #d6cfbf' }}
            >
              + Add Node
            </button>
          )}
          <button
            onClick={handleValidate}
            className="px-3 py-1.5 rounded-[8px] text-[12px] hover:bg-[#ebe6db] transition-colors"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', border: '1px solid #d6cfbf' }}
          >
            Validate DAG
          </button>
          {nextAction && (
            <button
              onClick={handleStatusAdvance}
              disabled={updateStatus.isPending}
              className="px-3 py-1.5 rounded-[8px] text-[12px] transition-colors disabled:opacity-50 hover:opacity-90"
              style={{ background: '#1a1614', color: '#faf7f1', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {updateStatus.isPending ? '…' : nextAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Validation banner */}
      {showValidation && validation && (
        <div className="px-6 pt-3 shrink-0">
          <ValidationResultBanner result={validation} onDismiss={() => { setShowValidation(false); setRunValidation(false); }} />
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative min-h-0" ref={flowRef}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeDragStop={onNodeDragStop}
          onPaneContextMenu={onPaneContextMenu}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{ background: '#f7f3ec' }}
          deleteKeyCode={null}
        >
          <Background color="#d6cfbf" gap={20} size={1} />
          <Controls style={{ background: '#faf7f1', border: '1px solid #d6cfbf', borderRadius: 8 }} />
          <MiniMap
            nodeColor={(n) => BRANCH_COLORS[(n.data as Record<string, unknown>).branchPath as string] ?? BRANCH_COLORS.__default__}
            style={{ background: '#f3efe7', border: '1px solid #d6cfbf', borderRadius: 8 }}
          />
        </ReactFlow>

        {/* Legend */}
        <div
          className="absolute bottom-4 left-4 px-3 py-2 rounded-[8px] flex flex-col gap-1.5"
          style={{ background: '#faf7f1', border: '1px solid #d6cfbf', zIndex: 5 }}
        >
          {[
            { color: BRANCH_COLORS.__default__, label: 'Core' },
            { color: BRANCH_COLORS.frontend, label: 'Frontend' },
            { color: BRANCH_COLORS.backend, label: 'Backend' },
            { color: BRANCH_COLORS.data_science, label: 'Data Science' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm border" style={{ background: color, borderColor: '#d6cfbf' }} />
              <span className="text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
                {label}
              </span>
            </div>
          ))}
          {isDraft && (
            <p className="text-[9px] mt-1 border-t pt-1" style={{ borderColor: '#ebe6db', color: '#c0b8b0', fontFamily: 'JetBrains Mono, monospace' }}>
              Right-click canvas to add node
            </p>
          )}
        </div>
      </div>

      {/* Node edit panel (slides in from right) */}
      {selectedNode && (
        <NodeEditPanel
          node={selectedNode}
          ontologyId={ontologyId}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Add node dialog */}
      {showAddDialog && (
        <AddNodeDialog
          ontologyId={ontologyId}
          defaultPosition={addPosition}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}
