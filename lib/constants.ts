/**
 * Centralized application constants.
 *
 * Anything that would otherwise be a magic number/string lives here so the
 * rules are consistent across routes, UI and tests, and easy to tune.
 */

/** One-time password (email verification) settings. */
export const OTP = {
  /** Number of digits in a generated code. */
  LENGTH: 6,
  /** How long a code remains valid, in milliseconds. */
  EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  /** Failed verification attempts allowed before a code is invalidated. */
  MAX_ATTEMPTS: 5,
} as const;

/** Password policy (enforced server-side). */
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
} as const;

/** User profile limits. */
export const PROFILE = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 150,
} as const;

/** Photo/post limits. */
export const PHOTO = {
  CAPTION_MAX_LENGTH: 2200,
} as const;

/** Pagination / listing defaults. */
export const PAGINATION = {
  PAGE_SIZE: 20,
  SEARCH_LIMIT: 10,
  SEARCH_MIN_QUERY_LENGTH: 2,
  SEARCH_MAX_QUERY_LENGTH: 50,
} as const;

/** Image upload constraints. */
export const UPLOAD = {
  /** Max file size in bytes (5 MB). */
  MAX_BYTES: 5 * 1024 * 1024,
  /** Allowed MIME types for user-provided images. */
  ALLOWED_MIME: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  FOLDERS: {
    POSTS: "social-house",
    AVATARS: "social-house/profile-pictures",
  },
} as const;

/**
 * Rate-limit windows (fixed-window). Each entry is `{ limit, windowMs }`.
 * Keyed by a stable identifier (email or IP) inside the route.
 */
export const RATE_LIMIT = {
  SEND_OTP_EMAIL: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 / hour / email
  SEND_OTP_IP: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 / hour / IP
  VERIFY_OTP_EMAIL: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 / 15min / email
  SIGNUP_IP: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 / hour / IP
  FORGOT_PW_EMAIL: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 / hour / email
  FORGOT_PW_IP: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 / hour / IP
  RESET_PW_EMAIL: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 / 15min / email
} as const;
