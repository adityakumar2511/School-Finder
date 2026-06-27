"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Skeleton } from "@/components/shared/ui/skeleton";
import ImageUploadField from "@/components/shared/upload/ImageUploadField";

export type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
};

export default function SchoolGalleryManager({
  initialImages,
}: {
  initialImages: GalleryImage[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  async function handleGalleryUploaded(url: string) {
    setGalleryError(null);
    const res = await fetch("/api/school/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body.success) {
      setGalleryError(body.message ?? "Failed to save gallery image");
      return;
    }

    // setImages((prev) => [body.image, ...prev]);
    setImages((prev) => [body.data ?? body.image, ...prev]);
    setShowUploader(false);
    router.refresh();
  }

  async function removeImage(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/school/gallery/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Failed to remove image");
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-gray-500">
          Showcase your campus and facilities. Up to 5MB per image.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUploader((v) => !v)}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Add photo
        </Button>
      </div>

      {galleryError && (
        <p className="alert-danger">
          {galleryError}
        </p>
      )}

      {showUploader && (
        <ImageUploadField
          label="Upload gallery photo"
          folder="gallery"
          hint="Images are compressed and optimized automatically."
          onUploaded={(url) => {
            void handleGalleryUploaded(url);
          }}
          onClear={() => setShowUploader(false)}
        />
      )}

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
          <p className="font-body text-sm text-gray-500">No gallery photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
            >
              <Image
                src={image.url}
                alt={image.caption ?? "School gallery"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={removingId === image.id}
                onClick={() => void removeImage(image.id)}
              >
                {removingId === image.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {removingId && images.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Skeleton className="h-4 w-4 rounded-full" />
          Removing image…
        </div>
      )}
    </section>
  );
}
