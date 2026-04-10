---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Student Registration & Login UI Fixes

## Objective
Fix the student login (`app/login/student`) and signup (`app/signup/student`) UI components. Standardize API integration and enforce mandatory profile fields (Name, Email, Password, Phone, DOB, 12th marks).

## Context
- .gsd/DECISIONS.md
- app/login/student/page.tsx
- app/signup/student/page.tsx
- app/api/login/student/route.ts
- app/api/signup/student/route.ts

## Tasks

<task type="auto">
  <name>Enforce Student Profile Requirements in UI</name>
  <files>app/signup/student/page.tsx</files>
  <action>
    - Ensure the UI form strictly collects: Full Name, Email, Password, Phone Number, Date of Birth, and Academic Details (12th marks).
    - Implement inline form validation to prevent submission of incomplete forms.
    - Remove extensive raw `console.error` usage; use a toast notification or state error message for the user.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Student signup UI properly validates the required fields before submission.</done>
</task>

<task type="auto">
  <name>Fix Student Auth API Endpoints</name>
  <files>app/api/login/student/route.ts, app/api/signup/student/route.ts</files>
  <action>
    - Refactor try-catch blocks: remove cluttered `console.error` usage and return structured JSON error responses (e.g. `{ error: "..." }`).
    - Verify that signup properly inserts mandatory fields into the database using the updated schema constraints.
    - On successful login/signup, set the `adx_student` cookie using the refactored `lib/auth.ts`.
  </action>
  <verify>npm run build</verify>
  <done>API routes securely handle student auth, enforcing fields, setting cookies, and returning clean HTTP responses.</done>
</task>

## Success Criteria
- [ ] Student signup enforces all mandatory fields.
- [ ] Errors are surfaced neatly to the UI, not blindly logged.
- [ ] Login and signup correctly set JWT session cookies.
