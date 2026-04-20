import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveUpload } from "@/lib/upload-utils";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const topic = formData.get("topic") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isactive = parseInt(formData.get("isactive") as string, 10);
    const imageFile = formData.get("bannerimage_file") as File | null;

    let featimage: string | null = null;
    if (imageFile && imageFile.size > 0) {
      featimage = await saveUpload(imageFile, "blogs", "blog");
    }

    const db = await getDb();
    await db.collection("blogs").insertOne({
      topic, slug, description, isactive, featimage, created_at: new Date(), updated_at: new Date(),
    });

    revalidatePath("/admin/blogs");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/admin/blogs POST]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const topic = formData.get("topic") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isactive = parseInt(formData.get("isactive") as string, 10);
    const imageFile = formData.get("bannerimage_file") as File | null;
    const existing = formData.get("bannerimage_existing") as string | null;

    let featimage: string | null = existing || null;
    if (featimage && featimage.startsWith("/api/image-proxy?url=")) {
      // Decode the URL and optionally clean the legacy domain off so only the true filename remains
      const decoded = decodeURIComponent(featimage.split("url=")[1]);
      if (decoded.startsWith("https://admin.admissionx.in/uploads/")) {
        featimage = decoded.replace("https://admin.admissionx.in/uploads/", "");
      } else {
        featimage = decoded;
      }
    }
    
    if (imageFile && imageFile.size > 0) {
      featimage = await saveUpload(imageFile, "blogs", "blog");
    }

    const db = await getDb();
    const numericId = Number(id);
    const filter = !isNaN(numericId) && numericId > 0
      ? { id: numericId }
      : { _id: new ObjectId(id) };

    await db.collection("blogs").updateOne(
      filter,
      { $set: { topic, slug, description, isactive, featimage, updated_at: new Date() } }
    );

    revalidatePath("/admin/blogs");
    revalidatePath("/");
    revalidatePath("/blogs");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/admin/blogs PUT]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
