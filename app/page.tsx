import pool from "@/lib/db";
import HomePageClient from "./HomePageClient";
import { University } from "./components/TopUniversities";

// Helper: Convert a slug like "some-university-name-3" to "Some University Name"
function slugToName(slug: string): string {
  return slug
    .replace(/-\d+$/, "") // remove trailing -number
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// This is a Server Component that fetches data securely
export default async function Page() {
  let universities: University[] = [];

  try {
    // Fetch featured colleges directly from collegeprofile (no JOIN needed)
    const [rows]: unknown[] = await pool.query(`
      SELECT 
        cp.slug,
        cp.registeredSortAddress AS location,
        cp.bannerimage AS image,
        cp.rating AS rating
      FROM collegeprofile cp
      WHERE cp.isShowOnHome = 1
      LIMIT 8
    `);

    // Transform database rows to match the UI component's interface
    universities = (rows as import('mysql2').RowDataPacket[]).map((row) => {
      const name = slugToName(row.slug || "university");

      // Create abbreviation from first letters of first two words
      const words = name.split(" ");
      const abbreviation =
        words.length > 1
          ? (words[0][0] + words[1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();

      // Default fallback image if null
      const imgUrl = row.image
        ? `https://admin.admissionx.in/uploads/${row.image}`
        : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600";

      return {
        name,
        location: row.location || "India",
        image: imgUrl,
        rating: Number(row.rating) || 4.5,
        abbr: abbreviation,
        abbrBg: "bg-primary",
        tags: ["Featured", "Top Ranked"],
        tuition: "View Fees",
        href: `/university/${row.slug || ""}`,
      };
    });
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    universities = [];
  }

  return <HomePageClient universities={universities} />;
}
