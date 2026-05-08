import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { saveUpload } from "@/lib/upload-utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Collect all slugs from hidden inputs named "slug__<slug>"
    const slugs: string[] = [];
    for (const [key] of formData.entries()) {
      if (key.startsWith("slug__")) {
        slugs.push(key.replace("slug__", ""));
      }
    }

    const db = await getDb();
    let updated = 0;

    for (const slug of slugs) {
      const fields: Record<string, string> = {};

      const imageKeys = ["banner", "logo", "mosaic1", "mosaic2", "mosaic3", "mosaic4"] as const;
      const dbKeys: Record<string, string> = {
        banner: "bannerimage",
        logo: "logoimage",
        mosaic1: "mosaic1",
        mosaic2: "mosaic2",
        mosaic3: "mosaic3",
        mosaic4: "mosaic4",
      };

      for (const key of imageKeys) {
        const file = formData.get(`${key}__${slug}`) as File | null;
        if (file && file.size > 0) {
          const subDir = key === "mosaic1" ? `college/${slug}` : key.startsWith("mosaic") ? `college/${slug}/mosaic` : `college/${slug}`;
          const prefix = key === "banner" ? "banner" : key === "logo" ? "logo" : key;
          fields[dbKeys[key]] = await saveUpload(file, subDir, prefix);
        }
      }

      if (Object.keys(fields).length > 0) {
        await db.collection("collegeprofile").updateOne(
          { slug },
          { $set: { ...fields, updated_at: new Date() } }
        );
        updated++;
      }
    }

    return NextResponse.json({ ok: true, updated, total: slugs.length });
  } catch (e) {
    console.error("[bulk-images]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
