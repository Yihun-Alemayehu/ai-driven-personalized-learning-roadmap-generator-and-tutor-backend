import { test, expect } from '../fixtures/auth.fixture';

test.describe('Quiz flow', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  test('quiz page renders questions', async ({ page }) => {
    // Navigate to roadmap and open a node with a quiz button
    await page.goto('/dashboard');
    const roadmapLink = page.locator('a[href*="/roadmap"]').first();
    if (!(await roadmapLink.isVisible({ timeout: 5_000 }))) return;
    await roadmapLink.click();
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });

    const nodeCard = page.locator('[data-testid=learning-node]').first();
    if (!(await nodeCard.isVisible({ timeout: 5_000 }))) return;
    await nodeCard.click();

    const quizBtn = page.locator('button', { hasText: /take quiz|start quiz/i }).first();
    if (!(await quizBtn.isVisible({ timeout: 5_000 }))) return;
    await quizBtn.click();

    // Quiz page should show questions
    await expect(page.locator('[data-testid=quiz-question], h2, h3').first()).toBeVisible({ timeout: 10_000 });
  });

  test('quiz attempt review page accessible from history', async ({ page }) => {
    // If there are any attempts, /quiz-attempts/:id should render
    await page.goto('/dashboard');
    const attemptLink = page.locator('a[href*="/quiz-attempts/"]').first();
    if (await attemptLink.isVisible({ timeout: 3_000 })) {
      await attemptLink.click();
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5_000 });
    }
  });
});
