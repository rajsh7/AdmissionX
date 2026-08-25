import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Uploads a File object to Cloudinary.
 * @param file    The File object from FormData
 * @param subDir  Folder path in Cloudinary, e.g. 'college/slug'
 * @param prefix  Public ID prefix, e.g. 'banner'
 * @returns       The Cloudinary secure_url
 */
export async function saveUpload(file: File, subDir: string, prefix: string = "img"): Promise<string> {
  const fileType = file.type?.toLowerCase() || "image/jpeg";
  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    throw new Error(`Invalid file type: ${fileType}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum allowed limit of 10MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${fileType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `admissionx/${subDir}`,
    public_id: `${prefix}_${Date.now()}`,
    overwrite: true,
    resource_type: "image",
  });

  return result.secure_url;
}
