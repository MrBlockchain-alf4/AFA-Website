# AFA — Complete Project Context

**Read this once at the start of a new session. It replaces the need for the previous conversation history.**

This document was written by Claude after directly doing the work described in it (not reconstructed from a template or guessed). Everything here was verified against real git history, real file contents, and real commit dates in this repo before being written down. If something below ever looks wrong against the current code, trust the code — this file can go stale.

---

## 1. What this is

AFA is a small web design agency (Hagen, Germany area, German-speaking clients). This repo (`AFA-Website`) is the agency's own Next.js website AND the umbrella folder that contains every client project the agency has built. It is not one website — it's a monorepo-ish workspace: one real Next.js app at the root, plus ~9 client site folders living alongside it, plus contracts/invoices/email templates/brand assets for running the business side.

First commit: **2026-06-02**. As of this writing the repo has **159 commits** on `master`. Everything below is ordered by when it actually happened, verified via `git log --reverse`.

---

## 2. Repo architecture — READ THIS BEFORE TOUCHING GIT

This is the single most error-prone part of this workspace. There are **three different, incompatible patterns** for how a client-site subfolder relates to git. Confusing them causes real bugs (it happened this session — see §3).

### Pattern A — Registered git submodule-like gitlinks (mode 160000)
Folders: `dr-peters/`, `elit-juwelier/`, `sahinler-juwelier/`

These show up as mode `160000` entries in `git ls-files -s` from the outer repo — meaning the outer repo stores a *pointer* (a commit SHA) to them, not their file contents directly. **Important gotcha: there is no `.gitmodules` file**, so these are not properly wired submodules. `git submodule status` fails. A fresh `git clone` of AFA-Website will create the empty folders but **not** pull their contents — you'd need to `cd` into each and `git clone` its own remote separately.

