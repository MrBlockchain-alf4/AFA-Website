# TRIGA-S n8n-Ready Email Templates

All 9 templates are in `email-templates/triga-s/n8n-ready/`. Copy the HTML content into each n8n Send Email node's "Message" field (HTML mode).

---

## Quick Reference

| # | File | n8n Node TO | Subject |
|---|---|---|---|
| 1 | `trigas_anfrage_bestaetigung_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Vielen Dank für Ihre Anfrage bei TRIGA-S` |
| 2 | `trigas_anfrage_intern_n8n.html` | `info@afa-ai.com` | `Neue TRIGA-S Chatbot-Anfrage – {{ $('leadId').first().json.interesse \|\| ... \|\| 'Allgemein' }}` |
| 3 | `trigas_frage_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Chatbot-Frage zur Prüfung – {{ $('leadId').first().json.frage_kategorie \|\| ... }}` |
| 4 | `trigas_termin_bestaetigung_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihre Projektberatung mit TRIGA-S wurde bestätigt` |
| 5 | `trigas_termin_erinnerung_24h_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt` |
| 6 | `trigas_termin_erinnerung_24h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Termin morgen – {{ $('leadId').first().json.vollstaendiger_name \|\| ... }} ({{ $('leadId').first().json.termin_datum \|\| ... }} {{ $('leadId').first().json.termin_uhrzeit \|\| ... }})` |
| 7 | `trigas_termin_erinnerung_1h_intern_n8n.html` | `info@afa-ai.com` | `TRIGA-S Meeting in 1 Stunde – {{ $('leadId').first().json.vollstaendiger_name \|\| ... }} ({{ $('leadId').first().json.termin_uhrzeit \|\| ... }})` |
| 8 | `trigas_termin_verschoben_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihr TRIGA-S Termin wurde verschoben – Neue Termindetails` |
| 9 | `trigas_termin_storniert_kunde_n8n.html` | `{{ $('leadId').first().json.email \|\| ... }}` | `Ihr TRIGA-S Termin wurde storniert` |

See the comment at the top of each HTML file for the exact TO and Subject expressions.

---

## Image URLs (hardcoded in all templates — no placeholders)

Both images are hosted at the production domain. **Before testing in Gmail, verify both URLs load in a browser:**

- `https://www.afa-ai.com/triga-s-email/trigas-full-logo-white.png`
- `https://www.afa-ai.com/triga-s-email/trigas-lines.png`

If either returns 404, the file is not deployed yet and Gmail will show a broken image.

| Image | URL | HTML img |
|---|---|---|
| Logo (white) | `https://www.afa-ai.com/triga-s-email/trigas-full-logo-white.png` | `<img src="..." width="170" alt="TRIGA-S" style="display:block;border:0;width:170px;max-width:170px;height:auto;">` |
| Lines (decorative) | `https://www.afa-ai.com/triga-s-email/trigas-lines.png` | `<img src="..." width="220" alt="" style="display:block;border:0;width:220px;max-width:220px;height:auto;opacity:0.28;">` |

**Gmail-safe implementation used in all templates:**
- Logo: real `<img>` tag, left-aligned, `width="170"`, no `position:absolute`, no `margin-left:-12px`
- Lines: real `<img>` tag in a right-aligned `<td>`, `width="220"`, no `position:absolute`, no `background-image`
- Both images use absolute HTTPS URLs — no local paths, no `/triga-s-email/...` relative paths
- On mobile (`max-width:640px`), the lines column is hidden via `.hm{display:none!important}`

Source files (already copied to `public/triga-s-email/`):
- `email-templates/triga-s/assets/trigas-full-logo-white.png` → `public/triga-s-email/trigas-full-logo-white.png`
- `email-templates/triga-s/assets/trigas-lines.png` → `public/triga-s-email/trigas-lines.png`

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
| Frage-Kategorie | `$ld.frage_kategorie` | `$ld["Frage-Kategorie"]` / `$wb?.frage_kategorie` | `''` |
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
| Interne Notizen | `$ld.interne_notizen` | `$ld["Interne Notizen"]` | `''` |

---

## How to Use in n8n

1. Open the Send Email node in n8n
2. Set **To** using the expression from the `<!-- TO: -->` comment at the top of each HTML file
3. Set **Subject** using the expression from the `<!-- n8n Subject: -->` comment at the top of each HTML file
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

- [ ] `public/triga-s-email/trigas-full-logo-white.png` is deployed and reachable at `https://www.afa-ai.com/triga-s-email/trigas-full-logo-white.png`
- [ ] `public/triga-s-email/trigas-lines.png` is deployed and reachable at `https://www.afa-ai.com/triga-s-email/trigas-lines.png`
- [ ] All 9 HTML files pasted into the correct n8n nodes (HTML mode)
- [ ] `leadId` Set node outputs all required fields listed in the variable mapping above
- [ ] Google Sheets Telefon column uses the apostrophe fix (see `N8N_NODE_VALUES.md`)
- [ ] Test email verified in Gmail for each node — logo and lines image visible
- [ ] Customer emails show Vorname, Nachname, Unternehmen, Interesse, Nachricht correctly
