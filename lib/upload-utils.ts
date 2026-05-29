import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Saves a File object to the specified directory within public/uploads.
 * Supports mirroring to Next.js standalone directory to prevent broken images at runtime.
 * @param file The File object from FormData
 * @param subDir The subdirectory, e.g., 'college/slug', 'sliders', 'gallery'
 * @param prefix An optional prefix for the filename
 * @returns The public URL path of the saved file
 */
export async function saveUpload(file: File, subDir: string, prefix: string = "img"): Promise<string> {
  const rootUploadDir = path.join(process.cwd(), "public", "uploads", subDir);
  const standaloneUploadDir = path.join(process.cwd(), ".next", "standalone", "public", "uploads", subDir);
  
  if (!existsSync(rootUploadDir)) {
    await mkdir(rootUploadDir, { recursive: true });
  }

  const isStandaloneActive = existsSync(path.join(process.cwd(), ".next", "standalone"));
  if (isStandaloneActive && !existsSync(standaloneUploadDir)) {
    await mkdir(standaloneUploadDir, { recursive: true });
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${prefix}_${Date.now()}${ext}`;
  
  const rootFullPath = path.join(rootUploadDir, filename);
  const standaloneFullPath = path.join(standaloneUploadDir, filename);
  
  const publicUrl = `/uploads/${subDir}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Save to root public folder (persistent across builds/re-deploys)
  await writeFile(rootFullPath, buffer);
  
  // Save to standalone folder (live serving for production server)
  if (isStandaloneActive) {
    try {
      await writeFile(standaloneFullPath, buffer);
      console.log(`✅ Standalone asset mirrored: ${standaloneFullPath}`);
    } catch (err) {
      console.error("❌ Failed to mirror asset to standalone folder:", err);
    }
  }

  return publicUrl;
}
