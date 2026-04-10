import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import pool from "@/lib/db";

// ── Auth + ownership helper ───────────────────────────────────────────────────
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
    return { payload, collegeprofile_id: list[0].collegeprofile_id, users_id: list[0].users_id };
  } finally {
    conn.release();
  }
}

// ── GET /api/college/dashboard/[slug]/facilities ──────────────────────────────
// Returns all facilities from the reference table, each marked with whether
// this college has enabled it (i.e. has a row in collegefacilities).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    // All reference facilities
    const [allRows] = await conn.query(
      `SELECT id, name, iconname FROM facilities ORDER BY name ASC`,
    );

    // Which ones this college has enabled
    const [enabledRows] = await conn.query(
      `SELECT facilities_id, name AS custom_name, description
       FROM collegefacilities
       WHERE collegeprofile_id = ?`,
      [auth.collegeprofile_id],
    );

    const enabledMap = new Map<
      number,
      { custom_name: string | null; description: string | null }
    >();
    for (const row of enabledRows as {
      facilities_id: number;
      custom_name: string | null;
      description: string | null;
    }[]) {
      enabledMap.set(row.facilities_id, {
        custom_name: row.custom_name,
        description: row.description,
      });
    }

    const facilities = (
      allRows as { id: number; name: string; iconname: string | null }[]
    ).map((f) => {
      const enabled = enabledMap.has(f.id);
      const extra   = enabledMap.get(f.id);
      return {
        id:          f.id,
        name:        f.name,
        iconname:    f.iconname ?? null,
        enabled,
        custom_name: extra?.custom_name  ?? null,
        description: extra?.description  ?? null,
      };
    });

    return NextResponse.json({
      facilities,
      enabled_count: enabledMap.size,
      total:         facilities.length,
    });
  } finally {
    conn.release();
  }
}

// ── PUT /api/college/dashboard/[slug]/facilities ──────────────────────────────
// Body: { facilities_id: number, enabled: boolean, description?: string }
// Adds or removes the facility for this college.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    facilities_id?: number;
    enabled?: boolean;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { facilities_id, enabled, description } = body;

  if (facilities_id === undefined || facilities_id === null) {
    return NextResponse.json(
      { error: "facilities_id is required." },
      { status: 400 },
    );
  }

  if (typeof enabled !== "boolean") {
    return NextResponse.json(
      { error: "enabled (boolean) is required." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    // Verify the facility exists in the reference table
    const [refRows] = await conn.query(
      `SELECT id, name FROM facilities WHERE id = ? LIMIT 1`,
      [facilities_id],
    );
    const refList = refRows as { id: number; name: string }[];
    if (!refList.length) {
      return NextResponse.json(
        { error: `Facility with id ${facilities_id} not found.` },
        { status: 404 },
      );
    }

    if (enabled) {
      // Upsert: add the facility for this college
      await conn.query(
        `INSERT INTO collegefacilities
           (collegeprofile_id, facilities_id, name, description)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           description = VALUES(description),
           updated_at  = CURRENT_TIMESTAMP`,
        [
          auth.collegeprofile_id,
          facilities_id,
          refList[0].name,
          description?.trim() || null,
        ],
      );
    } else {
      // Remove: disable the facility for this college
      await conn.query(
        `DELETE FROM collegefacilities
         WHERE collegeprofile_id = ? AND facilities_id = ?`,
        [auth.collegeprofile_id, facilities_id],
      );
    }

    return NextResponse.json({
      success:      true,
      facilities_id,
      enabled,
      message:      enabled
        ? `"${refList[0].name}" has been added to your facilities.`
        : `"${refList[0].name}" has been removed from your facilities.`,
    });
  } finally {
    conn.release();
  }
}

// ── POST /api/college/dashboard/[slug]/facilities ─────────────────────────────
// Bulk-update: Body: { updates: Array<{ facilities_id, enabled, description? }> }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    updates?: { facilities_id: number; enabled: boolean; description?: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updates = body.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json(
      { error: "updates array is required and must not be empty." },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();
  try {
    // Fetch all reference facilities to validate IDs
    const [refRows] = await conn.query(`SELECT id, name FROM facilities`);
    const refMap = new Map(
      (refRows as { id: number; name: string }[]).map((r) => [r.id, r.name]),
    );

    for (const update of updates) {
      const { facilities_id, enabled, description } = update;

      if (!refMap.has(facilities_id)) continue; // skip unknown IDs

      if (enabled) {
        await conn.query(
          `INSERT INTO collegefacilities
             (collegeprofile_id, facilities_id, name, description)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             description = VALUES(description),
             updated_at  = CURRENT_TIMESTAMP`,
          [
            auth.collegeprofile_id,
            facilities_id,
            refMap.get(facilities_id),
            description?.trim() || null,
          ],
        );
      } else {
        await conn.query(
          `DELETE FROM collegefacilities
           WHERE collegeprofile_id = ? AND facilities_id = ?`,
          [auth.collegeprofile_id, facilities_id],
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updates.length} facility update(s) applied.`,
    });
  } finally {
    conn.release();
  }
}
