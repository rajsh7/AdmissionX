"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createManagementMember(formData: FormData) {
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name = String(formData.get("name") || "");
  const suffix = String(formData.get("suffix") || "");
  const designation = String(formData.get("designation") || "");
  const emailaddress = String(formData.get("emailaddress") || "");
  const phoneno = String(formData.get("phoneno") || "");
  const picture = String(formData.get("picture") || "");

  try {
    const db = await getDb();
    const last = await db.collection("college_management_details").find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
    const nextId = ((last[0]?.id as number) ?? 0) + 1;
    await db.collection("college_management_details").insertOne({
      id: nextId, collegeprofile_id, name, suffix, designation,
      emailaddress, phoneno, picture, created_at: new Date(), updated_at: new Date(),
    });
  } catch (e) {
    console.error("[admin/colleges/management createAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

export async function updateManagementMember(formData: FormData) {
  const id = Number(formData.get("id"));
  const collegeprofile_id = Number(formData.get("collegeprofile_id"));
  const name = String(formData.get("name") || "");
  const suffix = String(formData.get("suffix") || "");
  const designation = String(formData.get("designation") || "");
  const emailaddress = String(formData.get("emailaddress") || "");
  const phoneno = String(formData.get("phoneno") || "");
  const picture = String(formData.get("picture") || "");

  try {
    const db = await getDb();
    await db.collection("college_management_details").updateOne(
      { id },
      { $set: { collegeprofile_id, name, suffix, designation, emailaddress, phoneno, picture, updated_at: new Date() } }
    );
  } catch (e) {
    console.error("[admin/colleges/management updateAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}

export async function deleteManagementRow(id: number) {
  try {
    const db = await getDb();
    await db.collection("college_management_details").deleteOne({ id });
  } catch (e) {
    console.error("[admin/colleges/management deleteAction]", e);
  }
  revalidatePath("/admin/colleges/management");
}
