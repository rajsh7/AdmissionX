import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function buildImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `/uploads/${raw}`;
}

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\/+$/, "").replace(/-+$/, "");
}

export async function GET(req: NextRequest) {
  const rawSlugs = (req.nextUrl.searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!rawSlugs.length) {
    return NextResponse.json({ courses: [] });
  }

  try {
    const db = await getDb();
    const normalizedRequested = rawSlugs.map(normalizeSlug);
    const looseSlugs = Array.from(new Set([...rawSlugs, ...normalizedRequested]));

    const rowsFromCounselling = await db
      .collection("counseling_courses_details")
      .aggregate([
        {
          $match: {
            $or: [{ slug: { $in: looseSlugs } }, { slug: { $in: rawSlugs } }],
          },
        },
        {
          $lookup: {
            from: "educationlevel",
            localField: "educationlevel_id",
            foreignField: "id",
            as: "el",
          },
        },
        {
          $lookup: {
            from: "functionalarea",
            localField: "functionalarea_id",
            foreignField: "id",
            as: "fa",
          },
        },
        { $unwind: { path: "$el", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            slug: 1,
            title: 1,
            image: 1,
            description: 1,
            bestChoiceOfCourse: 1,
            jobsCareerOpportunityDesc: 1,
            level_name: "$el.name",
            stream_name: "$fa.name",
          },
        },
      ])
      .toArray();

    const mappedCounselling = rowsFromCounselling.map((row) => ({
      slug: row.slug,
      title: row.title || row.slug,
      image: buildImageUrl(row.image),
      description: row.description || null,
      bestChoiceOfCourse: row.bestChoiceOfCourse || null,
      jobsCareerOpportunityDesc: row.jobsCareerOpportunityDesc || null,
      level_name: row.level_name || null,
      stream_name: row.stream_name || null,
    }));

    const presentNormalized = new Set(
      mappedCounselling.map((c) => normalizeSlug(String(c.slug || ""))),
    );
    const missingNormalized = normalizedRequested.filter(
      (s) => !presentNormalized.has(s),
    );

    let mappedCourseMaster: Array<{
      slug: string;
      title: string;
      image: string | null;
      description: string | null;
      bestChoiceOfCourse: string | null;
      jobsCareerOpportunityDesc: string | null;
      level_name: string | null;
      stream_name: string | null;
    }> = [];

    if (missingNormalized.length > 0) {
      const rowsFromCourse = await db
        .collection("course")
        .aggregate([
          {
            $match: {
              pageslug: { $in: missingNormalized },
            },
          },
          {
            $lookup: {
              from: "degree",
              localField: "degree_id",
              foreignField: "id",
              as: "deg",
            },
          },
          {
            $lookup: {
              from: "functionalarea",
              localField: "functionalarea_id",
              foreignField: "id",
              as: "fa",
            },
          },
          { $unwind: { path: "$deg", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$fa", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              pageslug: 1,
              name: 1,
              bannerimage: 1,
              logoimage: 1,
              pagedescription: 1,
              bestchoiceofcourse: 1,
              jobscareeropportunitydesc: 1,
              level_name: "$deg.name",
              stream_name: "$fa.name",
            },
          },
        ])
        .toArray();

      mappedCourseMaster = rowsFromCourse.map((row) => ({
        slug: row.pageslug,
        title: row.name || row.pageslug,
        image: buildImageUrl(row.bannerimage || row.logoimage),
        description: row.pagedescription || null,
        bestChoiceOfCourse: row.bestchoiceofcourse || null,
        jobsCareerOpportunityDesc: row.jobscareeropportunitydesc || null,
        level_name: row.level_name || null,
        stream_name: row.stream_name || null,
      }));
    }

    const merged = [...mappedCounselling, ...mappedCourseMaster];
    const ordered = normalizedRequested
      .map((target) => merged.find((c) => normalizeSlug(c.slug) === target))
      .filter(Boolean);

    return NextResponse.json({ courses: ordered });
  } catch (error) {
    console.error("[/api/compare-courses]", error);
    return NextResponse.json({ courses: [] }, { status: 500 });
  }
}

