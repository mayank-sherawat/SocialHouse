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
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const transforms = ["f_auto", "q_auto", extraTransforms].filter(Boolean).join(",");
  const insertAt = idx + marker.length;
  return `${url.slice(0, insertAt)}${transforms}/${url.slice(insertAt)}`;
}
