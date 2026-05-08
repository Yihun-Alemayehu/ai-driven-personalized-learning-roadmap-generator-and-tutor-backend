import { prisma } from '../../lib/prisma';

export interface LinkCheckResult {
  isValid: boolean;
  statusCode?: number;
}

export async function validateLink(url: string): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { isValid: res.ok, statusCode: res.status };
  } catch {
    clearTimeout(timer);
    return { isValid: false };
  }
}

export async function validateAllResources(): Promise<{ checked: number; invalid: number }> {
  const resources = await prisma.resource.findMany({
    select: { id: true, url: true },
  });

  let invalid = 0;

  for (const resource of resources) {
    const result = await validateLink(resource.url);
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        isValid: result.isValid,
        lastValidatedAt: new Date(),
      },
    });
    if (!result.isValid) invalid++;
  }

  return { checked: resources.length, invalid };
}
