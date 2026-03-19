---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Application Submission API & Validation

## Objective
Engineer the core integration surface finalizing form requests natively ensuring 100% profile gating schemas protect generic invalid data artifacts securely.

## Context
- .gsd/DECISIONS.md
- app/api/student/apply/route.ts

## Tasks

<task type="auto">
  <name>Assemble Core Verification Router</name>
  <files>app/api/student/apply/route.ts</files>
  <action>
    - Parse the incoming request securing `collegeId`, `courseId`, and the exact JSON string arrays carrying mapped `{ type, url }` documents.
    - Invoke existing JWT extraction helpers in `lib/auth.ts` referencing the generic student securely.
    - Fetch DB verifying profile maturity natively checking DOBS, Addresses, and 12th marks. Halt transactions enforcing 403 blocks otherwise.
    - Guarantee presence ensuring "10th Marksheet", "12th Marksheet", and "ID Proof" strictly are packaged natively or throw generic 400 validations.
    - Perform `INSERT` to `applications` saving results recursively linking the resulting IDs to a batch `INSERT` logic hitting `documents` cleanly.
    - Snag generic MySQL uniqueness errors returning structured "Application already filed" signals safely. 
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Final state accepts generic validations cleanly saving inputs safely mapping ID limits without SQL breaches.</done>
</task>

## Success Criteria
- [ ] Only thoroughly mature profiles access downstream DB mutations cleanly.
- [ ] Redundant requests safely bounce reflecting standard rules.
