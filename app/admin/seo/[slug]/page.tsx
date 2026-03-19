import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

async function deleteSeoEntry(id: number, slug: string) {
  "use server";
  try {
    await pool.query("DELETE FROM seo_contents WHERE id = ?", [id]);
  } catch (e) {
    console.error(`[admin/seo/${slug} deleteAction]`, e);
  }
  revalidatePath(`/admin/seo/${slug}`);
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
    console.error("[admin/seo dynamic safeQuery]", err);
    return [];
  }
}

interface SeoRow extends RowDataPacket {
  id: number;
  slugurl: string | null;
  pagetitle: string | null;
  description: string | null;
}

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

const SLUG_MAP: Record<string, { label: string; filter: string }> = {
  "all": { label: "All SEO Content", filter: "1=1" },
  "custom": { label: "Custom Page SEO", filter: "pageId IS NOT NULL" },
  "dynamic": { label: "Dynamic SEO Pages", filter: "pageId IS NULL AND collegeId IS NULL AND examId IS NULL AND boardId IS NULL AND blogId IS NULL AND newsId IS NULL" },
  "blogs": { label: "Blogs SEO", filter: "blogId IS NOT NULL" },
  "college": { label: "College SEO", filter: "collegeId IS NOT NULL" },
  "student": { label: "Student SEO", filter: "userId IS NOT NULL" },
  "exams": { label: "Examination SEO", filter: "examId IS NOT NULL" },
  "boards": { label: "Boards Details SEO", filter: "boardId IS NOT NULL" },
  "career-stream": { label: "Career Stream Details SEO", filter: "careerReleventId IS NOT NULL" },
  "popular-career": { label: "Popular Career SEO", filter: "popularCareerId IS NOT NULL" },
  "course-details": { label: "Course Details SEO", filter: "courseId IS NOT NULL" },
  "exam-section": { label: "Exam Section SEO", filter: "examSectionId IS NOT NULL" },
  "education-level": { label: "Education Level SEO", filter: "educationLevelId IS NOT NULL" },
  "degree": { label: "Degree SEO", filter: "degreeId IS NOT NULL" },
  "functional": { label: "Functional Area SEO", filter: "functionalAreaId IS NOT NULL" },
  "courses": { label: "Courses SEO", filter: "topCourseId IS NOT NULL" },
  "university": { label: "University SEO", filter: "universityId IS NOT NULL" },
  "country": { label: "Country SEO", filter: "countryId IS NOT NULL" },
  "state": { label: "State SEO", filter: "stateId IS NOT NULL" },
  "city": { label: "City SEO", filter: "cityId IS NOT NULL" },
  "news": { label: "News SEO", filter: "newsId IS NOT NULL" },
  "news-tags": { label: "News Tags SEO", filter: "newsTagId IS NOT NULL" },
  "news-type": { label: "News Type SEO", filter: "newsTypeId IS NOT NULL" },
  "ask-question": { label: "Ask Question SEO", filter: "askQuestionId IS NOT NULL" },
  "ask-tags": { label: "Ask Tags SEO", filter: "askTagId IS NOT NULL" },
};

export default async function DynamicSeoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const q = (sp.q || "").trim();

  const config = SLUG_MAP[slug] || SLUG_MAP["all"];
  
  let where = `WHERE ${config.filter}`;
  let queryParams: (string | number)[] = [];
  
  if (q) {
    where += " AND (pagetitle LIKE ? OR slugurl LIKE ?)";
    queryParams.push(`%${q}%`, `%${q}%`);
  }

  const data = await safeQuery<SeoRow>(
    `SELECT id, slugurl, pagetitle, description
     FROM seo_contents
     ${where}
     ORDER BY id DESC
     LIMIT 100`,
    queryParams
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-600 text-[22px]" style={ICO_FILL}>travel_explore</span>
            {config.label}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage SEO metadata for {config.label.toLowerCase()}.</p>
        </div>
        <form method="GET" className="relative max-w-sm w-full">
           <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-[20px]" style={ICO}>search</span>
           <input 
             name="q" 
             defaultValue={q}
             placeholder="Search SEO entries..." 
             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
           />
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Page URL</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Meta Title</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
                     No SEO entries found in this category.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-mono text-slate-500">{r.slugurl || "/"}</span>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800">{r.pagetitle || "Untitled"}</td>
                    <td className="px-4 py-4 text-[10px] text-slate-400 line-clamp-2 max-w-[400px]">
                      {r.description || "No description"}
                    </td>
                    <td className="px-4 py-4 text-right">
                       <DeleteButton action={deleteSeoEntry.bind(null, r.id, slug)} size="sm" />
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
