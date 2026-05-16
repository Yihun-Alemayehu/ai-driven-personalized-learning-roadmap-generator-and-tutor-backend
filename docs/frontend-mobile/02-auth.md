# Phase 2: Authentication

**Depends on:** [Phase 1: Scaffold](01-scaffold.md)  
**Next phase:** [Phase 3: Domain Catalog & Enrollment](03-catalog.md)

---

## What to Build

Login and Register screens. Complete Dio interceptors for JWT injection and silent token refresh. Persist tokens to `flutter_secure_storage`. Guard all routes via go_router `redirect`. Handle logout cleanly. Mirror the web's auth flow exactly — same API endpoints, same token pair (`accessToken` + `refreshToken`).

---

## API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/auth/register` | `{fullName, email, password}` → `{user, accessToken, refreshToken}` |
| `POST` | `/auth/login` | `{email, password}` → `{user, accessToken, refreshToken}` |
| `POST` | `/auth/refresh` | `{refreshToken}` → `{accessToken, refreshToken}` |
| `POST` | `/auth/logout` | `{refreshToken}` → 204 |
| `GET`  | `/users/me` | Returns current user object |

---

## Files to Create / Update

```
lib/
├── core/
│   ├── api/
│   │   └── auth_api.dart             # login(), register(), refresh(), logout()
│   ├── models/
│   │   └── user.dart                 # User, AuthTokens data classes + fromJson
│   ├── providers/
│   │   └── auth_provider.dart        # AuthNotifier (login, logout, refresh)
│   └── router/
│       └── app_router.dart           # Update redirect to watch AuthNotifier
├── features/
│   └── auth/
│       ├── login_screen.dart
│       └── register_screen.dart
```

---

## Key Implementation Details

### `lib/core/models/user.dart`
Dart data class using `fromJson` factory. Mirror all fields from the web's `User` type: `id`, `email`, `fullName`, `role` (enum), `avatarUrl?`, `preferredLanguage?`.

```dart
enum UserRole { learner, instructor, admin, domainExpert }

class User {
  final String id;
  final String email;
  final String fullName;
  final UserRole role;
  final String? avatarUrl;

  factory User.fromJson(Map<String, dynamic> json) { ... }
}
```

### `lib/core/providers/auth_provider.dart`
`AuthNotifier` is a `StateNotifier<AuthState>`. State holds `user`, `accessToken`, `refreshToken`, `isLoading`, `error`.

On app start: read tokens from `flutter_secure_storage`. If `accessToken` is present, call `GET /users/me` to validate and populate `user`. If it fails (expired), attempt refresh before giving up and going to login.

On login success: write tokens to secure storage, set state.  
On logout: delete tokens from storage, clear state.

```dart
class AuthState {
  final User? user;
  final String? accessToken;
  final String? refreshToken;
  final bool isLoading;
  final String? error;
}

class AuthNotifier extends StateNotifier<AuthState> {
  Future<void> login(String email, String password) async { ... }
  Future<void> register(String fullName, String email, String password) async { ... }
  Future<void> logout() async { ... }
  Future<void> refreshTokens() async { ... }
  Future<void> initialize() async { ... }  // called in main.dart
}
```

### `lib/core/api/api_client.dart` — interceptors
Add two Dio interceptors:

**Request interceptor:** Read `accessToken` from `AuthNotifier` state and inject as `Authorization: Bearer <token>` header.

**Response interceptor:** On 401 response, call `authNotifier.refreshTokens()`. On refresh success, retry the original request with the new token. On refresh failure (e.g., refresh token also expired), call `authNotifier.logout()` and let the go_router redirect handle navigation to `/login`.

Use a `Completer`-based lock to prevent concurrent refresh calls (same pattern as the web's Axios interceptor).

### `lib/features/auth/login_screen.dart`
- Scaffold with `AppColors.background`
- Logo/brand mark at top (same BrandMark design as web)
- `TextFormField` for email and password (Crimson Text, 16px, `AppColors.border` outline)
- "Log in" filled button (`AppColors.textPrimary` background, white text)
- "Create account" text button links to `/register`
- Error shown as inline `Text` below the form in `AppColors.accent` colour
- Loading state disables button and shows `CircularProgressIndicator` inside it

### `lib/features/auth/register_screen.dart`
- Same visual style as login
- Three fields: Full name, Email, Password
- "Create account" button
- "Already have an account? Log in" text button

---

## Definition of Done

- [ ] Login with valid credentials sets tokens in secure storage and navigates to `/dashboard`
- [ ] Login with wrong credentials shows inline error message
- [ ] Register creates account and navigates to `/dashboard`
- [ ] App restart with valid stored tokens restores session (user lands on `/dashboard`)
- [ ] App restart with expired/no tokens goes to `/login`
- [ ] Token refresh fires silently on 401 — user never sees a login redirect mid-session
- [ ] Logout clears tokens and navigates to `/login`
- [ ] All API requests after login include `Authorization: Bearer <token>` header
- [ ] `flutter analyze` zero issues
