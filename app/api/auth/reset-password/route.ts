import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleRoute, HttpError, parseBody } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyOtp } from "@/lib/otp";
import { resetPasswordSchema } from "@/lib/validations";
import { RATE_LIMIT } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const { email, otp, password } = await parseBody(req, resetPasswordSchema);

  const limit = await checkRateLimit(
    `reset-pw:${email}`,
    RATE_LIMIT.RESET_PW_EMAIL.limit,
    RATE_LIMIT.RESET_PW_EMAIL.windowMs
  );
  if (!limit.success) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  const record = await prisma.passwordReset.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record || new Date() > record.expiresAt || !(await verifyOtp(otp, record.otp))) {
    throw new HttpError(400, "Invalid or expired reset code.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Set the new password and consume all reset codes for this email.
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: hashedPassword } }),
    prisma.passwordReset.deleteMany({ where: { email } }),
  ]);

  return apiSuccess({ success: true });
});
