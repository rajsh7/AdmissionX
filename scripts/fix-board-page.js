const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../app/board/[category]/[slug]/page.tsx");
let src = fs.readFileSync(filePath, "utf8");

// 1. Fix imports
src = src.replace(`import pool from "@/lib/db";`, `import { getDb } from "@/lib/db";`);
src = src.replace(`import { RowDataPacket } from "mysql2";\r\n`, "");
src = src.replace(`import { RowDataPacket } from "mysql2";\n`, "");

// 2. Remove safeQuery function
src = src.replace(/async function safeQuery[\s\S]*?}\r?\n}\r?\n/, "");

// 3. Fix interface declarations
src = src.replace(/interface BoardRow extends RowDataPacket \{/, "interface BoardRow {");
src = src.replace(/interface BoardDetailRow extends RowDataPacket \{/, "interface BoardDetailRow {");
src = src.replace(/interface HighlightRow extends RowDataPacket \{/, "interface HighlightRow {");
src = src.replace(/interface ImpDateRow extends RowDataPacket \{/, "interface ImpDateRow {");
src = src.replace(/interface LatestUpdateRow extends RowDataPacket \{/, "interface LatestUpdateRow {");
src = src.replace(/interface SyllabusRow extends RowDataPacket \{/, "interface SyllabusRow {");
src = src.replace(/interface ExamDateRow extends RowDataPacket \{/, "interface ExamDateRow {");
src = src.replace(/interface SamplePaperRow extends RowDataPacket \{/, "interface SamplePaperRow {");
src = src.replace(/interface AdmissionDateRow extends RowDataPacket \{/, "interface AdmissionDateRow {");

// 4. Fix generateMetadata
const oldMeta = /export async function generateMetadata\(\{[\s\S]*?\}\s*\}\s*\}\)/;
const newMeta = `export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDb();
  const board = await db.collection("counseling_boards").findOne({ slug, status: 1 }, { projection: { id: 1, title: 1, name: 1 } });
  if (!board) return { title: "Board Not Found — AdmissionX" };
  const det = await db.collection("counseling_board_details").findOne({ counselingBoardId: board.id }, { projection: { aboutBoard: 1, description: 1 } });
  const displayName = board.name || board.title;
  const desc = stripHtml(det?.aboutBoard ?? det?.description).slice(0, 160);
  return {
    title: \`\${displayName} — Board Details | AdmissionX\`,
    description: desc || \`Get complete details on \${displayName} — syllabus, exam dates, sample papers, important dates, and admission information.\`,
    openGraph: { title: \`\${displayName} | AdmissionX\`, description: desc },
  };
}`;
src = src.replace(oldMeta, newMeta);

// 5. Fix page function data fetching
const oldPage = /export default async function BoardDetailPage\(\{[\s\S]*?const detail = detailRows\[0\] \?\? null;/;
const newPage = `export default async function BoardDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();

  const boardDoc = await db.collection("counseling_boards").findOne({ slug, status: 1 });
  if (!boardDoc) notFound();
  const board: BoardRow = { id: boardDoc!.id, title: boardDoc!.title, name: boardDoc!.name ?? null, status: boardDoc!.status, misc: boardDoc!.misc ?? null, slug: boardDoc!.slug };

  const [detailDocs, highlights, impDates, latestUpdates, syllabus, examDates, samplePapers, admissionDates] = await Promise.all([
    db.collection("counseling_board_details").find({ counselingBoardId: board.id }).limit(1).toArray(),
    db.collection("counseling_board_highlights").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_board_imp_dates").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_board_latest_updates").find({ counselingBoardId: board.id }).sort({ id: -1 }).toArray(),
    db.collection("counseling_board_syllabus").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_board_exam_dates").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_board_sample_papers").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
    db.collection("counseling_board_admission_dates").find({ counselingBoardId: board.id }).sort({ id: 1 }).toArray(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toRow = <T>(d: any): T => d as T;
  const detail = detailDocs.length ? toRow<BoardDetailRow>(detailDocs[0]) : null;`;
src = src.replace(oldPage, newPage);

fs.writeFileSync(filePath, src, "utf8");
console.log("Done. Remaining pool refs:", (src.match(/pool/g) || []).length);
console.log("Remaining safeQuery refs:", (src.match(/safeQuery/g) || []).length);
