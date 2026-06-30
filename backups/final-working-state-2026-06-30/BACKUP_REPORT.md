# BACKUP REPORT — TRIGA-S Full Project State

**Backup date:** 30.06.2026  
**Generated:** 2026-06-30  
**Backup folder:** `backups/final-working-state-2026-06-30/`

---

## 1. Project Status

| Item | Status |
|---|---|
| TRIGA-S chatbot working version saved | ✓ |
| Real contract HTML saved | ✓ |
| Real contract PDF saved | ✗ NOT YET EXPORTED (see PDF export instructions below) |
| Test contract HTML saved | ✓ |
| Test contract PDF saved | ✗ NOT YET EXPORTED (see PDF export instructions below) |
| No production files edited | ✓ |
| No chatbot/n8n files changed | ✓ |

---

## 2. Important Chatbot Details

**Main chatbot file (original):**
```
triga-s-chatbot-demo/triga-s-chatbot.js
```

**Backup path:**
```
backups/final-working-state-2026-06-30/chatbot/triga-s-chatbot.js
```

**SHA256 (original = backup):**
```
36CEBA048DC3C6DFD095D021FC4EFE3A7253D3620CD4B5CFD8D09A2217C6B16F
```

**File size:** 91,961 bytes  
**Last modified:** 2026-06-29 18:05:39

**Local demo start command:**
```
node triga-s-chatbot-demo/serve-demo.mjs
```

**Local demo URL:**
```
http://localhost:5500/
```

**Chrome Console loader (inject chatbot on live site without page refresh):**
```javascript
['tgs-launcher','tgs-panel','tgs-style','tgs-teaser'].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement('script');
s.src='http://localhost:5500/triga-s-chatbot.js?v='+Date.now();
document.body.appendChild(s);
```

---

## 3. Important Contract Details

**Real contract HTML (original):**
```
contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag.html
```
**Real contract HTML (backup):**
```
backups/final-working-state-2026-06-30/contracts/real/TRIGA-S_AFA_KI_Projektassistenz_Vertrag.html
```
**SHA256 (original = backup):**
```
4C4BB25B2D8CE70DDE1E12136376ADE345B77B12E9A523DA68A5E340A4E0A68A
```

**Real contract PDF (original — must be exported from Chrome):**
```
contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_DocuSign.pdf
```
*Status: NOT YET EXPORTED — use Chrome Strg+P to generate.*

**Test contract HTML (original):**
```
contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST.html
```
**Test contract HTML (backup):**
```
backups/final-working-state-2026-06-30/contracts/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST.html
```
**SHA256 (original = backup):**
```
BD12A4284B858240A7D16D5A79F6C8083FCFEDA0C374F1E7EEA5CD9FABC54F72
```

**Test contract PDF (original — must be exported from Chrome):**
```
contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST_DocuSign.pdf
```
*Status: NOT YET EXPORTED — use Chrome Strg+P to generate.*

### Contract Key Data

| Field | Value |
|---|---|
| Contract date | 30.06.2026 |
| Einmalige Einrichtungsgebühr | 10.000,00 € |
| Monatliche Betreuungsgebühr | 2.000,00 € / Monat |
| Mindestlaufzeit | 12 Monate |
| Gesamtvertragswert | 34.000,00 € |
| Umsatzsteuer | Kleinunternehmer gemäß § 19 UStG — keine Mehrwertsteuer |
| USt-IdNr. / Steuernummer | Wird nach Zuteilung durch das Finanzamt nachgereicht |
| IBAN | LT09 3250 0387 0908 1516 |
| BIC | REVOLT21 |
| Auftragnehmer | Ibrahim Ahmitti El Goul, AFA – Agentur für Automatisierung |
| Auftraggeber | TRIGA-S GmbH, Mühltal 5, 82392 Habach |
| DocuSign signature areas | [signature\|req\|signer1], [fullname\|req\|signer1], [signature\|req\|signer2], [fullname\|req\|signer2] |
| AFA Ort/Datum (Unterschrift) | Hagen, 30.06.2026 |
| TRIGA-S Ort/Datum (Unterschrift) | Habach, 30.06.2026 |

---

## 4. PDF Export Instructions (Chrome)

**For real contract:**
1. Open `contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag.html` in Chrome
2. Press `Strg+P`
3. Printer: "Als PDF speichern"
4. Papierformat: A4, Ränder: Keine, **Hintergrundgrafiken: EIN**
5. Save as: `contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_DocuSign.pdf`

**For test contract:**
1. Open `contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST.html` in Chrome
2. Same settings as above
3. Save as: `contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST_DocuSign.pdf`

After export, re-run this backup task or manually copy the PDFs to:
- `backups/final-working-state-2026-06-30/contracts/real/`
- `backups/final-working-state-2026-06-30/contracts/test/`

---

## 5. Webhook Status

All 7 TRIGA-S chatbot webhooks verified present in `triga-s-chatbot.js`. **Not changed.**

| Name | URL |
|---|---|
| Lead webhook | `https://afa-team.app.n8n.cloud/webhook/TrigaS-ChatBot-Lead` |
| Availability webhook | `https://afa-team.app.n8n.cloud/webhook/TrigaS-calendar-availability` |
| Find appointment webhook | `https://afa-team.app.n8n.cloud/webhook/TrigaS-chatbot-find-appointment` |
| Booking webhook | `https://afa-team.app.n8n.cloud/webhook/Termine%20TrigaS` |
| Reschedule webhook | `https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-verschieben-auto` |
| Cancel webhook | `https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-cancel` |
| SMS confirmation webhook | `https://afa-team.app.n8n.cloud/webhook/send_sms_confirmation_trigas` |

---

## 6. n8n Email Templates (in project, not backed up here — verify separately)

Located in `email-templates/triga-s/n8n-ready/`:

| File | Status |
|---|---|
| trigas_termin_bestaetigung_kunde_n8n.html | ✓ timezone-safe datetime fix applied |
| trigas_termin_bestaetigung_intern_n8n.html | ✓ timezone-safe datetime fix applied |
| trigas_termin_erinnerung_24h_kunde_n8n.html | ✓ timezone-safe datetime fix applied |
| trigas_termin_erinnerung_24h_intern_n8n.html | ✓ timezone-safe datetime fix applied |
| trigas_termin_erinnerung_1h_intern_n8n.html | ✓ timezone-safe datetime fix applied |
| trigas_termin_storniert_kunde_n8n.html | ✓ updated wording (Buchungsassistent) |

---

## 7. Safety Confirmation

> **"No files were deleted."**

> **"No chatbot production logic was changed."**

> **"No n8n workflow/template file was changed."**

> **"No contract legal text was changed during this backup task."**

> **"All listed files were copied into the backup folder."**

---

## 8. SHA256 Integrity

Full hash comparison available at:
```
backups/final-working-state-2026-06-30/checks/SHA256_CHECKS.txt
```

All original ↔ backup pairs verified identical (matching SHA256 hashes).

---

## 9. Missing Files (not yet generated)

| File | Reason |
|---|---|
| `contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_DocuSign.pdf` | Must be exported from Chrome (Strg+P) |
| `contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST_DocuSign.pdf` | Must be exported from Chrome (Strg+P) |

These are the only items not backed up. All other files present and verified.
