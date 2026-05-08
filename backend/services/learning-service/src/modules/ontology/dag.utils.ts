export interface DagEdge {
  nodeId: string;
  prerequisiteNodeId: string;
}

export interface CycleResult {
  hasCycle: boolean;
  cycleNodes?: string[];
}

export interface ValidationReport {
  valid: boolean;
  issues: string[];
}

export function detectCycle(nodeIds: string[], edges: DagEdge[]): CycleResult {
  // Build adjacency in dependency direction: prerequisiteNodeId → nodeId
  // (a node can be reached from its prerequisites)
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) adj.set(id, []);
  for (const e of edges) {
    const list = adj.get(e.prerequisiteNodeId);
    if (list) list.push(e.nodeId);
  }

  // DFS with state tracking: 0=unvisited, 1=in-stack, 2=done
  const state = new Map<string, number>();
  for (const id of nodeIds) state.set(id, 0);
  let cycleNodes: string[] | undefined;

  function dfs(node: string, stack: string[]): boolean {
    state.set(node, 1);
    stack.push(node);
    for (const neighbor of adj.get(node) ?? []) {
      if (state.get(neighbor) === 1) {
        const start = stack.indexOf(neighbor);
        cycleNodes = stack.slice(start);
        return true;
      }
      if (state.get(neighbor) === 0 && dfs(neighbor, stack)) return true;
    }
    stack.pop();
    state.set(node, 2);
    return false;
  }

  for (const id of nodeIds) {
    if (state.get(id) === 0 && dfs(id, [])) {
      return { hasCycle: true, cycleNodes };
    }
  }
  return { hasCycle: false };
}

export function topologicalSort(nodeIds: string[], edges: DagEdge[]): string[] {
  // Kahn's algorithm — returns nodes in learning order (prerequisites first)
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }
  for (const e of edges) {
    inDegree.set(e.nodeId, (inDegree.get(e.nodeId) ?? 0) + 1);
    dependents.get(e.prerequisiteNodeId)?.push(e.nodeId);
  }

  const queue: string[] = [];
  for (const id of nodeIds) {
    if ((inDegree.get(id) ?? 0) === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const dep of dependents.get(node) ?? []) {
      const deg = (inDegree.get(dep) ?? 0) - 1;
      inDegree.set(dep, deg);
      if (deg === 0) queue.push(dep);
    }
  }

  if (sorted.length !== nodeIds.length) {
    throw new Error('Graph has a cycle — topological sort is impossible');
  }
  return sorted;
}

export function findRootNodes(nodeIds: string[], edges: DagEdge[]): string[] {
  const hasPrereqs = new Set(edges.map((e) => e.nodeId));
  return nodeIds.filter((id) => !hasPrereqs.has(id));
}

export function findLeafNodes(nodeIds: string[], edges: DagEdge[]): string[] {
  const hasDependents = new Set(edges.map((e) => e.prerequisiteNodeId));
  return nodeIds.filter((id) => !hasDependents.has(id));
}

export function findOrphanNodes(nodeIds: string[], edges: DagEdge[]): string[] {
  const roots = new Set(findRootNodes(nodeIds, edges));
  if (roots.size === 0) return [];

  // BFS from all root nodes
  const reachable = new Set<string>(roots);
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) adj.set(id, []);
  for (const e of edges) adj.get(e.prerequisiteNodeId)?.push(e.nodeId);

  const queue = [...roots];
  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const neighbor of adj.get(node) ?? []) {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return nodeIds.filter((id) => !reachable.has(id));
}

export function getPrerequisiteChain(nodeId: string, edges: DagEdge[]): string[] {
  const prereqMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!prereqMap.has(e.nodeId)) prereqMap.set(e.nodeId, []);
    prereqMap.get(e.nodeId)!.push(e.prerequisiteNodeId);
  }

  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const prereq of prereqMap.get(current) ?? []) {
      if (!visited.has(prereq)) {
        visited.add(prereq);
        queue.push(prereq);
      }
    }
  }
  return [...visited];
}

export function getDependentChain(nodeId: string, edges: DagEdge[]): string[] {
  const depMap = new Map<string, string[]>();
  for (const e of edges) {
    if (!depMap.has(e.prerequisiteNodeId)) depMap.set(e.prerequisiteNodeId, []);
    depMap.get(e.prerequisiteNodeId)!.push(e.nodeId);
  }

  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const dep of depMap.get(current) ?? []) {
      if (!visited.has(dep)) {
        visited.add(dep);
        queue.push(dep);
      }
    }
  }
  return [...visited];
}

export function validateDAG(nodeIds: string[], edges: DagEdge[]): ValidationReport {
  const issues: string[] = [];

  // Self-referencing edges
  for (const e of edges) {
    if (e.nodeId === e.prerequisiteNodeId) {
      issues.push(`Node ${e.nodeId} has a self-referencing prerequisite`);
    }
  }

  // Cycle detection
  const cycleResult = detectCycle(nodeIds, edges);
  if (cycleResult.hasCycle) {
    const cycleStr = cycleResult.cycleNodes?.join(' → ') ?? 'unknown';
    issues.push(`Cycle detected: ${cycleStr}`);
  }

  // Orphan detection (only meaningful if no cycle — cycles break reachability)
  if (!cycleResult.hasCycle) {
    const orphans = findOrphanNodes(nodeIds, edges);
    if (orphans.length > 0) {
      issues.push(`Orphan nodes (unreachable from any root): ${orphans.join(', ')}`);
    }
  }

  return { valid: issues.length === 0, issues };
}
