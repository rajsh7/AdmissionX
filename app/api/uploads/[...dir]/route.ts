import { NextRequest, NextResponse } from "next/server";
import { join, resolve, normalize } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(req: NextRequest, context: { params: Promise<{ dir: string[] }> }) {
  const params = await context.params;

  // Sanitize: prevent path traversal
  const uploadsRoot = resolve(process.cwd(), "public", "uploads");
  const filePath = resolve(uploadsRoot, ...params.dir);
  if (!filePath.startsWith(uploadsRoot + "/") && filePath !== uploadsRoot) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const ext = params.dir[params.dir.length - 1].split(".").pop()?.toLowerCase() || "jpg";
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg",
      png: "image/png", webp: "image/webp",
      gif: "image/gif", svg: "image/svg+xml",
    };
    const contentType = contentTypeMap[ext] || "image/jpeg";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return new NextResponse("Server Error", { status: 500 });
  }
}
