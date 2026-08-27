import { Resend } from "resend";

/**
 * Email (Resend) client.
 *
 * When `RESEND_API_KEY` is missing (e.g. local dev) we still construct a client
 * with a placeholder so imports never crash; `isEmailConfigured` lets callers
 * treat delivery as best-effort in that case.
 */
const apiKey = process.env.RESEND_API_KEY;

export const resend = new Resend(apiKey || "re_placeholder_dev_key");

/** True only when a real Resend key is configured. */
export const isEmailConfigured = Boolean(apiKey && !apiKey.startsWith("re_placeholder"));

/** Verified sender address (must be a Resend-verified domain in production). */
export const EMAIL_FROM = process.env.EMAIL_FROM || "SocialHouse <no-reply@socialhouse.online>";

/**
 * High-End Editorial Email Template Generator
 */
export function renderEmailTemplate({
  badge,
  title,
  description,
  code,
  expiryMinutes = 10,
}: {
  badge: string;
  title: string;
  description: string;
  code: string;
  expiryMinutes?: number;
}): { html: string; text: string } {
  const text = `
SOCIALHOUSE - PHOTOGRAPHIC ARCHIVE
${badge}

${title}
${description}

VERIFICATION CODE: ${code}

This single-use code expires in ${expiryMinutes} minutes.
If you did not request this email, you can safely disregard it.

© 2026 SocialHouse • Curated • Ad-Free • Encrypted Session
https://www.socialhouse.online
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; word-spacing: normal;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F1EB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FAF9F6; border: 1px solid #DCD8CE; border-radius: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.04); overflow: hidden;">
          
          <!-- Masthead Header -->
          <tr>
            <td style="padding: 32px 36px 24px; border-bottom: 1px solid #EAE7DF; text-align: center; background-color: #FAF9F6;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 800; letter-spacing: 5px; color: #181716; text-transform: uppercase;">
                      SOCIALHOUSE
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #8C8880; text-transform: uppercase; margin-top: 6px;">
                      PHOTOGRAPHIC ARCHIVE &bull; ISSUE 04
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px; background-color: #FAF9F6;">
              <!-- Section Tag -->
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #8C8880; text-transform: uppercase; margin-bottom: 10px;">
                ${badge}
              </div>

              <!-- Title -->
              <h1 style="margin: 0 0 14px; font-size: 24px; font-weight: 700; color: #181716; line-height: 1.25; letter-spacing: -0.02em;">
                ${title}
              </h1>

              <!-- Description -->
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #4A463E;">
                ${description}
              </p>

              <!-- Single-Use Code Chamber -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="background-color: #F2EFE9; border: 1px solid #DCD8CE; padding: 24px 16px;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #6C6860; text-transform: uppercase; margin-bottom: 10px;">
                      SINGLE-USE VERIFICATION CODE
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #181716; padding-left: 12px; user-select: all;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Callout -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F6F4EE; border-left: 3px solid #181716; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #4A463E; line-height: 1.5;">
                      ⏱ This security code expires in <strong>${expiryMinutes} minutes</strong> and can only be used once. Never share this code.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #8C8880; line-height: 1.5;">
                If you did not initiate this request, no action is required and you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer Colophon -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F2EFE9; border-top: 1px solid #EAE7DF; text-align: center;">
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: 700; color: #5A564E; letter-spacing: 1.5px; text-transform: uppercase;">
                SOCIALHOUSE &bull; EST. 2025
              </div>
              <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; color: #8C8880; margin-top: 4px; letter-spacing: 1px;">
                CURATED &bull; AD-FREE &bull; SECURE SESSION
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { html, text };
}
