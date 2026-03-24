import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Proxy images from admin.admissionx.in which has an SSL SNI issue
// AND serve local /uploads images dynamically to bypass dev server 404s.

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  // Handle local dynamic uploads bypassing Dev Server Cache
  if (url.startsWith("/uploads/")) {
    const filePath = join(process.cwd(), "public", url.split("?")[0]);
    if (!existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }
    try {
      const file = await readFile(filePath);
      const ext = url.split(".").pop()?.toLowerCase() ?? "jpg";
      const contentTypeMap: Record<string, string> = {
        jpg: "image/jpeg", jpeg: "image/jpeg",
        png: "image/png", webp: "image/webp",
        gif: "image/gif", svg: "image/svg+xml",
      };
      const contentType = contentTypeMap[ext] ?? "image/jpeg";
      return new NextResponse(file as any, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      return new NextResponse("Server Error", { status: 500 });
    }
  }

  // Handle old proxy for legacy domains with SSL SNI issues
  if (!url.startsWith("https://admin.admissionx.in/") && !url.startsWith("https://admissionx.info/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      https.get(url, { rejectUnauthorized: false }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}`));
          res.resume();
          return;
        }
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    });

    const ext = url.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg",
      png: "image/png", webp: "image/webp",
      gif: "image/gif", svg: "image/svg+xml",
    };
    const contentType = contentTypeMap[ext] ?? "image/jpeg";

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
