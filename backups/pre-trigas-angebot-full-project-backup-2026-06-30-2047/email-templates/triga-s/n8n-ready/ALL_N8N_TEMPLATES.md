# TRIGA-S n8n-Ready Email Templates

All 11 templates (12 files) are in `email-templates/triga-s/n8n-ready/`. Copy the HTML content into each n8n Send Email node's "Message" field (HTML mode).

---

## Quick Reference

| # | File | n8n Node TO | Subject |
|---|---|---|---|
| 1 | `trigas_anfrage_bestaetigung_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Vielen Dank für Ihre Anfrage` |
| 2 | `trigas_anfrage_intern_n8n.html` | `info@afa-ai.com` | `Neue TRIGA-S Chatbot-Anfrage – {{ interesse }}` |
| 3 | `trigas_frage_intern_n8n.html` | `info@afa-ai.com` | `Neue TRIGA-S Chatbot-Frage – Prüfung erforderlich` |
| 4 | `trigas_termin_bestaetigung_kunde_n8n.html` | `{{ $node["Edit Fields3"].json.email \|\| '' }}` | `Ihre Projektberatung mit TRIGA-S wurde bestätigt` |
| 5 | `trigas_termin_erinnerung_24h_kunde_n8n.html` | `{{ $node["Edit Fields3"].json.email \|\| '' }}` | `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt` |
| 6 | `trigas_termin_erinnerung_24h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Termin morgen – {{ $node["Edit Fields3"].json.vorname }} {{ $node["Edit Fields3"].json.nachname }} ({{ $node["Edit Fields3"].json.terminDatumZeit }})` |
| 7 | `trigas_termin_erinnerung_1h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Meeting in 1 Stunde – {{ $node["Edit Fields3"].json.vorname }} {{ $node["Edit Fields3"].json.nachname }} ({{ $node["Edit Fields3"].json.terminDatumZeit }})` |
| 8 | `trigas_termin_verschoben_kunde_n8n.html` | `{{ $('Code in JavaScript6').first().json.email }}` | `Ihr TRIGA-S Termin wurde verschoben` |
| 9 | `trigas_termin_storniert_kunde_n8n.html` | `{{ $node["Edit Fields3"].json.email \|\| '' }}` | `Ihr TRIGA-S Termin wurde storniert` |
| 10 | `trigas_termin_bestaetigung_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Neuer Termin – {{ vorname }} {{ nachname }} ({{ terminDatumZeit }})` |
| 11 | `trigas_termin_verschoben_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Termin verschoben – {{ vorname \|\| name }} → {{ new_termin_formatted }}` |

See the comment at the top of each HTML file for the exact TO and Subject expressions.

---

## Header Images (one fixed PNG per template)

Each template uses a **single pre-rendered PNG** for the entire header section (navy background + TRIGA-S logo + lines overlay + badge + title + yellow accent line). Gmail cannot reorder or break elements inside a single `<img>` tag.

Header images are hosted at `https://www.afa-ai.com/triga-s-email/headers/` (deployed via Vercel from `public/triga-s-email/headers/`). **Verify each URL loads in a browser before testing in Gmail:**

| Template | Header Image URL | Dimensions | Size |
|---|---|---|---|
| #1 Anfrage Bestätigung Kunde | `https://www.afa-ai.com/triga-s-email/headers/anfrage-bestaetigung-kunde.png` | 680×244px | 27.4 KB |
| #2 Anfrage Intern | `https://www.afa-ai.com/triga-s-email/headers/anfrage-intern.png` | 680×224px | 23 KB |
| #3 Frage Intern | `https://www.afa-ai.com/triga-s-email/headers/frage-intern.png` | 680×251px | 24.8 KB |
| #4 Termin Bestätigung Kunde | `https://www.afa-ai.com/triga-s-email/headers/termin-bestaetigung-kunde.png` | 680×224px | 23 KB |
| #5 Erinnerung 24h Kunde | `https://www.afa-ai.com/triga-s-email/headers/termin-erinnerung-24h-kunde.png` | 680×224px | 22.4 KB |
| #6 Erinnerung 24h Intern | `https://www.afa-ai.com/triga-s-email/headers/termin-erinnerung-24h-intern.png` | 680×251px | 24.4 KB |
| #7 Erinnerung 1h Intern | `https://www.afa-ai.com/triga-s-email/headers/termin-erinnerung-1h-intern.png` | 680×252px | 25.1 KB |
| #8 Termin verschoben Kunde | `https://www.afa-ai.com/triga-s-email/headers/termin-verschoben-kunde.png` | 680×224px | 23.2 KB |
| #9 Termin storniert Kunde | `https://www.afa-ai.com/triga-s-email/headers/termin-storniert-kunde.png` | 680×224px | 22.6 KB |

