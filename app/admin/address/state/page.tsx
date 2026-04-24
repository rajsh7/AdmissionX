import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StateClient from "./StateClient";
import { revalidatePath } from "next/cache";

async function deleteState(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM state WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/address/state deleteAction]", e);
  }
  revalidatePath("/admin/address/state");
  revalidatePath("/", "layout");
}

async function createState(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const country_id = formData.get("country_id");
  try {
    await pool.query("INSERT INTO state (name, country_id) VALUES (?, ?)", [name, country_id]);
  } catch (e) {
    console.error("[admin/address/state createAction]", e);
  }
  revalidatePath("/admin/address/state");
  revalidatePath("/", "layout");
}

async function updateState(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const name = formData.get("name");
  const country_id = formData.get("country_id");
  try {
    await pool.query("UPDATE state SET name = ?, country_id = ? WHERE id = ?", [name, country_id, id]);
  } catch (e) {
    console.error("[admin/address/state updateAction]", e);
  }
  revalidatePath("/admin/address/state");
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
    console.error("[admin/address/state safeQuery]", err);
    return [];
  }
}

interface StateRow  {
  id: number;
  name: string;
  countryName: string | null;
  country_id: number | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function StatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { $or: [{ name: { $regex: q, $options: "i" } }] } : {};
  const [stateDocs, countryDocs] = await Promise.all([
    db.collection("state").find(filter).sort({ name: 1 }).limit(100).toArray(),
    db.collection("country").find({}, { projection: { id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
  ]);
  const countryMap = new Map(countryDocs.map((d: any) => [Number(d.id), String(d.name ?? "").trim()]));
  const data: StateRow[] = stateDocs.map((d: any) => ({
    id: Number(d.id ?? 0),
    name: String(d.name ?? "").trim(),
    countryName: countryMap.get(Number(d.country_id)) || null,
    country_id: d.country_id ? Number(d.country_id) : null,
  }));
  const countries = countryDocs.map((d: any) => ({ id: Number(d.id ?? 0), name: String(d.name ?? "").trim() }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>map</span>
            State
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage states and provinces within countries.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search states or countries..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
           />
        </form>
      </div>

      <StateClient 
        states={data}
        countries={countries}
        onAdd={createState}
        onEdit={updateState}
        onDelete={deleteState}
      />
    </div>
  );
}




