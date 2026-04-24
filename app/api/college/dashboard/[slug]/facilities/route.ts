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

// GET — all facilities with enabled status for this college
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();

  const [allFacilities, enabledFacilities] = await Promise.all([
    db.collection("facilities").find({}).sort({ name: 1 }).toArray(),
    db.collection("collegefacilities").find({ collegeprofile_id: auth.collegeprofile_id }).toArray(),
  ]);

  const enabledMap = new Map(
    enabledFacilities.map((f: any) => [Number(f.facilities_id), { description: f.description ?? null }])
  );

  const facilities = allFacilities.map((f: any) => ({
    id: Number(f.id),
    name: String(f.name ?? "").trim(),
    iconname: f.iconname ?? null,
    enabled: enabledMap.has(Number(f.id)),
    description: enabledMap.get(Number(f.id))?.description ?? null,
  }));

  return NextResponse.json({ facilities, enabled_count: enabledMap.size, total: facilities.length });
}

// POST — add/enable a facility
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const updates = body.updates as { facilities_id: number; enabled: boolean; description?: string }[];
  if (!Array.isArray(updates) || !updates.length)
    return NextResponse.json({ error: "updates array is required." }, { status: 400 });

  const db = await getDb();
  const allFacilities = await db.collection("facilities").find({}).toArray();
  const refMap = new Map(allFacilities.map((f: any) => [Number(f.id), String(f.name ?? "").trim()]));

  for (const { facilities_id, enabled, description } of updates) {
    const fid = Number(facilities_id);
    if (!refMap.has(fid)) continue;

    if (enabled) {
      await db.collection("collegefacilities").updateOne(
        { collegeprofile_id: auth.collegeprofile_id, facilities_id: fid },
        {
          $set: {
            collegeprofile_id: auth.collegeprofile_id,
            facilities_id: fid,
            name: refMap.get(fid),
            description: description?.trim() || null,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
    } else {
      await db.collection("collegefacilities").deleteOne({
        collegeprofile_id: auth.collegeprofile_id,
        facilities_id: fid,
      });
    }
  }

  return NextResponse.json({ success: true, message: `${updates.length} facility update(s) applied.` });
}

// DELETE — remove a facility
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await checkAuth(slug);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const facilityId = Number(req.nextUrl.searchParams.get("facilityId"));
  if (!facilityId) return NextResponse.json({ error: "facilityId is required." }, { status: 400 });

  const db = await getDb();
  await db.collection("collegefacilities").deleteOne({
    collegeprofile_id: auth.collegeprofile_id,
    facilities_id: facilityId,
  });

  return NextResponse.json({ success: true });
}
