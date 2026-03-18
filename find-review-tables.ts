import pool from "./lib/db";
import type { RowDataPacket } from "mysql2";

async function findReviewTables() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SHOW TABLES");
    const tables = rows.map((r) => String(Object.values(r)[0] ?? ""));
    const matches = tables.filter((t) => t.toLowerCase().includes("review"));
    console.log(matches.join("\n"));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findReviewTables();
