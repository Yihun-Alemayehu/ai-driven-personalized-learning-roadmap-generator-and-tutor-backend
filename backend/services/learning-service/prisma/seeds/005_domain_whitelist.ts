import { PrismaClient } from '@prisma/client';

interface WhitelistEntry {
  sourceDomain: string;
  sourceName: string;
  defaultModality: 'documentation' | 'tutorial' | 'video' | 'interactive' | 'reference';
}

const FRONTEND_WHITELIST: WhitelistEntry[] = [
  { sourceDomain: 'developer.mozilla.org', sourceName: 'MDN Web Docs', defaultModality: 'reference' },
  { sourceDomain: 'javascript.info', sourceName: 'The Modern JavaScript Tutorial', defaultModality: 'tutorial' },
  { sourceDomain: 'web.dev', sourceName: 'web.dev (Google)', defaultModality: 'documentation' },
  { sourceDomain: 'css-tricks.com', sourceName: 'CSS-Tricks', defaultModality: 'tutorial' },
  { sourceDomain: 'react.dev', sourceName: 'React Official Docs', defaultModality: 'documentation' },
  { sourceDomain: 'vitejs.dev', sourceName: 'Vite Docs', defaultModality: 'documentation' },
  { sourceDomain: 'typescriptlang.org', sourceName: 'TypeScript Official Docs', defaultModality: 'documentation' },
  { sourceDomain: 'freecodecamp.org', sourceName: 'freeCodeCamp', defaultModality: 'tutorial' },
  { sourceDomain: 'youtube.com', sourceName: 'YouTube', defaultModality: 'video' },
  { sourceDomain: 'frontendmasters.com', sourceName: 'Frontend Masters', defaultModality: 'video' },
  { sourceDomain: 'egghead.io', sourceName: 'Egghead.io', defaultModality: 'video' },
  { sourceDomain: 'scrimba.com', sourceName: 'Scrimba', defaultModality: 'interactive' },
  { sourceDomain: 'tailwindcss.com', sourceName: 'Tailwind CSS Docs', defaultModality: 'documentation' },
  { sourceDomain: 'redux.js.org', sourceName: 'Redux Toolkit Docs', defaultModality: 'documentation' },
  { sourceDomain: 'testing-library.com', sourceName: 'Testing Library Docs', defaultModality: 'documentation' },
];

export async function seedDomainWhitelist(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'frontend-development' } });
  if (!domain) throw new Error('Domain frontend-development not found');

  const admin = await prisma.user.findUnique({ where: { email: 'seed-admin@system.internal' } });

  let created = 0;
  let skipped = 0;

  for (const entry of FRONTEND_WHITELIST) {
    const existing = await prisma.domainWhitelist.findUnique({
      where: { domainId_sourceDomain: { domainId: domain.id, sourceDomain: entry.sourceDomain } },
    });
    if (existing) { skipped++; continue; }

    await prisma.domainWhitelist.create({
      data: {
        domainId: domain.id,
        sourceDomain: entry.sourceDomain,
        sourceName: entry.sourceName,
        defaultModality: entry.defaultModality,
        addedById: admin?.id ?? null,
      },
    });
    created++;
  }

  console.log(`Whitelist: ${created} created, ${skipped} already existed`);
}
