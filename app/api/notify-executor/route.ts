import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { executorEmail, giverName } = await request.json();

    if (!executorEmail || !giverName) {
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
      to: executorEmail,
      subject: `${giverName} named you as their executor on Iwill`,
      text: `${giverName} has named you as their executor on Iwill.\n\nWhat does this mean? When they're gone, you'll have access to distribute their digital wills to the people they chose.\n\nNo action needed right now - this is just a heads up.\n\nLearn more at gotwilled.com\n\nIwill - You can't take it with you. But you can decide who gets it.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a1a; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; margin: 0; color: #A855F7;">Iwill</h1>
          </div>

          <h2 style="font-size: 24px; text-align: center; margin-bottom: 20px; color: #1a1a1a;">
            You've been named an executor
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            <strong>${giverName}</strong> has named you as their executor on Iwill.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #444;">
            What does this mean? When they're gone, you'll have access to distribute their digital wills to the people they chose. Think of it as being trusted with their wishes.
          </p>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
              No action needed right now. This is just a heads up that someone trusts you.
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://gotwilled.com" style="display: inline-block; background: #A855F7; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Learn More About Iwill
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You received this email because ${giverName} named you as their executor on Iwill.<br>
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
