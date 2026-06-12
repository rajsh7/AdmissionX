import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { slugs } = await req.json() as { slugs: string[] };
    if (!slugs?.length) return NextResponse.json({ ok: false, error: "No slugs provided" });

    const db = await getDb();
    const colleges = await db.collection("collegeprofile")
      .find({ slug: { $in: slugs } }, { projection: { users_id: 1, email: 1 } })
      .toArray();

    const emails = colleges.map((c) => c.email).filter(Boolean);
    const userIds = colleges.map((c) => c.users_id).filter(Boolean);

    await Promise.all([
      db.collection("collegeprofile").deleteMany({ slug: { $in: slugs } }),
      emails.length ? db.collection("next_college_signups").deleteMany({ email: { $in: emails } }) : Promise.resolve(),
      userIds.length ? db.collection("users").deleteMany({ $or: [{ id: { $in: userIds } }, { _id: { $in: userIds } }] }) : Promise.resolve(),
    ]);

    return NextResponse.json({ ok: true, deleted: slugs.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
