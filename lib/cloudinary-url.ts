/**
 * Insert delivery transformations into a Cloudinary secure URL so images are
 * served in the best format (`f_auto` → AVIF/WebP) at an appropriate quality
 * (`q_auto`). This trims bandwidth/cost before Next's image optimizer even
 * touches the asset. Non-Cloudinary URLs are returned unchanged.
 *
 * @example
 * cldOptimized("https://res.cloudinary.com/x/image/upload/v1/a.jpg")
 * // -> "https://res.cloudinary.com/x/image/upload/f_auto,q_auto/v1/a.jpg"
 */
export function cldOptimized(url: string, extraTransforms = ""): string {
  if (!url) return "";
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const transforms = ["f_auto", "q_auto", extraTransforms].filter(Boolean).join(",");
  const insertAt = idx + marker.length;
  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}

/**
 * Generate a tiny, low-bandwidth blurred placeholder URL from Cloudinary (LQIP)
 * for use in Next.js `<Image placeholder="blur" blurDataURL={...} />`.
 */
export function cldBlurPlaceholder(url: string): string {
  if (!url) return shimmerPlaceholder(40, 40);
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return shimmerPlaceholder(40, 40);

  const transforms = "f_auto,q_10,w_40,e_blur:1000";
  const insertAt = idx + marker.length;
  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}

/**
 * Fallback lightweight base64 SVG shimmer for non-Cloudinary images.
 */
export function shimmerPlaceholder(w: number, h: number): string {
  const svg = `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="${w}" height="${h}" fill="#EAE7DF" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <defs>
        <linearGradient id="g">
          <stop stop-color="#EAE7DF" offset="20%" />
          <stop stop-color="#F2EFE9" offset="50%" />
          <stop stop-color="#EAE7DF" offset="70%" />
        </linearGradient>
      </defs>
    </svg>`;
  return `data:image/svg+xml;base64,${typeof window === "undefined" ? Buffer.from(svg).toString("base64") : window.btoa(svg)}`;
}
