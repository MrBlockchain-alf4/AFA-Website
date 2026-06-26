# N8N_NODE_VALUES.md — Exact Node Configuration for TRIGA-S Workflow

Copy these values verbatim into each n8n node's fields.

> **Note on email header image loading:** Email header images are loaded by Gmail as remote images from `https://www.afa-ai.com/triga-s-email/headers/`. This cannot be made completely instant — Gmail fetches external images after the email body structure renders. However, the following optimizations reduce visible loading as much as possible: optimized PNG file size (22–27 KB each), fixed `width` and `height` attributes (Gmail reserves the exact space immediately), and a matching `background-color:#003B70` fallback on the container `<td>` (shows TRIGA-S blue instead of a white flash while the image loads).

---

## Node: TRIGA-S Lead Intern

This node sends the internal notification email for new chatbot leads.
It runs **before** any Gmail node, so `$json` is still the original webhook/Set data.

| Field | Value |
|---|---|
| **To** | `info@afa-ai.com` |
| **Subject** | `Neue TRIGA-S Chatbot-Anfrage – {{ $('leadId').first().json.interesse \|\| $('leadId').first().json.body?.interesse \|\| $('TrigaS-ChatBot-Lead').first().json.body?.interesse \|\| 'Allgemein' }}` |
| **Message** | *(paste full content of `trigas_anfrage_intern_n8n.html`)* |
| **Message type** | HTML |

---

## Node: Anfrage Bestätigung Kunde

This node sends the confirmation email to the customer.
It runs **after** the "TRIGA-S Lead Intern" Gmail node — meaning `$json` at this point contains **Gmail API output**, not lead data.

**All expressions in this template MUST use `$('leadId').first().json` — never `$json` alone.**

| Field | Value |
|---|---|
| **To** | `{{ $('leadId').first().json.email \|\| $('leadId').first().json['E-Mail'] \|\| $('leadId').first().json.body?.email \|\| $('TrigaS-ChatBot-Lead').first().json.body?.email \|\| '' }}` |
| **Subject** | `Vielen Dank für Ihre Anfrage bei TRIGA-S` |
| **Message** | *(paste full content of `trigas_anfrage_bestaetigung_kunde_n8n.html`)* |
| **Message type** | HTML |

---

## Google Sheets: Telefon Column #ERROR Fix

**Problem:** Phone numbers starting with `+49` are interpreted as formula prefixes by Google Sheets, causing `#ERROR`.

**Fix:** Prepend an apostrophe character to force Google Sheets to treat the value as plain text.

### Expression to use in the Google Sheets node (Telefon field):

```
{{ "'" + ($('leadId').first().json.telefon || $('leadId').first().json.Telefon || $('leadId').first().json.body?.telefon || $('TrigaS-ChatBot-Lead').first().json.body?.telefon || '') }}
```

**How it works:**
- The leading `'` (apostrophe) tells Google Sheets: "this is text, not a formula"
- The apostrophe is invisible in the cell — the user sees the phone number normally
- The `||` fallback chain ensures it works regardless of where in the n8n data the phone number lives

**Where to apply:** In the Google Sheets node that writes lead data, find the column mapped to "Telefon" and replace the current expression with the one above.

---

## Image Deployment Verification

**Before testing the real email, open these URLs in the browser:**

- `https://www.afa-ai.com/triga-s-email/trigas-full-logo-white.png`
- `https://www.afa-ai.com/triga-s-email/trigas-lines.png`

If either URL gives 404, the images are not deployed yet and Gmail cannot show them.

The source files exist at:
- `public/triga-s-email/trigas-full-logo-white.png` (45,374 bytes)
- `public/triga-s-email/trigas-lines.png` (981,708 bytes)

These files are served at the root of `https://www.afa-ai.com/` — confirm they are included in the production deployment.

---

## Node Name Reference

| n8n Node Name | Purpose |
|---|---|
| `TrigaS-ChatBot-Lead` | Webhook — receives incoming chatbot form submissions |
| `leadId` | Set/Edit Fields — captures and stores all lead data for downstream nodes |
| `TRIGA-S Lead Intern` | Send Email — internal notification to `info@afa-ai.com` |
| `Anfrage Bestätigung Kunde` | Send Email — customer confirmation (runs AFTER TRIGA-S Lead Intern) |

---

## Why `$json` Fails in "Anfrage Bestätigung Kunde"

n8n nodes only expose **their own output** as `$json`. When a Send Email (Gmail) node runs, `$json` becomes the Gmail API response object (containing `id`, `threadId`, `labelIds`, etc.) — the original webhook payload is gone from `$json`.

To access data from any earlier node, reference it by node name:

```js
$('leadId').first().json.email          // from Set node output
$('leadId').first().json.body?.email    // if Set node preserved nested body
$('TrigaS-ChatBot-Lead').first().json.body?.email  // directly from webhook
```

The `leadId` Set node was designed as the single source of truth — all downstream nodes should read from it, not from `$json`.
