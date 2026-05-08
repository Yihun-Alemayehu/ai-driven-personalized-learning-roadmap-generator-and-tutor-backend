import { prisma } from '../../lib/prisma';
import { discoverForNode } from '../pse/pse.service';
import type { Resource } from '@prisma/client';

// Preference order when swapping away from a modality
const SWAP_PREFERENCE: Record<string, string[]> = {
  documentation: ['tutorial', 'video', 'interactive'],
  tutorial: ['video', 'interactive', 'documentation'],
  video: ['tutorial', 'interactive', 'documentation'],
  interactive: ['tutorial', 'documentation', 'video'],
  reference: ['tutorial', 'documentation', 'video'],
};

export async function getAdaptedResources(
  nodeId: string,
  fromModality?: string,
): Promise<Resource[]> {
  const resources = await prisma.resource.findMany({
    where: { nodeId, isValid: true },
    orderBy: [{ avgRating: 'desc' }, { createdAt: 'asc' }],
  });

  if (resources.length === 0) {
    // No resources at all — trigger discovery with tutorial-focused query
    const node = await prisma.learningNode.findUnique({
      where: { id: nodeId },
      select: { title: true },
    });
    return discoverForNode(nodeId, `${node?.title ?? ''} tutorial beginner guide`);
  }

  // Determine the source modality (most common among existing resources)
  const from =
    fromModality ??
    mostCommonModality(resources.map((r) => r.modality));

  const preferred = SWAP_PREFERENCE[from] ?? ['tutorial', 'video'];

  for (const targetModality of preferred) {
    const alternatives = resources.filter((r) => r.modality === targetModality);
    if (alternatives.length > 0) return alternatives.slice(0, 3);
  }

  // No alternative modality exists — trigger PSE with tutorial-focused query
  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: { title: true },
  });
  return discoverForNode(nodeId, `${node?.title ?? ''} tutorial video guide`);
}

function mostCommonModality(modalities: string[]): string {
  const counts: Record<string, number> = {};
  for (const m of modalities) counts[m] = (counts[m] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'documentation';
}
