import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/ApiError';
import { validateDAG, detectCycle, type DagEdge } from './dag.utils';
import type {
  OntologyStatus,
  STATUS_TRANSITIONS,
  CreateNodeInput,
  UpdateNodeInput,
} from './ontology.types';
import { STATUS_TRANSITIONS as TRANSITIONS } from './ontology.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function assertDraftStatus(ontologyVersionId: string): Promise<void> {
  const version = await prisma.ontologyVersion.findUnique({
    where: { id: ontologyVersionId },
    select: { status: true },
  });
  if (!version) throw ApiError.notFound('Ontology version not found');
  if (version.status !== 'draft') {
    throw ApiError.badRequest('Operation only allowed on draft ontology versions');
  }
}

async function getEdgesForVersion(ontologyVersionId: string): Promise<DagEdge[]> {
  const nodes = await prisma.learningNode.findMany({
    where: { ontologyVersionId },
    select: { id: true },
  });
  const nodeIds = nodes.map((n) => n.id);
  const edges = await prisma.nodePrerequisite.findMany({
    where: { nodeId: { in: nodeIds } },
    select: { nodeId: true, prerequisiteNodeId: true },
  });
  return edges;
}

// ── Ontology Versions ─────────────────────────────────────────────────────────

export async function createVersion(domainId: string, createdById: string) {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw ApiError.notFound('Domain not found');

  const latest = await prisma.ontologyVersion.findFirst({
    where: { domainId },
    orderBy: { versionNumber: 'desc' },
    select: { versionNumber: true },
  });

  return prisma.ontologyVersion.create({
    data: {
      domainId,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      createdById,
      status: 'draft',
    },
  });
}

export async function listVersions(domainId: string) {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) throw ApiError.notFound('Domain not found');

  return prisma.ontologyVersion.findMany({
    where: { domainId },
    orderBy: { versionNumber: 'desc' },
    include: {
      createdBy: { select: { id: true, email: true, fullName: true } },
      verifiedBy: { select: { id: true, email: true, fullName: true } },
      _count: { select: { nodes: true } },
    },
  });
}

export async function getVersion(id: string) {
  const version = await prisma.ontologyVersion.findUnique({
    where: { id },
    include: {
      domain: true,
      createdBy: { select: { id: true, email: true, fullName: true } },
      verifiedBy: { select: { id: true, email: true, fullName: true } },
      nodes: {
        orderBy: { createdAt: 'asc' },
        include: {
          prerequisites: { select: { id: true, nodeId: true, prerequisiteNodeId: true } },
        },
      },
    },
  });
  if (!version) throw ApiError.notFound('Ontology version not found');
  return version;
}

