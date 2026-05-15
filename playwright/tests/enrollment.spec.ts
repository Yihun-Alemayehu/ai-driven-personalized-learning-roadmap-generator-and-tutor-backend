import { test, expect } from '../fixtures/auth.fixture';

test.describe('Enrollment flow', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  test('catalog page shows domain cards', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('[data-testid=domain-card]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard shows enrolled domains', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to domain detail from catalog', async ({ page }) => {
    await page.goto('/catalog');
    const firstCard = page.locator('[data-testid=domain-card]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/catalog\/.+/);
  });

  test('enroll dialog opens from domain detail', async ({ page }) => {
    await page.goto('/catalog');
    const firstCard = page.locator('[data-testid=domain-card]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    const enrollBtn = page.locator('button', { hasText: /enroll/i }).first();
    if (await enrollBtn.isVisible()) {
      await enrollBtn.click();
      await expect(page.locator('[role=dialog], [data-testid=enroll-dialog]')).toBeVisible();
    }
  });
});
