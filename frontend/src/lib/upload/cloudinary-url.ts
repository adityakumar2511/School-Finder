  /**
   * Inject Cloudinary delivery optimizations into stored image URLs.
   * Safe no-op for non-Cloudinary URLs or URLs that already include transforms.
   */
  export function optimizeCloudinaryUrl(
    url: string | null | undefined,
    options: { width?: number } = {}
  ): string | null {
    if (!url) return null;
    if (!url.includes("res.cloudinary.com")) return url;

    try {
      const parsed = new URL(url);
      const marker = "/upload/";
      const markerIndex = parsed.pathname.indexOf(marker);
      if (markerIndex === -1) return url;

      const prefix = parsed.pathname.slice(0, markerIndex + marker.length);
      const  remainder = parsed.pathname.slice(markerIndex + marker.length);

      if (/^(q_auto|f_auto|w_\d)/.test(remainder)) {
        return url;
      }

      const transforms = ["q_auto", "f_auto", "dpr_auto"];
      if (options.width && options.width > 0) {
        transforms.unshift(`w_${Math.round(options.width)}`);
      }

      const transformSegment = `${transforms.join(",")}/`;
      parsed.pathname = `${prefix}${transformSegment}${remainder}`;
      return parsed.toString();
    } catch {
      return url;
    }
  }
