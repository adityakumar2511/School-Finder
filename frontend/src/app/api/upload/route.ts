import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/lib/types/database";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  detectImageMime,
  isUploadFolder,
  validateImageBuffer,
  validateUploadFile,
  type UploadFolder,
} from "@/lib/upload-security";

export const runtime = "nodejs";

const ALLOWED_UPLOAD_ROLES: Role[] = ["PARENT", "SCHOOL_ADMIN", "ADMIN"];
const MAX_UPLOADS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const uploadRateLimits = new Map<string, RateLimitEntry>();

function checkUploadRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = uploadRateLimits.get(userId);

  if (!entry || now >= entry.resetTime) {
    uploadRateLimits.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= MAX_UPLOADS_PER_HOUR) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  let session = null;
  try {
    session = await auth();
  } catch {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  if (!session?.user) {
    return NextResponse.json(
      { message: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    if (!ALLOWED_UPLOAD_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    if (!checkUploadRateLimit(session.user.id)) {
      return NextResponse.json(
        { message: "Upload limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folderInput = formData.get("folder");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const folder: UploadFolder =
      typeof folderInput === "string" && isUploadFolder(folderInput)
        ? folderInput
        : "logos";

    const validationError = validateUploadFile(file);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const bufferError = validateImageBuffer(buffer, file.type);
    if (bufferError) {
      return NextResponse.json(
        { success: false, message: bufferError },
        { status: 400 }
      );
    }

    const detectedMime = detectImageMime(buffer) ?? "image/jpeg";
    const result = await uploadImage(buffer, folder, detectedMime);

    return NextResponse.json({ success: true, url: result.url }, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Image upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
