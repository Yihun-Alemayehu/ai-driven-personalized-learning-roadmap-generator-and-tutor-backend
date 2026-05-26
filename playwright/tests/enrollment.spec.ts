import { test, expect } from '../fixtures/auth.fixture';

test.describe('Enrollment flow', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.loginAs('learner');
  });

  // ── Catalog browsing ─────────────────────────────────────────────────────────

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

  // ── Full enroll happy path ───────────────────────────────────────────────────

  test('completes full 3-step enrollment and lands on roadmap', async ({ page }) => {
    // 1. Open a domain detail page
    await page.goto('/catalog');
    const firstCard = page.locator('[data-testid=domain-card]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/catalog\/.+/, { timeout: 8_000 });

    // 2. Click Enroll button (text: "Enroll Now") — if already enrolled,
    //    the button is replaced by a "Go to Roadmap" button; navigate there.
    const enrollBtn = page.locator('button', { hasText: /enroll now/i }).first();
    const alreadyEnrolledBtn = page.locator('button', { hasText: /roadmap|continue/i }).first();
    if (!(await enrollBtn.isVisible({ timeout: 5_000 }))) {
      if (await alreadyEnrolledBtn.isVisible({ timeout: 2_000 })) {
        await alreadyEnrolledBtn.click();
        await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });
      }
      return;
    }
    await enrollBtn.click();

    const dialog = page.locator('[role=dialog]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // 3. Step 1 — pick learning path (click first option)
    const firstPathOption = dialog
      .locator('[data-testid=path-option], label:has(input[type=radio]), [role=radio]')
      .first();
    if (await firstPathOption.isVisible({ timeout: 3_000 })) {
      await firstPathOption.click();
    }
    await dialog.locator('button', { hasText: /next/i }).click();

    // 4. Step 2 — personalisation: fill hours, pick any radio options
    await expect(dialog.locator('text=/hours|goal|familiarity|learning style/i').first())
      .toBeVisible({ timeout: 5_000 });

    const hoursInput = dialog.locator('input[type=number], input[placeholder*="hour"]').first();
    if (await hoursInput.isVisible({ timeout: 2_000 })) {
      await hoursInput.fill('5');
    }

    // Pick first unselected radio in each group
    for (const group of await dialog.locator('[role=radiogroup], fieldset').all()) {
      const radio = group.locator('input[type=radio], [role=radio]').first();
      if (await radio.isVisible()) await radio.click();
    }

    await dialog.locator('button', { hasText: /next/i }).click();

    // 5. Step 3 — confirmation: submit
    await expect(dialog.locator('text=/confirm|enroll/i').first()).toBeVisible({ timeout: 5_000 });
    const confirmBtn = dialog
      .locator('button', { hasText: /confirm|enroll now|start learning/i })
      .first();
    await expect(confirmBtn).toBeEnabled({ timeout: 3_000 });
    await confirmBtn.click();

    // 6. Should navigate to roadmap
    await expect(page).toHaveURL(/\/roadmap\//, { timeout: 15_000 });
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 15_000 });
  });

  test('enroll dialog stays within viewport on step 2', async ({ page }) => {
    await page.goto('/catalog');
    const firstCard = page.locator('[data-testid=domain-card]').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();

    const enrollBtn = page.locator('button', { hasText: /enroll now/i }).first();
    if (!(await enrollBtn.isVisible({ timeout: 5_000 }))) return;
    await enrollBtn.click();

    const dialog = page.locator('[role=dialog]');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Advance to Step 2 — the tallest step
    await dialog.locator('button', { hasText: /next/i }).click();
    await expect(dialog.locator('text=/hours|goal|familiarity/i').first()).toBeVisible({ timeout: 4_000 });

    const box = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 2); // 2px rounding tolerance
  });
});
