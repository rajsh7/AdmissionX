import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCollegeToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function checkAuth(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("adx_college")?.value;
  if (!token) return null;
  const payload = await verifyCollegeToken(token);
  if (!payload) return null;

  const db = await getDb();
  const cp = await db.collection("collegeprofile").findOne(
    { slug },
    { projection: { _id: 1, id: 1, email: 1, users_id: 1 } }
  );
  if (!cp) return null;

  const emailMatch = cp.email?.toLowerCase().trim() === payload.email.toLowerCase().trim();
  if (!emailMatch) {
    const user = await db.collection("users").findOne({ id: cp.users_id }, { projection: { email: 1 } });
    if (!user || user.email?.toLowerCase().trim() !== payload.email.toLowerCase().trim()) return null;
  }

  return { payload, collegeprofile_id: cp.id ? Number(cp.id) : cp._id.toString(), slug };
}

const EMPTY = {
  numberofrecruitingcompany: "",
  numberofplacementlastyear: "",
  ctchighest: "",
  ctclowest: "",
  ctcaverage: "",
  placementinfo: "",
};

// GET
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const row = await db.collection("placement").findOne({ collegeprofile_id: auth.collegeprofile_id });

  const placement: Record<string, unknown> = { id: row?._id?.toString() ?? null };
  for (const key of Object.keys(EMPTY)) {
    const val = row?.[key];
    placement[key] = val === null || val === undefined ? "" : String(val);
  }

  return NextResponse.json({ placement });
}

// PUT — upsert placement data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const $set: Record<string, unknown> = { collegeprofile_id: auth.collegeprofile_id, updated_at: new Date() };
  for (const key of Object.keys(EMPTY)) {
    if (key in body) {
      const raw = body[key];
      $set[key] = raw === "" || raw === null || raw === undefined ? null : String(raw).trim() || null;
    }
  }

  const db = await getDb();
  await db.collection("placement").updateOne(
    { collegeprofile_id: auth.collegeprofile_id },
    { $set, $setOnInsert: { created_at: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true, message: "Placement data saved successfully." });
}
