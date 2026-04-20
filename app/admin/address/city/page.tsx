import pool from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CityClient from "./CityClient";
import { revalidatePath } from "next/cache";

async function deleteCity(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM city WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/address/city deleteAction]", e);
  }
  revalidatePath("/admin/address/city");
  revalidatePath("/", "layout");
}

async function createCity(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const state_id = formData.get("state_id");
  try {
    await pool.query(
      "INSERT INTO city (name, state_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, state_id]
    );
  } catch (e) {
    console.error("[admin/address/city createAction]", e);
  }
  revalidatePath("/admin/address/city");
  revalidatePath("/", "layout");
}

async function updateCity(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const name = formData.get("name");
  const state_id = formData.get("state_id");
  try {
    await pool.query(
      "UPDATE city SET name = ?, state_id = ?, updated_at = NOW() WHERE id = ?",
      [name, state_id, id]
    );
  } catch (e) {
    console.error("[admin/address/city updateAction]", e);
  }
  revalidatePath("/admin/address/city");
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
    console.error("[admin/address/city safeQuery]", err);
    return [];
  }
}

interface CityRow  {
  id: number;
  name: string;
  stateName: string | null;
  countryName: string | null;
  state_id: number | null;
  country_id: number | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

const PAGE_SIZE = 50;

export default async function CityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const [cityDocs, total, countryDocs, stateDocs] = await Promise.all([
    db.collection("city").find(filter).sort({ name: 1 }).skip(offset).limit(PAGE_SIZE).toArray(),
    db.collection("city").countDocuments(filter),
    db.collection("country").find({}, { projection: { id: 1, name: 1 } }).sort({ name: 1 }).toArray(),
    db.collection("state").find({}, { projection: { id: 1, name: 1, country_id: 1 } }).sort({ name: 1 }).toArray(),
  ]);
  const stateMap = new Map(stateDocs.map((d: any) => [Number(d.id), { name: String(d.name ?? "").trim(), country_id: Number(d.country_id ?? 0) }]));
  const countryMap = new Map(countryDocs.map((d: any) => [Number(d.id), String(d.name ?? "").trim()]));
  const data: CityRow[] = cityDocs.map((d: any) => {
    const st = stateMap.get(Number(d.state_id));
    return {
      id: Number(d.id ?? 0),
      name: String(d.name ?? "").trim(),
      stateName: st?.name || null,
      countryName: st ? (countryMap.get(st.country_id) || null) : null,
      state_id: d.state_id ? Number(d.state_id) : null,
      country_id: st?.country_id || null,
    };
  });
  const countries = countryDocs.map((d: any) => ({ id: Number(d.id ?? 0), name: String(d.name ?? "").trim() }));
  const states = stateDocs.map((d: any) => ({ id: Number(d.id ?? 0), name: String(d.name ?? "").trim(), country_id: Number(d.country_id ?? 0) }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-cyan-600 text-[22px]" style={ICO_FILL}>location_city</span>
            City
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage cities and link them to their respective states and countries.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search cities, states or countries..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
           />
        </form>
      </div>

      <CityClient 
        cities={data}
        countries={countries}
        states={states}
        onAdd={createCity}
        onEdit={updateCity}
        onDelete={deleteCity}
        pagination={{
          page,
          totalPages,
          total,
          offset,
          pageSize: PAGE_SIZE,
          q
        }}
      />
    </div>
  );
}




