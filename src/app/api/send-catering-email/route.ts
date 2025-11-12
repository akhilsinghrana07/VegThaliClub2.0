import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs"; // important: not edge
export const dynamic = "force-dynamic";

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

    /* ----------------- HTML EMAIL TEMPLATE ----------------- */
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
          ? `<h3>Base Items</h3><ul>${baseItems
              .map((b: string) => `<li>${b}</li>`)
              .join("")}</ul>`
          : ""
      }

      ${
        steps.length
          ? `<h3>Selections</h3>${steps
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

    /* ----------------- ENV VALIDATION ----------------- */
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
      process.env;

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error(
        "SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in environment variables."
      );
    }

    /* ----------------- SMTP CONFIG ----------------- */
    const baseConfig = {
      host: SMTP_HOST || "smtp.gmail.com",
      port: Number(SMTP_PORT || 465),
      secure: String(SMTP_SECURE || "true") === "true", // SSL by default
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    };

    let transporter = nodemailer.createTransport(baseConfig);

    try {
      await transporter.verify();
    } catch (err) {
      console.warn("SSL verification failed. Retrying with STARTTLS...");
      transporter = nodemailer.createTransport({
        ...baseConfig,
        port: 587,
        secure: false,
        requireTLS: true,
      });
      await transporter.verify();
    }

    /* ----------------- SEND EMAIL ----------------- */
    const toEmail = process.env.CATERING_TO_EMAIL || SMTP_USER;
    const fromEmail = process.env.CATERING_FROM_EMAIL || SMTP_USER;

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
      {
        success: false,
        message: err?.message || "Email send failed",
        stack: err?.stack,
      },
      { status: 500 }
    );
  }
}
