# Phase 2: Authentication

**Depends on:** [Phase 1: Scaffold](01-scaffold.md)  
**Next phase:** [Phase 3: Domain Catalog & Enrollment](03-domain-catalog.md)

---

## What to Build

Login, Register, and OAuth callback pages. Complete the Axios interceptors for JWT injection and silent token refresh. Populate the Zustand auth store on login. Guard all protected routes. Handle logout cleanly.

---

## API Endpoints Used

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/v1/auth/register` | `{fullName, email, password}` → `{user, tokens}` |
| `POST` | `/api/v1/auth/login` | `{email, password}` → `{user, tokens}` |
| `POST` | `/api/v1/auth/refresh` | `{refreshToken}` → `{accessToken, refreshToken}` |
| `POST` | `/api/v1/auth/logout` | `{refreshToken}` |
| `GET` | `/api/v1/auth/oauth/google` | Redirect to Google consent screen |
| `GET` | `/api/v1/auth/oauth/github` | Redirect to GitHub consent screen |
| `GET` | `/api/v1/users/me` | Get current user profile |

---

## File & Folder Structure

```
src/
├── api/
│   ├── client.ts                  # Complete interceptors
│   └── auth.ts                    # login(), register(), refresh(), logout(), getMe()
├── features/auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OAuthCallbackPage.tsx      # Reads ?token=... from URL, stores in Zustand
│   └── components/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
└── store/
    └── auth.store.ts              # Already created in Phase 1
```

---

## Key Implementation Details

### `src/api/auth.ts`
```typescript
import { apiClient } from './client';

export interface AuthTokens { accessToken: string; refreshToken: string; }
export interface AuthResponse { user: User; tokens: AuthTokens; }

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: { fullName: string; email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  getMe: () => apiClient.get<User>('/users/me').then((r) => r.data),
};
```

### Complete Axios interceptors (`src/api/client.ts`)
```typescript
// Request: inject access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: 401 → attempt refresh → retry original request once
let isRefreshing = false;
let failQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failQueue.push({
          resolve: (token) => { original.headers.Authorization = `Bearer ${token}`; resolve(apiClient(original)); },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) throw new Error('No refresh token');
      const { accessToken, refreshToken: newRefresh } = await authApi.refresh(refreshToken);
      useAuthStore.getState().setAuth(useAuthStore.getState().user!, accessToken, newRefresh);
      failQueue.forEach((p) => p.resolve(accessToken));
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (e) {
      failQueue.forEach((p) => p.reject(e));
      useAuthStore.getState().logout();
      window.location.replace('/login');
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      failQueue = [];
    }
  },
);
```

### `src/features/auth/LoginPage.tsx`
```
Layout:
  Centered card (max-w-sm)
  ┌──────────────────────────────┐
  │  Logo + "Sign in"            │
  │  [Email input]               │
  │  [Password input]            │
  │  [Sign in button]            │
  │  ── or continue with ──      │
  │  [Google] [GitHub]           │
  │  Don't have an account?      │
  │  → Register link             │
  └──────────────────────────────┘
```

**Validation** (React Hook Form + Zod):
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
```

On submit: call `authApi.login()` → `useAuthStore.setAuth()` → navigate to `/dashboard`.  
Show inline error on 401 ("Invalid email or password").

### `src/features/auth/RegisterPage.tsx`
```
Same centered card layout:
  [Full name]
  [Email]
  [Password]
  [Confirm password]
  [Create account button]
  [Google] [GitHub]
  Already have an account? → Login
```

On submit: call `authApi.register()` → auto-login (store tokens) → navigate to `/dashboard`.

### OAuth flow
- **Initiate**: `window.location.href = VITE_GATEWAY_URL + '/auth/oauth/google'` (full redirect, not fetch)
- **Callback**: Backend redirects to `FRONTEND_CALLBACK_URL?accessToken=...&refreshToken=...&userId=...`
- `OAuthCallbackPage` reads URL params, calls `authApi.getMe()`, stores everything in Zustand, navigates to `/dashboard`

### `src/hooks/useAuth.ts`
```typescript
export function useAuth() {
  const { user, accessToken, logout } = useAuthStore();
  const isAuthenticated = Boolean(accessToken);
  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  return { user, isAuthenticated, isAdmin, isInstructor, logout };
}
```

### `src/routes/RoleGuard.tsx`
```typescript
// Usage: <RoleGuard roles={['admin']}>...</RoleGuard>
// Redirects to /unauthorized if user.role not in allowed roles
```

---

## Tests to Write

| Test | Asserts |
|------|---------|
| Login form — valid credentials | Stores tokens, redirects to /dashboard |
| Login form — invalid credentials | Shows "Invalid email or password" error |
| Login form — empty fields | Inline Zod validation errors shown |
| Register form — password mismatch | Shows "Passwords do not match" |
| ProtectedRoute — no token | Redirects to /login |
| Token refresh interceptor | On 401 response, calls /auth/refresh; retries original request |
| Logout | Clears Zustand store; redirects to /login |
| OAuth callback | Reads URL params, calls getMe(), stores in Zustand |

---

## Definition of Done

- [ ] Login with valid credentials → lands on `/dashboard` with user name in navbar
- [ ] Login with wrong password → inline error, no redirect
- [ ] Register new account → auto-logged in, lands on `/dashboard`
- [ ] Refresh token works silently: manually expire access token → next API call refreshes and retries
- [ ] Logout → Zustand cleared → redirect to `/login` → accessing `/dashboard` redirects back to `/login`
- [ ] OAuth buttons redirect to backend OAuth URLs
- [ ] OAuth callback page stores tokens and redirects to `/dashboard`
- [ ] RoleGuard blocks `/admin` for `role=learner`; redirects to `/unauthorized`
