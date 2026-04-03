import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import ContactActions from "./ContactActions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { revalidatePath } from "next/cache";

// ─── Server Actions ───────────────────────────────────────────────────────────

async function deleteContactRow(id: string, src: string) {
  "use server";
  try {
    const db  = await getDb();
    const col = src === "old" ? "request_for_create_college_accounts" : "next_college_signups";
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: parseInt(id, 10) };
    await db.collection(col).deleteOne(filter);
  } catch (e) {
    console.error("[admin/colleges/contact deleteAction]", e);
  }
  revalidatePath("/admin/colleges/contact");
  revalidatePath("/", "layout");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const ICO_FILL = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" };
const ICO      = { fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20" };

interface ContactRow {
  _id: string;
  college_name: string;
  contact_name: string;
  email: string;
  phone: string;
  _source: "old" | "new";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CollegeContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const q      = (sp.q ?? "").trim();
  const page   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = await getDb();

  const [oldDocs, newDocs] = await Promise.all([
    db.collection("request_for_create_college_accounts").find({}).toArray(),
    db.collection("next_college_signups").find({}).toArray(),
  ]);

  let contacts: ContactRow[] = [
    ...newDocs.map(d => ({
      _id:          String(d._id),
      college_name: String(d.college_name ?? "").trim(),
      contact_name: String(d.contact_name ?? "").trim(),
      email:        String(d.email ?? "").trim(),
      phone:        String(d.phone ?? "").trim(),
      _source:      "new" as const,
    })),
    ...oldDocs.map(d => ({
      _id:          String(d._id),
      college_name: String(d.collegeName ?? d.college_name ?? "").trim(),
      contact_name: String(d.contactPersonName ?? d.contact_name ?? "").trim(),
      email:        String(d.email ?? "").trim(),
      phone:        String(d.phone ?? "").trim(),
      _source:      "old" as const,
    })),
  ].sort((a, b) => a.college_name.localeCompare(b.college_name));

  if (q) {
    const lq = q.toLowerCase();
    contacts = contacts.filter(c =>
      c.college_name.toLowerCase().includes(lq) ||
      c.contact_name.toLowerCase().includes(lq) ||
      c.email.toLowerCase().includes(lq) ||
      c.phone.includes(lq)
    );
  }

  const total      = contacts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rows       = contacts.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600 text-[22px]" style={ICO_FILL}>contact_mail</span>
            College Contacts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total.toLocaleString()} contact{total !== 1 ? "s" : ""} — manage inquiries and send welcome communications.
          </p>
        </div>
        <form method="GET" action="/admin/colleges/contact" className="w-full sm:w-80">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-[18px] text-slate-400 pointer-events-none" style={ICO}>search</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, college..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </form>
      </div>

      {/* ── Grid of Contact Cards ────────────────────────────────────── */}
      <div className="bg-transparent rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center shadow-sm">
            <span className="material-symbols-rounded text-6xl text-slate-200 block mb-4" style={ICO_FILL}>contact_mail</span>
            <p className="text-slate-500 font-bold text-sm">
              {q ? `No contacts matching "${q}"` : "No contact records found."}
            </p>
            {q && (
              <Link href="/admin/colleges/contact" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {rows.map((c, idx) => (
              <div 
                key={c._id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Delete button (positioned absolute for clean card UI) */}
                <div className="absolute top-4 right-4 z-10">
                  <DeleteButton action={deleteContactRow.bind(null, c._id, c._source)} size="sm" />
                </div>

                <div className="p-6">
                  {/* Card Header: Logo + Title Section */}
                  <div className="flex gap-4 items-start mb-4">
                    {/* Placeholder Logo / AKT Styled */}
                    <div className="w-24 h-24 bg-[#D16B0D] rounded-lg shrink-0 flex items-center justify-center p-2">
                       <span className="text-white text-3xl font-black tracking-tighter">AKT</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                       <h3 className="font-bold text-slate-600 text-lg leading-tight uppercase truncate">
                         {c.college_name || "Unknown College"}
                         {idx % 2 === 0 && <span className="block text-slate-600">Polytechnic College</span>}
                       </h3>
                       <p className="text-[11px] font-bold text-slate-500 leading-tight mt-2 italic">
                         Directorate of Technical Education, Chennai ( DoTE Chennai )
                       </p>
                    </div>
                  </div>

                  {/* Address Line Separator */}
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <p className="text-sm font-bold text-slate-500 truncate">
                       AKT Nagar, Neelamangalam, Kallakurichi
                    </p>
                  </div>

                  {/* Contact Info Rows */}
                  <div className="space-y-2 text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>location_on</span>
                      <span className="text-xs font-bold leading-tight">
                         Villupuram, Tamil Nadu 606202
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>mail</span>
                      <span className="text-xs font-bold leading-tight truncate">
                         {c.email || "no-email@yahoo.co.in"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-[18px] shrink-0" style={ICO_FILL}>call</span>
                      <span className="text-xs font-bold leading-tight tracking-wide">
                         {c.phone || "04364222202"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <ContactActions
                    email={c.email}
                    collegeName={c.college_name}
                    contactName={c.contact_name}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border border-slate-100 bg-white rounded-2xl shadow-sm mt-6">
            <p className="text-xs text-slate-500 font-medium">
              Showing <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> of <strong>{total.toLocaleString()}</strong> contacts
            </p>
            <div className="flex items-center gap-1">
              {page > 1 ? (
                <Link href={`/admin/colleges/contact?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">← Prev</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">← Prev</span>
              )}
              {page < totalPages ? (
                <Link href={`/admin/colleges/contact?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next →</Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-white border border-slate-100 rounded-lg cursor-not-allowed">Next →</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




