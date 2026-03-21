import type { NextConfig } from "next";
import path from "path";

// Force dev server restart to register new API routes
const nextConfig: NextConfig = {
  // Prevent Next.js from picking a parent folder as the workspace root when
  // multiple lockfiles exist on the machine.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  // ── Image optimisation ──────────────────────────────────────────────────────
  // Whitelist every external host that supplies images so Next.js can optimise
  // them (resize, convert to WebP/AVIF, add cache headers) via <Image />.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.admissionx.in",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.admissionx.in",
      },
    ],
    // Serve modern formats automatically; fall back to original for old browsers.
    formats: ["image/avif", "image/webp"],
    // Keep optimised images in the disk cache for 7 days before re-generating.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Allow reasonably large hero / banner images.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── HTTP fetch cache (Next.js data cache) ───────────────────────────────────
  // Sets the default TTL for fetch() calls that do NOT specify their own
  // { next: { revalidate } } option.  Pages that explicitly export
  // `export const revalidate = N` override this per-route.
  // 300 s = 5 minutes — matches the unstable_cache TTLs used across the app.
  experimental: {
    staleTimes: {
      dynamic: 0, // dynamic routes: no extra client-side staleness
      static: 300, // statically cached routes: serve from cache for 5 min
    },
  },

  // ── Compiler options ────────────────────────────────────────────────────────
  // Remove console.log in production builds (keep warn/error for debugging).
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["warn", "error"] }
        : false,
  },

  // ── HTTP headers ─────────────────────────────────────────────────────────────
  // Add aggressive cache headers on all static assets served from /_next/static.
  // These are content-addressed (hash in filename) so they are safe to cache
  // for a year.  The browser will always fetch a fresh HTML document, which
  // references the new hashed assets after each deploy.
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
