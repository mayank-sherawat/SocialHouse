import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// Safe initialization (prevents crash if key is missing)
export const resend = new Resend(apiKey || "re_123_mock_key");

export async function sendOTPEmail(email: string, otp: string) {
  if (!apiKey || apiKey.startsWith("re_123")) {
    return;
  }

  try {
    await resend.emails.send({
      from: "SocialHouse <no-reply@socialhouse.online>",
      to: email,
      subject: "Verify your email",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    });
  } catch (error) {
    console.error("Resend API Error:", error);
  }
}