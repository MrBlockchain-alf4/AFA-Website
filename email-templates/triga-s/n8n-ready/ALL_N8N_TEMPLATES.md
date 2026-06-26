# TRIGA-S n8n-Ready Email Templates

All 9 templates are in `email-templates/triga-s/n8n-ready/`. Copy the HTML content into each n8n Send Email node's "Message" field (HTML mode).

---

## Quick Reference

| # | File | n8n Node TO | Subject |
|---|---|---|---|
| 1 | `trigas_anfrage_bestaetigung_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Vielen Dank für Ihre Anfrage` |
| 2 | `trigas_anfrage_intern_n8n.html` | `info@afa-ai.com` | `Neue TRIGA-S Chatbot-Anfrage – {{ interesse }}` |
| 3 | `trigas_frage_intern_n8n.html` | `info@afa-ai.com` | `Neue TRIGA-S Chatbot-Frage – Prüfung erforderlich` |
| 4 | `trigas_termin_bestaetigung_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihre Projektberatung mit TRIGA-S wurde bestätigt` |
| 5 | `trigas_termin_erinnerung_24h_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt` |
| 6 | `trigas_termin_erinnerung_24h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Termin morgen – {{ vollstaendiger_name }} ({{ termin_datum }} {{ termin_uhrzeit }})` |
| 7 | `trigas_termin_erinnerung_1h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Meeting in 1 Stunde – {{ vollstaendiger_name }} ({{ termin_uhrzeit }})` |
| 8 | `trigas_termin_verschoben_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihr TRIGA-S Termin wurde verschoben – Neue Termindetails` |
| 9 | `trigas_termin_storniert_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihr TRIGA-S Termin wurde storniert` |
| 10 | `trigas_termin_bestaetigung_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Neuer Termin – {{ vorname }} {{ nachname }} ({{ terminDatumZeit }})` |

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

**Never use `$json.field` alone** in templates used by nodes that run AFTER a Gmail node.
After a Gmail node runs, `$json` contains Gmail API output — the original lead data is gone.

**Always use the 3-tier fallback chain:**

```
$('leadId').first().json.field
  || $('leadId').first().json.body?.field
  || $('TrigaS-ChatBot-Lead').first().json.body?.field
  || 'fallback'
```

- `leadId` = Set/Edit node that captures all incoming webhook data
- `TrigaS-ChatBot-Lead` = Webhook trigger node
- `body?.field` = used when the webhook payload arrives nested under `body`

All 9 templates already use this pattern. Do not replace with `$json.field`.

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

- [ ] All 9 header images reachable in browser (`https://www.afa-ai.com/triga-s-email/headers/*.png`) — see table above
- [ ] All 9 HTML files pasted into the correct n8n nodes (HTML mode)
- [ ] `leadId` Set node outputs all required fields listed in the variable mapping above
- [ ] Test email verified in Gmail for each node — logo visible
- [ ] Customer emails show Vorname, Nachname, Unternehmen, Interesse, Nachricht correctly

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
**To:** `{{ $('leadId').first().json.email || $('leadId').first().json['E-Mail'] || $('leadId').first().json.body?.email || $('TrigaS-ChatBot-Lead').first().json.body?.email || '' }}`

See the file `trigas_termin_bestaetigung_kunde_n8n.html` for the full paste-ready HTML. Badge: "Projektberatung". Data table: Datum/Uhrzeit/Zeitzone/Format/Thema/Unternehmen. Includes meeting button and "Ihre Nachricht" blue callout.

---

**File:** `trigas_termin_erinnerung_24h_kunde_n8n.html`
**Subject:** `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt`
**To:** `{{ $('leadId').first().json.email || $('leadId').first().json['E-Mail'] || $('leadId').first().json.body?.email || $('TrigaS-ChatBot-Lead').first().json.body?.email || '' }}`

See the file `trigas_termin_erinnerung_24h_kunde_n8n.html` for the full paste-ready HTML. Badge: "Terminerinnerung". H1: "Ihr Termin ist morgen". Data table: Datum/Uhrzeit/Zeitzone/Format. Meeting button.

---

