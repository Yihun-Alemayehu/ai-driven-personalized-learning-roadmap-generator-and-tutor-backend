# API Gateway Test Map

This file maps thesis test-plan IDs (Chapter 6) to the current Jest test files in this directory.

## Source of Truth

- Thesis chapter: `the-final-project/latex_project/chapters/ch06_evaluation.tex`
- Backend tests directory: `backend/services/api-gateway/tests/`

## Current Test Files

- `health.test.ts`
- `auth-core.test.ts`

## Thesis ID -> Test File Mapping

| Thesis Test ID(s) | Coverage area | Jest file |
| --- | --- | --- |
| TP-AVAIL-01 | API gateway health endpoint contract (status + dependency fields) | `health.test.ts` |
| TP-SEC-01, TP-SEC-02, TP-SEC-03 (partial infrastructure baseline) | Gateway-level access control and auth error pathways are represented at integration level; this file currently validates shared gateway plumbing | `health.test.ts` |
| TP-PERF-01/02 (supporting infrastructure) | Basic rate-limiter behavior (429 after threshold) | `health.test.ts` |
| TP-AUTH-01, TP-AUTH-02, TP-AUTH-04, TP-SEC-03 | Register/login/refresh/logout critical auth flows and token validation primitives | `auth-core.test.ts` |
| TP-AUTH-03 (supporting token/auth internals) | JWT duration parsing, sign/verify roundtrip, password hash/verify, refresh-token hashing helpers | `auth-core.test.ts` |

## Notes

- Gateway coverage now includes critical auth core unit tests plus health/rate-limit infrastructure checks.
- Full controller/route/user/admin module behavior is still primarily integration-tested and can be expanded in future unit suites.

## Run

```bash
npm test -- --runTestsByPath tests/health.test.ts tests/auth-core.test.ts
```
