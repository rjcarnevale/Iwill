import { Resend } from "resend";
import * as dotenv from "dotenv";

dotenv.config();

async function sendTestEmail() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not found in environment");
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log("Sending test email...");

  const { data, error } = await resend.emails.send({
    from: "Iwill <noreply@gotwilled.com>",
    to: "rjcarnevale@gmail.com",
    subject: "Test Email from Iwill",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 48px; margin: 0;">💀</h1>
        </div>
        <h2 style="font-size: 24px; text-align: center; color: #A855F7; margin-bottom: 20px;">
          Test Email Successful!
        </h2>
        <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; text-align: center;">
          If you're seeing this, Resend is working correctly.
        </p>
        <p style="font-size: 14px; color: #71717a; text-align: center; margin-top: 40px;">
          Iwill - You can't take it with you. But you can decide who gets it.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send email:", error);
    process.exit(1);
  }

  console.log("Email sent successfully!");
  console.log("Email ID:", data?.id);
}

sendTestEmail();
