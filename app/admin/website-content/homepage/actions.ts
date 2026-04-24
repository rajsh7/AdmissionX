"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveHomepageSettings(formData: FormData) {
  try {
    const db = await getDb();

    const featuredSlugs = (formData.get("featured_college_slugs") as string ?? "")
      .split(",").map(s => s.trim()).filter(Boolean);

    const hero = {
      heading: formData.get("hero_heading") as string ?? "",
      subheading: formData.get("hero_subheading") as string ?? "",
      cta_text: formData.get("hero_cta_text") as string ?? "",
      cta_link: formData.get("hero_cta_link") as string ?? "",
    };

    const stats = {
      colleges_label: formData.get("stat_colleges_label") as string ?? "Partner Colleges",
      students_label: formData.get("stat_students_label") as string ?? "Students Registered",
      countries_label: formData.get("stat_countries_label") as string ?? "Countries",
      courses_label: formData.get("stat_courses_label") as string ?? "Courses Available",
    };

    const sections = {
      show_top_universities: formData.get("show_top_universities") === "on",
      show_top_courses: formData.get("show_top_courses") === "on",
      show_career_guidance: formData.get("show_career_guidance") === "on",
      show_fields_of_study: formData.get("show_fields_of_study") === "on",
      show_news: formData.get("show_news") === "on",
      show_testimonials: formData.get("show_testimonials") === "on",
      show_contact: formData.get("show_contact") === "on",
      show_entrance_exams: formData.get("show_entrance_exams") === "on",
    };

    if (featuredSlugs.length > 0) {
      await db.collection("collegeprofile").updateMany({}, { $set: { isShowOnHome: 0 } });
      await db.collection("collegeprofile").updateMany(
        { slug: { $in: featuredSlugs } },
        { $set: { isShowOnHome: 1 } }
      );
    }

    await db.collection("homepage_settings").updateOne(
      { key: "main" },
      { $set: { key: "main", hero, stats, sections, featured_college_slugs: featuredSlugs, updated_at: new Date() } },
      { upsert: true }
    );

    revalidatePath("/");
    revalidatePath("/admin/website-content/homepage");
  } catch (e) {
    console.error("[admin/homepage save]", e);
  }
}

export async function toggleCollegeOnHome(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const current = formData.get("current") as string;
    const db = await getDb();
    await db.collection("collegeprofile").updateOne(
      { slug },
      { $set: { isShowOnHome: current === "1" ? 0 : 1 } }
    );
    revalidatePath("/");
    revalidatePath("/admin/website-content/homepage");
  } catch (e) {
    console.error("[admin/homepage toggleCollege]", e);
  }
}

export async function toggleUniversityOnHome(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const current = formData.get("current") as string;
    const db = await getDb();
    await db.collection("collegeprofile").updateOne(
      { slug },
      { $set: { isTopUniversity: current === "1" ? 0 : 1 } }
    );
    revalidatePath("/");
    revalidatePath("/admin/website-content/homepage");
  } catch (e) {
    console.error("[admin/homepage toggleUniversity]", e);
  }
}
