import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// -- Auth + ownership helper ---------------------------------------------------
async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT cp.id AS collegeprofile_id, cp.users_id
       FROM collegeprofile cp
       JOIN users u ON u.id = cp.users_id
       WHERE cp.slug = ? AND TRIM(LOWER(u.email)) = LOWER(?)
       LIMIT 1`,
      [slug, payload.email],
    );
    const list = rows as { collegeprofile_id: number; users_id: number }[];
    if (!list.length) return null;
    return { payload, collegeprofile_id: list[0].collegeprofile_id };
  } finally {
    conn.release();
  }
}

// -- GET /api/college/dashboard/[slug]/placement -------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT
         id,
         numberofrecruitingcompany,
         numberofplacementlastyear,
         ctchighest,
         ctclowest,
         ctcaverage,
         placementinfo
       FROM placement
       WHERE collegeprofile_id = ?
       LIMIT 1`,
      [auth.collegeprofile_id],
    );

    const list = rows as Record<string, unknown>[];

    // Return empty defaults if no row exists yet
    const empty = {
      id: null,
      numberofrecruitingcompany: "",
      numberofplacementlastyear: "",
      ctchighest: "",
      ctclowest: "",
      ctcaverage: "",
      placementinfo: "",
    };

    const placement = list[0] ?? empty;

    // Normalise nulls → empty strings
    const normalised: Record<string, unknown> = {};
    for (const key of Object.keys(empty)) {
      const val = (placement as Record<string, unknown>)[key];
      normalised[key] = val === null || val === undefined ? "" : val;
    }

    // Completeness: how many of the 6 stats fields are filled?
    const statFields = [
      "numberofrecruitingcompany",
      "numberofplacementlastyear",
      "ctchighest",
      "ctclowest",
      "ctcaverage",
    ];
    const filled = statFields.filter((k) => normalised[k] !== "").length;
    const placementComplete = Math.round((filled / statFields.length) * 100);

    return NextResponse.json({ placement: normalised, placementComplete });
  } finally {
    conn.release();
  }
}

// -- PUT /api/college/dashboard/[slug]/placement -------------------------------
// Body: { numberofrecruitingcompany?, numberofplacementlastyear?, ctchighest?,
//         ctclowest?, ctcaverage?, placementinfo? }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const allowed = [
    "numberofrecruitingcompany",
    "numberofplacementlastyear",
    "ctchighest",
    "ctclowest",
    "ctcaverage",
    "placementinfo",
  ];

  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const raw = body[key];
    const val =
      raw === "" || raw === null || raw === undefined
        ? null
        : String(raw).trim() || null;
    setClauses.push(`${key} = ?`);
    values.push(val);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields provided." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    // Check if a row already exists
    const [existing] = await conn.query(
      `SELECT id FROM placement WHERE collegeprofile_id = ? LIMIT 1`,
      [auth.collegeprofile_id],
    );
    const existingList = existing as { id: number }[];

    if (existingList.length) {
      // Update existing row
      setClauses.push("updated_at = CURRENT_TIMESTAMP");
      await conn.query(
        `UPDATE placement SET ${setClauses.join(", ")} WHERE collegeprofile_id = ?`,
        [...values, auth.collegeprofile_id],
      );
    } else {
      // Insert new row — build column list from setClauses
      const columns = setClauses
        .filter((c) => !c.startsWith("updated_at"))
        .map((c) => c.split(" = ")[0]);
      const insertValues = values.slice(0, columns.length);

      await conn.query(
        `INSERT INTO placement
           (collegeprofile_id, ${columns.join(", ")}, created_at, updated_at)
         VALUES (?, ${columns.map(() => "?").join(", ")}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [auth.collegeprofile_id, ...insertValues],
      );
    }

    return NextResponse.json({
      success: true,
      message: "Placement data saved successfully.",
    });
  } finally {
    conn.release();
  }
}
