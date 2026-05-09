# Phase 10: Polish, Tests & CI/CD

**Depends on:** [Phase 9: Admin Panel & Ontology Builder](09-admin.md)  
**Next phase:** — (final phase)

---

## What to Build

Production-readiness pass: skeleton loading states throughout, error boundaries, empty states, responsive layout, accessibility audit, Vitest unit/integration tests, Playwright E2E tests, and the GitHub Actions CI/CD pipeline.

---

## Dependencies to Install

```bash
# Testing
npm install -D vitest @vitest/coverage-v8 jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D msw                         # Mock Service Worker — mock API in tests

# E2E
npm install -D @playwright/test
npx playwright install chromium

# Dev experience
npm install -D vite-plugin-svgr            # SVG as React components (for icons)
```

---

## Checklist Areas

### 1. Skeleton Loading States

Every page that fetches data must show skeleton placeholders while loading — not just a spinner. Use shadcn's `Skeleton` component.

```typescript
// Pattern: conditional render based on isLoading
if (isLoading) return <DomainCatalogSkeleton />;
return <DomainCatalogPage data={data} />;
```

Pages requiring skeleton treatment:
- `DomainCatalogPage` — skeleton grid of 6 DomainCard skeletons
- `RoadmapPage` — grey rectangle canvas with animated pulse nodes
- `NodeDetailDrawer` — skeleton for title, stats, outcomes
- `ResourcePanel` — 3 ResourceCard skeletons
- `ExplanationPanel` — animated skeleton during AI generation (special: shows "Generating…" message)
- `LearnerListPage` — skeleton table rows
- `DomainAnalyticsPage` — skeleton bar chart
- `SystemStatsPage` — 4 stat card skeletons

---

### 2. Error Boundaries & Error States

Global `ErrorBoundary` wraps `<RouterProvider>` to catch uncaught rendering errors. Per-feature error states for API failures:

```typescript
// Pattern in every query-consuming component
if (isError) return (
  <EmptyState
    icon={<AlertTriangle />}
    title="Failed to load"
    description={error.message}
    action={<Button onClick={() => refetch()}>Try again</Button>}
  />
);
```

`EmptyState` component variants:
- `type="error"` — red icon, retry button
- `type="empty"` — grey icon, CTA (e.g., "Enroll in your first domain")
- `type="no-results"` — search/filter produced nothing

---

### 3. Responsive Layout

Breakpoints to support:

| Breakpoint | Layout |
|------------|--------|
| `sm` (< 640px) | Mobile: bottom navigation bar; no sidebar; full-width cards |
| `md` (640-1024px) | Tablet: collapsible sidebar (icon-only); 2-col catalog grid |
| `lg` (> 1024px) | Desktop: fixed sidebar; 3-4 col catalog grid |

- `AppShell` switches between fixed sidebar and bottom-nav based on `useMediaQuery`
- React Flow roadmap: full-screen on mobile (pinch-zoom); minimap hidden on `sm`
- NodeDetailDrawer: full-screen Sheet on mobile vs. 480px panel on desktop
- Tables: horizontal scroll on mobile

---

### 4. Accessibility Audit

Run `axe-core` during development and fix all violations:

```bash
npm install -D @axe-core/react
# Add in dev mode: import { run } from '@axe-core/react'
```