export async function transitionStatus(id: string, newStatus: OntologyStatus, userId: string) {
  const version = await prisma.ontologyVersion.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!version) throw ApiError.notFound('Ontology version not found');

  const current = version.status as OntologyStatus;
  const allowed = TRANSITIONS[current];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from '${current}' to '${newStatus}'. ` +
        `Allowed transitions: ${allowed.join(', ') || 'none'}`,
    );
  }

  if (newStatus === 'published') {
    const nodes = await prisma.learningNode.findMany({
      where: { ontologyVersionId: id },
      select: { id: true },
    });
    if (nodes.length === 0) {
      throw ApiError.badRequest('Cannot publish an ontology version with no nodes');
    }
    const edges = await getEdgesForVersion(id);
    const nodeIds = nodes.map((n) => n.id);
    const report = validateDAG(nodeIds, edges);
    if (!report.valid) {
      throw ApiError.badRequest('DAG validation failed — fix issues before publishing', {
        issues: report.issues,
      });
    }
  }

  const extraFields: Record<string, unknown> = {};
  if (newStatus === 'verified') {
    extraFields.verifiedById = userId;
    extraFields.verifiedAt = new Date();
  }
  if (newStatus === 'published') {
    extraFields.publishedAt = new Date();
  }

  return prisma.ontologyVersion.update({
    where: { id },
    data: { status: newStatus, ...extraFields },
  });
}

// ── Learning Nodes ────────────────────────────────────────────────────────────

export async function createNode(ontologyVersionId: string, data: CreateNodeInput) {
  await assertDraftStatus(ontologyVersionId);

  const clash = await prisma.learningNode.findUnique({
    where: { ontologyVersionId_slug: { ontologyVersionId, slug: data.slug } },
  });
  if (clash) throw ApiError.conflict('A node with this slug already exists in this ontology version');

  return prisma.learningNode.create({
    data: { ...data, ontologyVersionId, learningOutcomes: data.learningOutcomes },
  });
}

export async function updateNode(nodeId: string, data: UpdateNodeInput) {
  const node = await prisma.learningNode.findUnique({ where: { id: nodeId } });
  if (!node) throw ApiError.notFound('Node not found');

  await assertDraftStatus(node.ontologyVersionId);

  if (data.slug && data.slug !== node.slug) {
    const clash = await prisma.learningNode.findUnique({
      where: {
        ontologyVersionId_slug: { ontologyVersionId: node.ontologyVersionId, slug: data.slug },
      },
    });
    if (clash) throw ApiError.conflict('A node with this slug already exists in this ontology version');
  }

  return prisma.learningNode.update({
    where: { id: nodeId },
    data: data as Parameters<typeof prisma.learningNode.update>[0]['data'],
  });
}

export async function deleteNode(nodeId: string) {
  const node = await prisma.learningNode.findUnique({ where: { id: nodeId } });
  if (!node) throw ApiError.notFound('Node not found');

  await assertDraftStatus(node.ontologyVersionId);

  // Delete all edges involving this node before deleting the node
  await prisma.nodePrerequisite.deleteMany({
    where: { OR: [{ nodeId }, { prerequisiteNodeId: nodeId }] },
  });

  await prisma.learningNode.delete({ where: { id: nodeId } });
}

// ── Prerequisites (Edges) ─────────────────────────────────────────────────────

export async function addPrerequisite(nodeId: string, prerequisiteNodeId: string) {
  const [node, prereqNode] = await Promise.all([
    prisma.learningNode.findUnique({ where: { id: nodeId }, select: { ontologyVersionId: true } }),
    prisma.learningNode.findUnique({
      where: { id: prerequisiteNodeId },
      select: { ontologyVersionId: true },
    }),
  ]);

  if (!node) throw ApiError.notFound('Node not found');
  if (!prereqNode) throw ApiError.notFound('Prerequisite node not found');

  await assertDraftStatus(node.ontologyVersionId);

  if (node.ontologyVersionId !== prereqNode.ontologyVersionId) {
    throw ApiError.badRequest('Both nodes must belong to the same ontology version');
  }
  if (nodeId === prerequisiteNodeId) {
    throw ApiError.badRequest('A node cannot be a prerequisite of itself');
  }

  const existing = await prisma.nodePrerequisite.findUnique({
    where: { nodeId_prerequisiteNodeId: { nodeId, prerequisiteNodeId } },
  });
  if (existing) throw ApiError.conflict('Prerequisite edge already exists');

  // Cycle check: would adding this edge create a cycle?
  const allNodes = await prisma.learningNode.findMany({
    where: { ontologyVersionId: node.ontologyVersionId },
    select: { id: true },
  });
  const existingEdges = await getEdgesForVersion(node.ontologyVersionId);
  const proposedEdges: DagEdge[] = [...existingEdges, { nodeId, prerequisiteNodeId }];
  const nodeIds = allNodes.map((n) => n.id);

  const cycleResult = detectCycle(nodeIds, proposedEdges);
  if (cycleResult.hasCycle) {
    throw ApiError.badRequest(
      `Adding this prerequisite would create a cycle: ${cycleResult.cycleNodes?.join(' → ') ?? ''}`,
    );
  }

  return prisma.nodePrerequisite.create({ data: { nodeId, prerequisiteNodeId } });
}

export async function removePrerequisite(prerequisiteId: string) {
  const edge = await prisma.nodePrerequisite.findUnique({ where: { id: prerequisiteId } });
  if (!edge) throw ApiError.notFound('Prerequisite edge not found');

  const node = await prisma.learningNode.findUnique({
    where: { id: edge.nodeId },
    select: { ontologyVersionId: true },
  });
  if (node) await assertDraftStatus(node.ontologyVersionId);

  await prisma.nodePrerequisite.delete({ where: { id: prerequisiteId } });
}

// ── DAG Queries ───────────────────────────────────────────────────────────────

export async function validateOntologyDAG(id: string) {
  const version = await prisma.ontologyVersion.findUnique({ where: { id } });
  if (!version) throw ApiError.notFound('Ontology version not found');

  const nodes = await prisma.learningNode.findMany({
    where: { ontologyVersionId: id },
    select: { id: true },
  });
  const edges = await getEdgesForVersion(id);
  const nodeIds = nodes.map((n) => n.id);

  return validateDAG(nodeIds, edges);
}

export async function getGraph(id: string) {
  const version = await prisma.ontologyVersion.findUnique({
    where: { id },
    select: { id: true, status: true, domainId: true, versionNumber: true },
  });
  if (!version) throw ApiError.notFound('Ontology version not found');

  const nodes = await prisma.learningNode.findMany({
    where: { ontologyVersionId: id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      estimatedHours: true,
      difficultyLevel: true,
      isBranchingPoint: true,
      isConvergencePoint: true,
      branchPath: true,
      positionX: true,
      positionY: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const nodeIds = nodes.map((n) => n.id);
  const edges = await prisma.nodePrerequisite.findMany({
    where: { nodeId: { in: nodeIds } },
    select: { id: true, nodeId: true, prerequisiteNodeId: true },
  });

  return { version, nodes, edges };
}
