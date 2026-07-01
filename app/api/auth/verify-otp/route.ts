import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, parseBody } from "@/lib/api";
import { verifyOtpSchema } from "@/lib/validations";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { OTP, RATE_LIMIT } from "@/lib/constants";

/**
 * Pre-check for the registration UI: confirms a code is currently valid so the
 * user gets instant feedback. It does NOT consume the code — `signup`
 * re-verifies and deletes it, so it remains the authoritative gate.
 */
export const POST = handleRoute(async (req: Request) => {
  const { email, otp } = await parseBody(req, verifyOtpSchema);

  const limit = await checkRateLimit(
    `verify-otp:${email}`,
    RATE_LIMIT.VERIFY_OTP_EMAIL.limit,
    RATE_LIMIT.VERIFY_OTP_EMAIL.windowMs
  );
  if (!limit.success) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  const record = await prisma.emailOTP.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new HttpError(400, "No verification request found. Please request a new code.");
  }

  if (new Date() > record.expiresAt) {
    await prisma.emailOTP.deleteMany({ where: { email } });
    throw new HttpError(400, "Code expired. Please request a new one.");
  }

  if (record.attempts >= OTP.MAX_ATTEMPTS) {
    await prisma.emailOTP.deleteMany({ where: { email } });
    throw new HttpError(429, "Too many incorrect attempts. Please request a new code.");
  }

  const isValid = await verifyOtp(otp, record.otp);
  if (!isValid) {
    await prisma.emailOTP.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, "Invalid code.");
  }

  return apiSuccess({ success: true });
});
