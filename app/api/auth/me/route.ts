import { NextRequest, NextResponse } from "next/server";
import {
  verifyStudentToken,
  verifyCollegeToken,
  verifyAdminToken,
  STUDENT_COOKIE,
  COLLEGE_COOKIE,
  ADMIN_COOKIE,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Priority: admin > college > student
  const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    if (payload) {
      return NextResponse.json({
        user: {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      });
    }
  }

  const collegeToken = req.cookies.get(COLLEGE_COOKIE)?.value;
  if (collegeToken) {
    const payload = await verifyCollegeToken(collegeToken);
    if (payload) {
      return NextResponse.json({
        user: {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      });
    }
  }

  const studentToken = req.cookies.get(STUDENT_COOKIE)?.value;
  if (studentToken) {
    const payload = await verifyStudentToken(studentToken);
    if (payload) {
      return NextResponse.json({
        user: {
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      });
    }
  }

  return NextResponse.json({ user: null });
}
