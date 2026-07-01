import { UPLOAD } from "@/lib/constants";
import { HttpError } from "@/lib/api";

/**
 * Validate a user-provided image from `formData`: presence, MIME allowlist and
 * size cap. Narrows `value` to `File` on success; throws `HttpError` otherwise.
 */
export function assertValidImage(value: unknown): asserts value is File {
  if (!(value instanceof File)) {
    throw new HttpError(400, "No file provided");
  }

  const allowed = UPLOAD.ALLOWED_MIME as readonly string[];
  if (!allowed.includes(value.type)) {
    throw new HttpError(415, "Unsupported file type. Use JPEG, PNG, WebP or GIF.");
  }

  if (value.size > UPLOAD.MAX_BYTES) {
    const maxMb = Math.round(UPLOAD.MAX_BYTES / (1024 * 1024));
    throw new HttpError(413, `File too large. Maximum size is ${maxMb}MB.`);
  }
}

/** Convert an uploaded image File to a base64 data URI for Cloudinary. */
export async function fileToDataUri(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}