**File:** `trigas_termin_erinnerung_24h_intern_n8n.html`
**Subject:** `TRIGA-S Termin morgen – {{ $('leadId').first().json.vollstaendiger_name || $('leadId').first().json["Vollständiger Name"] || $('leadId').first().json.body?.vollstaendiger_name || '' }} ({{ $('leadId').first().json.termin_datum || $('leadId').first().json["Termin Datum"] || $('leadId').first().json.body?.termin_datum || '' }} {{ $('leadId').first().json.termin_uhrzeit || $('leadId').first().json["Termin Uhrzeit"] || $('leadId').first().json.body?.termin_uhrzeit || '' }})`
**To:** `info@afa-ai.com`

See the file `trigas_termin_erinnerung_24h_intern_n8n.html` for the full paste-ready HTML. Badge: "Erinnerung · 24h". H1: "Termin morgen". Sections: Kontakt (5 rows), Termindetails (6 rows), Nachricht callout, Meeting button, dark navy callout.

---

**File:** `trigas_termin_erinnerung_1h_intern_n8n.html`
**Subject:** `TRIGA-S Meeting in 1 Stunde – {{ $('leadId').first().json.vollstaendiger_name || $('leadId').first().json["Vollständiger Name"] || $('leadId').first().json.body?.vollstaendiger_name || '' }} ({{ $('leadId').first().json.termin_uhrzeit || $('leadId').first().json["Termin Uhrzeit"] || $('leadId').first().json.body?.termin_uhrzeit || '' }})`
**To:** `info@afa-ai.com`

See the file `trigas_termin_erinnerung_1h_intern_n8n.html` for the full paste-ready HTML. Badge: "Jetzt in 1 Stunde". H1: "Meeting startet gleich". Yellow "JETZT" badge. Kontakt section (5 rows), Meeting button, dark navy callout.

---

**File:** `trigas_termin_verschoben_kunde_n8n.html`
**Subject:** `Ihr TRIGA-S Termin wurde verschoben – Neue Termindetails`
**To:** `{{ $('leadId').first().json.email || $('leadId').first().json['E-Mail'] || $('leadId').first().json.body?.email || $('TrigaS-ChatBot-Lead').first().json.body?.email || '' }}`

See the file `trigas_termin_verschoben_kunde_n8n.html` for the full paste-ready HTML. Badge: "Terminaktualisierung". "Bisheriger Termin" section (muted styling, line-through). "Neuer Termin" section (standard styling). Meeting button.

---

**File:** `trigas_termin_storniert_kunde_n8n.html`
**Subject:** `Ihr TRIGA-S Termin wurde storniert`
**To:** `{{ $('leadId').first().json.email || $('leadId').first().json['E-Mail'] || $('leadId').first().json.body?.email || $('TrigaS-ChatBot-Lead').first().json.body?.email || '' }}`

See the file `trigas_termin_storniert_kunde_n8n.html` for the full paste-ready HTML. Badge: "Stornierung". "Stornierter Termin" table (Datum/Uhrzeit with line-through, Format normal). "Neuen Termin vereinbaren" blue callout.

---

*Note: Templates #2–#9 reference their respective .html files above. For the full inline HTML, open the corresponding file in this directory and copy its entire content into the n8n node.*

---

**File:** `trigas_termin_bestaetigung_intern_n8n.html`
**n8n Node:** `Send a message1`
**Subject:** `TRIGA-S Neuer Termin – {{ $('Edit Fields3').first().json.vorname || '' }} {{ $('Edit Fields3').first().json.nachname || '' }} ({{ $('Edit Fields3').first().json.terminDatumZeit || '' }})`
**To:** `info@afa-ai.com`
**n8n Source Node:** `Edit Fields3`

Header image: `https://www.afa-ai.com/triga-s-email/headers/termin-bestaetigung-intern.png` (680×251px, 24.8 KB)
Badge: "Neuer Termin gebucht" · H1: "Termin eingegangen" · Sections: Kontakt (Name/E-Mail/Telefon/Unternehmen), Termin (Interesse/Datum+Zeit/Status/Quelle/Meet-Link/Kalenderlink/Termin-ID), Notizen · Action callout: "Bitte Termin prüfen und vorbereiten."

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
                <td style="padding:12px 20px 12px 0;font-size:14px;color:#1F2933;font-weight:600;vertical-align:top;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">{{ $('Edit Fields3').first().json.terminDatumZeit || 'Nicht angegeben' }}</td>
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
