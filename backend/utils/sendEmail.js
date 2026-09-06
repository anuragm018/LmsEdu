import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  try {
    const rawUser = process.env.SMTP_USER || "";
    const rawPass = process.env.SMTP_PASS || "";
    const rawHost = process.env.SMTP_HOST || "";
    const rawPort = process.env.SMTP_PORT || "";

    // Clean credentials (removes accidental spaces, tabs, or quotes often copied with Google App Passwords)
    const cleanUser = rawUser.trim().replace(/^["']|["']$/g, "");
    const cleanPass = rawPass.replace(/\s+/g, "").replace(/^["']|["']$/g, "");

    const isGmail =
      rawHost.toLowerCase().includes("gmail") ||
      cleanUser.toLowerCase().endsWith("@gmail.com") ||
      (process.env.SMTP_SERVICE && process.env.SMTP_SERVICE.toLowerCase() === "gmail");

    // Configure transporter
    const transporterConfig = isGmail
      ? {
          service: "gmail",
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        }
      : {
          host: rawHost || "smtp.gmail.com",
          port: Number(rawPort) || 465,
          secure: Number(rawPort) === 465 || !rawPort,
          auth: {
            user: cleanUser,
            pass: cleanPass,
          },
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    // Email Message
    const fromName = process.env.FROM_NAME || "EduSphere LMS";
    const fromEmail = process.env.FROM_EMAIL || cleanUser;

    const message = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html:
        options.html ||
        `
        <div style="
          font-family: Arial, sans-serif;
          padding: 24px;
          background: #0f172a;
          color: #f8fafc;
          border-radius: 12px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        ">
          <h2 style="color: #6366f1; margin-top: 0;">
            EduSphere LMS
          </h2>
          <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0;">
            ${options.message}
          </p>
        </div>
        `,
    };

    // Send Email
    const info = await transporter.sendMail(message);

    console.log(`[Nodemailer] Email sent successfully to: ${options.email}`);
    console.log(`[Nodemailer] Message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("[Nodemailer Error]: Email delivery failed:", error.message);

    if (error.message && error.message.includes("535-5.7.8")) {
      console.error(
        "\n[SMTP TROUBLESHOOTING]: Google rejected your SMTP credentials (BadCredentials 535-5.7.8)."
      );
      console.error("To fix this with Gmail:");
      console.error("1. Enable 2-Step Verification on your Google Account: https://myaccount.google.com/security");
      console.error("2. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords");
      console.error("3. Paste that 16-character code into backend/.env as SMTP_PASS\n");
    }

    // Let controller know email failed
    throw error;
  }
};
