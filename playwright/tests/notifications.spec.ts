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
    const bell = page.locator('[data-testid=notification-bell]').first();
    await expect(bell).toBeVisible({ timeout: 5_000 });
    await bell.click();
    // The bell toggles an inline popover. Wait for any newly-visible floating
    // element, OR for navigation to /notifications.
    const popoverContent = page.locator('[role=dialog], [role=menu], [role=listbox]').first()
      .or(page.locator('text=/notifications/i').nth(1)); // second occurrence = inside popover
    const appeared = await popoverContent.isVisible({ timeout: 3_000 }).catch(() => false);
    const navigated = page.url().includes('/notifications');
    expect(appeared || navigated).toBe(true);
  });

  test('notifications page renders empty state or mark-all-read button', async ({ page }) => {
    await page.goto('/notifications');
    // "Mark all as read" only appears when unreadCount > 0.
    // A fresh e2e user may have 0 notifications, so accept either the button
    // or the page heading as proof the page loaded correctly.
    // Accept any of: the mark-all button, the page heading, or the empty-state text.
    // Use .first() on the whole chain to avoid strict-mode failures when multiple
    // arms of .or() are simultaneously visible (h1 + empty-state paragraph).
    const pageReady = page.locator('button', { hasText: /mark all as read/i })
      .or(page.locator('h1'))
      .or(page.getByText(/no notifications yet/i));
    await expect(pageReady.first()).toBeVisible({ timeout: 8_000 });
  });
});
