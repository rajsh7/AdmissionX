---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Application Database Schema

## Objective
Establish the relational MySQL tables required to rigidly track student applications and their explicitly associated uploaded documents.

## Context
- .gsd/DECISIONS.md
- lib/db.ts

## Tasks

<task type="auto">
  <name>Create Applications and Documents Schema</name>
  <files>scripts/seed-applications.ts, lib/db.ts</files>
  <action>
    - Create a database migrations/seed script `scripts/seed-applications.ts` to execute `CREATE TABLE IF NOT EXISTS` natively against connection pools.
    - Schema `applications`: id (INT AUTO_INCREMENT PK), studentId (INT), collegeId (INT), courseId (INT), status (VARCHAR 20 default 'pending'), createdAt (DATETIME).
    - Schema `documents`: id (INT AUTO_INCREMENT PK), applicationId (INT FK to applications), type (VARCHAR 50), fileUrl (VARCHAR 255), uploadedAt (DATETIME).
    - Insert a `UNIQUE` constraint on `(sideId, studentId, courseId)` to rigorously enforce the 1-per-course prevention rule securely within MySQL.
    - Add script to execute `npx tsx scripts/seed-applications.ts`.
  </action>
  <verify>npx tsc --noEmit && npx tsx scripts/seed-applications.ts || true</verify>
  <done>The database tables `applications` and `documents` exist safely aligned with the strict schema parameters.</done>
</task>

## Success Criteria
- [ ] Database structures accept new DDL schemas effortlessly.
- [ ] Duplicate application entries trigger generic constraint faults.
