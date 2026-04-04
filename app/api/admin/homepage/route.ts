import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db.collection("homepage_settings").findOne({ key: "main" });
    return NextResponse.json({ success: true, data: settings ?? {} });
  } catch (err) {
    console.error("[api/admin/homepage GET]", err);
    return NextResponse.json({ success: false, data: {} }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDb();
    await db.collection("homepage_settings").updateOne(
      { key: "main" },
      { $set: { ...body, key: "main", updated_at: new Date() } },
      { upsert: true }
    );
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/homepage POST]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
