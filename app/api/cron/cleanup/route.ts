import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError } from "@/lib/api";
import { cleanupExpiredRateLimits } from "@/lib/rate-limit";

/**
 * Scheduled maintenance: purge expired rate-limit and OTP rows so those tables
 * don't grow unbounded. Triggered by Vercel Cron (see vercel.json), which sends
 * `Authorization: Bearer $CRON_SECRET`. Fails closed if the secret is unset.
 */
export const GET = handleRoute(async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    throw new HttpError(401, "Unauthorized");
  }

  const [rateLimits, expiredOtps, expiredResets] = await Promise.all([
    cleanupExpiredRateLimits(),
    prisma.emailOTP.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);

  return apiSuccess({
    deleted: {
      rateLimits: rateLimits.count,
      expiredOtps: expiredOtps.count,
      expiredResets: expiredResets.count,
    },
  });
});
