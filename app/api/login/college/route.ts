import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signCollegeToken, COLLEGE_COOKIE, COOKIE_OPTIONS } from "@/lib/auth";

interface CollegeRow {
  id: number;
  college_name: string;
  email: string;
  password_hash: string | null;
  status: string;
}

interface CollegeProfileRow {
  slug: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const conn = await pool.getConnection();
    let user: CollegeRow | null = null;
    let slug: string | null = null;

    try {
      const [rows] = await conn.query(
        `SELECT id, college_name, email, password_hash, status
         FROM next_college_signups
         WHERE email = ?
         LIMIT 1`,
        [email],
      );

      const list = rows as unknown as CollegeRow[];
      if (list.length) user = list[0];
    } finally {
      conn.release();
    }

    // Account not found
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Account pending admin approval — no password set yet
    if (user.status === "pending" || !user.password_hash) {
      return NextResponse.json(
        {
          error:
            "Your college account is pending approval. You will receive login credentials by email once approved.",
        },
        { status: 403 },
      );
    }

    // Account rejected or suspended
    if (user.status === "rejected" || user.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "Your college account has been suspended or rejected. Please contact support@admissionx.com.",
        },
        { status: 403 },
      );
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Look up the collegeprofile slug for this user
    const slugConn = await pool.getConnection();
    try {
      const [slugRows] = await slugConn.query(
        `SELECT cp.slug
         FROM collegeprofile cp
         JOIN users u ON u.id = cp.users_id
         WHERE TRIM(LOWER(u.email)) = LOWER(?)
         LIMIT 1`,
        [user.email],
      );
      const slugList = slugRows as unknown as CollegeProfileRow[];
      if (slugList.length && slugList[0].slug) {
        slug = slugList[0].slug;
      }
    } catch {
      // Non-fatal — slug lookup failure falls back to id-based redirect
    } finally {
      slugConn.release();
    }

    // Sign a 7-day JWT
    const token = await signCollegeToken({
      id: user.id,
      name: user.college_name,
      email: user.email,
      role: "college",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.college_name,
        email: user.email,
        role: "college",
        slug: slug ?? null,
      },
    });

    response.cookies.set(COLLEGE_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
