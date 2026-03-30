import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(req: NextRequest) {
  try {
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
