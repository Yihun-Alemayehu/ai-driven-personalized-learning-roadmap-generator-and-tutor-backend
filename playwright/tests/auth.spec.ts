import { test, expect } from '../fixtures/auth.fixture';

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.locator('[type=email]')).toBeVisible();
    await expect(page.locator('[type=password]')).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type=email]', 'not-an-email');
    await page.fill('[type=password]', 'password123');
    await page.click('[type=submit]');
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type=email]', 'wrong@example.com');
    await page.fill('[type=password]', 'wrongpassword');
    await page.click('[type=submit]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 8_000 });
  });

  test('redirect to /login when accessing protected route unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/create|register|sign up/i);
  });

  test('logout clears auth and redirects to login', async ({ page, auth }) => {
    await auth.loginAs('learner');
    await auth.logout();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
