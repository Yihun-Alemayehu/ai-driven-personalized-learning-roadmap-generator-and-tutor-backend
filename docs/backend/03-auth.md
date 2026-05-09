# Phase 3: Authentication and User Management

**Depends on:** [Phase 2: Database Schema](02-schema.md)  
**Next phase:** [Phase 4: Ontology Service](04-ontology.md)

---

## What to Build

JWT-based authentication with access/refresh token pattern. OAuth2 social login (Google, GitHub). User registration, login, profile management. Role-based access control (RBAC) middleware.

All auth logic lives in the **api-gateway** service.

---

## Files and Folders

```
services/api-gateway/src/
├── middleware/
│   ├── authenticate.ts            # Verify JWT, attach user to req
│   └── authorize.ts               # RBAC middleware factory: authorize('admin', 'instructor')
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts         # POST /register, /login, /refresh, /logout, /oauth/google, /oauth/github
│   │   ├── auth.controller.ts     # Request handlers
│   │   ├── auth.service.ts        # Business logic (hash password, generate tokens, verify OAuth)
│   │   ├── auth.validation.ts     # Joi schemas for request validation
│   │   └── auth.test.ts           # Integration tests
│   └── users/
│       ├── users.routes.ts        # GET /me, PATCH /me, GET /:id (admin), GET / (admin list)
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.validation.ts
│       └── users.test.ts
```

---

## API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | /api/v1/auth/register | No | — | Email + password registration |
| POST | /api/v1/auth/login | No | — | Email + password login → access + refresh tokens |
| POST | /api/v1/auth/refresh | No | — | Refresh token → new access token |
| POST | /api/v1/auth/logout | Yes | Any | Revoke refresh token |
| GET | /api/v1/auth/oauth/google | No | — | Redirect to Google OAuth consent |
| GET | /api/v1/auth/oauth/google/callback | No | — | Handle Google OAuth callback |
| GET | /api/v1/auth/oauth/github | No | — | Redirect to GitHub OAuth consent |
| GET | /api/v1/auth/oauth/github/callback | No | — | Handle GitHub OAuth callback |
| GET | /api/v1/users/me | Yes | Any | Get current user profile |
| PATCH | /api/v1/users/me | Yes | Any | Update name, avatar, preferred_language |
| GET | /api/v1/users/:id | Yes | Admin | Get any user profile |
| GET | /api/v1/users | Yes | Admin | List users with pagination and role filter |

---

## Implementation Details

- **Password hashing**: bcrypt (cost factor 12).
- **Access token**: JWT signed with HS256, 15-minute expiry, contains `{ sub: userId, role }`.
- **Refresh token**: Random 256-bit token, bcrypt-hashed in DB, 7-day expiry, rotate on use.
- **OAuth flow**: Passport.js strategies for Google and GitHub. On callback, find-or-create user by `(oauth_provider, oauth_provider_id)`, issue tokens.
- **RBAC middleware**: `authorize(...roles)` checks `req.user.role` against allowed roles. Returns 403 if not authorized.
- **Input validation**: Joi schemas on all request bodies. Middleware returns 400 with structured error on validation failure.
- **Swagger annotations**: Every route file includes JSDoc Swagger annotations from the start. Docs build incrementally, not bolted on at the end.
- **Rate limiting**: `authLimiter` (stricter rate limit) applied to `/login` and `/register` endpoints to prevent brute force. See Phase 1 for `rateLimiter.ts`.

---

## Tests to Write

| Test | Asserts |
|------|---------|
| Register with valid email/password | Returns 201 + access token + refresh token |
| Register with duplicate email | Returns 409 Conflict |
| Register with weak password | Returns 400 validation error |
| Login with correct credentials | Returns 200 + tokens |
| Login with wrong password | Returns 401 |
| Login with nonexistent email | Returns 401 (same error — no user enumeration) |
| Access protected route with valid token | Returns 200 |
| Access protected route with expired token | Returns 401 |
| Access protected route with no token | Returns 401 |
| Refresh token flow | New access token issued; old refresh token invalidated |
| Refresh with expired/revoked token | Returns 401 |
| Logout revokes refresh token | Subsequent refresh attempt returns 401 |
| RBAC: learner cannot access admin route | Returns 403 |
| RBAC: admin can access admin route | Returns 200 |
| PATCH /users/me updates profile | Returns 200 with updated fields |
| GET /users (admin) returns paginated list | Pagination params work; role filter works |

---

## Definition of Done

- [ ] All auth endpoints functional and tested
- [ ] OAuth flow works for Google and GitHub (tested manually or with mocked OAuth provider)
- [ ] JWT access/refresh token lifecycle works end-to-end
- [ ] RBAC middleware blocks unauthorized access
- [ ] No password stored in plaintext anywhere
- [ ] All auth tests pass
- [ ] Rate limiting applied to login/register endpoints (prevent brute force)
