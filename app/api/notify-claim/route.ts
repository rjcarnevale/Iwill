import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, giverName, itemDescription, claimToken, claimUrl } =
      await request.json();

    if (!recipientEmail || !giverName || !claimToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Iwill <noreply@gotwilled.com>",
      to: recipientEmail,
      subject: "⚰️ Someone left you something (hopefully not their problems)",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 64px; margin: 0;">⚰️</h1>
          </div>

          <h2 style="font-size: 28px; text-align: center; margin-bottom: 12px; color: #A855F7; letter-spacing: 2px;">
            SOMEONE LEFT YOU SOMETHING
          </h2>

          <p style="font-size: 18px; text-align: center; color: #888; margin-bottom: 30px;">
            (hopefully not their problems)
          </p>

          <div style="background: #242424; border-radius: 16px; padding: 24px; border: 2px dashed #A855F7; margin-bottom: 30px;">
            <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
              From
            </p>
            <p style="font-size: 18px; color: #fff; font-weight: 600; margin: 0 0 20px 0;">
              ${giverName}
            </p>

            <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                They willed you
              </p>
              <p style="font-size: 20px; color: #A855F7; margin: 0;">
                ████████ 🔒
              </p>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${claimUrl}" style="display: inline-block; background: #A855F7; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
              Sign Up to See What You Got 💀
            </a>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 16px;">
            Free. Takes 30 seconds. Regret optional.
          </p>

          <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
            💀 Iwill — You can't take it with you. But you can decide who gets it.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
