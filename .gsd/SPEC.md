# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
AdmissionX is a scalable, web-based college admission management system that simplifies the end-to-end application workflow, securely connecting students, colleges, and administrators in a single, user-friendly platform.

## Goals
1. **Simplified Application Workflow**: Enable students to seamlessly register, complete their profiles, browse courses, apply to colleges, and upload required documents entirely online.
2. **Application Management**: Provide colleges with a portal to review applications, verify documents, and update statuses (e.g., pending, approved, rejected).
3. **Platform Oversight**: Give administrators the tools needed to oversee users (students, colleges) and manage the entire platform workflow.

## Non-Goals (Out of Scope for v1.0)
- Online payment processing for application fees
- Interview scheduling system
- Real-time chat or messaging system
- Email/SMS notification system
- Advanced analytics or reporting dashboards
- Multi-language support

## Users
- **Students**: Register, manage profiles (personal, academic), browse colleges/courses, apply, upload documents, and track application outcomes via a dashboard.
- **Colleges**: Receive and review applications, verify supporting documents, and issue final decisions to students.
- **Administrators**: Oversee the platform, manage student and college accounts, and ensure correct data routing.

## Constraints
- **Technical constraints**: Must be integrated cleanly into the existing Next.js App Router architecture, using the proven MySQL pool methodology and custom JWT authentication.
- **Complexity**: Must handle multiple concurrent users safely and without data-leaks.

## Success Criteria
- [ ] Students can successfully register, login, and apply to colleges
- [ ] Colleges can view and manage applications
- [ ] Admin can manage users (students, colleges)
- [ ] Application submission and status tracking works without errors
- [ ] Dashboard loads correct data (students, applications, stats)
- [ ] System handles multiple users without breaking
