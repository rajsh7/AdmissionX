import { getDb } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { fetchCollegeOptions } from "../_components/college-options";
import CollegeFilterBar from "../_components/CollegeFilterBar";
import FAQListClient from "./FAQListClient";
import { ObjectId } from "mongodb";

async function createFAQ(formData: FormData) {
  "use server";
  try {
    const db = await getDb();
    const cpId = formData.get("collegeprofile_id");
    await db.collection("college_faqs").insertOne({
      collegeprofile_id: Number(cpId),
      question: String(formData.get("question") ?? "").trim(),
      answer: String(formData.get("answer") ?? "").trim() || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
  } catch (e) { console.error("[admin/colleges/faqs createAction]", e); }
  revalidatePath("/admin/colleges/faqs");
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/dashboard/college", "layout");
}

async function updateFAQ(formData: FormData) {
  "use server";
  try {
    const db = await getDb();
    const id = String(formData.get("id") ?? "");
    await db.collection("college_faqs").updateOne(
      { _id: new ObjectId(id) },
      { $set: {
        collegeprofile_id: Number(formData.get("collegeprofile_id")),
        question: String(formData.get("question") ?? "").trim(),
        answer: String(formData.get("answer") ?? "").trim() || null,
        updated_at: new Date(),
      }}
    );
  } catch (e) { console.error("[admin/colleges/faqs updateAction]", e); }
  revalidatePath("/admin/colleges/faqs");
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/dashboard/college", "layout");
}

async function deleteFAQRow(id: number) {
  "use server";
  try {
    const db = await getDb();
    await db.collection("college_faqs").deleteOne({ _id: new ObjectId(String(id)) });
  } catch (e) { console.error("[admin/colleges/faqs deleteAction]", e); }
  revalidatePath("/admin/colleges/faqs");
  revalidatePath("/admin/colleges/profile");
  revalidatePath("/dashboard/college", "layout");
}

const PAGE_SIZE = 25;

interface FAQRow { id: string; collegeprofile_id: number; college_name: string; question: string; answer: string; }

export default async function CollegeFAQsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp        = await searchParams;
  const q         = (sp.q ?? "").trim();
  const collegeId = sp.collegeId ?? "";
  const page      = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip      = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  // Build match filter for college_faqs
  const faqMatch: Record<string, unknown> = {};
  if (q) faqMatch.$or = [
    { question: { $regex: q, $options: "i" } },
    { answer:   { $regex: q, $options: "i" } },
  ];
  if (collegeId) faqMatch.collegeprofile_id = Number(collegeId);

  // Fetch all college profiles to build a name lookup map
  const profiles = await db.collection("collegeprofile")
    .find({}, { projection: { id: 1, name: 1, slug: 1, users_id: 1 } })
    .toArray();

  // Fetch users for name fallback
  const userIds = profiles.map(p => p.users_id).filter(Boolean);
  const users = await db.collection("users")
    .find({ _id: { $in: userIds } }, { projection: { _id: 1, firstname: 1, name: 1 } })
    .toArray();
  const userMap = new Map(users.map(u => [String(u._id), u.firstname || u.name || ""]));

  // Build collegeprofile_id → college_name map
  const collegeNameMap = new Map<number, string>();
  for (const p of profiles) {
    const cpId = Number(p.id);
    const name = p.name || userMap.get(String(p.users_id)) || p.slug || "Unnamed College";
    collegeNameMap.set(cpId, name);
  }

  // If searching by college name text, also filter by matching collegeprofile_ids
  let extraCpIds: number[] | null = null;
  if (q) {
    const matchedCpIds: number[] = [];
    for (const [cpId, name] of collegeNameMap.entries()) {
      if (name.toLowerCase().includes(q.toLowerCase())) matchedCpIds.push(cpId);
    }
    if (matchedCpIds.length > 0) {
      const existing = faqMatch.$or as any[] | undefined;
      if (existing) {
        existing.push({ collegeprofile_id: { $in: matchedCpIds } });
      } else {
        faqMatch.$or = [{ collegeprofile_id: { $in: matchedCpIds } }];
      }
    }
  }

  const [rawFaqs, total, collegeOptions] = await Promise.all([
    db.collection("college_faqs")
      .find(faqMatch)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection("college_faqs").countDocuments(faqMatch),
    fetchCollegeOptions(),
  ]);

  const faqs: FAQRow[] = rawFaqs.map(f => ({
    id:               String(f._id),
    collegeprofile_id: Number(f.collegeprofile_id),
    college_name:     collegeNameMap.get(Number(f.collegeprofile_id)) ?? "Unnamed College",
    question:         String(f.question ?? ""),
    answer:           String(f.answer ?? ""),
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (collegeId) qs.set("collegeId", collegeId);
    qs.set("page", String(p));
    return `/admin/colleges/faqs?${qs.toString()}`;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <CollegeFilterBar colleges={collegeOptions} selectedId={collegeId} total={total} label="College FAQs" icon="quiz" description="Manage frequently asked questions — filter by college to see classified data." />
      <FAQListClient faqs={faqs as any} colleges={collegeOptions as any} offset={skip} total={total} pageSize={PAGE_SIZE} onAdd={createFAQ} onEdit={updateFAQ} onDelete={deleteFAQRow} />
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500">Showing <strong>{skip + 1}–{Math.min(skip + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> FAQs</p>
          <div className="flex items-center gap-1">
            {page > 1 ? <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">← Prev</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>}
            <span className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-blue-50 border border-blue-100 rounded-lg">{page} / {totalPages}</span>
            {page < totalPages ? <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Next →</Link> : <span className="px-3 py-1.5 text-xs text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>}
          </div>
        </div>
      )}
    </div>
  );
}
