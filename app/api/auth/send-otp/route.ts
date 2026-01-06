import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/email"; // Ensure this path matches your project structure

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 2. Database: Delete old OTPs -> Create new one
    await prisma.$transaction([
      prisma.emailOTP.deleteMany({ where: { email } }),
      prisma.emailOTP.create({
        data: {
          email,
          otp,
          expiresAt,
        },
      }),
    ]);

    // 3. Send Email
    await resend.emails.send({
      from: "SocialHouse <no-reply@socialhouse.online>", // Or your domain
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 5px;">${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Send OTP Error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}