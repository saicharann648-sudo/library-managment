// api/send-otp.js — Vercel serverless function (Node.js runtime)
// Generates a 6-digit OTP, emails it to the admin, returns a base64 token.
// Requires env vars: GMAIL_USER, GMAIL_APP_PASSWORD

import nodemailer from "nodemailer";

/** The one address that always receives the OTP */
const ADMIN_EMAIL = "saicharann648@gmail.com";

export default async function handler(req, res) {
  // ── CORS headers ────────────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // ── Check env vars are set ──────────────────────────────────────────────────
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      error: "Email service not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to Vercel environment variables.",
    });
  }

  // ── Generate OTP ────────────────────────────────────────────────────────────
  const otp       = String(Math.floor(100000 + Math.random() * 900000));
  const timestamp = Date.now();

  // ── Send email ──────────────────────────────────────────────────────────────
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"School Library System" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: "🔑 Your Library Login OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:460px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:#2563eb;border-radius:12px;padding:14px 20px;margin-bottom:12px;">
              <span style="font-size:28px;">📚</span>
            </div>
            <h2 style="margin:0;color:#f1f5f9;font-size:20px;">School Library System</h2>
            <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Password Reset — One-Time Password</p>
          </div>

          <div style="background:#1e293b;border-radius:12px;padding:28px;text-align:center;border:1px solid #334155;">
            <p style="margin:0 0 20px;color:#cbd5e1;font-size:14px;">Your OTP is:</p>
            <div style="font-size:44px;font-weight:700;letter-spacing:14px;color:#3b82f6;font-family:monospace;padding:8px 0;">
              ${otp}
            </div>
            <div style="margin-top:20px;padding:12px;background:#0f172a;border-radius:8px;">
              <p style="margin:0;color:#f59e0b;font-size:13px;">⏱ Expires in <strong>10 minutes</strong></p>
            </div>
          </div>

          <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;line-height:1.6;">
            If you didn't request this OTP, you can safely ignore this email.<br/>
            Do not share this code with anyone.
          </p>
        </div>
      `,
    });

    // Encode otp + timestamp so the client can verify without another round-trip
    // (base64 is NOT encryption — acceptable for a school-level project)
    const token = Buffer.from(`${otp}:${timestamp}`).toString("base64");

    return res.status(200).json({ token });
  } catch (err) {
    console.error("OTP email error:", err.message);
    return res.status(500).json({ error: "Failed to send OTP email. Check Gmail credentials." });
  }
}
