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
      subject: "⚰️ Congratulations? You've been named someone's executor.",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 48px; margin: 0;">⚰️</h1>
          </div>

          <h2 style="font-size: 24px; text-align: center; margin-bottom: 20px;">
            Well, this is... something.
          </h2>

          <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
            <strong style="color: #ffffff;">${giverName}</strong> has named you as their executor on Iwill.
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
            What does this mean? When they shuffle off this mortal coil, you'll get access to all their digital wills.
            Yes, that vintage jacket. The crypto wallet password. The embarrassing photos. All yours to distribute
            (or hoard, we don't judge).
          </p>

          <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa;">
            Is this an honor? A burden? A cry for help? Probably all three. Either way, someone trusts you
            with their post-mortem chaos, and that's... kind of sweet? In a morbid way.
          </p>

          <div style="background: linear-gradient(90deg, #A855F7 0%, #db2777 50%, #f59e0b 100%); padding: 3px; border-radius: 12px; margin: 30px 0;">
            <div style="background: #1a1a2e; padding: 20px; border-radius: 10px; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                No action needed right now. Just... don't die before they do?
              </p>
            </div>
          </div>

          <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
            💀 Iwill — You can't take it with you. But you can decide who gets it.
          </p>

          <p style="font-size: 12px; color: #52525b; text-align: center; margin-top: 20px;">
            This email was sent because someone named you as their executor on Iwill.
            If you have no idea what this is about, maybe reach out to ${giverName} while you still can.
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
