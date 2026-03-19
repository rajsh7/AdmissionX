---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Dynamic College Profile & Course Listing

## Objective
Launch the individual dynamic college detail views (`/college/[slug]`), rendering full profile information and tightly coupled courses.

## Context
- .gsd/SPEC.md
- lib/db.ts

## Tasks

<task type="auto">
  <name>Setup College Detail Page</name>
  <files>app/college/[slug]/page.tsx</files>
  <action>
    - Create the route file exporting a Server Component.
    - Enforce `export const dynamic = "force-dynamic";`.
    - Accept `params.slug` asynchronously to rigorously query the database for this specific college's data.
    - Render the college name, rating, address, and any available metadata natively. 
    - If the slug doesn't match an entry, invoke the Next.js `notFound()` handler.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The dynamic route compiles, enforces force-dynamic, and safely triggers `notFound()` on misses.</done>
</task>

<task type="auto">
  <name>Integrate Course Listing</name>
  <files>app/college/[slug]/page.tsx</files>
  <action>
    - Expand the component's internal DB logic to optionally fetch associated courses for that specific college.
    - Map through the courses and cleanly display them in a list or grid UI component embedded directly under the college profile details.
  </action>
  <verify>npm run build</verify>
  <done>Courses associated with the college are visible natively on the SSR page view, passing the Next.js production build.</done>
</task>

## Success Criteria
- [ ] Dynamic college pages securely parse route parameters to fetch strict localized data.
- [ ] Associated courses are fetched reliably via server components without triggering client-side network roundtrips.
