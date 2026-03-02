import pool from "@/lib/db";
import HomePageClient from "./HomePageClient";
import { University } from "./components/TopUniversities";

// This is a Server Component that fetches data securely
export default async function Page() {
  let universities: University[] = [];

  try {
    // Fetch featured colleges
    const [rows]: unknown[] = await pool.query(`
      SELECT 
        u.firstname AS name,
        cp.registeredSortAddress AS location,
        cp.bannerimage AS image,
        cp.rating AS rating,
        cp.slug AS abbr
      FROM collegeprofile cp
      JOIN users u ON cp.users_id = u.id
      WHERE cp.isShowOnHome = 1
      LIMIT 8
    `);

    // Transform database rows to match the UI component's interface
    universities = (rows as import('mysql2').RowDataPacket[]).map((row) => {
      // Create a short abbreviation
      let abbreviation = "U";
      if (row.name) {
        const words = row.name.split(" ");
        if (words.length > 1) {
          abbreviation = words[0][0] + words[1][0];
        } else {
          abbreviation = row.name.substring(0, 2).toUpperCase();
        }
      }

      // Default fallback image if null
      const imgUrl = row.image 
        ? `https://admin.admissionx.in/uploads/${row.image}`
        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

      return {
        name: row.name || "Unknown University",
        location: row.location || "India",
        image: imgUrl,
        rating: Number(row.rating) || 4.5,
        abbr: abbreviation.toUpperCase(),
        abbrBg: "bg-primary",
        tags: ["Featured", "Top Ranked"],
        tuition: "View Fees", // Since tuition isn't directly in this table, using placeholder
        href: `/university/${row.abbr || ''}`
      };
    });
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    // Fallback data if DB fails
    universities = [];
  }

  return <HomePageClient universities={universities} />;
}
