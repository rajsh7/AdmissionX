import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteYoutubeLink(id: number) {
  "use server";
  try {
    // We only allow deleting row if it's strictly a Youtube link entry in socialmanagements
    // Or we just update description to empty. But usually delete is safer if it's a list.
    // For now, let's treat socialmanagements as a list where we can have multiple types.
    await pool.query("DELETE FROM socialmanagements WHERE id = ? AND title LIKE '%Youtube%'", [id]);
  } catch (e) {
    console.error("[admin/media/youtube deleteAction]", e);
  }
  revalidatePath("/admin/media/youtube");
  revalidatePath("/", "layout");
}

async function safeQuery<T >(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/media/youtube safeQuery]", err);
    return [];
  }
}

interface SocialRow  {
  id: number;
  title: string;
  description: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function YoutubeLinksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const baseFilter = { title: { $regex: "youtube", $options: "i" } };
  const filter = q
    ? { ...baseFilter, $or: [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }] }
    : baseFilter;
  const docs = await db.collection("socialmanagements").find(filter).sort({ id: -1 }).limit(100).toArray();
  const data: SocialRow[] = docs.map((d: any) => ({
    id: Number(d.id ?? 0),
    title: String(d.title ?? "").trim(),
    description: d.description ? String(d.description).trim() : null,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>video_library</span>
            Youtube Links
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage YouTube video links and social media video integration.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search links..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">Platform</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title / Video Info</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL / Link</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No YouTube links found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-5 py-4">
                       <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                         <span className="material-symbols-rounded text-[20px]">play_circle</span>
                       </div>
                    </td>
                    <td className="px-5 py-4">
                       <p className="font-bold text-slate-800">{r.title}</p>
                    </td>
                    <td className="px-5 py-4">
                       <p className="text-[11px] text-blue-600 font-mono underline truncate max-w-[250px]">{r.description || "No link set"}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteYoutubeLink.bind(null, r.id)} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




