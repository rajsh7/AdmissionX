import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { sendCollegeApprovalEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 25;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { college_name: { $regex: q, $options: "i" } },
        { contact_name: { $regex: q, $options: "i" } },
      ];
    }

    let students: unknown[] = [];
    let colleges: unknown[] = [];
    let studentTotal = 0;
    let collegeTotal = 0;

    if (type !== "college") {
      [students, studentTotal] = await Promise.all([
        db.collection("next_student_signups").find(filter).sort({ created_at: -1 }).skip(type === "student" ? skip : 0).limit(type === "student" ? limit : 1000).toArray(),
        db.collection("next_student_signups").countDocuments(filter),
      ]);
    }
    if (type !== "student") {
      [colleges, collegeTotal] = await Promise.all([
        db.collection("next_college_signups").find(filter).sort({ created_at: -1 }).skip(type === "college" ? skip : 0).limit(type === "college" ? limit : 1000).toArray(),
        db.collection("next_college_signups").countDocuments(filter),
      ]);
    }

    const studentRows = (students as any[]).map((s) => ({
      _id: s._id.toString(),
      type: "student",
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: "Student",
      status: s.status || (s.is_active ? "approved" : "pending"),
      created_at: s.created_at,
    }));

    const collegeRows = (colleges as any[]).map((c) => ({
      _id: c._id.toString(),
      type: "college",
      name: c.college_name,
      email: c.email,
      phone: c.phone,
      role: "College",
      status: c.status || "pending",
      created_at: c.created_at,
    }));

    let rows = type === "student" ? studentRows : type === "college" ? collegeRows : [...studentRows, ...collegeRows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = type === "student" ? studentTotal : type === "college" ? collegeTotal : studentTotal + collegeTotal;

    if (type === "all") {
      rows = rows.slice(skip, skip + limit);
    }

    return NextResponse.json({ rows, total, studentTotal, collegeTotal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { _id, type, status, name, email, phone } = await req.json();
    if (!_id || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();

    // ── Student approval ────────────────────────────────────────────────────
    if (type === "student") {
      const update: Record<string, unknown> = { updated_at: new Date() };
      if (status) update.status = status;
      if (status === "approved") update.is_active = 1;
      if (status === "rejected") update.is_active = 0;
      if (name) update.name = name;
      if (email) update.email = email.toLowerCase();
      if (phone) update.phone = phone;
      await db.collection("next_student_signups").updateOne(
        { _id: new ObjectId(_id) },
        { $set: update }
      );
      return NextResponse.json({ success: true });
    }

    // ── College approval — full account creation flow ────────────────────────
    if (type === "college") {
      const college = await db.collection("next_college_signups").findOne(
        { _id: new ObjectId(_id) },
        { projection: { college_name: 1, email: 1, contact_name: 1, phone: 1, status: 1 } }
      );
      if (!college) return NextResponse.json({ error: "College not found" }, { status: 404 });

      // Basic field updates (name/email/phone/reject) — no full flow needed
      if (status !== "approved") {
        const update: Record<string, unknown> = { updated_at: new Date() };
        if (status) update.status = status;
        if (name) update.college_name = name;
        if (email) update.email = email.toLowerCase();
        if (phone) update.phone = phone;
        await db.collection("next_college_signups").updateOne(
          { _id: new ObjectId(_id) },
          { $set: update }
        );
        return NextResponse.json({ success: true });
      }

      // Already approved — don't re-run the flow
      if (college.status === "approved") {
        return NextResponse.json({ success: true, message: "Already approved" });
      }

      // ── Full approval flow (mirrors old RequestForCreateCollegeAccountController) ──
      const collegeName = (name || college.college_name || "").trim();
      const collegeEmail = (email || college.email || "").trim().toLowerCase();
      const collegePhone = (phone || college.phone || "").trim();
      const contactName = (college.contact_name || collegeName).trim();

      // Check email not already used in collegeprofile
      const existingProfile = await db.collection("collegeprofile").findOne(
        { email: collegeEmail },
        { projection: { _id: 1 } }
      );
      if (existingProfile) {
        return NextResponse.json(
          { error: "A college profile with this email already exists." },
          { status: 409 }
        );
      }

      // Generate slug: college-name-{shortId}
      const shortId = _id.slice(-5);
      const slug = collegeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + shortId;

      // Generate temporary password: same pattern as old project
      const last4 = collegePhone.slice(-4) || "0000";
      const year = new Date().getFullYear();
      const tempPassword = `Adx@${year}#${last4}`;
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      // Create collegeprofile record
      const profileResult = await db.collection("collegeprofile").insertOne({
        college_name: collegeName,
        email: collegeEmail,
        contact_name: contactName,
        phone: collegePhone,
        slug,
        signup_id: new ObjectId(_id),
        review: 0,
        password_hash: passwordHash,
        is_active: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Update the signup record: mark approved, store slug + hashed password
      await db.collection("next_college_signups").updateOne(
        { _id: new ObjectId(_id) },
        {
          $set: {
            status: "approved",
            slug,
            password_hash: passwordHash,
            collegeprofile_id: profileResult.insertedId,
            approved_at: new Date(),
            updated_at: new Date(),
          },
        }
      );

      // Send approval email with credentials
      try {
        await sendCollegeApprovalEmail(collegeEmail, collegeName, contactName, tempPassword);
      } catch (emailErr) {
        console.error("[registrations] Approval email failed:", emailErr);
      }

      return NextResponse.json({
        success: true,
        slug,
        message: `College approved. Login credentials sent to ${collegeEmail}.`,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { _id, type } = await req.json();
    if (!_id || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const db = await getDb();
    const collection = type === "student" ? "next_student_signups" : "next_college_signups";
    await db.collection(collection).deleteOne({ _id: new ObjectId(_id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
