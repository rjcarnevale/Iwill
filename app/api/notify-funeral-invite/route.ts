import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, recipientName, giverName, inviteToken } =
      await request.json();

    if (!recipientEmail || !giverName) {
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
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://gotwilled.com"}/funeral-invite/${inviteToken}`;

    const { error } = await resend.emails.send({
      from: "Iwill <noreply@gotwilled.com>",
      to: recipientEmail,
      subject: `${giverName} invited you to their funeral`,
      text: `${giverName} has added you to their funeral guest list on Iwill.\n\nDon't worry, they're not dead yet. They're just planning ahead.\n\nView your invite: ${inviteUrl}\n\nIwill - You can't take it with you. But you can decide who gets it.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a1a; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; margin: 0; color: #A855F7;">Iwill</h1>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px;">⚰️</span>
          </div>

          <h2 style="font-size: 24px; text-align: center; margin-bottom: 8px; color: #1a1a1a;">
            You're Invited to ${giverName}'s Funeral
          </h2>

          <p style="font-size: 16px; text-align: center; color: #666; margin-bottom: 30px;">
            Don't worry, they're not dead yet. They're just planning ahead.
          </p>

          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
              ${recipientName ? `Hey ${recipientName},` : "Hey,"}
            </p>
            <p style="font-size: 16px; color: #1a1a1a; margin: 0;">
              <strong>${giverName}</strong> wants you there when they shuffle off this mortal coil.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${inviteUrl}" style="display: inline-block; background: #A855F7; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Your Invite
            </a>
          </div>

          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Iwill lets you plan who gets your stuff and who gets to say goodbye.<br>
            Free to join. Morbidly fun.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You received this email because ${giverName} added you to their funeral guest list on Iwill.<br>
            <a href="https://gotwilled.com" style="color: #A855F7;">gotwilled.com</a>
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
