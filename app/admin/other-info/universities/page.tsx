import pool from "@/lib/db";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload-utils";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import OtherInfoUniversityClient from "./OtherInfoUniversityClient";

async function deleteUniversity(id: number) {
  "use server";
  try {
    await pool.query("DELETE FROM university WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/other-info/universities deleteAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
  revalidatePath("/", "layout");
}

async function createUniversity(formData: FormData) {
  "use server";
  try {
    const name      = formData.get("name") as string;
    const imageFile = formData.get("image_file") as File;
    let image = "";
    if (imageFile && imageFile.size > 0)
      image = await saveUpload(imageFile, "universities", "uni");
    if (!name) return;
    const db = await getDb();
    await db.collection("university").insertOne({ name, image, created_at: new Date() });
  } catch (e) {
    console.error("[admin/other-info/universities createAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
  revalidatePath("/", "layout");
}

async function updateUniversity(formData: FormData) {
  "use server";
  try {
    const id        = parseInt(formData.get("id") as string, 10);
    const name      = formData.get("name") as string;
    const imageFile = formData.get("image_file") as File;
    let image       = formData.get("image_existing") as string || "";
    if (imageFile && imageFile.size > 0)
      image = await saveUpload(imageFile, "universities", "uni");
    if (isNaN(id) || !name) return;
    const db = await getDb();
    await db.collection("university").updateOne({ id }, { $set: { name, image, updated_at: new Date() } });
  } catch (e) {
    console.error("[admin/other-info/universities updateAction]", e);
  }
  revalidatePath("/admin/other-info/universities");
  revalidatePath("/", "layout");
}

async function safeQuery<T>(
  sql: string,
  params: (string | number | boolean)[] = [],
): Promise<T[]> {
  try {
    const [rows] = (await pool.query(sql, params)) as [T[], unknown];
    return rows;
  } catch (err) {
    console.error("[admin/other-info/universities safeQuery]", err);
    return [];
  }
}

interface UniversityRow {
  id: number;
  name: string;
  image: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

export default async function UniversitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const where = q ? "WHERE name LIKE ?" : "";
  const params = q ? [`%${q}%`] : [];

  const data = await safeQuery<UniversityRow>(
    `SELECT id, name, image FROM university ${where} ORDER BY name ASC LIMIT 100`,
    params,
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>account_balance</span>
            Universities
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage the master list of universities and academic institutions.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search universities..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>
      </div>

      <OtherInfoUniversityClient
        data={data}
        createUniversity={createUniversity}
        updateUniversity={updateUniversity}
        deleteUniversity={deleteUniversity}
      />
    </div>
  );
}
