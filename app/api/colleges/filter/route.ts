import { NextResponse } from "next/server";
import { getCachedCollegesForSlug, CATEGORY_SLUG } from "@/lib/college-filter";

// --- GET /api/colleges/filter -------------------------------------------------
//
//  Query param:
//    stream – UI category label  e.g. "MBA" | "Engineering" | "MBBS" …
//             Falls back to the raw value lowercased if not in CATEGORY_SLUG.
//
//  All heavy lifting (3-step query + caching) lives in lib/college-filter.ts.
//
// -----------------------------------------------------------------------------

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawStream = (searchParams.get("stream") ?? "Engineering").trim();

  // Map UI label → DB pageslug
  const slug = CATEGORY_SLUG[rawStream] ?? rawStream.toLowerCase();

  try {
    const data = await getCachedCollegesForSlug(slug);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/colleges/filter]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
