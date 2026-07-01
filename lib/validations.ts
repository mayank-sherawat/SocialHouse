import { z } from "zod";
import { OTP, PASSWORD, PROFILE } from "@/lib/constants";

/**
 * Zod request schemas — the single source of truth for input validation.
 * Routes call `parseBody(req, schema)` (see `lib/api.ts`) so validation and
 * error messaging are consistent everywhere.
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const usernameSchema = z
  .string()
  .trim()
  .min(PROFILE.USERNAME_MIN_LENGTH, `Username must be at least ${PROFILE.USERNAME_MIN_LENGTH} characters`)
  .max(PROFILE.USERNAME_MAX_LENGTH, `Username must be at most ${PROFILE.USERNAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, and . _ -");

export const passwordSchema = z
  .string()
  .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
  .max(PASSWORD.MAX_LENGTH, "Password is too long");

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP.LENGTH}}$`), `Enter the ${OTP.LENGTH}-digit code`);

export const bioSchema = z
  .string()
  .trim()
  .max(PROFILE.BIO_MAX_LENGTH, `Bio must be at most ${PROFILE.BIO_MAX_LENGTH} characters`);

// --- Composite body schemas ------------------------------------------------

export const sendOtpSchema = z.object({ email: emailSchema });

export const verifyOtpSchema = z.object({ email: emailSchema, otp: otpCodeSchema });

export const signupSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  otp: otpCodeSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpCodeSchema,
  password: passwordSchema,
});

export const followSchema = z.object({ userId: z.string().cuid("Invalid user id") });

export const updateBioSchema = z.object({ bio: bioSchema });

export const settingsSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    bio: bioSchema.nullable().optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "No changes provided",
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
