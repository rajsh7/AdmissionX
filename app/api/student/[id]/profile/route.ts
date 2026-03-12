import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyStudentToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function checkAuth(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_student")?.value;
  if (!token) return null;
  const payload = await verifyStudentToken(token);
  if (!payload || String(payload.id) !== studentId) return null;
  return payload;
}

// ── Ensure tables exist ───────────────────────────────────────────────────────
async function ensureTables(conn: Awaited<ReturnType<typeof pool.getConnection>>) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS next_student_profiles (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      student_id   INT NOT NULL UNIQUE,
      dob          DATE,
      gender       VARCHAR(20),
      city         VARCHAR(100),
      state        VARCHAR(100),
      country      VARCHAR(100) DEFAULT 'India',
      photo        VARCHAR(500),
      hobbies      TEXT,
      interest     TEXT,
      about        TEXT,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// ── GET /api/student/[id]/profile ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await pool.getConnection();
  try {
    await ensureTables(conn);

    const [baseRows] = await conn.query(
      `SELECT id, name, email, phone, created_at
       FROM next_student_signups
       WHERE id = ?
       LIMIT 1`,
      [id],
    );
    const baseList = baseRows as {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      created_at: string;
    }[];
    if (!baseList.length) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const base = baseList[0];

    const [profRows] = await conn.query(
      `SELECT dob, gender, city, state, country, photo, hobbies, interest, about
       FROM next_student_profiles
       WHERE student_id = ?
       LIMIT 1`,
      [id],
    );
    const profList = profRows as {
      dob: string | null;
      gender: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      photo: string | null;
      hobbies: string | null;
      interest: string | null;
      about: string | null;
    }[];
    const prof = profList[0] ?? {};

    // Profile completeness score
    const fields = [
      base.name,
      base.email,
      base.phone,
      prof.dob,
      prof.gender,
      prof.city,
      prof.state,
      prof.photo,
      prof.hobbies,
      prof.interest,
      prof.about,
    ];
    const filled = fields.filter(Boolean).length;
    const profileComplete = Math.round((filled / fields.length) * 100);

    return NextResponse.json({
      id: base.id,
      name: base.name,
      email: base.email,
      phone: base.phone ?? "",
      dob: prof.dob ?? "",
      gender: prof.gender ?? "",
      city: prof.city ?? "",
      state: prof.state ?? "",
      country: prof.country ?? "India",
      photo: prof.photo ?? "",
      hobbies: prof.hobbies ?? "",
      interest: prof.interest ?? "",
      about: prof.about ?? "",
      member_since: base.created_at,
      profile_complete: profileComplete,
    });
  } finally {
    conn.release();
  }
}

// ── PUT /api/student/[id]/profile ─────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await checkAuth(id);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    name?: string;
    phone?: string;
    dob?: string;
    gender?: string;
    city?: string;
    state?: string;
    country?: string;
    hobbies?: string;
    interest?: string;
    about?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, phone, dob, gender, city, state, country, hobbies, interest, about } = body;

  const conn = await pool.getConnection();
  try {
    await ensureTables(conn);

    // Update base info
    if (name?.trim()) {
      await conn.query(
        `UPDATE next_student_signups SET name = ? WHERE id = ?`,
        [name.trim(), id],
      );
    }
    if (phone !== undefined) {
      await conn.query(
        `UPDATE next_student_signups SET phone = ? WHERE id = ?`,
        [phone.trim() || null, id],
      );
    }

    // Upsert extended profile
    await conn.query(
      `INSERT INTO next_student_profiles
         (student_id, dob, gender, city, state, country, hobbies, interest, about)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         dob      = VALUES(dob),
         gender   = VALUES(gender),
         city     = VALUES(city),
         state    = VALUES(state),
         country  = VALUES(country),
         hobbies  = VALUES(hobbies),
         interest = VALUES(interest),
         about    = VALUES(about)`,
      [
        id,
        dob || null,
        gender || null,
        city || null,
        state || null,
        country || "India",
        hobbies || null,
        interest || null,
        about || null,
      ],
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } finally {
    conn.release();
  }
}
