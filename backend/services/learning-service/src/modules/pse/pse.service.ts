import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { search } from './pse.client';
import type { Resource } from '@prisma/client';

const CACHE_TTL = 86_400; // 24 hours
// Cap per-discovery to 3 whitelist searches to preserve Serper quota
const MAX_SOURCES = 3;

function cacheKey(nodeId: string): string {
  return `serper:node:${nodeId}`;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function guessModality(
  sourceDomain: string,
): 'documentation' | 'tutorial' | 'video' | 'interactive' | 'reference' {
  if (['youtube.com', 'youtu.be', 'frontendmasters.com', 'egghead.io'].includes(sourceDomain))
    return 'video';
  if (
    ['freecodecamp.org', 'css-tricks.com', 'javascript.info', 'web.dev', 'scrimba.com'].includes(
      sourceDomain,
    )
  )
    return 'tutorial';
  if (
    ['developer.mozilla.org', 'tc39.es', 'w3.org', 'html.spec.whatwg.org'].includes(sourceDomain)
  )
    return 'reference';
  if (['codesandbox.io', 'codepen.io', 'stackblitz.com'].includes(sourceDomain))
    return 'interactive';
  return 'documentation';
}

export async function discoverForNode(nodeId: string, queryOverride?: string): Promise<Resource[]> {
  // Return cached results if available
  const cached = await redis.get(cacheKey(nodeId));
  if (cached) return JSON.parse(cached) as Resource[];

  // Get node details and its domain's whitelist
  const node = await prisma.learningNode.findUnique({
    where: { id: nodeId },
    select: {
      title: true,
      learningOutcomes: true,
      ontologyVersion: { select: { domainId: true } },
    },
  });
  if (!node) return [];

  const whitelist = await prisma.domainWhitelist.findMany({
    where: { domainId: node.ontologyVersion.domainId },
    select: { sourceDomain: true, defaultModality: true },
  });

  const outcomes = Array.isArray(node.learningOutcomes) ? node.learningOutcomes : [];
  const baseQuery =
    queryOverride ?? `${node.title} ${outcomes.slice(0, 2).join(' ')} tutorial`;

  // Collect existing URLs to avoid duplicates
  const existing = await prisma.resource.findMany({
    where: { nodeId },
    select: { url: true },
  });
  const existingUrls = new Set(existing.map((r) => r.url));

  const inserted: Resource[] = [];

  // Limit to MAX_SOURCES whitelist entries to conserve Serper quota
  const sources =
    whitelist.length > 0
      ? whitelist.slice(0, MAX_SOURCES)
      : [{ sourceDomain: '', defaultModality: 'documentation' as const }];

  for (const entry of sources) {
    const items = await search(baseQuery, entry.sourceDomain || undefined);
    for (const item of items) {
      if (existingUrls.has(item.link)) continue;
      existingUrls.add(item.link);

      const sourceDomain = extractDomain(item.link);
      const modality = guessModality(sourceDomain) ?? entry.defaultModality;

      const resource = await prisma.resource.create({
        data: {
          nodeId,
          title: item.title.slice(0, 499),
          url: item.link,
          sourceDomain,
          modality,
          description: item.snippet,
          fetchedVia: 'serper_api',
        },
      });
      inserted.push(resource);
    }
  }

  if (inserted.length > 0) {
    await redis.setex(cacheKey(nodeId), CACHE_TTL, JSON.stringify(inserted));
  }

  return inserted;
}

export async function bustCache(nodeId: string): Promise<void> {
  await redis.del(cacheKey(nodeId));
}
