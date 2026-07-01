import { prisma } from "@/lib/prisma";
import { resend, isEmailConfigured, EMAIL_FROM } from "@/lib/email";
import { apiSuccess, getClientIp, handleRoute, HttpError, parseBody } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { forgotPasswordSchema } from "@/lib/validations";
import { OTP, RATE_LIMIT } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const { email } = await parseBody(req, forgotPasswordSchema);
  const ip = getClientIp(req);

  const byEmail = await checkRateLimit(
    `forgot-pw:${email}`,
    RATE_LIMIT.FORGOT_PW_EMAIL.limit,
    RATE_LIMIT.FORGOT_PW_EMAIL.windowMs
  );
  const byIp = await checkRateLimit(
    `forgot-pw-ip:${ip}`,
    RATE_LIMIT.FORGOT_PW_IP.limit,
    RATE_LIMIT.FORGOT_PW_IP.windowMs
  );
  if (!byEmail.success || !byIp.success) {
    throw new HttpError(429, "Too many requests. Please try again later.");
  }

  // Only send a code if the account exists, but always respond identically so
  // the endpoint can't be used to enumerate registered emails.
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const code = generateOtp();
    const otpHash = await hashOtp(code);

    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { email } }),
      prisma.passwordReset.create({ data: { email, otp: otpHash, expiresAt: otpExpiry() } }),
    ]);

    if (isEmailConfigured) {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Reset your password",
        html: `
          <h2>Password Reset</h2>
          <p>Use this code to reset your password:</p>
          <h1 style="letter-spacing: 5px;">${code}</h1>
          <p>This code expires in ${OTP.EXPIRY_MS / 60000} minutes. If you didn't request this, you can ignore this email.</p>
        `,
      });
    } else {
      console.warn(`[forgot-password] Email not configured. Code for ${email}: ${code}`);
    }
  }

  return apiSuccess({ success: true });
});
