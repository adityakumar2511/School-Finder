import type { UploadFolder } from "@/lib/upload/upload-security";

export type UploadSuccess = { success: true; url: string };
export type UploadFailure = { success: false; message: string };
export type UploadResult = UploadSuccess | UploadFailure;

type UploadOptions = {
  folder?: UploadFolder;
  onProgress?: (percent: number) => void;
};

type UploadResponseBody = {
  success?: boolean;
  url?: string;
  message?: string;
};

export async function uploadImageFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder ?? "logos";

  if (options.onProgress && typeof XMLHttpRequest !== "undefined") {
    return uploadWithProgress(file, folder, options.onProgress);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const body = (await res.json().catch(() => ({}))) as UploadResponseBody;

    if (!res.ok) {
      return {
        success: false,
        message: body.message ?? "Upload failed. Please try again.",
      };
    }

    if (!body.success || !body.url) {
      return {
        success: false,
        message: body.message ?? "Image upload failed. Please try again.",
      };
    }

    return { success: true, url: body.url };
  } catch {
    return {
      success: false,
      message: "Image upload failed. Please try again.",
    };
  }
}

function uploadWithProgress(
  file: File,
  folder: UploadFolder,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(100, percent));
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as UploadResponseBody;

        if (xhr.status >= 200 && xhr.status < 300 && body.success && body.url) {
          resolve({ success: true, url: body.url });
          return;
        }

        resolve({
          success: false,
          message: body.message ?? "Upload failed. Please try again.",
        });
      } catch {
        resolve({
          success: false,
          message: "Image upload failed. Please try again.",
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        message: "Image upload failed. Please try again.",
      });
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    xhr.send(formData);
  });
}
