---
phase: 3
plan: 2
wave: 1
---

# Plan 3.2: Cloud Storage API Integration

## Objective
Implement a natively secure file upload mechanism resolving to Cloudinary configurations designed to handle the mandatory documents seamlessly inline with Vercel deployment practices.

## Context
- .gsd/DECISIONS.md
- package.json

## Tasks

<task type="auto">
  <name>Install SDK and Blueprint Upload Route</name>
  <files>package.json, app/api/student/upload/route.ts</files>
  <action>
    - Run `npm install cloudinary`.
    - Create `app/api/student/upload/route.ts` exporting a `POST` handler expecting multipart/form payloads.
    - Exclusively enforce tight 5MB logic checks natively per buffer processing. 
    - Reject generic extensions missing secure `application/pdf`, `image/jpeg`, or `image/png` formats via basic strict equality rules sending HTTP 400 outputs natively.
    - Pipe passing buffers directly to the `cloudinary.v2.uploader.upload_stream` safely resolving the URL references and returning it wrapped securely `NextResponse.json({ url: ... })`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Upload boundaries successfully proxy memory structures off onto external secure origins.</done>
</task>

## Success Criteria
- [ ] TypeScript validations accept integration seamlessly natively without definition loss.
- [ ] Heavy files rigorously fall out without stalling Node limits.
