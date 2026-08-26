import { prisma } from "@/lib/prisma";
import { resend, isEmailConfigured, EMAIL_FROM } from "@/lib/email";
import { apiSuccess, getClientIp, handleRoute, HttpError, parseBody } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/otp";
import { sendOtpSchema } from "@/lib/validations";
import { OTP, RATE_LIMIT } from "@/lib/constants";

export const POST = handleRoute(async (req: Request) => {
  const { email } = await parseBody(req, sendOtpSchema);
  const ip = getClientIp(req);

  // Throttle per-email (anti-spam / anti-enumeration) and per-IP (anti-abuse).
  const byEmail = await checkRateLimit(
    `send-otp:${email}`,
    RATE_LIMIT.SEND_OTP_EMAIL.limit,
    RATE_LIMIT.SEND_OTP_EMAIL.windowMs
  );
  const byIp = await checkRateLimit(
    `send-otp-ip:${ip}`,
    RATE_LIMIT.SEND_OTP_IP.limit,
    RATE_LIMIT.SEND_OTP_IP.windowMs
  );
  if (!byEmail.success || !byIp.success) {
    throw new HttpError(429, "Too many requests. Please try again later.");
  }

  // Prevent sending registration OTP if the email already has an account.
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    throw new HttpError(400, "This email is already registered. Please sign in instead.");
  }

  // Generate a secure code, store only its hash, and invalidate prior codes.
  const code = generateOtp();
  const otpHash = await hashOtp(code);

  await prisma.$transaction([
    prisma.emailOTP.deleteMany({ where: { email } }),
    prisma.emailOTP.create({ data: { email, otp: otpHash, expiresAt: otpExpiry() } }),
  ]);

  if (isEmailConfigured) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in ${OTP.EXPIRY_MS / 60000} minutes.</p>
      `,
    });
  } else {
    // No email provider configured (local dev): surface the code in server logs.
    console.warn(`[send-otp] Email not configured. Code for ${email}: ${code}`);
  }

  return apiSuccess({ success: true });
});
