import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper to safely query a table, returns empty array on failure
async function safeQuery(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
  sql: string
): Promise<{ id: number; name: string }[]> {
  try {
    const [rows] = await conn.query(sql) as [{ id: number; name: string }[], unknown];
    return rows;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const conn = await pool.getConnection();

    const [countries, cities, degrees, courses] = await Promise.all([
      safeQuery(conn, "SELECT id, name FROM country WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 200"),
      safeQuery(conn, "SELECT id, name FROM city WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 300"),
      safeQuery(conn, "SELECT id, name FROM degree WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 100"),
      safeQuery(conn, "SELECT id, name FROM course WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 200"),
    ]);

    conn.release();

    // No 'state' table in DB — use static fallback states
    const states = [
      { id: 1, name: "Andhra Pradesh" },
      { id: 2, name: "Delhi" },
      { id: 3, name: "Gujarat" },
      { id: 4, name: "Karnataka" },
      { id: 5, name: "Kerala" },
      { id: 6, name: "Madhya Pradesh" },
      { id: 7, name: "Maharashtra" },
      { id: 8, name: "Punjab" },
      { id: 9, name: "Rajasthan" },
      { id: 10, name: "Tamil Nadu" },
      { id: 11, name: "Telangana" },
      { id: 12, name: "Uttar Pradesh" },
      { id: 13, name: "West Bengal" },
    ];

    return NextResponse.json({
      success: true,
      data: { countries, states, cities, degrees, courses },
    });
  } catch (error) {
    console.error("Filter API error:", error);
    return NextResponse.json({
      success: false,
      data: {
        countries: [
          { id: 1, name: "India" },
          { id: 2, name: "United States" },
          { id: 3, name: "United Kingdom" },
          { id: 4, name: "Canada" },
          { id: 5, name: "Australia" },
        ],
        states: [
          { id: 1, name: "Maharashtra" },
          { id: 2, name: "Delhi" },
          { id: 3, name: "Karnataka" },
          { id: 4, name: "Tamil Nadu" },
          { id: 5, name: "Uttar Pradesh" },
        ],
        cities: [
          { id: 1, name: "Mumbai" },
          { id: 2, name: "Delhi" },
          { id: 3, name: "Bangalore" },
          { id: 4, name: "Chennai" },
          { id: 5, name: "Hyderabad" },
        ],
        degrees: [
          { id: 1, name: "Bachelor" },
          { id: 2, name: "Master" },
          { id: 3, name: "PhD" },
          { id: 4, name: "Diploma" },
          { id: 5, name: "Certificate" },
        ],
        courses: [
          { id: 1, name: "Computer Science" },
          { id: 2, name: "Business Administration" },
          { id: 3, name: "Medicine" },
          { id: 4, name: "Engineering" },
          { id: 5, name: "Law" },
        ],
      },
    });
  }
}
