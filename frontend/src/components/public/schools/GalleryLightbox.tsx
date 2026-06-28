"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/upload/image-placeholder";
import { optimizeCloudinaryUrl } from "@/lib/upload/cloudinary-url";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  category: string | null;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
  schoolName: string;
}

export default function GalleryLightbox({
  images,
  schoolName,
}: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);

  const isOpen = activeIndex !== null;

  const close = useCallback(() => {
    setActiveIndex(null);
    setImgError(false);
  }, []);

  const prev = useCallback(() => {
    setImgError(false);
    setActiveIndex((i) =>
      i === null ? null : i === 0 ? images.length - 1 : i - 1,
    );
  }, [images.length]);

  const next = useCallback(() => {
    setImgError(false);
    setActiveIndex((i) =>
      i === null ? null : i === images.length - 1 ? 0 : i + 1,
    );
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  // Use plain <img> tag to avoid next/image hostname / transform issues in lightbox
  const lightboxSrc = activeImage
    ? (optimizeCloudinaryUrl(activeImage.url, { width: 1200 }) ?? activeImage.url)
    : "";

  return (
    <>
      {/* ── Thumbnail Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, index) => {
          const thumbSrc =
            optimizeCloudinaryUrl(img.url, { width: 640 }) ?? img.url;

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setImgError(false);
                setActiveIndex(index);
              }}
              className="relative aspect-video rounded-xl overflow-hidden bg-blue-50 border border-gray-100 group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbSrc}
                alt={img.caption || `${schoolName} photo ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-white text-xs truncate">{img.caption}</p>
                </div>
              )}

              {img.category && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-xs">
                    {img.category}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                  View
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Lightbox Overlay ─────────────────────────────── */}
      {isOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
          onClick={close}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-body">
              {(activeIndex ?? 0) + 1} / {images.length}
            </span>
          </div>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 sm:left-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main image — plain <img> to avoid next/image restrictions */}
          <div
            className="relative flex items-center justify-center w-full px-16 sm:px-24"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {imgError ? (
              <div className="flex flex-col items-center gap-3 text-white/60">
                <span className="text-5xl">🖼️</span>
                <p className="font-body text-sm">Could not load image</p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={lightboxSrc}
                src={lightboxSrc}
                alt={activeImage.caption || `${schoolName} photo`}
                onError={() => setImgError(true)}
                style={{
                  maxHeight: "75vh",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            )}
          </div>

          {/* Caption + category */}
          {(activeImage.caption || activeImage.category) && (
            <div className="mt-4 text-center space-y-1 px-4">
              {activeImage.caption && (
                <p className="text-white font-body text-sm">
                  {activeImage.caption}
                </p>
              )}
              {activeImage.category && (
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-white/70 text-xs">
                  {activeImage.category}
                </span>
              )}
            </div>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 sm:right-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Dot indicators — only if ≤ 12 images */}
          {images.length > 1 && images.length <= 12 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgError(false);
                    setActiveIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-white" : "bg-white/35"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}