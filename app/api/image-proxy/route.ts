import { NextRequest, NextResponse } from "next/server";
import http from "http";
import https from "https";
import path, { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent({});

const ALLOWED_DOMAINS = [
  "admin.admissionx.in",
  "admissionx.info",
  "admissionx.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "lh3.googleusercontent.com",
];

function isAllowedDomain(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return (
      ALLOWED_DOMAINS.includes(host) ||
      host.endsWith(".admissionx.in") ||
      host.endsWith(".admissionx.info") ||
      host.endsWith(".admissionx.com") ||
      host.endsWith(".cloudinary.com")
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) return new NextResponse("Missing url", { status: 400 });

  // Handle local dynamic uploads bypassing Dev Server Cache with path traversal protection
  if (url.startsWith("/uploads/")) {
    const cleanPath = url.split("?")[0];
    const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(process.cwd(), "public", cleanPath.replace(/^\/+/, ""));

    // Prevent directory traversal outside public/uploads
    if (!filePath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

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

  // Validate allowed proxy hostnames
  if (!isAllowedDomain(url)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    // Fix double /uploads//uploads/ path that comes from bad data
    const cleanUrl = url.replace(/\/uploads\/\/uploads\//g, "/uploads/");

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      function fetchWithRedirects(targetUrl: string, redirectsLeft = 5) {
        if (!isAllowedDomain(targetUrl)) {
          reject(new Error("Redirect to disallowed host"));
          return;
        }

        const isHttps = targetUrl.startsWith("https://");
        const client = isHttps ? https : http;
        const agent = isHttps ? httpsAgent : httpAgent;

        client.get(targetUrl, { agent, timeout: 10000 }, (res: any) => {
          // Follow 3xx redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
            res.resume();
            const next = res.headers.location.startsWith("http")
              ? res.headers.location
              : new URL(res.headers.location, targetUrl).toString();

            if (!isAllowedDomain(next)) {
              reject(new Error("Redirect to disallowed host"));
              return;
            }

            fetchWithRedirects(next, redirectsLeft - 1);
            return;
          }
          if (res.statusCode === 404) {
            const err = new Error("Image not found on remote server");
            (err as any).statusCode = 404;
            reject(err);
            res.resume();
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
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return new NextResponse("Image Not Found", {
        status: 404,
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    }
    console.error("Image proxy error:", error);
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
