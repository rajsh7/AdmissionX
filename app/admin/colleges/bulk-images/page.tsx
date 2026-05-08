import { getDb } from "@/lib/db";
import BulkImagesClient from "./BulkImagesClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const IMAGE_BASE = "https://admin.admissionx.in/uploads/";

function buildUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http") || raw.startsWith("/")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

export default async function BulkImagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();
  const col = db.collection("collegeprofile");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = q
    ? { $or: [{ name: { $regex: q, $options: "i" } }, { slug: { $regex: q, $options: "i" } }, { college_name: { $regex: q, $options: "i" } }] }
    : {};

  const [total, raw] = await Promise.all([
    col.countDocuments(filter),
    col
      .find(filter, { projection: { slug: 1, name: 1, college_name: 1, collegeName: 1, bannerimage: 1, logoimage: 1, mosaic1: 1, users_id: 1 } })
      .sort({ name: 1 })
      .skip(offset)
      .limit(PAGE_SIZE)
      .toArray(),
  ]);

  const userIds = [...new Set(raw.map((p) => p.users_id).filter(Boolean))];
  const usersMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const users = await db
      .collection("users")
      .find({ $or: [{ _id: { $in: userIds } }, { id: { $in: userIds } }] }, { projection: { id: 1, _id: 1, firstname: 1 } })
      .toArray();
    for (const u of users) {
      usersMap[String(u.id ?? u._id)] = String(u.firstname ?? "");
    }
  }

  const colleges = raw
    .map((p) => {
      const uid = String(p.users_id ?? "");
      const name =
        (p.name && String(p.name).trim()) ||
        (p.college_name && String(p.college_name).trim()) ||
        (p.collegeName && String(p.collegeName).trim()) ||
        usersMap[uid] ||
        String(p.slug ?? "");
      return {
        slug: String(p.slug ?? ""),
        name,
        bannerimage: buildUrl(p.bannerimage ? String(p.bannerimage) : null),
        logoimage: buildUrl(p.logoimage ? String(p.logoimage) : null),
        hasMosaic: !!(p.mosaic1 && String(p.mosaic1).trim()),
      };
    })
    .filter((c) => c.slug);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <BulkImagesClient
      colleges={colleges}
      total={total}
      page={page}
      totalPages={totalPages}
      q={q}
    />
  );
}
