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

async function safeNameQuery(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
  sql: string
): Promise<{ name: string }[]> {
  try {
    const [rows] = await conn.query(sql) as [{ name: string }[], unknown];
    return rows;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const conn = await pool.getConnection();

    const [countriesRaw, citiesRaw, degrees, courses, educationLevels, streams] = await Promise.all([
      safeQuery(conn, "SELECT id, name FROM country WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 200"),
      safeQuery(conn, "SELECT id, name FROM city WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 300"),
      safeQuery(conn, "SELECT id, name FROM degree WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 100"),
      safeQuery(conn, "SELECT id, name FROM course WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 200"),
      safeQuery(conn, "SELECT id, name FROM educationlevel WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 50"),
      safeQuery(conn, "SELECT id, name FROM functionalarea WHERE name IS NOT NULL AND name != '' ORDER BY name LIMIT 100"),
    ]);

    let countries = countriesRaw;
    let cities = citiesRaw;

    // Fallback: if country/city tables are unavailable, derive options from seeded college table.
    if (!countries.length) {
      const countryNames = await safeNameQuery(
        conn,
        "SELECT DISTINCT country AS name FROM college WHERE country IS NOT NULL AND country != '' ORDER BY country LIMIT 200"
      );
      countries = countryNames.map((row, idx) => ({ id: idx + 1, name: row.name }));
    }

    if (!cities.length) {
      const cityNames = await safeNameQuery(
        conn,
        "SELECT DISTINCT city AS name FROM college WHERE city IS NOT NULL AND city != '' ORDER BY city LIMIT 300"
      );
      cities = cityNames.map((row, idx) => ({ id: idx + 1, name: row.name }));
    }

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
      data: { countries, states, cities, degrees, courses, educationLevels, streams },
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
        educationLevels: [
          { id: 1, name: "Undergraduate" },
          { id: 2, name: "Postgraduate" },
          { id: 3, name: "Diploma" },
          { id: 4, name: "Doctorate" },
        ],
        streams: [
          { id: 1, name: "Engineering" },
          { id: 2, name: "Management" },
          { id: 3, name: "Medical" },
          { id: 4, name: "Arts" },
          { id: 5, name: "Science" },
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
