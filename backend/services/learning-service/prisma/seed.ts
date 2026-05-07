import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Phase 1 placeholder — seed data is added from Phase 4 onward
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
