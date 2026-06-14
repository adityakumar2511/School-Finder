export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const UPLOAD_FOLDERS = ["logos", "gallery", "profiles"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

const BLOCKED_EXTENSIONS =
  /\.(svg|pdf|exe|zip|js|mjs|ts|html|htm|php|bat|cmd|sh|dll|msi)$/i;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function isUploadFolder(value: string): value is UploadFolder {
  return UPLOAD_FOLDERS.includes(value as UploadFolder);
}

export function detectImageMime(buffer: Buffer): AllowedMimeType | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }

  const name = file.name.toLowerCase();

  if (BLOCKED_EXTENSIONS.test(name)) {
    return "File type is not allowed";
  }

  if (!ALLOWED_EXTENSIONS.test(name)) {
    return "Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "File size exceeds 5MB limit";
  }

  if (file.size === 0) {
    return "Empty files are not allowed";
  }

  return null;
}

export function validateImageBuffer(buffer: Buffer, declaredMime?: string): string | null {
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return "File size exceeds 5MB limit";
  }

  if (buffer.length < 12) {
    return "Invalid image file";
  }

  const detected = detectImageMime(buffer);

  if (!detected) {
    return "File content does not match an allowed image format";
  }

  if (
    declaredMime &&
    !ALLOWED_MIME_TYPES.includes(declaredMime as AllowedMimeType)
  ) {
    return "Only JPEG, PNG, and WebP images are allowed";
  }

  if (
    declaredMime &&
    declaredMime !== detected &&
    !(declaredMime === "image/jpg" && detected === "image/jpeg")
  ) {
    return "File content does not match the declared MIME type";
  }

  return null;
}
