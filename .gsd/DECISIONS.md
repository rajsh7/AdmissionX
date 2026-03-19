# Architecture Decisions Log

Record key architectural choices, deviations from the master plan, and the reasons why.

## Phase 1 Decisions

**Date:** 2026-03-19

### Scope
- Keep existing UI (`app/login` and `app/signup`) but fix bugs, error handling, and component consistency.
- **Mandatory Student profile:** Full Name, Email, Password, Phone Number, Date of Birth, Academic Details (12th marks / equivalent).
- **Mandatory College profile:** College Name, Email, Password, Contact Number, Address, Courses Offered (basic info).
- Avoid large-scale refactoring; only clean up debt (e.g. `console.error`) in files modified for Auth.

### Approach
- Chose: **Option A** (Refactor existing custom JWT auth using `jose`, standardize middleware and cookie handling).
- Reason: Authentication is a core foundation and must be fully reliable. Refactoring now prevents future bugs and rework while ensuring clean, scalable, and secure architecture.

### Constraints
- Scope boundary clearly defined to prevent unnecessary rewrites of UI components while still fixing all auth-related integration points.
