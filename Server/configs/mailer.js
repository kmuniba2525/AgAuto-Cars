import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

export const sendMail = async (to, subject, html) => {
  try {
    console.log("📧 Attempting to send email...");
    console.log("To:", to);
    console.log("From:", process.env.BREVO_SENDER_EMAIL);

    const info = await transporter.sendMail({
      from: `"AgAuto Cars" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return info;
  } catch (error) {
    console.error("❌ EMAIL FAILED");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);

    return null;
  }
};

export default transporter;