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

## Phase 2 Decisions

**Date:** 2026-03-19

### Scope
- **Unified Browsing:** Focus exclusively on a unified `/colleges` page for listing/searching, and a dynamic `/colleges/[id]` page for college details and course listings.
- **Out of Scope:** Sibling search pages (`app/top-colleges`, `app/top-university`, `app/university`, `app/search`) will be ignored for now.
- **Component Strategy:** Reuse and fix existing components. Create new ones only if absolutely required for clean structure.

### Approach
- Chose: **Option A (SSR with URL search parameters)**.
- Reason: Optimal for SEO, shareable URLs, consistent data fetching via Next.js server components, and prevents client-state fragmentation.
- **Rendering Rules:** Enforce `export const dynamic = "force-dynamic";` on all browsing routes to prevent static caching bugs (e.g., infinite loading).

### Constraints
- Assume DB contains partial/inconsistent dummy data. Perform basic validation and minimal seeding to ensure the feature works reliably in dev, but skip full production data population.
