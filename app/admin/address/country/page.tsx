import pool from "@/lib/db";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import CountryClient from "./CountryClient";
import { revalidatePath } from "next/cache";

async function deleteCountry(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM country WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/address/country deleteAction]", e);
  }
  revalidatePath("/admin/address/country");
  revalidatePath("/", "layout");
}

async function createCountry(formData: FormData) {
  "use server";
  const name = formData.get("name");
  try {
    await pool.query("INSERT INTO country (name) VALUES (?)", [name]);
  } catch (e) {
    console.error("[admin/address/country createAction]", e);
  }
  revalidatePath("/admin/address/country");
  revalidatePath("/", "layout");
}

async function updateCountry(formData: FormData) {
  "use server";
  const id = formData.get("id");
  const name = formData.get("name");
  try {
    await pool.query("UPDATE country SET name = ? WHERE id = ?", [name, id]);
  } catch (e) {
    console.error("[admin/address/country updateAction]", e);
  }
  revalidatePath("/admin/address/country");
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
    console.error("[admin/address/country safeQuery]", err);
    return [];
  }
}

interface CountryRow  {
  id: number;
  name: string;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function CountryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE name LIKE ?" : "";
  const params = q ? [`%${q}%`] : [];

  const data = await safeQuery<CountryRow>(
    `SELECT id, name
     FROM country
     ${where}
     ORDER BY name ASC
     LIMIT 100`,
    params
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-rose-600 text-[22px]" style={ICO_FILL}>flag</span>
            Country
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the list of countries available for address selection.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search countries..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
           />
        </form>
      </div>

      <CountryClient 
        countries={data}
        onAdd={createCountry}
        onEdit={updateCountry}
        onDelete={deleteCountry}
      />
    </div>
  );
}




