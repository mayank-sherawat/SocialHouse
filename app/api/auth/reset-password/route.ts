import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, getClientIp, handleRoute, HttpError, parseBody } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyOtp } from "@/lib/otp";
import { resetPasswordSchema } from "@/lib/validations";
import { OTP, RATE_LIMIT } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const { email, otp, password } = await parseBody(req, resetPasswordSchema);
  const ip = getClientIp(req);

  const byEmail = await checkRateLimit(
    `reset-pw:${email}`,
    RATE_LIMIT.RESET_PW_EMAIL.limit,
    RATE_LIMIT.RESET_PW_EMAIL.windowMs
  );
  const byIp = await checkRateLimit(
    `reset-pw-ip:${ip}`,
    RATE_LIMIT.FORGOT_PW_IP.limit,
    RATE_LIMIT.FORGOT_PW_IP.windowMs
  );
  if (!byEmail.success || !byIp.success) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  const record = await prisma.passwordReset.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new HttpError(400, "No reset request found. Please request a new code.");
  }

  if (new Date() > record.expiresAt) {
    await prisma.passwordReset.deleteMany({ where: { email } });
    throw new HttpError(400, "Reset code expired. Please request a new one.");
  }

  if (record.attempts >= OTP.MAX_ATTEMPTS) {
    await prisma.passwordReset.deleteMany({ where: { email } });
    throw new HttpError(429, "Too many incorrect attempts. Please request a new reset code.");
  }

  const isValid = await verifyOtp(otp, record.otp);
  if (!isValid) {
    await prisma.passwordReset.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, "Invalid reset code.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Set the new password and consume all reset codes for this email.
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: hashedPassword } }),
    prisma.passwordReset.deleteMany({ where: { email } }),
  ]);

  return apiSuccess({ success: true });
});
