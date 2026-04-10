"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { saveUpload } from "@/lib/upload-utils";

export async function toggleAdAction(formData: FormData) {
  const id  = parseInt(formData.get("id")  as string, 10);
  const cur = parseInt(formData.get("cur") as string, 10);
  if (isNaN(id)) return;
  try {
    await pool.query("UPDATE ads_managements SET isactive = ? WHERE id = ?", [cur ? 0 : 1, id]);
  } catch (e) {
    console.error("[admin/ads toggleAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}

export async function createAdManagement(formData: FormData) {
  try {
    const title        = formData.get("title") as string;
    const slug         = formData.get("slug") as string;
    const description  = formData.get("description") as string;
    const redirectto   = formData.get("redirectto") as string;
    const start        = formData.get("start") as string;
    const end          = formData.get("end") as string;
    const ads_position = formData.get("ads_position") as string;
    const users_id     = parseInt(formData.get("users_id") as string, 10);
    const isactive     = formData.get("isactive") ? 1 : 0;

    const imgFile = formData.get("img_file") as File;
    let img = "";
    if (imgFile && imgFile.size > 0) {
      const publicUrl = await saveUpload(imgFile, "ads", "banner");
      img = publicUrl.replace("/uploads/", "");
    }

    await pool.query(
      `INSERT INTO ads_managements (title, slug, description, img, redirectto, start, end, ads_position, users_id, isactive, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, slug, description, img, redirectto, start || null, end || null, ads_position, isNaN(users_id) ? null : users_id, isactive]
    );
  } catch (e) {
    console.error("[admin/ads createAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}

export async function updateAdManagement(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string, 10);
    if (isNaN(id)) return;

    const title        = formData.get("title") as string;
    const slug         = formData.get("slug") as string;
    const description  = formData.get("description") as string;
    const redirectto   = formData.get("redirectto") as string;
    const start        = formData.get("start") as string;
    const end          = formData.get("end") as string;
    const ads_position = formData.get("ads_position") as string;
    const users_id     = parseInt(formData.get("users_id") as string, 10);
    const isactive     = formData.get("isactive") ? 1 : 0;

    const imgFile = formData.get("img_file") as File;
    let img = formData.get("img_existing") as string;
    if (imgFile && imgFile.size > 0) {
      const publicUrl = await saveUpload(imgFile, "ads", "banner");
      img = publicUrl.replace("/uploads/", "");
    }

    await pool.query(
      `UPDATE ads_managements SET title=?, slug=?, description=?, img=?, redirectto=?, start=?, end=?, ads_position=?, users_id=?, isactive=?, updated_at=NOW() WHERE id=?`,
      [title, slug, description, img, redirectto, start || null, end || null, ads_position, isNaN(users_id) ? null : users_id, isactive, id]
    );
  } catch (e) {
    console.error("[admin/ads updateAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}

export async function deleteAdManagement(formData: FormData) {
  const id = parseInt(formData.get("id") as string, 10);
  if (isNaN(id)) return;
  try {
    await pool.query("DELETE FROM ads_managements WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/ads deleteAd]", e);
  }
  revalidatePath("/admin/ads/management");
  revalidatePath("/", "layout");
}
