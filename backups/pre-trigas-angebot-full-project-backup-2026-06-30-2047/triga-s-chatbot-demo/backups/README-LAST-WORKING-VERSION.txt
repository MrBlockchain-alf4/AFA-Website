TRIGA-S CHATBOT — LAST WORKING VERSION RECORD
==============================================

Updated:       2026-06-29 22:04
Main file:     triga-s-chatbot-demo/triga-s-chatbot.js
Backup file:   triga-s-chatbot-final-working-backup-2026-06-29-22-04.js

THIS IS THE LATEST WORKING TRIGA-S CHATBOT VERSION
----------------------------------------------------

THIS VERSION INCLUDES
---------------------
- TRIGA-S premium chatbot UI
- TRIGA-S launcher button with adaptive icon switching (dark/light bg detection)
- TRIGA-S teaser bubble with 5 rotating messages and full timing scheduler
- Custom TRIGA-S header (TRIGA-S Assistenz / Studies. Services. Solutions.)
- n8n webhooks fully integrated (all 7, verified present, NOT CHANGED)

BOOKING FLOW
  - Vorname / Nachname / E-Mail / Unternehmen collection
  - Telefon (optional, with skip chip)
  - Thema/Anliegen selection
  - ONE SINGLE BOOKING BOX architecture (Step 1/3 → 2/3 → 3/3)
  - Date selection (5-col Mon-Fri weekday calendar)
  - Time slot selection (3-col grid)
  - Terminübersicht confirmation summary:
      - Premium review card boxes for all fields
      - 2-column grid: Datum|Uhrzeit, Vorname|Nachname, E-Mail|Telefon
      - Firma/Org. full width, Thema/Anliegen full width
      - Card grows downward (height:auto), no clipping
      - Missing fields show "Nicht angegeben"
      - Expand/collapse for long Anliegen text

