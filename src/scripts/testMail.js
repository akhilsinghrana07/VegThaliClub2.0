// package/src/scripts/testMail.js
/* eslint-disable no-console */
const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

// Load env from project root .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Quick sanity log (masked)
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log(
  "SMTP_PASS length:",
  process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
);

async function main() {
  // Try 465 first. If it fails with EAUTH, try the 587 config below.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();
  console.log("✅ SMTP verified successfully!");

  const to = process.env.CATERING_TO_EMAIL || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"Veg Thali Club" <${
      process.env.CATERING_FROM_EMAIL || process.env.SMTP_USER
    }>`,
    to,
    subject: "Test — Catering SMTP",
    text: "Hello! This is a test email from the catering setup.",
  });

  console.log("🎉 Test email sent! MessageId:", info.messageId);
}

main().catch(async (err) => {
  console.error("❌ Test failed:", err && err.message ? err.message : err);

  // === Try fallback config (587 / STARTTLS) automatically ===
  if (String(process.env.SMTP_PORT) !== "587") {
    console.log("↪️ Retrying with port 587 / secure=false …");
    try {
      const transporter2 = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter2.verify();
      const info2 = await transporter2.sendMail({
        from: `"Veg Thali Club" <${
          process.env.CATERING_FROM_EMAIL || process.env.SMTP_USER
        }>`,
        to: process.env.CATERING_TO_EMAIL || process.env.SMTP_USER,
        subject: "Test — Catering SMTP (587)",
        text: "Hello! This is a test email using 587/STARTTLS.",
      });
      console.log("🎉 Test email sent with 587! MessageId:", info2.messageId);
    } catch (e2) {
      console.error(
        "❌ Fallback (587) also failed:",
        e2 && e2.message ? e2.message : e2
      );
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
});
