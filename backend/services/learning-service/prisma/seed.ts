import { PrismaClient } from '@prisma/client';
import { seedDomains } from './seeds/001_domains';
import { seedFrontendOntology } from './seeds/002_frontend_ontology';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed…');
  await seedDomains(prisma);
  await seedFrontendOntology(prisma);
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
