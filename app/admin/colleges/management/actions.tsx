"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createManagementMember(formData: FormData) {
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name = formData.get("name");
  const suffix = formData.get("suffix") || null;
  const designation = formData.get("designation") || null;
  const email = formData.get("emailaddress") || null;
  const phone = formData.get("phoneno") || null;
  const picture = formData.get("picture") || null;

  try {
    await pool.query(
      `INSERT INTO college_management_details
        (collegeprofile_id, name, suffix, designation, emailaddress, phoneno, picture, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [collegeprofile_id, name, suffix, designation, email, phone, picture],
    );
  } catch (e) {
    console.error("[admin/colleges/management createAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

export async function updateManagementMember(formData: FormData) {
  const id = formData.get("id");
  const collegeprofile_id = formData.get("collegeprofile_id");
  const name = formData.get("name");
  const suffix = formData.get("suffix") || null;
  const designation = formData.get("designation") || null;
  const email = formData.get("emailaddress") || null;
  const phone = formData.get("phoneno") || null;
  const picture = formData.get("picture") || null;

  try {
    await pool.query(
      `UPDATE college_management_details
          SET collegeprofile_id = ?, name = ?, suffix = ?, designation = ?,
              emailaddress = ?, phoneno = ?, picture = ?, updated_at = NOW()
        WHERE id = ?`,
      [collegeprofile_id, name, suffix, designation, email, phone, picture, id],
    );
  } catch (e) {
    console.error("[admin/colleges/management updateAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

export async function deleteManagementRow(id: number) {
  try {
    await pool.query("DELETE FROM college_management_details WHERE id = ?", [id]);
  } catch (e) {
    console.error("[admin/colleges/management deleteAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}