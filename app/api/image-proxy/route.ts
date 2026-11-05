import { NextRequest, NextResponse } from "next/server";
import http from "http";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Proxy images from admin.admissionx.in which has an SSL SNI issue
// AND serve local /uploads images dynamically to bypass dev server 404s.

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const width = req.nextUrl.searchParams.get("w");
  const quality = req.nextUrl.searchParams.get("q");

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
    } catch (error) {
      console.error("Error reading local file:", error);
      return new NextResponse("Server Error", { status: 500 });
    }
  }

  // Handle old proxy for legacy domains with SSL SNI issues
  if (!url.startsWith("https://admin.admissionx.in/") && !url.startsWith("https://admissionx.info/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // Fix double /uploads//uploads/ path that comes from bad data
    const cleanUrl = url.replace(/\/uploads\/\/uploads\//g, "/uploads/");

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      function fetchWithRedirects(targetUrl: string, redirectsLeft = 5) {
        const fetchUrl = targetUrl.replace("https://", "http://");
        http.get(fetchUrl, { timeout: 10000 }, (res: any) => {
          // Follow 3xx redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
            res.resume();
            const next = res.headers.location.startsWith("http")
              ? res.headers.location
              : new URL(res.headers.location, targetUrl).toString();
            fetchWithRedirects(next, redirectsLeft - 1);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Status ${res.statusCode}`));
            res.resume();
            return;
          }
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        }).on("error", (error: any) => {
          console.error("HTTP request error:", error);
          reject(error);
        });
      }

      fetchWithRedirects(cleanUrl);
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
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
