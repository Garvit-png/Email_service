require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

// Embed logo as base64 so email clients always show it
const logoPath = path.join(__dirname, "public", "logo.png");
const logoExists = fs.existsSync(logoPath);

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
  // Convert plain text body to HTML — bold (**text**) and line breaks
  const toHtml = (text) => text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // convert **bold** to <strong>
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return `<p style="margin:0 0 10px 0; color:#374151; font-size:14px; line-height:1.7;">${line}</p>`;
    })
    .join("");

  const bodyHtml = toHtml(body);

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
            ${logoExists
              ? `<img src="cid:logo" alt="AIRIS" style="max-height:240px; max-width:100%; display:inline-block;" />`
              : `<div style="font-size:42px;font-weight:900;color:#fff;font-family:Arial,sans-serif;line-height:1;letter-spacing:-1px;"><span style="color:#a855f7;">AIRIS</span></div>`
            }
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px; color:#111; font-size:14px; line-height:1.7;">

            <p style="margin:0 0 16px 0; font-size:14px; color:#374151;">Dear <strong>${name}</strong>,</p>

            ${bodyHtml}

            ${highlightBlock}

            <!-- Regards -->
            <p style="margin:28px 0 4px 0; font-size:14px; color:#374151;"><strong>Best regards,</strong></p>
            <p style="margin:0 0 2px 0; font-size:15px; font-weight:bold; color:#111;">Japinder Kaur</p>
            <p style="margin:0; font-size:13px; color:#6b7280;">General Secretary (AIRIS)</p>

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
        text: `Dear ${contact.name},\n\n${personalizedBody}\n\nBest regards,\nJapinder Kaur\nGeneral Secretary (AIRIS)`,
        attachments: logoExists ? [{
          filename: "logo.png",
          path: logoPath,
          cid: "logo",  // referenced as cid:logo in the HTML
        }] : [],
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












