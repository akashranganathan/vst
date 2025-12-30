// server/utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_FROM_NAME || "VST Universe Support"}" <${
        process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER
      }>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent via Brevo:", info.messageId);
  } catch (error) {
    console.error("❌ Brevo email failed:", error.message);
  }
};
