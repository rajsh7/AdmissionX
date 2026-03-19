---
phase: 3
plan: 4
wave: 2
---

# Plan 3.4: Apply Now Entry Points & Front-End UI

## Objective
Refactor existing visual nodes finalizing user interactions unifying dashboard capabilities synchronously handling segmented staging states.

## Context
- .gsd/DECISIONS.md
- app/college/[slug]/page.tsx
- app/dashboard/student/tabs/ApplyTab.tsx

## Tasks

<task type="auto">
  <name>Inject Pre-Filled Referral Tracking</name>
  <files>app/college/[slug]/page.tsx</files>
  <action>
    - Refactor explicit generic `/apply/xyz` anchors natively. Embed direct push URL configurations targeting `/dashboard/student?tab=apply&collegeId=...&courseId=...` handling contexts explicitly.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Public college interfaces direct cleanly natively forwarding context structures.</done>
</task>

<task type="auto">
  <name>Develop Unified Dashboard Component</name>
  <files>app/dashboard/student/tabs/ApplyTab.tsx</files>
  <action>
    - Modify the file handling URL param mapping pre-selecting generic HTML Dropdowns natively.
    - Install native `<input type="file">` DOM boundaries explicitly setting generic limitations on extensions cleanly stopping execution explicitly if larger than `5 * 1024 * 1024` bytes.
    - Build UI state handlers sequentially running `POST` cycles parsing the output tracking URL nodes natively, triggering a single massive generic commit asynchronously to `/api/student/apply`. Provide clear success and error feedback natively cleanly preventing dual submission clicks.
  </action>
  <verify>npx tsc --noEmit && npm run build</verify>
  <done>Student interfaces fluidly navigate validations gracefully finishing upload processes directly.</done>
</task>

## Success Criteria
- [ ] Users natively receive validation blockers on oversized inputs instantly.
- [ ] Application life-cycles route end-to-end accurately preserving generic variables effectively.
