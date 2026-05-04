import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const value      = (formData.get("value") as string)?.trim();
    const label      = (formData.get("label") as string)?.trim();
    const desc       = (formData.get("desc") as string)?.trim();
    const badgeColor = (formData.get("badgeColor") as string)?.trim();
    const accessMode = (formData.get("accessMode") as string) || "blacklist";
    const blockedPaths = formData.getAll("blockedPaths").map(p => String(p).trim()).filter(Boolean);
    const allowedPaths = formData.getAll("allowedPaths").map(p => String(p).trim()).filter(Boolean);

    if (!value || !label) {
      return NextResponse.json({ error: "Value and label are required." }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.collection("admin_roles").findOne({ value });
    if (existing) {
      return NextResponse.json({ error: "Role value already exists." }, { status: 400 });
    }

    await db.collection("admin_roles").insertOne({
      value, label, desc, badgeColor, accessMode, blockedPaths, allowedPaths,
      is_system: false, created_at: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/roles POST]", err);
    return NextResponse.json({ error: "Failed to create role." }, { status: 500 });
  }
}
