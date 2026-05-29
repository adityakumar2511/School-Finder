"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImageFile } from "@/lib/upload-client";
import { validateUploadFile } from "@/lib/upload-security";
import type { UploadFolder } from "@/lib/upload-security";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  folder: UploadFolder;
  hint?: string;
  previewUrl?: string | null;
  onUploaded: (url: string) => void;
  onClear?: () => void;
  className?: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp";

export default function ImageUploadField({
  label,
  folder,
  hint,
  previewUrl,
  onUploaded,
  onClear,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const displayPreview = localPreview ?? previewUrl ?? null;

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateUploadFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setPendingFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLocalPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      setProgress(0);

      const result = await uploadImageFile(file, {
        folder,
        onProgress: setProgress,
      });

      setUploading(false);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setPendingFile(null);
      onUploaded(result.url);
    },
    [folder, onUploaded]
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  function handleClear() {
    setLocalPreview(null);
    setError(null);
    setPendingFile(null);
    onClear?.();
  }

  async function handleRetry() {
    if (pendingFile) {
      await processFile(pendingFile);
    } else {
      inputRef.current?.click();
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-heading text-sm font-semibold text-gray-800">{label}</p>
      {hint && <p className="font-body text-xs text-gray-500">{hint}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-4 transition-colors",
          dragOver ? "border-blue-400 bg-blue-50/50" : "border-gray-200 bg-gray-50/50",
          uploading && "pointer-events-none opacity-90"
        )}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {uploading && !displayPreview ? (
              <Skeleton className="h-full w-full" />
            ) : displayPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPreview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-300">
                <Upload className="h-8 w-8" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={onInputChange}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose image
              </Button>
              {displayPreview && onClear && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={handleClear}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-center font-body text-xs text-gray-500 sm:text-left">
              Drag and drop or click to upload. JPEG, PNG, or WebP up to 5MB.
            </p>
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="alert-danger flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-text" />
          <div className="flex-1">
            <p className="font-body text-sm">{error}</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-danger-text"
              onClick={() => void handleRetry()}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
