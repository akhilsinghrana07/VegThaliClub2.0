import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      package: pkg,
      baseItems,
      steps,
      includeEcoSet,
      perPerson,
      subtotal,
      grandTotal,
      form,
    } = body;

    const html = `
      <h2>🍽️ New Catering Request</h2>
      <h3>Package</h3>
      <p><strong>${pkg}</strong></p>

      <h3>Base Items</h3>
      <ul>${baseItems.map((b: string) => `<li>${b}</li>`).join("")}</ul>

      <h3>Selections</h3>
      ${steps
        .map(
          (s: any) => `
          <p>
            <strong>${s.title}</strong><br/>
            ${s.selections?.length ? s.selections.join(", ") : "—"}
          </p>`
        )
        .join("")}

      <h3>Eco Option</h3>
      <p>${includeEcoSet ? "✅ Yes (+$0.99/person)" : "❌ No"}</p>

      <h3>Pricing Summary</h3>
      <p>
        Per Person: <strong>$${Number(perPerson).toFixed(2)}</strong><br/>
        Subtotal: $${Number(subtotal).toFixed(2)}<br/>
        <strong>Total: $${Number(grandTotal).toFixed(2)}</strong>
      </p>

      <h3>Client Info</h3>
      <p>
        <strong>Name:</strong> ${form.fullName}<br/>
        <strong>Phone:</strong> ${form.phone}<br/>
        <strong>Email:</strong> ${form.email}<br/>
        <strong>Event Type / Location:</strong> ${form.eventType}<br/>
        <strong>Date of Event:</strong> ${form.date}<br/>
        <strong>Party Size:</strong> ${form.partySize}<br/>
        <strong>Message:</strong> ${form.message || "—"}
      </p>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toEmail =
      process.env.CATERING_TO_EMAIL || "akhilsinghrana729@gmail.com";
    const fromEmail =
      process.env.CATERING_FROM_EMAIL || process.env.SMTP_USER || toEmail;

    await transporter.verify();
    await transporter.sendMail({
      from: `"Veg Thali Club Catering" <${fromEmail}>`,
      to: toEmail,
      subject: `🥗 New Catering Request — ${pkg} — ${form.fullName}`,
      html,
    });

    console.log("✅ Catering email sent successfully.");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Email send failed:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
