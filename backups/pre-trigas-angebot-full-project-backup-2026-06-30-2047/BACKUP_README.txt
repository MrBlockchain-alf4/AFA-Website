BACKUP README
=============================================================================
Backup name:   pre-trigas-angebot-full-project-backup-2026-06-30-2047
Backup date:   2026-06-30 20:47
Project root:  C:\Users\ghost\OneDrive\Desktop\Claude Web Design\AFA Website
=============================================================================

WHY THIS BACKUP WAS CREATED
-----------------------------
This backup was created BEFORE generating the TRIGA-S Angebot (proposal /
offer) email template. It captures the full, stable, verified project state
at this point in time so that the new Angebot work can be developed safely
without risk to any existing finished deliverable.

WHAT IS PROTECTED IN THIS BACKUP
----------------------------------
  - TRIGA-S chatbot (with GDPR/Datenschutz gate, all 7 webhook flows)
  - TRIGA-S contract / Vertrag HTML (DocuSign-ready, clean signature areas)
  - TRIGA-S invoice / Rechnung HTML (AFA-RE-2026-001, 10.000,00 EUR)
  - TRIGA-S email templates (all n8n-ready templates with timezone fixes)
  - All chatbot assets (11 image/b64 assets)
  - Brand assets (AFA logos, TRIGA-S logos)
  - AFA website (Next.js app, components, lib, public, configs)
  - Booking calendar files
  - All invoices folder

WHAT WAS NOT MODIFIED DURING THIS BACKUP
------------------------------------------
  - No chatbot logic was changed
  - No n8n workflow or template was changed
  - No contract legal clauses were changed
  - No invoice content was changed
  - No email template content was changed
  - No brand assets were changed
  - No production files were modified in any way

WHAT WAS INTENTIONALLY EXCLUDED FROM THE COPY
-----------------------------------------------
  - .next/           (Next.js generated build cache — not source)
  - node_modules/    (npm packages — restore with: npm install)
  - .git/            (Git history is preserved in the repo itself)
  - temporary screenshots/  (session-only screenshots)
  - *.tsbuildinfo    (TypeScript incremental build cache)
  - triga-s-demo-server*.log  (transient runtime logs)

KEY FILE PATHS (originals — not changed)
------------------------------------------
  Chatbot JS:         triga-s-chatbot-demo/triga-s-chatbot.js
  Chatbot demo:       triga-s-chatbot-demo/index.html
  Real contract:      contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag.html
  Test contract:      contracts/triga-s/test/TRIGA-S_AFA_KI_Projektassistenz_Vertrag_TEST.html
  Invoice HTML:       invoices/triga-s/AFA_RE-2026-001_TRIGA-S_Einrichtungsgebuehr.html
  n8n templates:      email-templates/triga-s/n8n-ready/
  Brand assets:       brand_assets/

CHATBOT STATUS AT TIME OF BACKUP
----------------------------------
  - GDPR / Datenschutz consent gate: ACTIVE
  - Privacy URL: https://www.triga-s.de/datenschutz/
  - Privacy version: TRIGA-S Datenschutz 30.06.2026
  - All 7 n8n webhook URLs: UNCHANGED
  - Booking / reschedule / cancel / lead / questions flows: ALL WORKING
  - Datenschutz fields in all 5 webhook payloads: YES

CONTRACT STATUS AT TIME OF BACKUP
------------------------------------
  - Real contract date: 30.06.2026
  - Yellow DocuSign placeholder boxes: REMOVED (clean signature areas)
  - DocuSign-ready: YES (manual field placement inside DocuSign)
  - Price: 10.000,00 EUR einmalig + 2.000,00 EUR/Monat
  - Kleinunternehmer gemäß § 19 UStG: YES

INVOICE STATUS AT TIME OF BACKUP
-----------------------------------
  - Invoice number: AFA-RE-2026-001
  - Amount: 10.000,00 EUR (0,00 EUR VAT, § 19 UStG)
  - Payment deadline: 14.07.2026
  - Steuernummer: pending (nach Zuteilung durch das Finanzamt)

NEXT STEP (after this backup)
-------------------------------
  Create TRIGA-S Angebot email template.
  All Angebot work will go into new files only.
  Existing files listed above will NOT be touched.

=============================================================================
"No existing chatbot, contract, invoice, email template, n8n template,
or brand asset was modified during this backup step."
=============================================================================