Each has its own independent git identity:
- `dr-peters` → `github.com/MrBlockchain-alf4/Dr.-Ingo-Peters.git`
- `sahinler-juwelier` → `github.com/MrBlockchain-alf4/Sahinler-Juwelier.git`
- `elit-juwelier` → **two remotes**: `origin` → `github.com/MrBlockchain-alf4/Elit-Juwelier.git`, and `elit` → `github.com/ElitJuwelier/Elit-Juwelier-Website.git` (the client's own GitHub, used for their Vercel deploy). When you push Elit changes, you generally want both.

**Workflow:** commit and push inside the subfolder's own repo first, THEN go back to the outer AFA-Website repo and run `git add elit-juwelier` (etc.) + commit to update the pointer. This session's commits like `sync: elit-juwelier submodule (...)` are exactly that second step. If you skip it, the outer repo's pointer goes stale and a fresh clone would get an old version of Elit's site.

### Pattern B — Separate repos NOT registered as gitlinks ("dual-tracked")
Folders: `framework-berlin/`, `praxis-mueser/`

These folders have their own nested `.git` (their own commit history, their own remote), but the outer AFA-Website repo does **not** register them as gitlinks — it just tracks their files directly as regular blobs (like any other file in the repo). This means changes need **two separate commits**: one inside the nested repo (with its own push to its own remote), and one "sync" commit in the outer repo copying the same file changes so the outer repo's copy doesn't drift. This session's `sync: framework-berlin index.html (...)` commits are exactly that.

- `framework-berlin` → `github.com/MrBlockchain-alf4/framework-berlin.git`
- `praxis-mueser` → `github.com/MrBlockchain-alf4/Muser.git`

### Pattern C — Plain subfolders, no independent git identity at all
Folders: `inter-cent/`, `foruzan-cuts-cosmetic/`, `triga-s-chatbot-demo/`

No nested `.git` anywhere. These live 100% inside AFA-Website's own history — a normal commit at the repo root is all that's needed. `inter-cent` is the one exception worth knowing: the outer repo has an *extra* git remote called `intercent` (`github.com/MrBlockchain-alf4/intercent.git`) that isn't `origin` — this looks like it exists specifically to push/deploy `inter-cent` as its own thing despite not being its own repo.

### THE CRITICAL PITFALL: `origin` vs `intercent` on the outer repo
The AFA-Website repo itself has two remotes:
- `origin` → `github.com/MrBlockchain-alf4/AFA-Website.git` ← **this is the correct one, connected to the real Vercel deployment for afa-ai.com**
- `intercent` → `github.com/MrBlockchain-alf4/intercent.git` ← a different, legacy/unrelated remote

**This session, a push accidentally went to `intercent` instead of `origin`, and Vercel kept silently serving a stale build of the whole AFA site for a long time before this was caught.** Before any push from the repo root, run `git remote -v` and double check you're pushing to `origin`, not `intercent`. This is exactly the kind of mistake a new session with no history would repeat blindly.

---

## 3. Vercel deployment — two different conventions in use

Two genuinely different patterns exist across projects. Mixing them up causes 404s on serverless functions (this happened with Elit this session).

**Convention 1 — `vercel.json` outputDirectory, no dashboard config:**
Most single-folder client sites (`dr-peters`, `sahinler-juwelier`, `praxis-mueser`, `inter-cent`) use a `vercel.json` like `{"outputDirectory": "website"}` sitting at the project's own repo root, deployed from that project's own dedicated GitHub repo.

**Convention 2 — dashboard "Root Directory" + vercel.json inside the site subfolder:**
`framework-berlin`'s pattern: the Vercel project dashboard has a "Root Directory" setting pointing into the repo, and `vercel.json` lives inside that rerooted directory. Its `/api` serverless functions live under that same rerooted directory.

**Convention 3 — vercel.json at the true repo root with outputDirectory, `/api` must also be at true repo root:**
`elit-juwelier`'s pattern. **This bit us**: `api/admin/data.js` was originally placed at `elit-juwelier/website/api/admin/data.js` (mirroring where the HTML lives), which caused a 404 — because with Elit's `outputDirectory`-based config, Vercel's function discovery looks at the actual repo root's `/api` folder, not inside `outputDirectory`. Fix was moving the function to `elit-juwelier/api/admin/data.js` (repo root, sibling to `website/`, not inside it).

**Lesson for any new client's admin bridge:** check which convention that specific project's `vercel.json` uses before assuming where `/api` functions belong. Don't copy Framework's layout onto an Elit-style project or vice versa.

---

## 4. Chronological project history (real, dated, verified via git log)

**2026-06-02 — AFA's own website.** The very first commits. `app/page.tsx` (currently ~176KB, a single large page) is AFA's own marketing site — Next.js 14 App Router, Tailwind, Framer Motion, Zustand. This is the site at afa-ai.com.

**~June 2026 — AFA's own chatbot**, with real n8n webhook integrations (confirmed live in `.env.local`): a lead-capture webhook, a Termin/booking webhook, an availability-check webhook, and an SMS-confirmation webhook, all pointed at `afa-team.app.n8n.cloud`. This n8n usage is confirmed real for AFA's own chatbot specifically — do not assume every other client's chatbot also uses n8n (most don't; see §5).

**Late June – July 2026 — TRIGA-S.** A sales-pitch chatbot demo built for a specific real prospect, TRIGA-S GmbH (a CRO / clinical-lab-services company — IVD studies, CDx/Pharma, biostatistics, regulatory affairs). Lives in `triga-s-chatbot-demo/`, explicitly documented in its own README as "standalone, no connection to the AFA website." Includes a lead-capture flow (9 conversation paths, 16+ question knowledge base), its own set of 7 n8n webhooks (lead, availability, find-appointment, booking, reschedule, cancel, SMS — all under `afa-team.app.n8n.cloud/webhook/TrigaS-*`), and a separate "BotCore" orb/particle animation used to visually simulate the bot "thinking" during live sales calls (a local WebSocket relay, `serve-demo.mjs`, no real backend). **This went beyond a pitch**: `contracts/triga-s/TRIGA-S_AFA_KI_Projektassistenz_Vertrag.html/.pdf` is a signed-looking AI-project-assistance contract, and `invoices/triga-s/AFA_RE-2026-001_TRIGA-S_Einrichtungsgebuehr.html/.pdf` is a real setup-fee invoice (RE-2026-001) — so TRIGA-S is a real contracted client relationship, not just a cold demo, though the chatbot itself is still a demo artifact, not yet installed permanently on triga-s.de.

**2026-08-17/18 — Framework Berlin.** First real full client site + chatbot + first version of an admin panel. A gym/fitness studio (Berlin) with Home/Team/Physiotherapy pages. This became the template that the later multi-client Kundenzugang system was generalized from. Notable early iteration: several commits removing photos of women per explicit client preference and replacing with equipment-only imagery/placeholders.

