// Server/config/mailer.js
import nodemailer from "nodemailer";

// Reusable transporter using Brevo SMTP relay.
// Credentials come from environment variables — never hardcode them.
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // TLS is used automatically on port 587 (STARTTLS)
  auth: {
    user: process.env.BREVO_SMTP_USER, // your Brevo account login email
    pass: process.env.BREVO_SMTP_KEY,  // the SMTP key you generated
  },
});

/**
 * Sends an email.
 * @param {string} to - recipient email address
 * @param {string} subject - email subject line
 * @param {string} html - HTML body content
 */
export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"AgAuto Cars" <${process.env.BREVO_SENDER_EMAIL}>`, // must match your verified sender
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    // Never let an email failure crash order creation — just log it.
    console.error("Failed to send email:", error.message);
    return null;
  }
};

export default transporter;