**Header image spec:** 680px wide, 1x pixel density (22–27 KB each). Fixed `width` + `height` attributes let Gmail reserve the exact space immediately, reducing layout shift while the image loads.

**What is NOT in the header image:** dynamic data (dates, times, names) — these appear in the email body data tables below the header image.

**Header structure in each template (optimized for Gmail fast-load):**
```html
<tr>
  <td style="padding:0;margin:0;line-height:0;font-size:0;background-color:#003B70;">
    <img src="https://www.afa-ai.com/triga-s-email/headers/[template].png"
         width="680" height="[exact-height]" alt="TRIGA-S" draggable="false"
         style="display:block;width:680px;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;background-color:#003B70;cursor:default;">
  </td>
</tr>
```

- `background-color:#003B70` on the `<td>` shows the TRIGA-S blue immediately while the image loads — no white flash
- `width` + `height` attributes allow Gmail to reserve layout space before the image arrives
- No `position:absolute`, `background-image`, `flex`, `grid`, or `width:100%` in the header

---

## Critical: n8n Expression Pattern

> **⚠️ Path-specific node rule — read before pasting any template into n8n:**
>
> The n8n workflow has **three separate branches** with different data source nodes:
>
> | Workflow path | Data source node | Use in templates |
> |---|---|---|
> | Lead / Anfrage (chatbot) | `leadId` Set node | Templates #1, #2, #3 only |
> | Termin / Buchung (booking) | `Edit Fields3` node | Templates #4–#10 |
> | Termin verschieben (`TrigaS-termin-verschieben-auto`) | `Code in JavaScript6` node | Templates #8, #11 |
>
> **`leadId` is not executed in the booking path. `Edit Fields3` is not executed in the reschedule path.**
> Referencing the wrong node causes: *Node "X" hasn't been executed* at runtime.

