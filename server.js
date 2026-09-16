require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Embed logo as base64 so email clients always show it
const logoPath = path.join(__dirname, "public", "logo.png");
const logoBase64 = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
  : null;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Build the HTML email template
function buildHTML({ name, body, highlightTitle, highlightBody, buttonText, buttonUrl }) {
  // Convert plain text body paragraphs to <p> tags
  const bodyHtml = body
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p style="margin:0 0 10px 0;">${line}</p>`)
    .join("");

  const highlightBlock = (highlightTitle || highlightBody) ? `
    <div style="border-left:4px solid #a855f7; background:#faf5ff; padding:14px 18px; margin:20px 0; border-radius:0 6px 6px 0;">
      ${highlightTitle ? `<p style="margin:0 0 6px 0; font-weight:bold; color:#7c3aed; font-size:15px;">${highlightTitle}</p>` : ""}
      ${highlightBody ? `<p style="margin:0 0 12px 0; color:#374151; font-size:13px;">${highlightBody}</p>` : ""}
      ${buttonText && buttonUrl ? `
        <a href="${buttonUrl}" style="display:inline-block; background:#a855f7; color:#fff; padding:10px 22px; border-radius:5px; text-decoration:none; font-size:13px; font-weight:bold;">${buttonText}</a>
      ` : ""}
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Banner -->
        <tr>
          <td style="background:#000; padding:28px 40px; text-align:center;">
            ${logoBase64
              ? `<img src="${logoBase64}" alt="AI ML Club" style="max-height:240px; max-width:100%; display:inline-block;" />`
              : `<div style="font-size:42px;font-weight:900;color:#fff;font-family:Arial,sans-serif;line-height:1;letter-spacing:-1px;"><span style="color:#a855f7;">ai</span> ml</div>
                 <div style="color:#9ca3af;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-top:6px;">AI &amp; Machine Learning Club</div>`
            }
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px; color:#111; font-size:14px; line-height:1.7;">
            <p style="margin:0 0 16px 0; font-size:14px; color:#374151;">Dear <strong>${name}</strong>,</p>

            ${bodyHtml}

            ${highlightBlock}

            <p style="margin:20px 0 0 0; font-size:14px; color:#374151;">
              Best regards,<br/>
              <strong>Team AI ML Club</strong><br/>
              <span style="color:#6b7280; font-size:12px;">Rishihood University</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:14px 40px; text-align:center;">
            <p style="margin:0; font-size:11px; color:#9ca3af; letter-spacing:1px;">
              AI ML CLUB &nbsp;|&nbsp; RISHIHOOD UNIVERSITY &nbsp;|&nbsp; ${process.env.GMAIL_USER}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Send emails endpoint
app.post("/api/send", async (req, res) => {
  const { contacts, subject, body, highlightTitle, highlightBody, buttonText, buttonUrl } = req.body;

  if (!contacts || contacts.length === 0) {
    return res.status(400).json({ error: "No contacts provided" });
  }

  const results = [];

  for (const contact of contacts) {
    const personalizedBody = body.replace(/\{name\}/gi, contact.name);

    const html = buildHTML({
      name: contact.name,
      body: personalizedBody,
      highlightTitle,
      highlightBody,
      buttonText,
      buttonUrl,
    });

    try {
      await transporter.sendMail({
        from: `AI ML Club <${process.env.GMAIL_USER}>`,
        to: contact.email,
        subject: subject,
        html: html,
        // plain text fallback
        text: `Dear ${contact.name},\n\n${personalizedBody}\n\nBest regards,\nTeam AI ML Club`,
      });
      results.push({ name: contact.name, email: contact.email, status: "sent" });
    } catch (err) {
      results.push({ name: contact.name, email: contact.email, status: "failed", error: err.message });
    }
  }

  res.json({ results });
});

// Get sender info
app.get("/api/config", (req, res) => {
  res.json({ sender: process.env.GMAIL_USER });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀  Email service running at http://localhost:${PORT}\n`);
});
