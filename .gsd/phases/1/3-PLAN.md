---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: College Registration & Login UI Fixes

## Objective
Fix the college login (`app/login/college`) and signup (`app/signup/college`) UI components. Enforce mandatory fields (Name, Email, Password, Contact, Address, Courses) and tidy up API responses.

## Context
- .gsd/DECISIONS.md
- app/login/college/page.tsx
- app/signup/college/page.tsx
- app/api/login/college/route.ts
- app/api/signup/college/route.ts

## Tasks

<task type="auto">
  <name>Enforce College Profile Requirements in UI</name>
  <files>app/signup/college/page.tsx</files>
  <action>
    - Ensure the UI form strictly collects: College Name, Email, Password, Contact Number, Address, and Courses Offered.
    - Implement HTML5 or React State validation preventing submission if mandatory fields are missing.
    - Replace generic `console.error` catches with proper user-facing error state updates.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>College signup UI prevents invalid form submission and handles errors gracefully.</done>
</task>

<task type="auto">
  <name>Fix College Auth API Endpoints</name>
  <files>app/api/login/college/route.ts, app/api/signup/college/route.ts</files>
  <action>
    - Refactor routes to strictly parse payload data, throwing typed HTTP errors if data is missing.
    - Ensure token generation assigns the `adx_college` cookie correctly using `lib/auth.ts`.
    - Clean up debugging logs to adhere to `DECISIONS.md` technical debt cleanup instructions.
  </action>
  <verify>npm run build</verify>
  <done>College auth APIs securely validate payload, set cookies, and return standard JSON.</done>
</task>

## Success Criteria
- [ ] College signup enforces required schema data.
- [ ] Endpoints securely handle connections without throwing unhandled exceptions.
- [ ] Auth cookies enable access to college dashboards.
