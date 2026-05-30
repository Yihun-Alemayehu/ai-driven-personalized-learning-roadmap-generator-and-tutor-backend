import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, key) => {
      if (err) reject(err);
      // eslint-disable-next-line no-promise-executor-return
      else resolve(`${salt}:${key.toString('hex')}`);
    });
  });
}

export async function seedAdminAndInstructorUsers(prisma: PrismaClient) {
  // Create test admin account
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const adminPasswordHash = await hashPassword('password123');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        fullName: 'Test Admin',
        role: 'admin',
        passwordHash: adminPasswordHash,
        preferredLanguage: 'en',
      },
    });
    console.log(`Created admin user: ${admin.email} (ID: ${admin.id})`);
  } else {
    console.log('Admin user already exists: admin@example.com');
  }

  // Create test instructor (domain_expert) account
  const instructorExists = await prisma.user.findUnique({
    where: { email: 'instructor@example.com' },
  });

  if (!instructorExists) {
    const instructorPasswordHash = await hashPassword('password123');
    const instructor = await prisma.user.create({
      data: {
        email: 'instructor@example.com',
        fullName: 'Test Instructor',
        role: 'domain_expert',
        passwordHash: instructorPasswordHash,
        preferredLanguage: 'en',
      },
    });
    console.log(`Created instructor user: ${instructor.email} (ID: ${instructor.id})`);
  } else {
    console.log('Instructor user already exists: instructor@example.com');
  }

  // Create test learner account for instructor to monitor
  const learnerExists = await prisma.user.findUnique({
    where: { email: 'learner@example.com' },
  });

  if (!learnerExists) {
    const learnerPasswordHash = await hashPassword('password123');
    const learner = await prisma.user.create({
      data: {
        email: 'learner@example.com',
        fullName: 'Test Learner',
        role: 'learner',
        passwordHash: learnerPasswordHash,
        preferredLanguage: 'en',
      },
    });
    console.log(`Created learner user: ${learner.email} (ID: ${learner.id})`);

    // Enroll learner in a domain for testing instructor features
    const frontendDomain = await prisma.domain.findUnique({
      where: { slug: 'frontend-development' },
    });

    if (frontendDomain) {
      // Get the published ontology version for this domain
      const ontology = await prisma.ontologyVersion.findFirst({
        where: { domainId: frontendDomain.id, status: 'published' },
      });

      if (!ontology) {
        console.log('No published ontology found for frontend-development');
        return;
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: learner.id,
          domainId: frontendDomain.id,
          ontologyVersionId: ontology.id,
        },
      });
      console.log(`Enrolled learner in: ${frontendDomain.name}`);

      // Create some node progress for the learner
      const nodes = await prisma.learningNode.findMany({
        where: { ontologyVersionId: ontology.id },
        take: 3,
      });

      for (const node of nodes) {
        await prisma.learnerNodeProgress.create({
          data: {
            userId: learner.id,
            enrollmentId: enrollment.id,
            nodeId: node.id,
            masteryState: ['not_started', 'in_progress', 'mastered'][Math.floor(Math.random() * 3)] as 'not_started' | 'in_progress' | 'mastered',
            attemptsCount: Math.floor(Math.random() * 3),
          },
        });
      }
      console.log(`Created ${nodes.length} node progress entries for learner`);
    }
  } else {
    console.log('Learner user already exists: learner@example.com');
  }

  console.log('Admin/Instructor/Learner seed complete.');
}
