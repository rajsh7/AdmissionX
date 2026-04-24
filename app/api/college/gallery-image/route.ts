import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GALLERY_BASE = "D:\\admissionx_new\\admissionx_new\\public\\gallery";

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const folder = sp.get("folder") ?? "";
  const file = sp.get("file") ?? "";

  // Security: prevent path traversal
  if (!folder || !file || folder.includes("..") || file.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(GALLERY_BASE, folder, file);

  if (!filePath.startsWith(GALLERY_BASE) || !fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(file).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  };
  const contentType = mimeMap[ext] ?? "image/jpeg";

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
