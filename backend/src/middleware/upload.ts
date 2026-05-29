import multer from "multer";
import { AppError } from "../utils/AppError";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const UPLOAD_FOLDERS = ["logos", "gallery", "profiles"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const BLOCKED_EXTENSIONS =
  /\.(svg|pdf|exe|zip|js|mjs|ts|html|htm|php|bat|cmd|sh|dll|msi)$/i;

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

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

export function validateUploadedFile(
  buffer: Buffer,
  options: {
    originalname?: string;
    mimetype?: string;
  } = {}
): void {
  if (buffer.length === 0) {
    throw new AppError(400, "Empty files are not allowed");
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new AppError(400, "File size exceeds 5MB limit");
  }

  const filename = options.originalname?.toLowerCase() ?? "";

  if (filename && BLOCKED_EXTENSIONS.test(filename)) {
    throw new AppError(400, "File type is not allowed");
  }

  if (filename && !ALLOWED_EXTENSIONS.test(filename)) {
    throw new AppError(
      400,
      "Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed"
    );
  }

  const detectedMime = detectImageMime(buffer);

  if (!detectedMime) {
    throw new AppError(400, "File content does not match an allowed image format");
  }

  if (
    options.mimetype &&
    !ALLOWED_MIME_TYPES.includes(options.mimetype as AllowedMimeType)
  ) {
    throw new AppError(400, "Only JPEG, PNG, and WebP images are allowed");
  }

  if (
    options.mimetype &&
    options.mimetype !== detectedMime &&
    !(options.mimetype === "image/jpg" && detectedMime === "image/jpeg")
  ) {
    throw new AppError(400, "File content does not match the declared MIME type");
  }
}

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as AllowedMimeType)) {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }

    if (BLOCKED_EXTENSIONS.test(file.originalname.toLowerCase())) {
      cb(new Error("File type is not allowed"));
      return;
    }

    cb(null, true);
  },
});

export const singleImageUpload = uploadMemory.single("file");
