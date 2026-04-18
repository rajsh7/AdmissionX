import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export interface DbBlog {
  id: string | number;
  topic: string;
  featimage: string | null;
  description: string;
  slug: string;
  created_at: string;
  author_name?: string;
  author_image?: string;
  read_time?: string;
}

export async function GET() {
  try {
    const db = await getDb();

    const rows = await db.collection("blogs")
      .find({ isactive: 1 })
      .sort({ created_at: -1 })
      .limit(4)
      .project({ _id: 1, topic: 1, featimage: 1, description: 1, slug: 1, created_at: 1, author_name: 1, author_image: 1, read_time: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[home/latest-blogs]", err);
    return NextResponse.json({ success: false, data: [] });
  }
}
