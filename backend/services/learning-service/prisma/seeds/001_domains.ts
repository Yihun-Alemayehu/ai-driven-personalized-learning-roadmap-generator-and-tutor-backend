import { PrismaClient } from '@prisma/client';

export async function seedDomains(prisma: PrismaClient) {
  const domains = [
    {
      name: 'Frontend Development',
      slug: 'frontend-development',
      description: 'Build modern user interfaces with HTML, CSS, JavaScript, and React.',
      iconUrl: null,
    },
    {
      name: 'Backend Development',
      slug: 'backend-development',
      description: 'Build scalable server-side applications and APIs.',
      iconUrl: null,
    },
    {
      name: 'Data Science',
      slug: 'data-science',
      description: 'Analyze data and build machine learning models with Python.',
      iconUrl: null,
    },
    {
      name: 'DevOps Engineering',
      slug: 'devops-engineering',
      description: 'Automate infrastructure, CI/CD pipelines, and cloud deployments.',
      iconUrl: null,
    },
  ];

  for (const d of domains) {
    await prisma.domain.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description },
      create: d,
    });
  }

  console.log(`Seeded ${domains.length} domains`);
}
