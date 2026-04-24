---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: SSR Search & Filtering

## Objective
Enable deep-linking and SEO-friendly searches by natively parsing URL `searchParams` in the Server Component to filter colleges.

## Context
- .gsd/DECISIONS.md
- app/colleges/page.tsx

## Tasks

<task type="auto">
  <name>Implement SSR Search Params Filtering</name>
  <files>app/colleges/page.tsx</files>
  <action>
    - Update the Server Component to accept `searchParams` prop asynchronously (matching standard Next.js App Router patterns).
    - Extract query string parameters like `q` (search text) or `location`.
    - Modify the `lib/db.ts` SQL query execution inside the component to dynamically append `WHERE` clauses matching the search parameters. Use strict parameterized queries (`?`) to prevent SQL injection.
    - Add a basic client-side Search input component that pushes text changes to the router URL (`router.push('?q=...')`) which automatically triggers the SSR refetch.
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>SQL queries dynamically adjust based on active URL `searchParams`, and typechecks pass cleanly.</done>
</task>

## Success Criteria
- [ ] Search parameters dynamically affect the SSR retrieved results.
- [ ] Safe parameterized DB queries are strictly enforced, averting SQL injection.
