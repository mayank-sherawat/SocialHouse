import { Resend } from "resend";

/**
 * Email (Resend) client.
 *
 * When `RESEND_API_KEY` is missing (e.g. local dev) we still construct a client
 * with a placeholder so imports never crash; `isEmailConfigured` lets callers
 * treat delivery as best-effort in that case.
 */
const apiKey = process.env.RESEND_API_KEY;

export const resend = new Resend(apiKey || "re_placeholder_dev_key");

/** True only when a real Resend key is configured. */
export const isEmailConfigured = Boolean(apiKey && !apiKey.startsWith("re_placeholder"));

/** Verified sender address (must be a Resend-verified domain in production). */
export const EMAIL_FROM = process.env.EMAIL_FROM || "SocialHouse <no-reply@socialhouse.online>";
