import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(req: NextRequest, context: { params: Promise<{ dir: string[] }> }) {
  const params = await context.params;
  const filePath = join(process.cwd(), "public", "uploads", ...params.dir);

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
