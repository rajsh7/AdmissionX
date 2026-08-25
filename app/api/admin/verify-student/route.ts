import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminPayload = await verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json({ error: "student_id is required" }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.collection("next_student_signups").updateOne(
      { _id: new ObjectId(student_id) },
      {
        $set: {
          is_active: 1,
          otp_verified: true,
          updated_at: new Date(),
        },
        $unset: {
          otp_code: "",
          otp_expiry: "",
          otp_purpose: "",
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Student not found or already verified" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Student account manually verified and activated",
    });
  } catch (err: any) {
    console.error("[Manual Verify Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
