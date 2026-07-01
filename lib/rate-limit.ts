import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  /** False once the limit for the current window has been exceeded. */
  success: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Milliseconds until the window resets (0 when not limited). */
  retryAfterMs: number;
}

/**
 * DB-backed fixed-window rate limiter (serverless-safe — no external infra).
 *
 * Keeps one row per `key` (e.g. `"send-otp:user@example.com"`). Each call
 * increments the counter; when the window has elapsed the counter resets.
 *
 * Note: this is a pragmatic limiter for auth throttling, not a distributed
 * token bucket. A tiny read-then-write race is acceptable here — the goal is to
 * make brute force/spam expensive, which it does.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const nowDate = new Date(now);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  // No window yet, or the previous window expired -> start a fresh window.
  if (!existing || existing.expiresAt <= nowDate) {
    const expiresAt = new Date(now + windowMs);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: 1, expiresAt },
    });
    return { success: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  // Limit already reached for this window.
  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: existing.expiresAt.getTime() - now,
    };
  }

  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    success: true,
    remaining: Math.max(0, limit - updated.count),
    retryAfterMs: 0,
  };
}

/** Delete rate-limit rows whose window has elapsed. Run periodically (cron). */
export function cleanupExpiredRateLimits() {
  return prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
