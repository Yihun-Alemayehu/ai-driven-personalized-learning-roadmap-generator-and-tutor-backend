import { PrismaClient } from '@prisma/client';
import { seedDomains } from './seeds/001_domains';
import { seedFrontendOntology } from './seeds/002_frontend_ontology';
import { seedFrontendQuizzes } from './seeds/003_frontend_quizzes';
import { seedChallengeProjects } from './seeds/004_challenge_projects';
import { seedDomainWhitelist } from './seeds/005_domain_whitelist';
import { seedManualResources } from './seeds/006_manual_resources';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed…');
  await seedDomains(prisma);
  await seedFrontendOntology(prisma);
  await seedFrontendQuizzes(prisma);
  await seedChallengeProjects(prisma);
  await seedDomainWhitelist(prisma);
  await seedManualResources(prisma);
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
