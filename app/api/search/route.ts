import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Parse "X in Y" pattern → { subject: "X", location: "Y" }
function parseQuery(q: string): { subject: string; location: string | null } {
  const inMatch = q.match(/^(.+?)\s+in\s+(.+)$/i);
  if (inMatch) {
    return { subject: inMatch[1].trim(), location: inMatch[2].trim() };
  }
  return { subject: q, location: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  try {
    const db = await getDb();
    const { subject, location } = parseQuery(q);

    const subjectRegex = { $regex: subject, $options: "i" };
    const locationRegex = location ? { $regex: location, $options: "i" } : null;

    // Resolve location → city IDs if "in <city>" present
    let cityIds: unknown[] = [];
    let cityName = "";
    if (locationRegex) {
      const cityDocs = await db.collection("city")
        .find({ name: locationRegex })
        .project({ _id: 1, id: 1, name: 1 })
        .limit(10)
        .toArray();
      cityIds = cityDocs.map((c) => c.id ?? c._id);
      cityName = cityDocs[0]?.name ?? location ?? "";
    }

    // Resolve subject → stream/degree IDs for college filtering
    const [streamDocs, degreeDocs, courseDocs] = await Promise.all([
      db.collection("functionalarea").find({ name: subjectRegex }).project({ _id: 1, id: 1, name: 1, pageslug: 1 }).limit(5).toArray(),
      db.collection("degree").find({ name: subjectRegex }).project({ _id: 1, id: 1, name: 1, pageslug: 1 }).limit(5).toArray(),
      db.collection("course").find({ name: subjectRegex }).project({ _id: 0, name: 1, pageslug: 1 }).limit(5).toArray(),
    ]);

    const suggestions: any[] = [];

    // ── 1. "course in city" → colleges offering that course in that city ──
    if ((streamDocs.length > 0 || degreeDocs.length > 0) && cityIds.length > 0) {
      const streamIds = streamDocs.map((s) => s.id ?? s._id);
      const degreeIds = degreeDocs.map((d) => d.id ?? d._id);

      const cmFilter: Record<string, unknown> = {};
      if (streamIds.length > 0) cmFilter.functionalarea_id = { $in: streamIds };
      else if (degreeIds.length > 0) cmFilter.degree_id = { $in: degreeIds };

      const cmDocs = await db.collection("collegemaster")
        .find(cmFilter, { projection: { collegeprofile_id: 1 } })
        .limit(500)
        .toArray();
      const cpIds = [...new Set(cmDocs.map((c) => c.collegeprofile_id))];

      if (cpIds.length > 0) {
        const collegeFilter: Record<string, unknown> = {
          id: { $in: cpIds },
          registeredAddressCityId: { $in: cityIds },
        };

        const colleges = await db.collection("collegeprofile").aggregate([
          { $match: collegeFilter },
          { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $project: { slug: 1, "user.firstname": 1, registeredSortAddress: 1 } },
          { $limit: 6 },
        ]).toArray();

        colleges.forEach((r) => {
          const name = r.user?.firstname?.trim() || r.slug || "";
          suggestions.push({
            type: "college",
            name,
            location: cityName || r.registeredSortAddress || "India",
            slug: r.slug,
            tag: streamDocs[0]?.name || degreeDocs[0]?.name || subject,
          });
        });
      }
    }

    // ── 2. Direct college name match ──
    if (suggestions.length < 6) {
      const nameMatchedUsers = await db.collection("users")
        .find({ firstname: subjectRegex }, { projection: { id: 1, _id: 1 } })
        .limit(100)
        .toArray();
      const matchedUserIds = nameMatchedUsers.map((u) => u.id ?? u._id);

      const collegeFilter: Record<string, unknown> = {
        $or: [
          { slug: subjectRegex },
          ...(matchedUserIds.length > 0 ? [{ users_id: { $in: matchedUserIds } }] : []),
        ],
      };
      if (cityIds.length > 0) collegeFilter.registeredAddressCityId = { $in: cityIds };

      const colleges = await db.collection("collegeprofile").aggregate([
        { $match: collegeFilter },
        { $lookup: { from: "users", localField: "users_id", foreignField: "id", as: "user" } },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { slug: 1, "user.firstname": 1, registeredSortAddress: 1 } },
        { $limit: 5 },
      ]).toArray();

      colleges.forEach((r) => {
        const name = r.user?.firstname?.trim() || r.slug || "";
        if (!suggestions.find((s) => s.slug === r.slug)) {
          suggestions.push({
            type: "college",
            name,
            location: r.registeredSortAddress || "India",
            slug: r.slug,
          });
        }
      });
    }

    // ── 3. Stream suggestions ──
    streamDocs.slice(0, 2).forEach((s) => {
      suggestions.push({
        type: "stream",
        name: s.name,
        location: cityName ? `Colleges in ${cityName}` : "Browse stream",
        slug: s.pageslug,
        cityId: cityIds[0] ?? null,
      });
    });

    // ── 4. Course suggestions ──
    if (!location) {
      courseDocs.slice(0, 3).forEach((c) => {
        suggestions.push({ type: "course", name: c.name, location: "Course", slug: c.pageslug });
      });
    }

    // ── 5. City suggestions (only when no "in" pattern) ──
    if (!location) {
      const cities = await db.collection("city")
        .find({ name: subjectRegex })
        .project({ _id: 0, id: 1, name: 1 })
        .limit(3)
        .toArray();
      cities.forEach((city) => {
        suggestions.push({ type: "city", name: city.name, location: "Location", id: city.id });
      });
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 10) });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
