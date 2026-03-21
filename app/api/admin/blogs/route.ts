import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { saveUpload } from "@/lib/upload-utils";
import { revalidatePath } from "next/cache";

// POST /api/admin/blogs — create
export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const topic       = formData.get("topic") as string;
    const slug        = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isactive    = parseInt(formData.get("isactive") as string, 10);
    const imageFile   = formData.get("bannerimage_file") as File | null;

    let featimage: string | null = null;
    if (imageFile && imageFile.size > 0) {
      featimage = await saveUpload(imageFile, "blogs", "blog");
    }

    await pool.query(
      "INSERT INTO blogs (topic, slug, description, isactive, featimage) VALUES (?, ?, ?, ?, ?)",
      [topic, slug, description, isactive, featimage]
    );

    revalidatePath("/admin/blogs");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/admin/blogs POST]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// PUT /api/admin/blogs — update
export async function PUT(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const id          = formData.get("id") as string;
    const topic       = formData.get("topic") as string;
    const slug        = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const isactive    = parseInt(formData.get("isactive") as string, 10);
    const imageFile   = formData.get("bannerimage_file") as File | null;
    const existing    = formData.get("bannerimage_existing") as string | null;

    let featimage: string | null = existing || null;
    if (imageFile && imageFile.size > 0) {
      featimage = await saveUpload(imageFile, "blogs", "blog");
    }

    await pool.query(
      "UPDATE blogs SET topic = ?, slug = ?, description = ?, isactive = ?, featimage = ? WHERE id = ?",
      [topic, slug, description, isactive, featimage, id]
    );

    revalidatePath("/admin/blogs");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/admin/blogs PUT]", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
