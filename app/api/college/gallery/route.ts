import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GALLERY_BASE = "D:\\admissionx_new\\admissionx_new\\public\\gallery";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slug) return NextResponse.json({ images: [] });

  try {
    if (!fs.existsSync(GALLERY_BASE)) return NextResponse.json({ images: [] });

    const allFolders = fs.readdirSync(GALLERY_BASE);

    // Folder pattern: [-]{slug}-{numericId}
    const matchedFolder =
      allFolders.find((f) => {
        const clean = f.startsWith("-") ? f.slice(1) : f;
        return clean === slug || clean.startsWith(slug + "-");
      }) ??
      allFolders.find((f) => {
        const clean = f.startsWith("-") ? f.slice(1) : f;
        return clean.includes(slug);
      });

    if (!matchedFolder) return NextResponse.json({ images: [] });

    const folderPath = path.join(GALLERY_BASE, matchedFolder);
    const files = fs.readdirSync(folderPath);

    const images = files
      .filter((f) => !f.includes("_original") && /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .map((f) => `/api/college/gallery-image?folder=${encodeURIComponent(matchedFolder)}&file=${encodeURIComponent(f)}`);

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[gallery]", err);
    return NextResponse.json({ images: [] });
  }
}