Checklist:
- [ ] All interactive elements have accessible labels (aria-label or visible text)
- [ ] Colour contrast passes WCAG AA (4.5:1 for normal text)
- [ ] Keyboard navigation works: Tab through all interactive elements; Enter/Space activates
- [ ] React Flow nodes keyboard-navigable (focus ring visible)
- [ ] Modals trap focus; ESC closes
- [ ] All images have `alt` text; decorative images have `alt=""`
- [ ] Form fields have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`

---

### 5. Performance

- [ ] React Flow canvas: only render visible nodes (use `<ReactFlow defaultViewport>` + built-in virtualisation)
- [ ] Virtualize long lists: `LearnerTable` and `UserTable` use `@tanstack/react-virtual` if rows > 100
- [ ] Lazy-load all route pages with `React.lazy` + `Suspense`
- [ ] Image lazy loading: `<img loading="lazy">` on domain icons
- [ ] TanStack Query: `staleTime` set appropriately (roadmap: 2min; catalog: 10min; AI explanation: 10min)
- [ ] Bundle analysis: `npx vite-bundle-visualizer` — ensure no accidental large imports

---

### 6. Vitest Unit & Integration Tests

#### Test setup (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

#### MSW handlers (`src/test/handlers.ts`)
```typescript
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.post('/api/v1/auth/login', () =>
    HttpResponse.json({ user: mockUser, tokens: mockTokens })),
  http.get('/api/v1/domains', () =>
    HttpResponse.json([mockDomain1, mockDomain2])),
  http.get('/api/v1/enrollments/:id/roadmap', () =>
    HttpResponse.json(mockRoadmapData)),
  // ... all endpoints
];
```

#### Test coverage targets

| Module | Min Coverage |
|--------|-------------|
| `src/api/*` | 80% |
| `src/store/auth.store.ts` | 90% |
| `src/routes/ProtectedRoute.tsx` | 100% |
| `src/features/auth/*` | 80% |
| `src/features/quiz/*` | 80% |
| `src/features/roadmap/*` | 70% |

---

### 7. Playwright E2E Tests

#### Test file structure
```
playwright/
├── fixtures/
│   └── auth.fixture.ts          # Login helper
└── tests/
    ├── auth.spec.ts              # Login, register, logout flows
    ├── enrollment.spec.ts        # Browse catalog, enroll, see dashboard
    ├── roadmap.spec.ts           # Load roadmap, click node, open drawer
    ├── quiz.spec.ts              # Take quiz, submit, see outcome
    └── notifications.spec.ts     # Bell badge, mark read
```

#### Key E2E scenarios
```typescript
// auth.spec.ts
test('login with valid credentials navigates to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('[type=submit]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid=user-name]')).toBeVisible();
});

// roadmap.spec.ts
test('clicking unlocked node opens detail drawer', async ({ page, auth }) => {
  await auth.loginAs('learner');
  await page.goto('/enrollments/test-enrollment-id/roadmap');
  await page.click('[data-testid=node-unlocked]');
  await expect(page.locator('[data-testid=node-drawer]')).toBeVisible();
});
```

---

### 8. GitHub Actions CI Pipeline (update existing)

Update `.github/workflows/ci.yml` to add the frontend:
```yaml
  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - run: npm run test:coverage
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
        env:
          VITE_API_BASE_URL: http://localhost:3000/api/v1
```

#### `package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

### 9. Deployment (update deploy.yml)

Add frontend build + deploy step to `.github/workflows/deploy.yml`:
```yaml
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
        env:
          VITE_API_BASE_URL: ${{ secrets.PROD_API_URL }}
      - name: Upload dist to S3 / deploy to Vercel / Nginx
        # Adjust based on chosen hosting
        run: |
          # Option A: Vercel
          npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
          # Option B: Copy to nginx static dir on server
          # scp -r frontend/dist/* $STAGING_HOST:/var/www/html/
```

---

## Definition of Done

- [ ] All pages show skeleton loading states — no empty white flashes
- [ ] All API error states show retry buttons and friendly messages
- [ ] All pages work on mobile (375px), tablet (768px), and desktop (1280px)
- [ ] Lighthouse Performance score ≥ 80 on production build
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Zero axe-core violations in critical flows
- [ ] Keyboard navigation works for all interactive elements
- [ ] Vitest coverage ≥ 80% across `src/api/` and `src/features/auth/`
- [ ] All 5 Playwright E2E test suites pass against running backend
- [ ] `npm run build` produces zero TypeScript errors
- [ ] CI pipeline completes: typecheck → lint → build → unit tests → E2E tests
- [ ] Bundle size: main chunk < 400kb gzipped
