import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const adminPayload = await verifyAdminToken(token);
    if (!adminPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (id === undefined || id === null) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("ads_managements").deleteOne({ _id: new ObjectId(id) });

    revalidatePath("/admin/ads/management");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/admin/ads DELETE]", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