**2026-08-25 — Three client sites built back-to-back, all Hagen-based:**
- **Foruzan's Cuts & Kosmetik** (`foruzan-cuts-cosmetic/`) — hair/beauty salon, Rathausstraße 20, Hagen. Magenta/dark-brown branding, black background, a "10 Google reviews" testimonial section. **Note: that reviews section is static hand-authored HTML styled to look like a live Google-reviews carousel — it is not actually pulled from a Google API.** Also has no `vercel.json` — if this is ever deployed standalone from its own Vercel project pointed at this subfolder, that's missing and needs adding first.
- **Praxis Müser** (`praxis-mueser/`) — dental practice ("Zahnärzte im Volksparkbogen"), Karl-Marx-Straße 10, Hagen. Booking chatbot, reviews carousel, smart-hours display, mobile responsiveness pass. Has its own separate git repo (Pattern B above). Minor known loose end: a duplicated `chatbot.js` exists both at `praxis-mueser/chatbot/` and `praxis-mueser/website/chatbot/` — leftover from a restructure, never cleaned up.
- **Sahinler Juwelier** (`sahinler-juwelier/`) — jewelry/watch store, Hagen. Black/gold luxury styling, booking-focused chatbot. Own git repo (Pattern A, gitlink).

**2026-08-26 — Dr. Ingo Peters** (`dr-peters/`) — ENT/allergology practice ("HNO-Praxis · Allergologie"), Hindenburgstraße 5, Hagen. Own git repo (Pattern A, gitlink). Known minor issue: the `<meta description>` tag still says "Hausarztpraxis" (GP practice) while every visible section correctly says HNO-Praxis — a leftover copy-paste inconsistency, cosmetic only (not user-visible), never fixed.

**2026-08-27 — Inter-Cent** (`inter-cent/`) — a certified translation/interpreting service ("Inter-Cent Fachübersetzungsdienst"), Hagen. The rotating Earth globe is a real, working Three.js WebGL scene (`three@0.167.0`, `OrbitControls`, day/night cycle with sun-direction vectors), used as a visual metaphor for "global languages" — not a finance or logistics company as the globe imagery might suggest. Texture was upgraded to a 4K NASA Blue Marble map (`earth-map.jpg`, 1.39MB) partway through. Has a chatbot too. Has two `vercel.json` files (one at project root, one duplicated inside `website/`) — redundant, flagged but not cleaned up; hasn't caused a confirmed problem.

**2026-08-28 — Invoice system built out.** The `invoices/` and `contracts/` folders got real design work this day: professional 2-page A4 PDF invoice layout (logo on both pages, page numbers, dedicated payment-details page), fixed print-CSS bugs (footer causing page-split, content getting cut off). Elit Juwelier's and TRIGA-S's real invoices were finalized here.

**2026-08-29/30/31 — Elit Juwelier + the Kundenzugang multi-client admin panel.** By far the most intensive and most recent stretch of work (roughly the last 3 days of the entire git log). Two things happened together:

