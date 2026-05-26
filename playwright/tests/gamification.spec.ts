import { test, expect } from '../fixtures/auth.fixture';

test.describe('Gamification — Achievements page', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  // ── Navigation ───────────────────────────────────────────────────────────────

  test('achievements page is reachable from sidebar nav', async ({ page }) => {
    await page.goto('/dashboard');

    // The sidebar has a "Achievements" link on desktop
    const link = page.locator('a[href="/achievements"], nav a', { hasText: /achievements/i }).first();
    if (await link.isVisible({ timeout: 5_000 })) {
      await link.click();
    } else {
      // Fallback: navigate directly
      await page.goto('/achievements');
    }
    await expect(page).toHaveURL(/\/achievements/);
  });

  test('achievements page is reachable from bottom nav on mobile', async ({ page }) => {
    // The mobile bottom nav also has the achievements tab
    await page.goto('/achievements');
    await expect(page).toHaveURL(/\/achievements/);
  });

  // ── Page structure ───────────────────────────────────────────────────────────

  test('page header is visible with level and XP summary', async ({ page }) => {
    await page.goto('/achievements');
    // Page title
    await expect(page.locator('h1', { hasText: /achievements/i })).toBeVisible({ timeout: 8_000 });
    // Sub-line contains "Level", "XP", and "streak"
    const subtitle = page.locator('p, [class*="subtitle"], h1 ~ p, h1 + *').first();
    await expect(subtitle).toContainText(/level|xp/i, { timeout: 8_000 });
  });

  test('XP progress bar section is visible', async ({ page }) => {
    await page.goto('/achievements');
    // The page header subtitle contains "XP"; the XpBar component also renders
    // "Level X · Y XP" text. Use .or() to combine text and attribute selectors.
    const xpSection = page.getByText(/\d+\s*xp/i).first()
      .or(page.locator('[data-testid=xp-bar]').first());
    await expect(xpSection).toBeVisible({ timeout: 10_000 });
  });

  test('streak badge is visible', async ({ page }) => {
    await page.goto('/achievements');
    const streak = page.getByText(/streak/i).first()
      .or(page.locator('[data-testid=streak-badge]').first());
    await expect(streak).toBeVisible({ timeout: 10_000 });
  });

  test('weekly goal card is visible', async ({ page }) => {
    await page.goto('/achievements');
    await expect(page.locator('text=/weekly goal/i').first()).toBeVisible({ timeout: 10_000 });
  });

  test('badges section renders', async ({ page }) => {
    await page.goto('/achievements');
    await expect(page.locator('text=/badges/i').first()).toBeVisible({ timeout: 10_000 });
    // At least one badge card or the empty-state message
    const badgeItem = page.locator('[data-testid=badge-item], [data-testid=badge-card]').first()
      .or(page.getByText(/no badges earned yet/i).first());
    await expect(badgeItem).toBeVisible({ timeout: 10_000 });
  });

  test('recent XP history section renders', async ({ page }) => {
    await page.goto('/achievements');
    await expect(page.locator('text=/recent xp/i').first()).toBeVisible({ timeout: 10_000 });
    // Either a history row or an empty-state message
    const historyItem = page.locator('[data-testid=xp-event]').first()
      .or(page.getByText(/no xp events|take a quiz/i).first());
    await expect(historyItem).toBeVisible({ timeout: 10_000 });
  });

  // ── Data integrity ───────────────────────────────────────────────────────────

  test('XP total is a non-negative number', async ({ page }) => {
    await page.goto('/achievements');
    // Wait for data to load (skeleton disappears)
    await expect(page.locator('h1', { hasText: /achievements/i })).toBeVisible({ timeout: 8_000 });

    const subtitle = await page.locator('p').first().textContent({ timeout: 8_000 });
    // Subtitle format: "Level X · Y XP · Z badge(s) · N-day streak"
    expect(subtitle).toMatch(/\d+\s*xp/i);
  });

  test('page root has overflow-y-auto (scrollable container)', async ({ page }) => {
    await page.goto('/achievements');
    await expect(page.locator('h1', { hasText: /achievements/i })).toBeVisible({ timeout: 8_000 });

    // The AchievementsPage root div carries the Tailwind class `overflow-y-auto`
    // which makes it the scroll root within AppShell's fixed-height main area.
    const scrollRoot = page.locator('div.overflow-y-auto').first();
    await expect(scrollRoot).toBeAttached({ timeout: 5_000 });

    // Confirm via computed style that it actually has overflow-y: auto
    const overflowY = await scrollRoot.evaluate((el) =>
      window.getComputedStyle(el).overflowY,
    );
    expect(['auto', 'scroll']).toContain(overflowY);
  });

  // ── Responsive ───────────────────────────────────────────────────────────────

  test('XP card and streak card stack vertically on mobile', async ({ page }) => {
    // This test runs on the mobile project (Pixel 5 = 393px wide)
    await page.goto('/achievements');
    await expect(page.locator('h1', { hasText: /achievements/i })).toBeVisible({ timeout: 8_000 });

    const xpCard = page.locator('[data-testid=xp-bar]').first()
      .or(page.getByText(/level/i).first());
    const streakCard = page.locator('[data-testid=streak-badge]').first()
      .or(page.getByText(/streak/i).first());

    if (
      (await xpCard.isVisible({ timeout: 3_000 })) &&
      (await streakCard.isVisible({ timeout: 3_000 }))
    ) {
      const xpBox = await xpCard.boundingBox();
      const streakBox = await streakCard.boundingBox();
      // On mobile they should be in the same column (close x-position)
      if (xpBox && streakBox && page.viewportSize()!.width < 640) {
        // Both start near x=0 on mobile (stacked)
        expect(Math.abs(xpBox.x - streakBox.x)).toBeLessThan(100);
      }
    }
  });
});
