import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, getClientIp, handleRoute, HttpError, parseBody } from "@/lib/api";
import { signupSchema } from "@/lib/validations";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { OTP, RATE_LIMIT } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const { email, username, password, otp } = await parseBody(req, signupSchema);

  const ipLimit = await checkRateLimit(
    `signup-ip:${getClientIp(req)}`,
    RATE_LIMIT.SIGNUP_IP.limit,
    RATE_LIMIT.SIGNUP_IP.windowMs
  );
  if (!ipLimit.success) {
    throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  // Authoritative email-verification gate. Previously `emailVerified` was
  // hardcoded to `true` here, so anyone could POST directly and skip OTP.
  // Now signup re-validates the code and consumes it in the same transaction.
  const record = await prisma.emailOTP.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const otpUsable =
    record && new Date() <= record.expiresAt && record.attempts < OTP.MAX_ATTEMPTS;

  if (!otpUsable || !(await verifyOtp(otp, record.otp))) {
    if (record) {
      await prisma.emailOTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
    }
    throw new HttpError(400, "Email not verified. Please request a new code.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction([
      prisma.user.create({
        data: { email, username, password: hashedPassword, emailVerified: true },
      }),
      prisma.emailOTP.deleteMany({ where: { email } }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "That username or email is already taken.");
    }
    throw err;
  }

  return apiSuccess({ success: true }, 201);
});
