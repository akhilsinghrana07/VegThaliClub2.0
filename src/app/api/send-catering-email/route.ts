// app/api/send-catering-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // ✅ ensure NOT edge
export const dynamic = "force-dynamic"; // ✅ deploy as a function, not static

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      package: pkg,
      baseItems = [],
      steps = [],
      includeEcoSet,
      perPerson,
      subtotal,
      grandTotal,
      form = {},
    } = body;

    const isWeightOrder = !!form.weightKg && Number(form.weightKg) > 0;

    const html = `
      <h2>🍽️ New Catering Request</h2>
      <h3>Package</h3>
      <p><strong>${pkg}</strong></p>

      ${
        isWeightOrder
          ? `<p><strong>Weight (kg):</strong> ${Number(form.weightKg).toFixed(
              2
            )}</p>`
          : ""
      }

      ${
        baseItems.length
          ? `
      <h3>Base Items</h3>
      <ul>${baseItems.map((b: string) => `<li>${b}</li>`).join("")}</ul>`
          : ""
      }

      ${
        steps.length
          ? `
      <h3>Selections</h3>
      ${steps
        .map(
          (s: any) => `
          <p>
            <strong>${s.title}</strong><br/>
            ${s.selections?.length ? s.selections.join(", ") : "—"}
          </p>`
        )
        .join("")}`
          : ""
      }

      <h3>Eco Option</h3>
      <p>${includeEcoSet ? "✅ Yes (+$0.99/person)" : "❌ No"}</p>

      <h3>Pricing Summary</h3>
      <p>
        ${
          isWeightOrder
            ? ""
            : `Per Person: <strong>$${Number(perPerson || 0).toFixed(
                2
              )}</strong><br/>`
        }
        Subtotal: $${Number(subtotal || 0).toFixed(2)}<br/>
        <strong>Total: $${Number(grandTotal || 0).toFixed(2)}</strong>
      </p>

      <h3>Client Info</h3>
      <p>
        <strong>Name:</strong> ${form.fullName || "—"}<br/>
        <strong>Phone:</strong> ${form.phone || "—"}<br/>
        <strong>Email:</strong> ${form.email || "—"}<br/>
        <strong>Event Type / Location:</strong> ${form.eventType || "—"}<br/>
        <strong>Date of Event:</strong> ${form.date || "—"}<br/>
        <strong>Party Size:</strong> ${form.partySize ?? "—"}<br/>
        <strong>Message:</strong> ${form.message || "—"}
      </p>
    `;

    // Try 465 (SSL) first, then fall back to 587 (STARTTLS) if needed
    const smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true", // 465=true, 587=false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Gmail App Password if using Gmail
      },
    };

    let transporter = nodemailer.createTransport(smtpConfig);
    try {
      await transporter.verify();
    } catch {
      // fallback to STARTTLS/587
      transporter = nodemailer.createTransport({
        ...smtpConfig,
        port: 587,
        secure: false,
        requireTLS: true,
      });
      await transporter.verify();
    }

    const toEmail =
      process.env.CATERING_TO_EMAIL || "akhilsinghrana729@gmail.com";
    const fromEmail =
      process.env.CATERING_FROM_EMAIL || process.env.SMTP_USER || toEmail;

    await transporter.sendMail({
      from: `"Veg Thali Club Catering" <${fromEmail}>`,
      to: toEmail,
      subject: `🥗 New Catering Request — ${pkg} — ${
        form.fullName || "Unknown"
      }`,
      html,
      replyTo: form.email || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Email send failed:", err);
    return NextResponse.json(
      { success: false, message: err?.message, stack: err?.stack },
      { status: 500 }
    );
  }
}
