---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Core Authentication Refactoring & Middleware

## Objective
Refactor the custom JWT authentication in `lib/auth.ts` to be fully reliable. Fix `middleware.ts` to securely gate protected routes without spamming `console.error`.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- lib/auth.ts
- middleware.ts

## Tasks

<task type="auto">
  <name>Refactor Custom JWT Logic</name>
  <files>lib/auth.ts</files>
  <action>
    - Review and harden `signStudentToken`, `signCollegeToken`, `signAdminToken` and their respective verify functions.
    - Standardize the `COOKIE_OPTIONS` export for usage across all route handlers.
    - Remove or properly format any debugging logs/console.errors into structured throws or silent null returns for failed verifies.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>lib/auth.ts provides a strict, type-safe API for JWT handling without technical debt.</done>
</task>

<task type="auto">
  <name>Standardize Next.js Middleware</name>
  <files>middleware.ts</files>
  <action>
    - Ensure `middleware.ts` properly captures JWT configuration from `lib/auth.ts`.
    - Apply consistent route matchers (protect `/dashboard`, `/admin`, etc.).
    - Redirect unauthenticated users gracefully rather than letting the application crash or log excess unhandled errors.
  </action>
  <verify>npm run build</verify>
  <done>Middleware correctly handles unauthorized access via HTTP 307 redirects to login pages.</done>
</task>

## Success Criteria
- [ ] JWT tokens are securely generated, stored, and verified.
- [ ] `middleware.ts` accurately protects sensitive routes.