**For the lead/anfrage path (templates #1–#3),** use the 3-tier fallback chain:

```
$('leadId').first().json.field
  || $('leadId').first().json.body?.field
  || $('TrigaS-ChatBot-Lead').first().json.body?.field
  || 'fallback'
```

- `leadId` = Set/Edit node capturing incoming webhook data
- `TrigaS-ChatBot-Lead` = Webhook trigger node
- `body?.field` = when payload arrives nested under `body`

**For the termin/booking path (templates #4–#10),** use:

```
$node["Edit Fields3"].json.fieldName || 'fallback'
```

Fields available in `Edit Fields3`: `vorname, nachname, email, telefon, unternehmen, interesse, terminDatumZeit, meeting_link, hangoutLink, calendar_link, event_id, smsWanted, status, quelle, notizen`

**For the reschedule path (templates #11–#12),** use:

```
$('Code in JavaScript6').first().json.fieldName || 'fallback'
```

Fields available in `Code in JavaScript6`: `email, vorname, nachname, name, telefon, unternehmen, interesse, old_termin_formatted, new_termin_formatted, besprechungslink, kalenderlink, event_id, source, customer_message, notizen, status_update, changed_at`

**Never use `$json.field` alone** — after a Gmail node runs, `$json` contains Gmail API output, not lead data.

---

## Variable Mapping

Abbreviation used below: `$ld` = `$('leadId').first().json`, `$wb` = `$('TrigaS-ChatBot-Lead').first().json.body`

| Field | leadId key | Fallback key | Default |
|---|---|---|---|
| Vorname | `$ld.vorname` | `$wb?.vorname` | `''` |
| Nachname | `$ld.nachname` | `$wb?.nachname` | `''` |
| Vollständiger Name | `$ld.vollstaendiger_name` | `$ld["Vollständiger Name"]` | `vorname + ' ' + nachname` |
| E-Mail | `$ld.email` | `$ld['E-Mail']` / `$wb?.email` | `''` |
| Telefon | `$ld.telefon` | `$ld.Telefon` / `$wb?.telefon` | `''` |
| Unternehmen | `$ld.unternehmen` | `$ld.Unternehmen` / `$wb?.unternehmen` | `''` |
| Position/Funktion | `$ld.position_funktion` | `$ld["Position/Funktion"]` | `''` |
| Interesse | `$ld.interesse` | `$ld.Interesse` / `$wb?.interesse` | `''` |
| Projekttyp | `$ld.projekttyp` | `$ld.Projekttyp` / `$wb?.projekttyp` | `''` |
| Bedarf | `$ld.bedarf` | `$ld.Bedarf` / `$wb?.bedarf` | `''` |
| Nachricht | `$ld.nachricht` | `$ld.Nachricht` / `$wb?.nachricht` | `''` |
| KI-Zusammenfassung | `$ld.ki_zusammenfassung` | `$ld["KI-Zusammenfassung"]` | `''` |
| KI-Antwort | `$ld.ki_antwort` | `$ld["KI-Antwort"]` / `$ld.body?.kiAntwort` | `''` |
| Kategorie | `$ld.kategorie` | `$ld.Kategorie` / `$wb?.kategorie` | `''` |
| Frage | `$ld.frage` | `$ld.Frage` / `$wb?.frage` | `''` |
| Status | `$ld.status` | `$ld.Status` | `'Neu'` |
| Priorität | `$ld.prioritaet` | `$ld["Priorität"]` | `'Mittel'` |
| Termin Datum | `$ld.termin_datum` | `$ld["Termin Datum"]` / `$wb?.termin_datum` | `''` |
| Termin Uhrzeit | `$ld.termin_uhrzeit` | `$ld["Termin Uhrzeit"]` / `$wb?.termin_uhrzeit` | `''` |
| Zeitzone | `$ld.zeitzone` | `$ld.Zeitzone` / `$wb?.zeitzone` | `'Europe/Berlin'` |
| Terminart (Format) | `$ld.terminart` | `$ld.Terminart` / `$wb?.terminart` | `'Online-Meeting'` |
| Besprechungslink | `$ld.besprechungslink` | `$ld.Besprechungslink` / `$wb?.besprechungslink` | `''` |
| Termin Datum Alt | `$ld.termin_datum_alt` | `$ld["Termin Datum Alt"]` / `$wb?.termin_datum_alt` | `''` |
| Termin Uhrzeit Alt | `$ld.termin_uhrzeit_alt` | `$ld["Termin Uhrzeit Alt"]` / `$wb?.termin_uhrzeit_alt` | `''` |
| Notizen | `$ld.notizen` | `$ld.Notizen` / `$wb?.notizen` | `''` |

---

## How to Use in n8n

1. Open the Send Email node in n8n
2. Set **To** using the expression from the `<!-- TO: -->` comment at the top of each HTML file
3. Set **Subject** using the expression from the `<!-- Subject: -->` comment at the top of each HTML file
4. In **Message**, switch to HTML mode
5. Paste the full HTML file content
6. Click **Test node** with a real lead to verify all fields render

---

## Template Types

| Template | Recipient | Ends with |
|---|---|---|
| #1 Anfrage Bestätigung Kunde | Customer email | "Ihr TRIGA-S Team" signature |
| #2 Anfrage Intern | `info@afa-ai.com` | Dark navy action box |
| #3 Frage Intern | `info@afa-ai.com` | Dark navy action box |
| #4 Termin Bestätigung Kunde | Customer email | "Ihr TRIGA-S Team" signature |
| #5 Erinnerung 24h Kunde | Customer email | "Ihr TRIGA-S Team" signature |
| #6 Erinnerung 24h Intern | `info@afa-ai.com` | Dark navy action box |
| #7 Erinnerung 1h Intern | `info@afa-ai.com` | Dark navy action box |
| #8 Termin verschoben Kunde | Customer email | "Ihr TRIGA-S Team" signature |
| #9 Termin storniert Kunde | Customer email | "Ihr TRIGA-S Team" signature |

---

## Production Checklist

- [ ] All 10 header images reachable in browser (`https://www.afa-ai.com/triga-s-email/headers/*.png`) — see table above
- [ ] All 10 HTML files pasted into the correct n8n nodes (HTML mode)
- [ ] `leadId` Set node outputs all required fields (for templates #1–#3 / lead path only)
- [ ] `Edit Fields3` node outputs all required fields (for templates #4–#10 / booking path)
- [ ] Test email verified in Gmail for each node — logo visible
- [ ] Customer termin emails (#4, #5, #8, #9) reference `Edit Fields3`, NOT `leadId`
- [ ] Customer termin emails show Vorname, Unternehmen, Interesse, terminDatumZeit correctly

---

## Paste-Ready HTML for n8n

Copy the HTML block for each template and paste it directly into the n8n Gmail node **Message** field (HTML mode).
Do NOT wrap the entire block in {{ }} — only the dynamic values inside already use {{ }}.

---

**File:** `trigas_anfrage_bestaetigung_kunde_n8n.html`
**Subject:** `Vielen Dank für Ihre Anfrage`
**To:** `{{ $('leadId').first().json.email || $('leadId').first().json['E-Mail'] || $('leadId').first().json.body?.email || $('TrigaS-ChatBot-Lead').first().json.body?.email || '' }}`

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Vielen Dank für Ihre Anfrage – TRIGA-S</title>
  <style>
    body{margin:0;padding:0;background-color:#F4F7FB;-webkit-font-smoothing:antialiased;}
    img{border:0;outline:none;text-decoration:none;display:block;}
    a{color:#005BAA;text-decoration:none;}
    @media only screen and (max-width:640px){
      .ew{width:100%!important;}
      .ep{padding:26px 22px 24px!important;}
      .eh{padding:24px 22px 30px 28px!important;}
      .hm{display:none!important;width:0!important;max-width:0!important;overflow:hidden!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F7FB;">
<tr><td align="center" style="padding:36px 16px 52px;">
  <table class="ew" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;border-radius:14px;overflow:hidden;box-shadow:0 8px 48px rgba(0,30,80,0.13),0 2px 8px rgba(0,0,0,0.06);">
    <!-- HEADER IMAGE -->
    <tr>
      <td style="padding:0;margin:0;line-height:0;font-size:0;background-color:#003B70;">
        <img src="https://www.afa-ai.com/triga-s-email/headers/anfrage-bestaetigung-kunde.png" width="680" height="244" alt="TRIGA-S" draggable="false" style="display:block;width:680px;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;background-color:#003B70;cursor:default;">
      </td>
    </tr>
    <tr>
      <td class="ep" style="background-color:#FFFFFF;padding:36px 40px 32px;">
        <p style="margin:0 0 6px;font-size:15px;color:#1F2933;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Sehr geehrte/r {{ $('leadId').first().json.vorname || $('leadId').first().json.body?.vorname || $('TrigaS-ChatBot-Lead').first().json.body?.vorname || '' }} {{ $('leadId').first().json.nachname || $('leadId').first().json.body?.nachname || $('TrigaS-ChatBot-Lead').first().json.body?.nachname || '' }},</p>
        <p style="margin:0 0 30px;font-size:15px;color:#1F2933;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Ihre Anfrage bei TRIGA-S ist bei uns eingegangen. Unser Team wird Ihre Angaben prüfen und sich zeitnah bei Ihnen melden.</p>
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.14em;padding-left:10px;border-left:2px solid #FFD84A;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Ihre Angaben</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFE;border:1px solid #D9E3EF;border-top:2px solid #003B70;border-radius:8px;margin-bottom:28px;">
          <tr><td style="padding:4px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Unternehmen</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;font-weight:500;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('leadId').first().json.unternehmen || $('leadId').first().json.Unternehmen || $('leadId').first().json.body?.unternehmen || $('TrigaS-ChatBot-Lead').first().json.body?.unternehmen || '' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Interesse</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('leadId').first().json.interesse || $('leadId').first().json.Interesse || $('leadId').first().json.body?.interesse || $('TrigaS-ChatBot-Lead').first().json.body?.interesse || '' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Nachricht</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;line-height:1.65;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('leadId').first().json.nachricht || $('leadId').first().json.Nachricht || $('leadId').first().json.body?.nachricht || $('TrigaS-ChatBot-Lead').first().json.body?.nachricht || '' }}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF5FF;border-left:3px solid #005BAA;border-radius:0 8px 8px 0;margin-bottom:32px;">
          <tr><td style="padding:15px 20px;">
            <p style="margin:0 0 3px;font-size:12.5px;font-weight:700;color:#003B70;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Nächster Schritt</p>
            <p style="margin:0;font-size:13.5px;color:#1F2933;line-height:1.65;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Unser Team prüft Ihre Anfrage und meldet sich in Kürze bei Ihnen. Bei dringenden Rückfragen können Sie uns direkt über unsere Website kontaktieren.</p>
          </td></tr>
        </table>
        <p style="margin:0 0 3px;font-size:14px;color:#667085;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Mit freundlichen Grüßen</p>
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#003B70;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Ihr TRIGA-S Team</p>
        <p style="margin:0;font-size:12px;color:#B0BAC9;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Studies. Services. Solutions.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#003B70;padding:20px 40px;text-align:center;border-radius:0 0 14px 14px;">
        <p style="margin:0 0 3px;color:#FFFFFF;font-size:12.5px;font-weight:700;letter-spacing:0.04em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">TRIGA-S GmbH</p>
        <p style="margin:0 0 2px;color:rgba(255,255,255,0.48);font-size:11.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Mühltal 5, 82392 Habach, Deutschland</p>
        <p style="margin:0;color:rgba(255,255,255,0.30);font-size:11px;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Studies. Services. Solutions.</p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>
```

---

**File:** `trigas_anfrage_intern_n8n.html`
**Subject:** `Neue TRIGA-S Chatbot-Anfrage – {{ $('leadId').first().json.interesse || $('leadId').first().json.Interesse || $('leadId').first().json.body?.interesse || $('TrigaS-ChatBot-Lead').first().json.body?.interesse || '' }}`
**To:** `info@afa-ai.com`

See the file `trigas_anfrage_intern_n8n.html` for the full paste-ready HTML. It includes Kontakt, Projektdetails (11 fields), Nachricht, KI-Zusammenfassung, Notizen sections, and a dark navy action callout.

---

**File:** `trigas_frage_intern_n8n.html`
**Subject:** `Neue TRIGA-S Chatbot-Frage – Prüfung erforderlich`
**To:** `info@afa-ai.com`

See the file `trigas_frage_intern_n8n.html` for the full paste-ready HTML. It includes Kontakt, Gestellte Frage (Kategorie/Interesse/Frage), KI-Antwort, Bearbeitungsstatus, Notizen sections, and a dark navy action callout.

---

**File:** `trigas_termin_bestaetigung_kunde_n8n.html`
**Subject:** `Ihre Projektberatung mit TRIGA-S wurde bestätigt`
**To:** `{{ $node["Edit Fields3"].json.email || '' }}`
**n8n Source Node:** `Edit Fields3`

Paste full file content into the Gmail node "Message" field (HTML mode). Content:
- Greeting: "Ihr Termin ist bestätigt."
- Data table: Datum & Uhrzeit (terminDatumZeit auto-formatted as "Dienstag, 30.06.2026 um 08:00 Uhr"), Thema (interesse), Unternehmen
- **Yellow button** `#FFD84A`, centered, dark navy text: "Google Meet öffnen →" — no raw URL below
- Notizen callout: hidden (`display:none`) when notizen is empty; visible only when notes exist
- No raw Google Meet URL. No Calendar link. No Termin-ID. No technical fields.

---

**File:** `trigas_termin_erinnerung_24h_kunde_n8n.html`
**Subject:** `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt`
**To:** `{{ $node["Edit Fields3"].json.email || '' }}`
**n8n Source Node:** `Edit Fields3`

See the file `trigas_termin_erinnerung_24h_kunde_n8n.html` for the full paste-ready HTML. Data table: Datum & Uhrzeit (terminDatumZeit), Thema (interesse). **Google Meet button:** "Zum Google Meet →" (href: `$node["Edit Fields3"].json.meeting_link || $node["Edit Fields3"].json.hangoutLink || '#'`), raw link shown below.

---

**File:** `trigas_termin_erinnerung_24h_intern_n8n.html`
**Subject:** `TRIGA-S Termin morgen – {{ $node["Edit Fields3"].json.vorname || '' }} {{ $node["Edit Fields3"].json.nachname || '' }} ({{ $node["Edit Fields3"].json.terminDatumZeit || '' }})`
**To:** `info@afa-ai.com`
**n8n Source Node:** `Edit Fields3`

See the file `trigas_termin_erinnerung_24h_intern_n8n.html` for the full paste-ready HTML. Sections: Kontakt (Name/E-Mail/Telefon/Unternehmen), Termindetails (Datum & Uhrzeit/Interesse/Status), Notizen, dark navy callout. **Google Meet button:** "Google Meet öffnen →" (href: `$node["Edit Fields3"].json.meeting_link || $node["Edit Fields3"].json.hangoutLink || '#'`), raw link shown below.

---

**File:** `trigas_termin_erinnerung_1h_intern_n8n.html`
**Subject:** `TRIGA-S Meeting in 1 Stunde – {{ $node["Edit Fields3"].json.vorname || '' }} {{ $node["Edit Fields3"].json.nachname || '' }} ({{ $node["Edit Fields3"].json.terminDatumZeit || '' }})`
**To:** `info@afa-ai.com`
**n8n Source Node:** `Edit Fields3`

See the file `trigas_termin_erinnerung_1h_intern_n8n.html` for the full paste-ready HTML. Kontakt section: Name/E-Mail/Telefon/Unternehmen/Interesse/Datum & Uhrzeit. Dark navy callout "Meeting startet in 1 Stunde." **Google Meet button:** "Google Meet öffnen →" (href: `$node["Edit Fields3"].json.meeting_link || $node["Edit Fields3"].json.hangoutLink || '#'`), raw link shown below.

---

**File:** `trigas_termin_verschoben_kunde_n8n.html`
**Subject:** `Ihr TRIGA-S Termin wurde verschoben`
**To:** `{{ $('Code in JavaScript6').first().json.email }}`
**n8n Source Node:** `Code in JavaScript6` (branch: `TrigaS-termin-verschieben-auto`)

See the file `trigas_termin_verschoben_kunde_n8n.html` for the full paste-ready HTML. Sections: Alter Termin (muted, line-through, `old_termin_formatted`), Neuer Termin (bold, `new_termin_formatted`, Thema, Unternehmen). **Yellow button `#FFD23F`:** "Google Meet öffnen →" (href: `$('Code in JavaScript6').first().json.besprechungslink || '#'`). Notizen: HTML-comment-hidden when empty.

---

**File:** `trigas_termin_storniert_kunde_n8n.html`
**Subject:** `Ihr TRIGA-S Termin wurde storniert`
**To:** `{{ $node["Edit Fields3"].json.email || '' }}`
**n8n Source Node:** `Edit Fields3`

See the file `trigas_termin_storniert_kunde_n8n.html` for the full paste-ready HTML. "Stornierter Termin" table: Datum & Uhrzeit (terminDatumZeit, line-through styling). **Google Meet button:** "Zum Google Meet →" (href: `$node["Edit Fields3"].json.meeting_link || $node["Edit Fields3"].json.hangoutLink || '#'`), raw link shown below. "Neuen Termin vereinbaren" blue callout.

---

---

**File:** `trigas_termin_verschoben_intern_n8n.html`
**Subject:** `TRIGA-S Termin verschoben – {{ $('Code in JavaScript6').first().json.vorname || $('Code in JavaScript6').first().json.name || '' }} → {{ $('Code in JavaScript6').first().json.new_termin_formatted || '' }}`
**To:** `info@afa-ai.com`
**n8n Source Node:** `Code in JavaScript6` (branch: `TrigaS-termin-verschieben-auto`)

See the file `trigas_termin_verschoben_intern_n8n.html` for the full paste-ready HTML. Sections: Kontakt (Name/E-Mail/Telefon/Unternehmen), Terminverschiebung (Alter Termin line-through, Neuer Termin bold, Interesse, Status, Geändert am), Notizen ("Keine Notizen" fallback), **Yellow button `#FFD23F`:** "Google Meet öffnen →". Dark navy callout "Termin wurde verschoben."

---

*Note: For the full inline HTML, open the corresponding .html file in this directory and copy its entire content into the n8n node.*

---

**File:** `trigas_termin_bestaetigung_intern_n8n.html`
**n8n Node:** `Send a message1`
**Subject:** `TRIGA-S Neuer Termin – {{ $('Edit Fields3').first().json.vorname || '' }} {{ $('Edit Fields3').first().json.nachname || '' }} ({{ $('Edit Fields3').first().json.terminDatumZeit || '' }})`
**To:** `info@afa-ai.com`
**n8n Source Node:** `Edit Fields3`

Header image: `https://www.afa-ai.com/triga-s-email/headers/termin-bestaetigung-intern.png` (680×251px, 24.8 KB)
Sections: Kontakt (Name/E-Mail/Telefon/Unternehmen), Termin (Interesse/Datum+Zeit formatted German/Status/Quelle), **Yellow Google Meet button** ("Google Meet öffnen →", centered, `#FFD84A`, dark navy text — no raw URL), Notizen ("Keine Notizen" fallback), dark navy action callout.
**No raw Google Meet URL, Kalenderlink or Termin-ID visible in email body.** Those fields exist in Edit Fields3 data but are intentionally excluded from the visible email.

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>TRIGA-S Neuer Termin – Intern</title>
  <style>
    body{margin:0;padding:0;background-color:#F4F7FB;-webkit-font-smoothing:antialiased;}
    img{border:0;outline:none;text-decoration:none;display:block;}
    a{color:#005BAA;text-decoration:none;}
    @media only screen and (max-width:640px){
      .ew{width:100%!important;}
      .ep{padding:26px 22px 24px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F7FB;">
<tr><td align="center" style="padding:36px 16px 52px;">
  <table class="ew" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width:680px;border-radius:14px;overflow:hidden;box-shadow:0 8px 48px rgba(0,30,80,0.13),0 2px 8px rgba(0,0,0,0.06);">
    <!-- HEADER IMAGE -->
    <tr>
      <td style="padding:0;margin:0;line-height:0;font-size:0;background-color:#003B70;">
        <img src="https://www.afa-ai.com/triga-s-email/headers/termin-bestaetigung-intern.png" width="680" height="251" alt="TRIGA-S" draggable="false" style="display:block;width:680px;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;background-color:#003B70;cursor:default;">
      </td>
    </tr>
    <!-- CONTENT -->
    <tr>
      <td class="ep" style="background-color:#FFFFFF;padding:36px 40px 32px;">
        <!-- SECTION: Kontakt -->
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.14em;padding-left:10px;border-left:2px solid #FFD84A;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Kontakt</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFE;border:1px solid #D9E3EF;border-top:2px solid #003B70;border-radius:8px;margin-bottom:26px;">
          <tr><td style="padding:4px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Name</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;font-weight:500;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ ($('Edit Fields3').first().json.vorname || '') + ' ' + ($('Edit Fields3').first().json.nachname || '') || 'Nicht angegeben' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">E-Mail</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#005BAA;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;"><a href="mailto:{{ $('Edit Fields3').first().json.email || '' }}" style="color:#005BAA;text-decoration:none;">{{ $('Edit Fields3').first().json.email || 'Nicht angegeben' }}</a></td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Telefon</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.telefon || 'Nicht angegeben' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Unternehmen</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;font-weight:500;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.unternehmen || 'Nicht angegeben' }}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <!-- SECTION: Termin -->
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.14em;padding-left:10px;border-left:2px solid #FFD84A;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Termin</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFE;border:1px solid #D9E3EF;border-top:2px solid #003B70;border-radius:8px;margin-bottom:26px;">
          <tr><td style="padding:4px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Interesse</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.interesse || 'Nicht angegeben' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Datum / Zeit</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;font-weight:600;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ (() => { const nd = $('Edit Fields3').first().json; const dt = (nd.terminDatumZeit || nd.appointmentDateTime || '').trim(); const tu = (nd.terminUhrzeit || nd.appointment_time || '').trim(); const W = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']; const z = n => String(n).padStart(2,'0'); if (!dt && !tu) return 'Nicht angegeben'; if (dt && !dt.includes('T') && !dt.includes(' ')) { const [yr,mo,dy] = dt.split('-').map(Number); const wd = W[new Date(Date.UTC(yr,mo-1,dy)).getUTCDay()]; return wd+', '+z(dy)+'.'+z(mo)+'.'+yr+' um '+(tu||'--:--')+' Uhr'; } try { const d = new Date(dt); if (isNaN(d.getTime())) return dt+(tu?' um '+tu+' Uhr':''); const p = new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',weekday:'long',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).formatToParts(d); const g = t => (p.find(x=>x.type===t)||{}).value||''; return g('weekday')+', '+g('day')+'.'+g('month')+'.'+g('year')+' um '+g('hour')+':'+g('minute')+' Uhr'; } catch(e) { return dt+(tu?' um '+tu+' Uhr':''); } })() }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Status</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.status || 'Nicht angegeben' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Quelle</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.quelle || 'Nicht angegeben' }}</td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Google Meet</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#005BAA;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;word-break:break-all;"><a href="{{ $('Edit Fields3').first().json.meeting_link || '' }}" target="_blank" style="color:#005BAA;text-decoration:none;">{{ $('Edit Fields3').first().json.meeting_link || 'Nicht angegeben' }}</a></td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Kalenderlink</td>
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#005BAA;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;word-break:break-all;"><a href="{{ $('Edit Fields3').first().json.calendar_link || '' }}" target="_blank" style="color:#005BAA;text-decoration:none;">{{ $('Edit Fields3').first().json.calendar_link || 'Nicht angegeben' }}</a></td>
              </tr>
              <tr><td colspan="2" style="height:1px;background-color:#D9E3EF;padding:0;font-size:1px;line-height:1px;mso-line-height-rule:exactly;"></td></tr>
              <tr>
                <td style="padding:12px 20px;width:36%;font-size:11px;color:#667085;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Termin-ID</td>
                <td style="padding:12px 20px 12px 0;font-size:12px;color:#667085;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;word-break:break-all;">{{ $('Edit Fields3').first().json.event_id || 'Nicht angegeben' }}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <!-- GOOGLE MEET BUTTON -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
          <tr>
            <td align="center" bgcolor="#005BAA" style="border-radius:7px;">
              <a href="{{ $node['Edit Fields3'].json['meeting_link'] || $node['Edit Fields3'].json['hangoutLink'] || '' }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Google Meet öffnen &rarr;</a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 26px;font-size:11px;color:#B0BAC9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;word-break:break-all;">{{ $node['Edit Fields3'].json['meeting_link'] || $node['Edit Fields3'].json['hangoutLink'] || 'Google Meet Link: Nicht angegeben' }}</p>
        <!-- SECTION: Notizen -->
        <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:0.14em;padding-left:10px;border-left:2px solid #FFD84A;line-height:1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Notizen</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF5FF;border-left:3px solid #005BAA;border-radius:0 8px 8px 0;margin-bottom:28px;">
          <tr><td style="padding:15px 20px;font-size:13.5px;color:#1F2933;line-height:1.65;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.notizen || 'Keine Notizen' }}</td></tr>
        </table>
        <!-- ACTION CALLOUT -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#002B54;border-radius:8px;">
          <tr><td style="padding:17px 24px;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#FFD84A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Bitte Termin prüfen und vorbereiten.</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Automatische Benachrichtigung des TRIGA-S Buchungssystems.</p>
          </td></tr>
        </table>
      </td>
    </tr>
    <!-- FOOTER -->
    <tr>
      <td style="background-color:#003B70;padding:20px 40px;text-align:center;border-radius:0 0 14px 14px;">
        <p style="margin:0 0 3px;color:#FFFFFF;font-size:12.5px;font-weight:700;letter-spacing:0.04em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">TRIGA-S GmbH</p>
        <p style="margin:0 0 2px;color:rgba(255,255,255,0.48);font-size:11.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Mühltal 5, 82392 Habach, Deutschland</p>
        <p style="margin:0;color:rgba(255,255,255,0.30);font-size:11px;font-style:italic;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">Studies. Services. Solutions.</p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>
```
