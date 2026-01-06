import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim();
    const otp = String(body.otp || "").trim();

    // 1. Validate Input
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 2. Fetch latest OTP by email
    const record = await prisma.emailOTP.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No OTP request found." },
        { status: 400 }
      );
    }

    // 3. Manual Strict Compare
    if (otp !== record.otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // 4. Expiry Check
    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: "Code expired. Request new one." },
        { status: 400 }
      );
    }

    // 5. SUCCESS!
    // IMPORTANT: We do NOT update the user table here because the user
    // has not clicked "Create Account" yet. We just return success.
    

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error("🔴 Server Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}