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
      subject: `${giverName} has left you something in their Will 👀`,
      text: `${giverName} has left you something in their Will 👀\n\nCheck it out on Iwill: ${claimUrl}\n\nWhat is it? You'll have to sign up to find out.\n\nIwill - You can't take it with you. But you can decide who gets it.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a1a; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; margin: 0; color: #A855F7;">Iwill</h1>
          </div>

          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 48px;">👀</span>
          </div>

          <h2 style="font-size: 24px; text-align: center; margin-bottom: 8px; color: #1a1a1a;">
            ${giverName} has left you something in their Will
          </h2>

          <p style="font-size: 16px; text-align: center; color: #666; margin-bottom: 30px;">
            What is it? You'll have to check to find out.
          </p>

          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
              From
            </p>
            <p style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin: 0 0 20px 0;">
              ${giverName}
            </p>

            <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e5e5e5;">
              <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
                They left you
              </p>
              <p style="font-size: 18px; color: #A855F7; margin: 0; font-weight: 600;">
                ??? 🔒
              </p>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${claimUrl}" style="display: inline-block; background: #A855F7; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              See What It Is
            </a>
          </div>

          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 30px;">
            Iwill is where you decide who gets your stuff (someday).<br>
            Free to join. Takes 30 seconds.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            You received this email because ${giverName} left you something on Iwill.<br>
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
