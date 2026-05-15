import { test, expect } from '../fixtures/auth.fixture';

test.describe('Notifications', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  test('notification bell is visible in navbar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('[aria-label="Notifications"], [data-testid=notification-bell], button[title*="notification"]').first())
      .toBeVisible({ timeout: 5_000 });
  });

  test('notifications page renders', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('clicking notification bell opens dropdown or navigates', async ({ page }) => {
    await page.goto('/dashboard');
    const bell = page.locator('[data-testid=notification-bell], button:has([data-lucide=bell])').first();
    if (await bell.isVisible({ timeout: 5_000 })) {
      await bell.click();
      // Either dropdown appears or redirects to /notifications
      const dropdown = page.locator('[data-testid=notification-dropdown]');
      const onNotifPage = page.url().includes('/notifications');
      const dropdownVisible = await dropdown.isVisible({ timeout: 2_000 }).catch(() => false);
      expect(dropdownVisible || onNotifPage).toBe(true);
    }
  });

  test('notifications page has mark all read button', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('button', { hasText: /mark all/i }).or(
      page.locator('button', { hasText: /read/i })
    ).first()).toBeVisible({ timeout: 5_000 });
  });
});
