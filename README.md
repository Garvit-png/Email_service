# Email Service

Sends personalized emails to a list of people — each one gets a greeting with their own name (e.g. "Hi Garvit," or "Hi Riyansh,").

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get a Gmail App Password
You can't use your regular Gmail password. You need an **App Password**:
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and your device
3. Copy the generated 16-character password

### 3. Fill in `.env`
Open `.env` and set:
```
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_SUBJECT=Your subject line here
```

---

## Usage

### Step 1 — Add your contacts in `contacts.js`
```js
const contacts = [
  { name: "Garvit", email: "garvit@gmail.com" },
  { name: "Riyansh", email: "riyansh@gmail.com" },
];
```

### Step 2 — Write your message in `send.js`
Find the `emailBody` variable and write your message. Use `{name}` where you want the person's name:
```
Hi {name},

Your message here...
```

### Step 3 — Send!
```bash
npm run send
```

You'll see a log like:
```
Sending to 3 recipients...

✅  Sent to Garvit <garvit@gmail.com>
✅  Sent to Riyansh <riyansh@gmail.com>

Done!
```