INPUT VALIDATION
  - Email validation (isValidEmail, regex /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
  - Error message in German if invalid
  - Handler re-attached after validation error (not stuck)
  - Phone validation (isValidPhone — optional, skip/empty always allowed)
  - Normalizes: 0049→+49, 0170→+49170, etc.
  - Skip chip recreated after phone validation error

FOCUS & INPUT FIXES
  - focusInput() helper (requestAnimationFrame + 60ms delay)
  - inp(), inpEmail(), inpPhone() all call focusInput()
  - inpEmail() error path re-attaches $snd.onclick and $inp.onkeydown
  - inpPhone() error path re-attaches handlers and skip chip
  - No more stuck send button after validation errors

POST-FLOW IDLE RESET
  - enterIdleMode() resets S.flow=null, re-attaches idleHandler to send button
  - Called from goBack() and showMenu()
  - After ANY completed flow, typing + Enter/send works immediately
  - No need to click "Zum Hauptmenü" to re-enable input

NATURAL LANGUAGE INTENT ROUTING
  - idleHandler() handles free-text input when S.flow=null
  - "Ich möchte einen Termin buchen" → starts booking flow
  - "Ich möchte meinen Termin verschieben" → starts reschedule flow
  - "Ich möchte meinen Termin stornieren" → starts cancel flow
  - Ambiguous "termin" message → shows clarification with 3 choice buttons
  - NFD-normalized umlaut matching (ö/ü/ä handled)
  - if(S.flow) return; guard prevents routing during active form inputs

SUPPRESS ECHO (typed intent = no fake button bubble)
  - bookStart(suppressEcho=true) → skips usr('Termin buchen')
  - findStart(next, suppressEcho=true) → skips usr('Termin verschieben/stornieren')
  - Chip-clicks still show the button echo normally

RESCHEDULE FLOW (WH.RESCHEDULE)
  - findStart('reschedule') → email lookup → showFoundAppt → reschedStart
  - New date/time calendar
  - showConfirm('reschedule') summary includes:
      - Neuer Termin: Datum + Uhrzeit (2-col)
      - Aktueller Termin (original, from found appointment)
      - Kontakt: Name + E-Mail + Firma
      - Anliegen: Thema if available
  - Payload: event_id, email, new_datetime, new_date, new_time, duration_minutes, timezone

CANCEL FLOW (WH.CANCEL)
  - findStart('cancel') → email lookup → showFoundAppt → cancelConfirm → cancelSubmit
  - Payload: event_id, email, reason, message, source

FOUND APPOINTMENT CARD
  - Premium gradient card (.tgs-ac) with top accent border
  - Shows: Name, Termin, E-Mail, Thema, Firma
  - fmtApptDate() parses ISO/RFC datetimes → German format
  - parseApptDateTime() checks 20+ field name variants:
      - termin_formatted, terminDatumZeit, appointment_datetime, startDateTime,
        start.dateTime (nested), Termin-Datum + Termin-Uhrzeit (separate), etc.
  - No more "Nicht angegeben" for dates that are present

SMS CONFIRMATION (WH.SMS)
  - askSms() called after booking if phone was provided
  - Two balanced full-width buttons (acts([...], true))
  - "Ja, SMS senden" and "Nein, danke" equal width
  - goBack() called after either choice

LEAD / PROJECT INQUIRY FLOW (WH.LEAD)
  - IVD-Studie, CDx/Pharma, Probenmanagement, Biostatistik, Allgemeine Frage
  - Vorname, Nachname, E-Mail, Firma, Nachricht collection

FIND APPOINTMENT FLOW (WH.FIND)
  - Used by reschedule and cancel to look up appointment by email

UI ELEMENTS
  - Typing indicator: "TRIGA-S schreibt" with animated dots
  - CSS loading spinner for time slots
  - Send button: paper plane SVG icon
  - Smooth message entrance animations
  - Staggered button entrance animations
  - Back nav: Datum ändern / Uhrzeit ändern / Kontaktdaten ändern
  - Footer: Crafted by AFA (link to afa-ai.com)

WEBHOOK URLS (all confirmed present — DO NOT CHANGE)
-----------------------------------------------------
WH.LEAD       https://afa-team.app.n8n.cloud/webhook/TrigaS-ChatBot-Lead
WH.AVAIL      https://afa-team.app.n8n.cloud/webhook/TrigaS-calendar-availability
WH.FIND       https://afa-team.app.n8n.cloud/webhook/TrigaS-chatbot-find-appointment
WH.BOOKING    https://afa-team.app.n8n.cloud/webhook/Termine%20TrigaS
WH.RESCHEDULE https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-verschieben-auto
WH.CANCEL     https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-cancel
WH.SMS        https://afa-team.app.n8n.cloud/webhook/send_sms_confirmation_trigas

ASSETS FOLDER (triga-s-chatbot-demo/assets/)
--------------------------------------------
  lineas-header.png
  lineas-triga-s.png
  logo-color.b64
  logo-white.b64
  triga-s-full-logo-color.png
  triga-s-full-logo-white.png
  triga-s-logo-color.png
  triga-s-logo-white.png
  triga-s-logo.png
  triga-s-mark-color.png
  triga-s-mark-white.png

N8N EMAIL TEMPLATES VERIFIED (email-templates/triga-s/n8n-ready/)
------------------------------------------------------------------
  trigas_termin_bestaetigung_kunde_n8n.html    ✓ timezone-safe datetime fix applied
  trigas_termin_bestaetigung_intern_n8n.html   ✓ timezone-safe datetime fix applied
  trigas_termin_erinnerung_24h_kunde_n8n.html  ✓ timezone-safe datetime fix applied
  trigas_termin_erinnerung_24h_intern_n8n.html ✓ timezone-safe datetime fix applied
  trigas_termin_erinnerung_1h_intern_n8n.html  ✓ timezone-safe datetime fix applied
  trigas_termin_storniert_kunde_n8n.html       ✓ updated wording (Buchungsassistent)
  N8N_NODE_VALUES.md                           ✓ Edit Fields3 datetime fix documented
  ALL_N8N_TEMPLATES.md                         ✓ timezone-safe datetime fix applied

TO START DEMO NEXT TIME
------------------------
  node triga-s-chatbot-demo/serve-demo.mjs
  Then open: http://localhost:5500/

CHROME CONSOLE LOADER (hot-reload without page refresh)
--------------------------------------------------------
  ['tgs-launcher','tgs-panel','tgs-style','tgs-teaser'].forEach(id=>document.getElementById(id)?.remove());
  const s=document.createElement('script');
  s.src='http://localhost:5500/triga-s-chatbot.js?v='+Date.now();
  document.body.appendChild(s);

ALL BACKUPS IN THIS FOLDER
---------------------------
  triga-s-chatbot-working-final-2026-06-28-10-08.js
    → pre-ONE-BOX refactor, last fully working clean version

  triga-s-chatbot-working-backup-2026-06-28-22-00.js
    → ONE BOX architecture, has calendar visibility bug (overflow:hidden)

  triga-s-chatbot-before-booking-ui-redesign-2026-06-29-00-00.js
    → before lab UI visual redesign session

  triga-s-chatbot-before-final-booking-lab-ui-2026-06-29-01-26.js
    → snapshot before final visual pass

  triga-s-chatbot-working-backup-2026-06-29-02-00.js
    → final TRIGA-S lab scheduler UI, all flows verified

  triga-s-chatbot-summary-fixed-2026-06-29.js
    → Terminübersicht fields all present, gv() resolver

  triga-s-chatbot-summary-2col-2026-06-29.js
    → 2-column summary grid added

  triga-s-chatbot-summary-autoheight-2026-06-29.js
    → confirm card grows downward (height:auto), no clipping

  triga-s-chatbot-review-boxes-2026-06-29.js
    → Terminübersicht fields styled as review boxes

  triga-s-chatbot-premium-cards-2026-06-29.js
    → Premium gradient review card style with top accent line

  triga-s-chatbot-validation-intent-2026-06-29.js
    → Email + phone validation, natural language intent routing

  triga-s-chatbot-working-backup-2026-06-29-10-15.js
    → All of the above, fully verified

  triga-s-chatbot-before-functional-bugfix-2026-06-29-12-30.js
    → Before input focus, email/phone handler re-attachment, S.flow guard fixes

  triga-s-chatbot-before-final-flow-bugfix-2026-06-29-18-04.js
    → Before typed intent echo, post-flow idle reset, SMS balance, date mapping fixes

  triga-s-chatbot-final-before-n8n-email-fix-2026-06-29-18-21.js
    → Complete. All bugs fixed. All flows verified. Safe to use.
    → This is the version to restore if n8n changes break anything.

  triga-s-chatbot-final-working-backup-2026-06-29-22-04.js           ← LATEST BACKUP
    → Same complete chatbot. Saved at session end 2026-06-29 22:04.
    → All n8n email templates also updated and saved.
    → Safe to shut down. Safe to continue later.
