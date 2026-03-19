import pool from "@/lib/db";
import Link from "next/link";
import { RowDataPacket } from "mysql2";
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

async function safeQuery<T extends RowDataPacket>(
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

interface CityRow extends RowDataPacket {
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

  // ── Build WHERE clause ─────────────────────────────────────────────────────
  const conditions: string[] = [];
  const queryParams: (string | number)[] = [];

  if (q) {
    conditions.push("(ci.name LIKE ? OR s.name LIKE ? OR c.name LIKE ?)");
    queryParams.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // ── Query data ─────────────────────────────────────────────────────────────
  const [data, countRows, countries, states] = await Promise.all([
    safeQuery<CityRow>(
      `SELECT ci.id, ci.name, s.name as stateName, c.name as countryName, ci.state_id, s.country_id
       FROM city ci
       LEFT JOIN state s ON s.id = ci.state_id
       LEFT JOIN country c ON c.id = s.country_id
       ${where}
       ORDER BY ci.name ASC
       LIMIT ? OFFSET ?`,
      [...queryParams, PAGE_SIZE, offset]
    ),
    safeQuery<{ total: number } & RowDataPacket>(
      `SELECT COUNT(*) as total FROM city ci 
       LEFT JOIN state s ON s.id = ci.state_id
       LEFT JOIN country c ON c.id = s.country_id 
       ${where}`,
      queryParams
    ),
    safeQuery<{ id: number; name: string } & RowDataPacket>(
      "SELECT id, name FROM country ORDER BY name ASC"
    ),
    safeQuery<{ id: number; name: string; country_id: number | null } & RowDataPacket>(
      "SELECT id, name, country_id FROM state ORDER BY name ASC"
    )
  ]);

  const total = Number(countRows[0]?.total || 0);
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
