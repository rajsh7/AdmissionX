import { getDb } from "@/lib/db";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import SubscribeListClient from "./SubscribeListClient";

// ─── Server Actions ────────────────────────────────────────────────────────────

async function deleteSubscription(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM subscribe WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/subscribe deleteAction]", e);
  }
  revalidatePath("/admin/subscribe");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 75;
const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db  = await getDb();
  const col = db.collection("subscribe");

  const filter = q ? { email: { $regex: q, $options: "i" } } : {};

  const [docs, total] = await Promise.all([
    col.find(filter).sort({ id: -1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    col.countDocuments(filter),
  ]);

  const data = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    email: String(d.email ?? "").trim(),
    name: (d.name && String(d.name).trim() !== "NULL") ? String(d.name).trim() : null,
    created_at: d.created_at ? String(d.created_at).trim() : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>mail</span>
            Subscription List
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage newsletter subscribers and lead captures.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {total.toLocaleString()} subscribers
          </span>
          <form method="GET" action="/admin/subscribe" className="w-full sm:w-72">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search emails..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      <SubscribeListClient
        data={data}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        offset={offset}
        deleteAction={deleteSubscription}
      />
    </div>
  );
}
