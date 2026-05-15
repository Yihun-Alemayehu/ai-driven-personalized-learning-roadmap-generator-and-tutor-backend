import type { User, Domain, Enrollment, RoadmapData, RoadmapNode, Quiz } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'learner',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockAdmin: User = {
  id: 'admin-1',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const mockDomain: Domain = {
  id: 'domain-1',
  name: 'Web Development',
  slug: 'web-development',
  description: 'Learn web development from scratch',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockDomain2: Domain = {
  id: 'domain-2',
  name: 'Python',
  slug: 'python',
  description: 'Python programming',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockEnrollment: Enrollment = {
  id: 'enrollment-1',
  userId: 'user-1',
  domainId: 'domain-1',
  domain: mockDomain,
  enrolledAt: '2026-02-01T00:00:00.000Z',
};

const baseNode: RoadmapNode = {
  id: 'node-1',
  title: 'HTML Basics',
  slug: 'html-basics',
  description: 'Learn HTML',
  learningOutcomes: ['Create web pages'],
  estimatedHours: 5,
  difficultyLevel: 1,
  isBranchingPoint: false,
  isConvergencePoint: false,
  masteryState: 'not_started',
  unlocked: true,
  attemptsCount: 0,
};

export const mockRoadmapData: RoadmapData = {
  nodes: [
    baseNode,
    { ...baseNode, id: 'node-2', title: 'CSS Basics', slug: 'css-basics', masteryState: 'locked', unlocked: false },
  ],
  edges: [{ nodeId: 'node-2', prerequisiteNodeId: 'node-1' }],
};

export const mockQuiz: Quiz = {
  id: 'quiz-1',
  nodeId: 'node-1',
  isMicroQuiz: false,
  questions: [
    {
      id: 'q-1',
      questionType: 'multiple_choice',
      questionText: 'What does HTML stand for?',
      options: ['HyperText Markup Language', 'HighText Machine Language', 'Hyperloop Machine Language', 'None'],
      explanation: 'HTML stands for HyperText Markup Language.',
      orderIndex: 0,
    },
  ],
};

export const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'node_unlocked',
    title: 'New node unlocked',
    body: 'CSS Basics is now available',
    data: { enrollmentId: 'enrollment-1' },
    read: false,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
];
