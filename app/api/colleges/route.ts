import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CollegeRow = Record<string, string | number | null>;

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nameFromSlug(value: string): string {
  return value
    .replace(/-\d+$/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveImageUrl(value: string | number | null): string {
  const raw = typeof value === "number" ? String(value) : value?.toString().trim();
  if (!raw) {
    return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";
  }
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    return raw;
  }
  return `https://admin.admissionx.in/uploads/${raw}`;
}

function parseLocationParts(value: string): { city: string; country: string } {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { city: "", country: "" };
  const city = parts[0] ?? "";
  const country = parts.length > 1 ? parts[parts.length - 1] ?? "" : "";
  return { city, country };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = (searchParams.get("q") ?? "").trim();
  const country = (searchParams.get("country") ?? "").trim();
  const city = (searchParams.get("city") ?? "").trim();
  const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : null;
  const universityType = (searchParams.get("universityType") ?? "").trim();
  const sortBy = (searchParams.get("sortBy") ?? "id").trim();
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(toPositiveInt(searchParams.get("limit"), 12), 100);
  const offset = (page - 1) * limit;

  try {
    const selectParts = [
      "cp.id AS id",
      "cp.description AS description",
      "cp.website AS website",
      "cp.estyear AS estyear",
      "cp.universityType AS universityType",
      "COALESCE(cp.registeredSortAddress, cp.campusSortAddress) AS location",
      "cp.rating AS rating",
      "cp.totalStudent AS students",
      "cp.bannerimage AS campus_image",
      "cp.slug AS slug",
      "u.bannerimage AS univ_banner",
      "u.logoimage AS univ_logo",
    ];

    const where: string[] = [];
    const params: Array<string | number> = [];

    if (q) {
      where.push("(cp.slug LIKE ? OR cp.registeredSortAddress LIKE ? OR cp.campusSortAddress LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (country) {
      where.push("(cp.registeredSortAddress LIKE ? OR cp.campusSortAddress LIKE ?)");
      params.push(`%${country}%`, `%${country}%`);
    }

    if (city) {
      where.push("(cp.registeredSortAddress LIKE ? OR cp.campusSortAddress LIKE ?)");
      params.push(`%${city}%`, `%${city}%`);
    }

    if (minRating !== null && Number.isFinite(minRating)) {
      where.push("cp.rating >= ?");
      params.push(minRating);
    }

    if (universityType) {
      where.push("cp.universityType = ?");
      params.push(universityType);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Get real total count for pagination
    const [countRows] = (await pool.query(
      `SELECT COUNT(*) AS total FROM collegeprofile cp ${whereSql}`,
      params
    )) as [Array<{ total: number }>, unknown];
    const totalCount = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const [rows] = (await pool.query(
      `SELECT ${selectParts.join(", ")}
       FROM collegeprofile cp
       LEFT JOIN university u ON cp.university_id = u.id
       ${whereSql}
       ORDER BY ${sortBy === "rating" ? "cp.rating DESC, cp.id ASC" : sortBy === "name" ? "cp.slug ASC" : "cp.id ASC"}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )) as [CollegeRow[], unknown];

    const hasNext = page < totalPages;

    const data = rows.map((row) => {
      const id = Number(row.id);
      const locationValue = row.location ? String(row.location) : "";
      const { city: cityValue, country: countryValue } = locationValue
        ? parseLocationParts(locationValue)
        : { city: "", country: "" };
      const slugValue =
        row.slug && String(row.slug).trim().length > 0
          ? String(row.slug)
          : row.name
            ? `${slugify(String(row.name))}${Number.isFinite(id) ? `-${id}` : ""}`
            : Number.isFinite(id)
              ? `college-${id}`
              : "";

      const name =
        row.name && String(row.name).trim().length > 0
          ? String(row.name)
          : slugValue
            ? nameFromSlug(slugValue)
            : "College";

      const ratingValue = row.rating !== null && row.rating !== undefined ? Number(row.rating) : null;

      // Image prioritization: Campus Banner > Univ Banner > Univ Logo > Fallback
      let resolvedImage = resolveImageUrl(row.campus_image);
      if (resolvedImage.includes("unsplash.com") && row.univ_banner) {
        resolvedImage = resolveImageUrl(row.univ_banner);
      }
      if (resolvedImage.includes("unsplash.com") && row.univ_logo) {
        resolvedImage = resolveImageUrl(row.univ_logo);
      }

      return {
        id: Number.isFinite(id) ? id : 0,
        name,
        city: cityValue,
        country: countryValue,
        location: locationValue || [cityValue, countryValue].filter(Boolean).join(", "),
        rating: Number.isFinite(ratingValue) ? ratingValue : null,
        students: row.students !== null && row.students !== undefined ? String(row.students) : "N/A",
        image: resolvedImage,
        slug: slugValue,
        description: row.description ? String(row.description) : "",
        website: row.website ? String(row.website) : "",
        estyear: row.estyear ? String(row.estyear) : "",
        universityType: row.universityType ? String(row.universityType) : "",
      };
    });

    const total = totalCount;

    const response = NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev: page > 1,
      },
      appliedFilters: { q, country, city, minRating, universityType, sortBy },
    });
    response.headers.set("X-Total-Count", String(total));
    response.headers.set("X-Total-Pages", String(totalPages));
    response.headers.set("X-Page", String(page));
    response.headers.set("X-Limit", String(limit));
    response.headers.set(
      "Access-Control-Expose-Headers",
      "X-Total-Count, X-Total-Pages, X-Page, X-Limit"
    );

    return response;
  } catch (error) {
    console.error("Colleges API error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch colleges";
    return NextResponse.json({ success: false, message, data: [] }, { status: 500 });
  }
}
