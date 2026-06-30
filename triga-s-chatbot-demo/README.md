# TRIGA-S Chatbot Demo

Isolated B2B chatbot demo for TRIGA-S GmbH sales presentations.
Standalone — no connection to the AFA website, no shared code.

---

## Quick Start

**Open the demo locally:**

```
triga-s-chatbot-demo/index.html
```

Double-click the file in your file explorer — it opens directly in any browser.
No server, no build step, no dependencies.

**Or serve via local server** (optional — needed for `fetch()` in some browsers):

```bash
# From the project root:
node serve.mjs
# Then open: http://localhost:3000/triga-s-chatbot-demo/index.html
```

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Demo page — TRIGA-S inspired layout with hero, stats, services, contact |
| `styles.css` | Page styles — TRIGA-S color palette, laboratory aesthetic, responsive |
| `triga-s-chatbot.js` | Self-contained chatbot widget — injects its own CSS and HTML |
| `README.md` | This file |

---

## Chatbot Features

- Floating launcher button (bottom-right, blue, yellow accent dot)
- Smooth open/close animation
- First message + 6 topic quick replies on open
- 9 conversation paths (IVD study, CDx/Pharma, Sample Management, Biostatistics, Study Management, Contract Analytics, Clinical Supply, Regulatory, General)
- Keyword detection for free-text routing
- Knowledge base (16+ questions answered: CDx, CRO, IVD, IVDR, ISO 13485, pricing, contact, etc.)
- Qualification questions (2–4 per topic)
- Step-by-step lead capture (first name, last name, email, company, role, phone, website, callback preference)
- Email validation
- Optional fields with "Nein" skip
- Lead payload logged to browser console (DevTools → Console)
- Confirmation message + summary card
- Reset button ("Neue Anfrage starten")
- Mobile responsive (full-width on small screens)

---

## Connect a Real Webhook

Open `triga-s-chatbot.js` and set line 1 of the configuration section:

```javascript
const TRIGAS_LEAD_WEBHOOK_URL = '';
```

Change it to the n8n (or other) webhook URL:

```javascript
const TRIGAS_LEAD_WEBHOOK_URL = 'https://your-webhook-url.com/webhook/triga-s-lead';
```

The chatbot will POST this payload as JSON:

```json
{
  "source": "TRIGA-S Demo Chatbot",
  "company_context": "TRIGA-S GmbH",
  "first_name": "",
  "last_name": "",
  "email": "",
  "phone": "",
  "company": "",
  "role": "",
  "selected_topic": "",
  "project_description": "",
  "timeline": "",
  "callback_requested": false,
  "website": "",
  "notes": "",
  "created_at": ""
}
```

If the URL is empty, the chatbot simulates success and logs the payload to the console.

---

## View Lead Payload in Console (Demo)

1. Open `index.html` in Chrome or Firefox
2. Open DevTools → **Console** tab (F12)
3. Complete the chatbot flow
4. See the full structured lead payload printed under `[TRIGA-S Chatbot] ─── Lead Payload ───`

---

## Temporary Browser Injection (Show on Real Website)

To demonstrate the chatbot on the real TRIGA-S website **only in your browser**:

1. Open https://triga-s.de/ in Chrome
2. Open DevTools → **Console** tab
3. Paste this snippet and press Enter:

```javascript
var s = document.createElement('script');
s.src = 'https://YOUR-HOSTING-URL/triga-s-chatbot.js';
document.body.appendChild(s);
```

Replace `YOUR-HOSTING-URL` with wherever you host the file (e.g. a temp CDN, GitHub Pages, or ngrok tunnel).

The chatbot appears instantly in your browser only.
When the page is refreshed, it disappears — no changes to the real website.

---

## Real Installation (When TRIGA-S Buys)

If TRIGA-S purchases the chatbot, their web agency can install it on their existing website with one line — no rebuild required.

**Add to `<head>` or before `</body>` on triga-s.de:**

```html
<script src="https://www.afa-ai.com/triga-s-chatbot-widget.js" async></script>
```

This works via:
- Direct code insertion by their web agency
- CMS header/footer injection (WordPress, TYPO3, etc.)
- Google Tag Manager custom HTML tag
- Any other method that injects a `<script>` tag

**No framework required. No rebuild. No backend changes.**

The chatbot injects itself — it creates its own CSS, HTML, and event handlers.
Setting the webhook URL connects it to their n8n or CRM pipeline.

---

## Safety

This demo is **fully isolated**:

- No connection to the AFA website
- No changes to AFA's `package.json`, components, or pages
- No git commits or pushes
- No global registration
- Runs entirely in `triga-s-chatbot-demo/`

---

## TRIGA-S Brand Colors Used

| Token | Hex |
|---|---|
| Primary Blue | `#005BAA` |
| Dark Blue | `#003F7D` |
| Deep Navy | `#102A43` |
| Accent Yellow | `#F4C542` |
| Lab Grey | `#F5F8FA` |
| Soft Blue Grey | `#EAF1F7` |
| Border Grey | `#D9E2EC` |
| Body Text | `#243447` |
| Muted Text | `#667085` |
