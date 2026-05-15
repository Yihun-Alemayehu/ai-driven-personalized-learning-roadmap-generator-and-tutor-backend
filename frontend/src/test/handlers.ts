import { http, HttpResponse } from 'msw';
import {
  mockUser, mockTokens, mockDomain, mockDomain2,
  mockEnrollment, mockRoadmapData, mockQuiz, mockNotifications,
} from './mocks';

const BASE = '/api/v1';

export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({ user: mockUser, accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken }),
  ),
  http.post(`${BASE}/auth/register`, () =>
    HttpResponse.json({ user: mockUser, accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken }),
  ),
  http.post(`${BASE}/auth/logout`, () => HttpResponse.json({ ok: true })),
  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ accessToken: mockTokens.accessToken }),
  ),
  http.get(`${BASE}/auth/me`, () => HttpResponse.json(mockUser)),

  // ── Domains ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/domains`, () => HttpResponse.json([mockDomain, mockDomain2])),
  http.get(`${BASE}/domains/:slug`, ({ params }) =>
    HttpResponse.json(params.slug === mockDomain.slug ? mockDomain : mockDomain2),
  ),

  // ── Enrollments ───────────────────────────────────────────────────────────
  http.get(`${BASE}/enrollments`, () => HttpResponse.json([mockEnrollment])),
  http.post(`${BASE}/enrollments`, () => HttpResponse.json(mockEnrollment)),
  http.get(`${BASE}/enrollments/:id/roadmap`, () => HttpResponse.json(mockRoadmapData)),

  // ── Quizzes ───────────────────────────────────────────────────────────────
  http.get(`${BASE}/nodes/:nodeId/quiz`, () => HttpResponse.json(mockQuiz)),
  http.post(`${BASE}/quizzes/:quizId/attempts`, () =>
    HttpResponse.json({
      attempt: { id: 'attempt-1', scorePercent: 90, correctAnswers: 9, totalQuestions: 10, completedAt: new Date().toISOString() },
      gatekeeper: { tier: 'strong_pass', newMasteryState: 'mastered', isMarginalPass: false, newlyUnlockedNodes: ['node-2'] },
    }),
  ),

  // ── Notifications ─────────────────────────────────────────────────────────
  http.get(`${BASE}/notifications`, () =>
    HttpResponse.json({ notifications: mockNotifications, unreadCount: 1, total: 1 }),
  ),
  http.patch(`${BASE}/notifications/:id/read`, () => HttpResponse.json({ ok: true })),
  http.patch(`${BASE}/notifications/read-all`, () => HttpResponse.json({ ok: true })),

  // ── Admin ─────────────────────────────────────────────────────────────────
  http.get(`${BASE}/admin/users`, () =>
    HttpResponse.json({ users: [{ ...mockUser, createdAt: mockUser.createdAt }], total: 1 }),
  ),
  http.get(`${BASE}/admin/stats`, () =>
    HttpResponse.json({
      stats: {
        users: 100,
        enrollments: 80,
        quizAttempts: 40,
        avgQuizScore: 3.8,
        masteryBreakdown: {
          in_progress: 29,
          review_needed: 1,
          mastered: 3,
          not_started: 247,
        },
      },
    }),
  ),
  http.get(`${BASE}/admin/stats/domains`, () =>
    HttpResponse.json({
      stats: [{ domainId: 'domain-1', name: 'Web Development', enrollmentCount: 40, avgCompletion: 72, avgQuizScore: 81 }],
    }),
  ),
];
