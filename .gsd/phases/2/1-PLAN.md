---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Unified College Listing Setup

## Objective
Establish the primary browsing interface (`/colleges/page.tsx`) using SSR and dynamic rendering, ensuring basic data connectivity with the database.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- app/components/CollegeCard.tsx
- app/components/CollegeListItem.tsx

## Tasks

<task type="auto">
  <name>Create Unified Colleges Page</name>
  <files>app/colleges/page.tsx</files>
  <action>
    - Create the route file exporting a React Server Component.
    - MUST include `export const dynamic = "force-dynamic";` at the top to prevent static generation loops.
    - Inside the component, use `lib/db.ts` to perform a basic `SELECT` query retrieving colleges (limiting to ~20 for safety). Ensure fallback parsing handles any missing required `CollegeResult` properties.
    - Map the results securely over `CollegeListItem` components. Handle cases where the DB might be completely empty gracefully (e.g., render a "No colleges found" state rather than crashing).
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>The `/colleges` route exists, compiles successfully in a production build, enforces dynamic rendering, and displays data from the DB.</done>
</task>

## Success Criteria
- [ ] Next.js build passes with no type errors on the new route.
- [ ] Page renders without infinite loading bugs, relying purely on fresh server data.
