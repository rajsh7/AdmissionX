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

## Phase 3 Decisions

**Date:** 2026-03-19

### Scope
- **Entry Points:** Implement two flows: Primary (via student dashboard `ApplyTab.tsx`) and Secondary ("Apply Now" from public `/college/[slug]` redirecting to dashboard with pre-filled college/course).
- **Documents:** Standardized global requirements for Phase 3 (10th Marksheet, 12th Marksheet, ID Proof). Dynamic college-specific documents are OOS.

### Approach
- Chose: **Option B (Cloud Storage - Cloudinary/S3)**.
- Reason: Scalability, production-readiness, and Vercel serverless compatibility.
- **Data Flow:** Upload files via Next.js API route, store returned secure URLs securely in the MySQL database.

### Database Design
- **New Tables:** 
  1. `applications`: id, studentId, collegeId, courseId, status (pending, approved, rejected), createdAt.
  2. `documents`: id, applicationId, type, fileUrl, uploadedAt.

### Constraints & Security
- **Strict Validations:** 
  - Student profile MUST be 100% complete before applying.
  - One application per course per student.
  - All requested documents must be uploaded prior to submission.
- **Upload Security:** Enforce strict 5MB size limit and PDF/JPG/PNG MIME types on both client and server boundaries to prevent malicious payloads.

## Phase 5 Decisions

**Date:** 2026-03-19

### Scope
- **Admin Applications Overview:** New read-only "Applications" tab in the admin dashboard showing all applications across all colleges. Supports filtering by status, college, and student. Admin cannot change application status.
- **Admin User Management:** Fix and optimize the existing `/administrator/users` page. Add separate Students/Colleges tabs with pagination.
- **End-to-End Integration Test:** Validate the full flow: student applies → college reviews → status updated → student dashboard reflects the update.
- **Polish:** Fix UI inconsistencies, improve loading states, remove unused routes (`top-colleges`, `top-university`, etc.), clean console errors in touched files, and ensure consistent API error handling.

### Approach
- **Admin Applications Tab:** New tab reading from the `applications` table (same structure as college dashboard). Read-only — no status editing.
- **Users Page Fix:** Replace full-table query with paginated `LIMIT/OFFSET` queries. Add DB indexes on `role` and `status` columns. Split into Students/Colleges tabs.

### Performance Fix
- Mandatory fix for `/administrator/users` timeout bug.
- Pagination (limit + offset) to prevent full dataset fetches.
- DB indexes on frequently queried fields (`role`, `status`).

### Phase 5 Done Criteria
1. Admin can view all applications (read-only, filters working)
2. Admin can activate/deactivate students and colleges
3. `/administrator/users` no longer times out
4. Full end-to-end flow works correctly
5. No critical bugs or broken flows

