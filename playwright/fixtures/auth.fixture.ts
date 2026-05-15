import { test as base, type Page } from '@playwright/test';

const TEST_LEARNER = { email: 'learner@test.com', password: 'password123' };
const TEST_ADMIN   = { email: 'admin@test.com',   password: 'password123' };

interface AuthFixtures {
  auth: {
    loginAs: (role: 'learner' | 'admin') => Promise<void>;
    logout: () => Promise<void>;
  };
}

export const test = base.extend<AuthFixtures>({
  auth: async ({ page }: { page: Page }, use: (r: AuthFixtures['auth']) => Promise<void>) => {
    const loginAs = async (role: 'learner' | 'admin') => {
      const creds = role === 'admin' ? TEST_ADMIN : TEST_LEARNER;
      await page.goto('/login');
      await page.fill('[type=email]', creds.email);
      await page.fill('[type=password]', creds.password);
      await page.click('[type=submit]');
      await page.waitForURL('**/dashboard', { timeout: 10_000 });
    };

    const logout = async () => {
      await page.evaluate(() => {
        localStorage.removeItem('atlas-auth');
        sessionStorage.clear();
      });
    };

    await use({ loginAs, logout });
  },
});

export { expect } from '@playwright/test';
