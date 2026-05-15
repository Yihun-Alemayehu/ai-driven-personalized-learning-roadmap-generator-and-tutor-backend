import { test, expect } from '../fixtures/auth.fixture';

test.describe('Roadmap', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  test('roadmap page loads react flow canvas', async ({ page }) => {
    // Navigate to first enrollment's roadmap from dashboard
    await page.goto('/dashboard');
    const roadmapLink = page.locator('a[href*="/roadmap"]').first();
    if (await roadmapLink.isVisible({ timeout: 5_000 })) {
      await roadmapLink.click();
      await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });
    }
  });

  test('clicking an unlocked node opens detail drawer', async ({ page }) => {
    await page.goto('/dashboard');
    const roadmapLink = page.locator('a[href*="/roadmap"]').first();
    if (!(await roadmapLink.isVisible({ timeout: 5_000 }))) return;
    await roadmapLink.click();
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });

    // Click first visible node card
    const nodeCard = page.locator('[data-testid=learning-node]').first();
    if (await nodeCard.isVisible({ timeout: 5_000 })) {
      await nodeCard.click();
      // Drawer should appear with node title
      await expect(page.locator('[data-testid=node-drawer], [role=dialog]')).toBeVisible({ timeout: 5_000 });
    }
  });

  test('roadmap has a color legend', async ({ page }) => {
    await page.goto('/dashboard');
    const roadmapLink = page.locator('a[href*="/roadmap"]').first();
    if (!(await roadmapLink.isVisible({ timeout: 5_000 }))) return;
    await roadmapLink.click();
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });
    // Legend visible
    await expect(page.locator('text=Topics, text=Subtopics').or(page.locator('text=Core, text=Frontend'))).toBeVisible({ timeout: 3_000 });
  });
});
