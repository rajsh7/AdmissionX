import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Saves a File object to the specified directory within public/uploads.
 * @param file The File object from FormData
 * @param subDir The subdirectory, e.g., 'college/slug', 'sliders', 'gallery'
 * @param prefix An optional prefix for the filename
 * @returns The public URL path of the saved file
 */
export async function saveUpload(file: File, subDir: string, prefix: string = "img"): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${prefix}_${Date.now()}${ext}`;
  const fullPath = path.join(uploadDir, filename);
  
  // Public URL used in <img> tags and stored in DB
  const publicUrl = `/uploads/${subDir}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return publicUrl;
}
