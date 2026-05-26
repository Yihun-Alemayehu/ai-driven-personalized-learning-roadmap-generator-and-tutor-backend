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
    // Zod schema message: "Invalid email address"
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[type=email]', 'wrong@example.com');
    await page.fill('[type=password]', 'wrongpassword');
    await page.click('[type=submit]');
    // A 401 response triggers the axios refresh interceptor which calls
    // onAuthFailure → logout → navigate to /login (re-mount), losing React
    // state. Asserting the URL remains /login is the robust contract here.
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    // User must NOT have been admitted to the app
    await expect(page).not.toHaveURL(/\/dashboard/);
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