1. **Elit Juwelier** (`elit-juwelier/`, gitlink submodule, dual remote as described in §2) — a gold-buying/jewelry business ("Goldankauf"). Full site with a Gold Calculator chatbot widget (`chatbot/chatbot.js`, self-contained, builds its own DOM — architecturally separate from the main site's data-fw hooks) that computes offer prices as `realPrice × 0.85` (client keeps 15% margin) for four gold purities (999/750/585/333). Prices are manually maintained in `GOLD_PER_G` inside `chatbot.js` and were updated this session to real current market rates.

2. **Kundenzugang** (`/kundenzugang` route in the main Next.js app) — a content-editing admin panel that started as a Framework-Berlin-only proof of concept on 2026-08-29 and was generalized into a real multi-client system within the same 2-3 days. **See §5 for what this actually is** — it is frequently mis-described (including once by the user this session, based on a wrong assumption) as having CRM/booking/analytics features. It does not. It is a content editor, full stop.

---

## 5. What Kundenzugang actually is (and is NOT)

**Kundenzugang = a password-gated, per-client content editor for the client's own live website.** Nothing more. There is no CRM, no booking/scheduling module, no client database, no analytics dashboard, no dark/light mode toggle, no reports. If a future request assumes any of those exist, they don't — check `lib/kundenzugang-store.ts` and `components/kundenzugang/` before promising anything.

**Real architecture:**
- Next.js app: `app/kundenzugang/` (route) → `components/kundenzugang/AdminShell.tsx` (shell/layout), `NavTree.tsx` (sidebar, fully generic — renders whatever nav nodes it's given), `FieldEditor.tsx` (all the actual field-editing UI, composed from generic primitives: `TextField`, `ImagePositionEditor`, `SimpleImageEditor`, `StatListEditor`, `ChipListEditor`, plus per-client composite editors built on top of those), `PreviewPane.tsx` (the live iframe), `LoginScreen.tsx`.
- State: `lib/kundenzugang-store.ts`, a Zustand store. `Client.content` is typed per client via a `kind` discriminator (`'framework' | 'elit'`) — Framework's `SiteContent` and Elit's `ElitContent` are **deliberately separate shapes**, not unioned into one generic content type, because their real sites have genuinely different section structures. `getAtPath`/`setAtPath` are generic dotted-path accessors that work over either shape.
- Nav config: `lib/kundenzugang-nav.ts` — per-client nav trees (`ELIT_NAV_TREE`, Framework's `HOME_NAV_TREE`/`TEAM_NAV_TREE`/`PHYSIO_NAV_TREE`), plus large lookup tables (`LIVE_PATH_TO_FIELD`, `PREFIX_TO_FIELD`, `FIELD_TO_LIVE_PATHS`, `SECTION_HIGHLIGHT_FIELDS`) that connect a field in the editor to the exact DOM location it patches in the live iframe.
- **The live-site bridge** — how editing actually reaches the real website: each client's own site folder gets a `data-fw="dot.path"` attribute added to every editable DOM element, an `admin/page-loader.js` script (postMessage protocol: `FW_ADMIN_PREVIEW` to live-patch the iframe as you type, `FW_ADMIN_HIGHLIGHT`/`FW_ADMIN_SELECT` for click-to-edit), and a Vercel serverless function `api/admin/data.js` that GETs/POSTs the client's content to/from Supabase.
- **Storage: Supabase**, table `website_data`, one row per client keyed by `client_id` (e.g. `'framework-berlin'`, `'elit-juwelier'`), accessed via the bespoke `api/admin/data.js` functions (not Next.js API routes — genuinely separate Vercel functions living inside each client's own deployed project, since the client sites deploy independently from the main AFA Next.js app). Requires `SUPABASE_URL` + a service-role key env var set on **each client's own Vercel project** — Elit's admin save (`POST`) didn't work at one point this session specifically because those env vars weren't set yet on Elit's Vercel project (GET still worked via a bundled `admin/data.json` offline fallback).
- **Image editing**: a "focal-point + zoom" pattern — `ImagePositionEditor` lets you drag a crosshair over an uploaded image and adjust a zoom slider; this gets applied on the live site via `object-position`/`background-position` + `transform: scale()`, computed in `page-loader.js`'s `applyImgFocalPoint`/`applyBgFocalPoint` helpers.

**Currently wired clients:** Framework Berlin (full — Home/Team/Physiotherapy pages, dynamic page tabs, logo, live theming) and Elit Juwelier (content + images across hero/nav/banner/stats/services/gallery/about/contact/goldankauf-info/reviews/instagram/footer/legal/cookie — built out extensively this session; the Gold Calculator's pricing and the chatbot notification text are explicitly NOT wired into Kundenzugang, they stay hardcoded in `chatbot.js`).

**A `spicy-crafting-falcon.md` plan file exists** (`C:\Users\ghost\.claude\plans\`) describing the original, narrower scope for adding Elit to Kundenzugang (Goldkauf hero/Gallery/About&Contact/Footer/Logo only). The actual implementation this session went well beyond that plan's original scope (nav, banner, stats, services, reviews, Instagram, legal, cookie were all added afterward per direct user requests) — treat that plan file as historical/superseded, not as the current spec.

---

## 6. Working style — how this user likes to collaborate

- **Spanish-speaking user**, communicates in Spanish, often via screenshots with things circled/annotated rather than written descriptions. Read screenshots carefully — the annotation is usually the actual bug report.
- **Minimal-context editing preference** (explicit, standing instruction): use standard context only, never full-project scans, never reading entire large files end-to-end when a targeted read/grep will do. Make direct, scoped edits.
- **Verify before asserting.** This user has been given wrong information before (the admin-panel feature list from a template) and immediately caught that it didn't match reality when asked directly — don't guess or extrapolate from commit-message subjects alone when the actual file content is checkable.
- **Always restore Supabase test/live data back to baseline after testing** — this was done repeatedly (Elit hero image tests, Framework team-member field tests) by capturing the pre-test value first via a GET, then POSTing it back after verifying the change worked.
- **Puppeteer verification means real interaction**, not synthetic state injection: real clicks, real drag events for focal-point editing, then diffing actual rendered CSS (`object-position`, `background-position`, computed `transform`) against what was set — not just checking that a store value changed.
- **After any change to a chatbot's frontend** (TRIGA-S specifically, but the habit generalizes): always end the response with a ready-to-paste Chrome DevTools console hot-reload snippet and the dev-server start command, without being asked — this was an explicit standing preference from an earlier session.
- User cares about production correctness over speed — e.g. asked for the wrong git remote to be identified and explained, not silently patched around.

---

## 7. Environment / tooling reference

- **Dev server**: `node serve.mjs` → `http://localhost:3000` for the main Next.js app (also serves the whole repo root, so client subfolders are reachable at e.g. `http://localhost:3000/elit-juwelier/website/`). Check it's not already running before starting a second instance.
- **Screenshots**: `node screenshot.mjs http://localhost:3000 [label]` → saves to `./temporary screenshots/screenshot-N[-label].png`. Puppeteer + Chrome are pre-installed locally (paths are user-machine-specific, see `screenshot.mjs`/`screenshot-mobile.mjs` for the exact cache paths). Never screenshot a `file:///` URL — always localhost.
- **Image processing**: `sharp` (npm) is available and was used this session to resize/compress a new hero photo for Elit (source photo was in the sibling `Elit Contrato` folder, output written into `elit-juwelier/website/public/images/`).
- **Frontend design skill**: this repo's `CLAUDE.md` requires invoking the `frontend-design` skill before any new frontend code, every session — matching reference images exactly when one is given (placeholder content via `placehold.co`, no unrequested improvements), or designing from scratch with the anti-generic guardrails (no default Tailwind indigo/blue, layered tinted shadows, paired display+body fonts, transform/opacity-only animation, no `transition-all`) when there is no reference.
- **Business-side folders** (not code, but real and relevant): `contracts/` and `invoices/` hold real signed-contract and invoice HTML/PDF pairs per client (TRIGA-S, Elit Juwelier so far); `email-templates/` holds transactional email HTML for booking confirmations/reminders/cancellations plus a couple of client-specific proposal ("Angebot") previews; `brand_assets/` holds every client's logo files plus AFA's own logo and business card.

---

## 8. Known loose ends (not urgent, just true)

- `praxis-mueser` has a duplicated `chatbot/chatbot.js` (root and inside `website/`) — never consolidated.
- `dr-peters`'s `<meta description>` still says "Hausarztpraxis" instead of "HNO-Praxis" — cosmetic, not user-facing.
- `foruzan-cuts-cosmetic` has no `vercel.json` at all — fine as a subfolder of AFA-Website, but would break a standalone Vercel deploy pointed directly at that folder until one is added.
- `inter-cent` has two redundant `vercel.json` files (root and inside `website/`) — hasn't caused an observed bug, just untidy.
- Foruzan's "Google reviews carousel" is static hardcoded testimonial HTML, not a live-pulled Google reviews feed — worth being upfront about if a client or the user ever asks how "live" it is.
- The repo root has a large number of loose screenshot/reference PNGs (`Elit Web Fot.PNG`, `Sahinler web foto.png`, `pberg.png`, `xberg.png`, a giant `—Pngtree—realistic rotating planet earth globe...png`, etc.) sitting directly at the repo root rather than in an organized assets folder — clutter, not a bug.
- Elit Juwelier's Kundenzugang **Save** may still fail if `SUPABASE_URL`/service-role env vars were never confirmed as added to Elit's own Vercel project (this was an open blocker flagged mid-session; verify before assuming saves persist).

---

## 9. If you're a new Claude Code session starting cold

Read §2 and §3 twice before running any `git push` from anywhere in this repo — the remote/deploy-convention mixups are the single most likely way to accidentally break something that was already working. Beyond that, treat this repo like any other Next.js + static-client-sites workspace: check the actual current file before trusting a claim about it, ask the user (in Spanish, they're comfortable there) when something is ambiguous, and don't assume Kundenzugang does more than content editing.
