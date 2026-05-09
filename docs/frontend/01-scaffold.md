# Phase 1: Project Scaffold, Routing & Layout

**Depends on:** Backend running (Phase 12 complete)  
**Next phase:** [Phase 2: Auth](02-auth.md)

---

## What to Build

Bootstrap the Vite + React + TypeScript project. Install all core dependencies. Set up React Router v6 with nested layouts. Create the persistent AppShell (navbar + sidebar). Wire up TanStack Query and Zustand. Set up the Axios API client skeleton. No real API calls yet — just scaffolding and mocked UI.

---

## Dependencies to Install

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend

# Routing & data fetching
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools

# State
npm install zustand

# HTTP
npm install axios

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui (run after tailwind setup)
npx shadcn@latest init
# Install needed components:
npx shadcn@latest add button card dialog sheet badge avatar
npx shadcn@latest add dropdown-menu popover tooltip scroll-area
npx shadcn@latest add input label textarea select separator skeleton

# Icons
npm install lucide-react

# Utilities
npm install clsx tailwind-merge date-fns
```

---

## File & Folder Structure

```
frontend/src/
├── api/
│   └── client.ts                  # Axios instance (interceptors added in Phase 2)
├── components/
│   ├── ui/                        # shadcn generated files (do not edit manually)
│   ├── layout/
│   │   ├── AppShell.tsx           # Root layout: sidebar + main content area
│   │   ├── Navbar.tsx             # Top bar: logo, search, notifications bell, avatar
│   │   ├── Sidebar.tsx            # Left nav: dashboard, catalog, profile links
│   │   └── PageWrapper.tsx        # Per-page padding + max-width container
│   └── common/
│       ├── Spinner.tsx            # Loading spinner (reused everywhere)
│       ├── EmptyState.tsx         # Zero-results placeholder with icon + text
│       └── ErrorBoundary.tsx      # React error boundary with fallback UI
├── features/                      # Empty subdirectories (filled in later phases)
│   ├── auth/
│   ├── catalog/
│   ├── roadmap/
│   ├── quiz/
│   ├── resources/
│   ├── notifications/
│   ├── decay/
│   ├── branching/
│   ├── instructor/
│   └── admin/
├── hooks/
│   └── useMediaQuery.ts           # Responsive breakpoint hook
├── lib/
│   ├── cn.ts                      # cn() = clsx + tailwind-merge helper
│   └── formatDate.ts              # date-fns wrappers
├── routes/
│   ├── index.tsx                  # createBrowserRouter() with all routes
│   ├── ProtectedRoute.tsx         # Redirect to /login if not authenticated
│   └── RoleGuard.tsx              # Redirect to /dashboard if role not allowed
├── store/
│   └── auth.store.ts              # Zustand: {user, accessToken, setTokens, logout}
├── types/
│   └── index.ts                   # All TypeScript interfaces (mirrors backend models)
├── pages/
│   ├── DashboardPage.tsx          # Placeholder: "Your dashboard"
│   ├── NotFoundPage.tsx           # 404 page
│   └── UnauthorizedPage.tsx       # 403 page
├── App.tsx                        # RouterProvider wrapper + QueryClientProvider
└── main.tsx                       # ReactDOM.createRoot
```

---

## Key Implementation Details

### `src/lib/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/api/client.ts`
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Request interceptor: inject access token (implemented in Phase 2)
apiClient.interceptors.request.use((config) => config);

// Response interceptor: handle 401 + refresh (implemented in Phase 2)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);
```

### `src/store/auth.store.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'learner' | 'instructor' | 'admin' | 'domain_expert';
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'auth-storage' },
  ),
);
```

### `src/routes/index.tsx`
```typescript
import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
// ... import all pages

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // ... added per phase
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/callback', element: <OAuthCallbackPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

### `src/routes/ProtectedRoute.tsx`
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### `src/components/layout/AppShell.tsx`
```typescript
// Layout: fixed sidebar (desktop) / bottom nav (mobile) + scrollable main
// <Outlet /> renders child routes
// Sidebar items driven by current user role
```

### `src/types/index.ts` — key interfaces
```typescript
export type UserRole = 'learner' | 'instructor' | 'admin' | 'domain_expert';
export type MasteryState = 'not_started' | 'in_progress' | 'mastered' | 'review_needed' | 'relearn';
export type QuizOutcome = 'strong_pass' | 'marginal_pass' | 'fail_low' | 'fail_fundamental' | 'fail_severe';
export type ResourceModality = 'documentation' | 'tutorial' | 'video' | 'interactive' | 'reference';
export type BranchPath = 'frontend' | 'backend' | 'data_science';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
}

export interface LearningNode {
  id: string;
  title: string;
  slug: string;
  description?: string;
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint: boolean;
  isConvergencePoint: boolean;
  branchPath?: BranchPath;
  positionX?: number;
  positionY?: number;
  learningOutcomes: string[];
}

export interface NodeProgress {
  nodeId: string;
  masteryState: MasteryState;
  bestQuizScore?: number;
  attemptsCount: number;
  unlocked: boolean;
  masteredAt?: string;
  lastReviewedAt?: string;
}
```

---

## Tailwind Config

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mastery state palette (used in roadmap nodes)
        mastery: {
          not_started: '#94a3b8',    // slate-400
          in_progress: '#3b82f6',   // blue-500
          mastered:    '#22c55e',   // green-500
          review_needed: '#f59e0b', // amber-500
          relearn:     '#ef4444',   // red-500
        },
      },
    },
  },
  plugins: [],
};
```

---

## Definition of Done

- [ ] `npm run dev` starts the app on `localhost:5173` with no console errors
- [ ] AppShell renders: sidebar + top navbar + main content area
- [ ] React Router navigates between `/dashboard`, `/login`, `/register` without full reload
- [ ] `/dashboard` redirects to `/login` when no access token in Zustand store
- [ ] TanStack Query DevTools visible in development mode
- [ ] TypeScript compiles with zero errors (`npm run typecheck`)
- [ ] Tailwind styles applied; `cn()` helper imported and working
- [ ] Sidebar shows role-based nav items (hardcoded role='learner' for now)
