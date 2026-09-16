require("dotenv").config();
const nodemailer = require("nodemailer");
const contacts = require("./contacts");

// ─── YOUR EMAIL CONTENT ───────────────────────────────────────────────────────
// {name} is replaced with the recipient's first name automatically
const emailBody = `Hi {name},

Hakuna Matata!

Cheers,
Garvit`;
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendEmails() {
  console.log(`\nSending to ${contacts.length} recipients...\n`);

  for (const contact of contacts) {
    const personalizedBody = emailBody.replace("{name}", contact.name);

    const mailOptions = {
      from: `Garvit <${process.env.GMAIL_USER}>`,
      to: contact.email,
      subject: process.env.EMAIL_SUBJECT,
      text: personalizedBody,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅  Sent to ${contact.name} <${contact.email}>`);
    } catch (err) {
      console.error(`❌  Failed for ${contact.name} <${contact.email}>: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

sendEmails();
