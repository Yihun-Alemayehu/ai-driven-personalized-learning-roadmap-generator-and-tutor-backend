import { PrismaClient } from '@prisma/client';

interface NodeDef {
  title: string;
  slug: string;
  description: string;
  learningOutcomes: string[];
  estimatedHours: number;
  difficultyLevel: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  prereqs: string[];
}

const NODES: NodeDef[] = [
  {
    title: 'Linux & Command Line',
    slug: 'do-linux-cli',
    description: 'Navigate and manage a Linux system — filesystem, permissions, processes, and shell scripting.',
    learningOutcomes: [
      'Navigate the filesystem and manage files with shell commands',
      'Set file permissions and manage users',
      'Write Bash scripts with variables, loops, and conditionals',
      'Monitor and manage processes with ps, top, and kill',
    ],
    estimatedHours: 8,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Git & Version Control',
    slug: 'do-git',
    description: 'Track changes, branch, and collaborate using Git and GitHub.',
    learningOutcomes: [
      'Initialize repos, stage, and commit changes',
      'Create, merge, and rebase branches',
      'Resolve merge conflicts',
      'Use pull requests and GitHub Actions triggers',
    ],
    estimatedHours: 5,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Networking Fundamentals',
    slug: 'do-networking',
    description: 'TCP/IP, DNS, HTTP, firewalls, and load balancing concepts for infrastructure work.',
    learningOutcomes: [
      'Explain TCP/IP layers and the OSI model',
      'Configure DNS records (A, CNAME, MX, TXT)',
      'Trace and diagnose network issues with ping, traceroute, curl',
      'Understand firewall rules, NAT, and VPNs',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['do-linux-cli'],
  },
  {
    title: 'Docker & Containers',
    slug: 'do-docker',
    description: 'Build, run, and manage containers with Docker and Docker Compose.',
    learningOutcomes: [
      'Write Dockerfiles and build images',
      'Run containers and manage volumes and networks',
      'Compose multi-container apps with Docker Compose',
      'Understand layer caching and image optimization',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['do-linux-cli'],
  },
  {
    title: 'CI/CD Fundamentals',
    slug: 'do-cicd-fundamentals',
    description: 'Automate build, test, and deploy pipelines with GitHub Actions.',
    learningOutcomes: [
      'Define workflows with triggers, jobs, and steps',
      'Cache dependencies and use marketplace actions',
      'Run tests and linters on every pull request',
      'Build and push Docker images from CI',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['do-git', 'do-docker'],
  },
  {
    title: 'Cloud Providers (AWS / GCP / Azure)',
    slug: 'do-cloud-fundamentals',
    description: 'Core cloud concepts and key services across major providers.',
    learningOutcomes: [
      'Understand compute, storage, networking primitives on a major cloud',
      'Launch VMs, object storage buckets, and managed databases',
      'Manage IAM users, roles, and least-privilege policies',
      'Estimate and monitor cloud costs',
    ],
    estimatedHours: 12,
    difficultyLevel: 2,
    prereqs: ['do-networking', 'do-docker'],
  },
  {
    title: 'Infrastructure as Code with Terraform',
    slug: 'do-terraform',
    description: 'Define, provision, and version cloud infrastructure with Terraform.',
    learningOutcomes: [
      'Write HCL resource blocks for cloud resources',
      'Use variables, outputs, and modules',
      'Manage state with remote backends (S3 + DynamoDB)',
      'Apply and destroy infra safely with plan/apply workflow',
    ],
    estimatedHours: 12,
    difficultyLevel: 3,
    prereqs: ['do-cloud-fundamentals'],
  },
  {
    title: 'Configuration Management with Ansible',
    slug: 'do-ansible',
    description: 'Automate server configuration and application deployments with Ansible playbooks.',
    learningOutcomes: [
      'Write YAML playbooks with tasks, handlers, and variables',
      'Use inventory files and dynamic inventories',
      'Apply roles and reuse playbooks across environments',
      'Manage secrets with Ansible Vault',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['do-cloud-fundamentals'],
  },
  {
    title: 'Kubernetes Fundamentals',
    slug: 'do-kubernetes',
    description: 'Deploy and manage containerized workloads on Kubernetes.',
    learningOutcomes: [
      'Understand Pods, Deployments, Services, and ConfigMaps',
      'Deploy apps with kubectl and YAML manifests',
      'Expose services with Ingress and ClusterIP',
      'Scale and roll back Deployments',
    ],
    estimatedHours: 14,
    difficultyLevel: 3,
    prereqs: ['do-docker', 'do-cloud-fundamentals'],
  },
  {
    title: 'Helm & Kubernetes Packaging',
    slug: 'do-helm',
    description: 'Package and manage Kubernetes applications with Helm charts.',
    learningOutcomes: [
      'Create and customize Helm charts',
      'Use values files for environment-specific config',
      'Install, upgrade, and rollback releases',
      'Use community charts from Artifact Hub',
    ],
    estimatedHours: 6,
    difficultyLevel: 3,
    prereqs: ['do-kubernetes'],
  },
  {
    title: 'Observability — Logs, Metrics & Tracing',
    slug: 'do-observability',
    description: 'Instrument applications and infrastructure with the three pillars of observability.',
    learningOutcomes: [
      'Aggregate logs with Loki or CloudWatch Logs',
      'Collect and visualize metrics with Prometheus and Grafana',
      'Instrument services with OpenTelemetry for distributed tracing',
      'Set up alerts and on-call runbooks',
    ],
    estimatedHours: 12,
    difficultyLevel: 3,
    prereqs: ['do-kubernetes'],
  },
  {
    title: 'Security & Secrets Management',
    slug: 'do-security',
    description: 'Secure pipelines, infrastructure, and secrets using DevSecOps practices.',
    learningOutcomes: [
      'Rotate secrets and manage them with Vault or AWS Secrets Manager',
      'Scan container images for CVEs with Trivy',
      'Apply Pod Security Standards and RBAC in Kubernetes',
      'Integrate SAST and dependency scanning into CI',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['do-cicd-fundamentals', 'do-kubernetes'],
  },
  {
    title: 'Advanced CI/CD — GitOps with ArgoCD',
    slug: 'do-gitops',
    description: 'Implement GitOps workflows with ArgoCD for declarative continuous delivery.',
    learningOutcomes: [
      'Install and configure ArgoCD in a cluster',
      'Define App of Apps and ApplicationSets',
      'Automate sync with image updater',
      'Implement promotion strategies across environments',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['do-helm', 'do-cicd-fundamentals'],
    isBranchingPoint: true,
  },
  {
    title: 'Cloud-Native Infrastructure',
    slug: 'do-cloud-native',
    description: 'Managed Kubernetes (EKS/GKE/AKS), serverless functions, and event-driven architectures.',
    learningOutcomes: [
      'Provision managed Kubernetes clusters with Terraform',
      'Deploy serverless functions (Lambda / Cloud Run)',
      'Build event-driven pipelines with SQS / Pub/Sub',
      'Use service meshes (Istio / Linkerd) for traffic management',
    ],
    estimatedHours: 12,
    difficultyLevel: 4,
    prereqs: ['do-gitops', 'do-terraform'],
  },
  {
    title: 'Platform Engineering',
    slug: 'do-platform-engineering',
    description: 'Build Internal Developer Platforms (IDPs) and golden-path templates for engineering teams.',
    learningOutcomes: [
      'Design self-service developer portals with Backstage',
      'Create golden-path templates for new services',
      'Implement policy-as-code with OPA/Kyverno',
      'Define and enforce platform SLOs',
    ],
    estimatedHours: 12,
    difficultyLevel: 4,
    prereqs: ['do-gitops', 'do-observability'],
  },
  {
    title: 'SRE & Reliability Engineering',
    slug: 'do-sre',
    description: 'Apply Site Reliability Engineering principles — SLOs, error budgets, incident management.',
    learningOutcomes: [
      'Define SLIs, SLOs, and error budgets',
      'Design runbooks and post-mortems for incidents',
      'Implement chaos engineering with Chaos Monkey or LitmusChaos',
      'Capacity plan and right-size infrastructure',
    ],
    estimatedHours: 10,
    difficultyLevel: 4,
    prereqs: ['do-observability', 'do-security'],
    isConvergencePoint: true,
  },
];

export async function seedDevOpsOntology(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'devops-engineering' } });
  if (!domain) throw new Error('Domain devops-engineering not found — run 001_domains first');

  const admin = await prisma.user.upsert({
    where: { email: 'seed-admin@system.internal' },
    update: {},
    create: {
      email: 'seed-admin@system.internal',
      fullName: 'System Seed',
      role: 'admin',
      passwordHash: null,
    },
  });

  const existing = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, versionNumber: 1 },
  });
  if (existing) {
    console.log('DevOps ontology v1 already seeded — skipping');
    return;
  }

  const version = await prisma.ontologyVersion.create({
    data: {
      domainId: domain.id,
      versionNumber: 1,
      status: 'draft',
      createdById: admin.id,
    },
  });

  const slugToId = new Map<string, string>();

  for (const nodeDef of NODES) {
    const { prereqs, ...fields } = nodeDef;
    const node = await prisma.learningNode.create({
      data: {
        ...fields,
        ontologyVersionId: version.id,
        learningOutcomes: fields.learningOutcomes,
        estimatedHours: fields.estimatedHours,
      },
    });
    slugToId.set(nodeDef.slug, node.id);
  }

  let edgeCount = 0;
  for (const nodeDef of NODES) {
    const nodeId = slugToId.get(nodeDef.slug)!;
    for (const prereqSlug of nodeDef.prereqs) {
      const prereqId = slugToId.get(prereqSlug);
      if (!prereqId) throw new Error(`Unknown prereq slug: ${prereqSlug}`);
      await prisma.nodePrerequisite.create({
        data: { nodeId, prerequisiteNodeId: prereqId },
      });
      edgeCount++;
    }
  }

  await prisma.ontologyVersion.update({
    where: { id: version.id },
    data: { status: 'published', publishedAt: new Date() },
  });

  console.log(`Seeded DevOps Engineering ontology v1: ${NODES.length} nodes, ${edgeCount} edges (published)`);
}
