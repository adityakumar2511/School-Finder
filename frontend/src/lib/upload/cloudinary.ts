import { v2 as cloudinary } from "cloudinary";
import type { UploadFolder } from "@/lib/upload/upload-security";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

const OPTIMIZATION = {
  quality: "auto:good" as const,
  fetch_format: "auto" as const,
  flags: "strip_profile.force_strip.progressive",
};

function folderPath(folder: UploadFolder): string {
  return `school-platform/${folder}`;
}

/**
 * Upload an image buffer to Cloudinary with automatic optimization.
 */
export async function uploadImage(
  file: Buffer,
  folder: UploadFolder = "logos",
  mime = "image/jpeg"
): Promise<UploadResult> {
  const uploadSource = `data:${mime};base64,${file.toString("base64")}`;

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder: folderPath(folder),
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [OPTIMIZATION],
    eager: [{ ...OPTIMIZATION, width: 1200, crop: "limit" }],
    eager_async: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const marker = "/upload/";
    const index = pathname.indexOf(marker);
    if (index === -1) return null;

    let remainder = pathname.slice(index + marker.length);
    if (remainder.startsWith("v") && /^\/?v\d+/.test(remainder)) {
      remainder = remainder.replace(/^\/?v\d+\//, "");
    }

    return decodeURIComponent(remainder.replace(/\.[^/.]+$/, ""));
  } catch {
    return null;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function deleteImageByUrl(url: string): Promise<void> {
  const publicId = extractPublicIdFromUrl(url);
  if (publicId) {
    await deleteImage(publicId);
  }
}

export default cloudinary;
