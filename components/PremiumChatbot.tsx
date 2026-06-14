'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type Step =
  | 'welcome'
  | 'privacy-notice'
  | 'lead-vorname' | 'lead-nachname' | 'lead-email'
  | 'lead-telefon' | 'lead-unternehmen' | 'lead-interesse' | 'lead-custom'
  | 'cal-date' | 'cal-time' | 'confirm' | 'submitting'
  | 'sms-confirm'
  | 'cancel-email' | 'cancel-confirm'
  | 'reschedule-email' | 'reschedule-confirm'
  | 'reschedule-cal-date' | 'reschedule-cal-time' | 'reschedule-datetime'
  | 'success' | 'error' | 'handoff-done';

type LeadGoal = 'book' | 'handoff';

interface Lead {
  vorname: string; nachname: string; email: string;
  telefon: string; unternehmen: string; interesse: string;
}

interface Msg {
  id: number;
  role: 'bot' | 'user';
  text: string;
  quickReplies?: string[];
  menuGrid?: boolean;
}

interface AvailableDate {
  date?: string;
  isWeekend?: boolean;
  isFullyBooked?: boolean;
  slots?: string[];
  blockedSlots?: string[];
  availableSlots?: string[];
  freeSlots?: string[];
  times?: string[];
  selectedSlots?: string[];
  [key: string]: unknown;
}
// The n8n Code node may return any of these three shapes:
//  Format 1: { success, availableDates: [{ date, slots/availableSlots/..., blockedSlots }] }
//  Format 2: { success, availableSlots: [{ date, slots/availableSlots/..., blockedSlots }] }
//  Format 3: { success, date, slots/selectedSlots/... }  (single-date flat object)
interface AvailabilityResponse {
  success: boolean;
  slotMinutes?: number;
  timezone?: string;
  availableDates?: AvailableDate[];
  availableSlots?: AvailableDate[] | string[];
  date?: string;
  slots?: string[];
  selectedSlots?: string[];
  freeSlots?: string[];
  times?: string[];
  blockedSlots?: string[];
  [key: string]: unknown;
}

// ── Constants ─────────────────────────────────────────────────────────────
const LEAD_WEBHOOK         = process.env.NEXT_PUBLIC_AFA_LEAD_WEBHOOK_URL         ?? '';
const TERMIN_WEBHOOK       = process.env.NEXT_PUBLIC_AFA_TERMIN_WEBHOOK_URL       ?? '';
const AVAILABILITY_WEBHOOK = process.env.NEXT_PUBLIC_AFA_AVAILABILITY_WEBHOOK_URL ?? 'https://afa-team.app.n8n.cloud/webhook/afa-calendar-availability';
const FIND_APPT_WEBHOOK       = 'https://afa-team.app.n8n.cloud/webhook/afa-chatbot-find-appointment';
const CANCEL_APPT_WEBHOOK     = 'https://afa-team.app.n8n.cloud/webhook/afa-chatbot-cancel-appointment';
const RESCHEDULE_APPT_WEBHOOK = 'https://afa-team.app.n8n.cloud/webhook/afa-termin-verschieben-auto';

const MAIN_MENU: string[] = [
  'Termin buchen',    'KI-Telefon',
  'KI-Chatbot',       'Premium Website',
  'Preise / Angebot', 'Weitere Optionen',
];

const SECONDARY_MENU: string[] = [
  'Termin verschieben', 'Termin stornieren',
  'Automatisierung',    'Leadgenerierung',
  'DSGVO / Datenschutz','Expertenkontakt',
  'Zurück zum Start',
];

const INTEREST_REPLIES = [
  'KI-Telefon', 'KI-Chatbot', 'Premium Website',
  'Leadgenerierung', 'Automatisierung', 'Allgemeine Beratung', 'Eigenes Anliegen',
];

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
];

const FAQ: Record<string, string> = {
  'ki-telefon':
    'Mit dem **KI-Telefon-Mitarbeiter** verpasst du keine Anfrage mehr – auch wenn dein Team beschäftigt ist oder es nach Feierabend klingelt. Er nimmt Anrufe automatisch entgegen, qualifiziert Interessenten, beantwortet häufige Fragen und bucht Termine direkt in deinen Kalender. Klingt natürlich, arbeitet **24/7**.',
  'ki-chat':
    'Der **KI-Chatbot** auf deiner Website übernimmt Kundenanfragen rund um die Uhr. Er erfasst Leads, qualifiziert Interessenten, beantwortet FAQ automatisch, bucht Termine und übergibt alles sauber an dein CRM oder n8n-Workflow – ohne manuellen Aufwand.',
  'website':
    'Eine **Premium-Website** von AFA ist mehr als Design: konversionsorientiert, mit integriertem KI-Chatbot, automatisiertem Buchungssystem und bereit für Workflow-Automatisierungen. Modern, schnell und auf deine Zielgruppe abgestimmt.',
  'leads':
    'Unser **Lead-Generierungssystem** erfasst Websitebesucher automatisch, qualifiziert sie per KI-Chat oder Formular und übergibt kaufbereite Leads direkt an dein CRM, Google Sheets oder n8n-Workflow. Das Follow-up läuft ebenfalls vollautomatisch.',
  'preise':
    'Der Preis hängt vom Umfang, den Integrationen und der Systemkomplexität ab. Wir geben keine Pauschalpreise ohne Kontext, da jede Lösung individuell ist. **Am schnellsten: kostenloses Erstgespräch buchen** – dort klären wir gemeinsam, was du brauchst und was es kostet.',
  'datenschutz':
    'Datenschutz ist fester Bestandteil unserer Arbeit. Daten können über **sichere Formulare**, verschlüsselte Webhook-Workflows und DSGVO-konforme Dienste verarbeitet werden. Wir leisten keine Rechtsberatung, unterstützen dich aber bei der **technischen Umsetzung** datenschutzkonformer Prozesse.',
  'automation':
    'Wir automatisieren Geschäftsprozesse mit **n8n, Make und Zapier** – ohne teure Individualentwicklung. Lead-Routing ins CRM, automatische E-Mail-Sequenzen, Kalender-Sync, Reporting. Du sparst Zeit, dein Team konzentriert sich auf das Wesentliche.',
};

const TEASER_MSGS: { title: string; body: string }[] = [
  { title: 'Brauchst du Hilfe?',    body: 'Frag mich einfach.' },
  { title: 'KI für dein Business.', body: 'Telefon, Chatbot & Termine.' },
  { title: 'Beratung buchen?',      body: 'Kostenlos & unverbindlich.' },
];

const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni',
                   'Juli','August','September','Oktober','November','Dezember'];
const DE_DAYS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];
const DE_DAYS_L = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

// ── Helpers ───────────────────────────────────────────────────────────────
function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function pad2(n: number) { return String(n).padStart(2, '0'); }

// Extract free slot strings from a single day object — tries pre-filtered fields first,
// then falls back to slots minus blockedSlots. Returns [] if nothing found.
function extractSlotsFromDayObj(obj: Record<string, unknown>): string[] {
  const blocked = new Set<string>((obj['blockedSlots'] as string[] | undefined) ?? []);
  for (const key of ['availableSlots', 'freeSlots', 'selectedSlots', 'times']) {
    const val = obj[key];
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      return (val as string[]).filter(s => !blocked.has(s));
    }
  }
  const all = (obj['slots'] as string[] | undefined) ?? [];
  return all.filter(s => !blocked.has(s));
}

// Normalize any of the 3 n8n response formats and return free slots for a given date.
// Never returns TIME_SLOTS — caller shows a loading/error state if this returns [].
function extractSlotsForDate(data: AvailabilityResponse, dateStr: string): string[] {
  const raw = data as Record<string, unknown>;

  // Format 1: { availableDates: [{ date, ...slotFields }] }
  if (Array.isArray(raw['availableDates'])) {
    const day = (raw['availableDates'] as Record<string, unknown>[]).find(d => d['date'] === dateStr);
    if (day) return extractSlotsFromDayObj(day);
  }

  // Format 2: { availableSlots: [{ date, ...slotFields }] }  (array of objects)
  const avArr = raw['availableSlots'];
  if (Array.isArray(avArr) && avArr.length > 0 && typeof avArr[0] === 'object' && avArr[0] !== null) {
    const day = (avArr as Record<string, unknown>[]).find(d => d['date'] === dateStr);
    if (day) return extractSlotsFromDayObj(day);
  }

  // Format 3: flat root object — matches if date field equals selected, or no date field at all
  if (raw['date'] === dateStr || !raw['date']) {
    return extractSlotsFromDayObj(raw);
  }

  return [];
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const dow  = new Date(year, month, 1).getDay();
  const off  = dow === 0 ? 6 : dow - 1;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(off).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtDate(y: number, m: number, d: number) {
  const jsDay = new Date(y, m, d).getDay();
  const idx   = jsDay === 0 ? 6 : jsDay - 1;
  return `${DE_DAYS_L[idx]}, den ${d}. ${DE_MONTHS[m]} ${y}`;
}

function normalizeChatText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCancelAppointmentIntent(value: string): boolean {
  const text = normalizeChatText(value);
  return (
    text.includes('storn')               ||
    text.includes('storni')              ||
    text.includes('absag')               ||
    text.includes('cancel')              ||
    text.includes('cansel')              ||
    text.includes('loesch')              ||
    text.includes('losch')               ||
    text.includes('entfern')             ||
    text.includes('nicht kommen')        ||
    text.includes('nicht wahrnehmen')    ||
    text.includes('schaffe es nicht')    ||
    text.includes('passt mir nicht')     ||
    text.includes('termin no')           ||
    text.includes('termin weg')          ||
    text.includes('buchung weg')         ||
    text.includes('termin loschen')      ||
    text.includes('termin loeschen')     ||
    text.includes('buchung loschen')     ||
    text.includes('buchung loeschen')
  );
}

function isRescheduleAppointmentIntent(value: string): boolean {
  if (isCancelAppointmentIntent(value)) return false;
  const text = normalizeChatText(value);
  return (
    text.includes('verschie')               ||
    text.includes('verleg')                 ||
    text.includes('umbuch')                 ||
    text.includes('andere uhrzeit')         ||
    text.includes('anderen tag')            ||
    text.includes('anderen termin')         ||
    text.includes('anderer termin')         ||
    text.includes('neuer termin')           ||
    text.includes('neuen termin')           ||
    text.includes('termin andern')          ||
    (text.includes('termin') && text.includes('andern')) ||
    text.includes('ich kann zu dem termin nicht')        ||
    text.includes('mochte eine andere')
  );
}

function parseGermanDatetime(raw: string): string | null {
  const t = raw.trim();
  // DD.MM.YYYY um HH:MM  or  DD.MM.YYYY HH:MM
  const m1 = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+um\s*|\s+)(\d{1,2}):(\d{2})/i);
  if (m1) {
    const day  = String(m1[1]).padStart(2, '0');
    const mon  = String(m1[2]).padStart(2, '0');
    const hour = String(m1[4]).padStart(2, '0');
    const min  = String(m1[5]).padStart(2, '0');
    return `${m1[3]}-${mon}-${day} ${hour}:${min}:00`;
  }
  // DD.MM.YYYY um HH Uhr  (no minutes)
  const m2 = t.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+um\s*|\s+)(\d{1,2})\s*(?:uhr)?/i);
  if (m2) {
    const day  = String(m2[1]).padStart(2, '0');
    const mon  = String(m2[2]).padStart(2, '0');
    const hour = String(m2[4]).padStart(2, '0');
    return `${m2[3]}-${mon}-${day} ${hour}:00:00`;
  }
  // YYYY-MM-DD HH:MM  or  YYYY-MM-DDTHH:MM
  const m3 = t.match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{1,2}):(\d{2})/);
  if (m3) {
    const hour = String(m3[4]).padStart(2, '0');
    const min  = String(m3[5]).padStart(2, '0');
    return `${m3[1]}-${m3[2]}-${m3[3]} ${hour}:${min}:00`;
  }
  return null;
}

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (isCancelAppointmentIntent(text))    return 'cancel';
  if (isRescheduleAppointmentIntent(text)) return 'reschedule';
  if (/\b(termin|buchen|vereinbaren|beratung|gespräch|meeting|angebot anfordern|demo anfragen|erstgespräch)\b/.test(t)) return 'book';
  if (/ki.?telefon|voicebot|telefonassistent|phone.?ai|sprachassistent/.test(t))  return 'ki-telefon';
  if (/ki.?chat|chatbot|chat.assistent/.test(t))                                    return 'ki-chat';
  if (/premium.?web|webseite|homepage|landing|website/.test(t))                     return 'website';
  if (/lead.?gen|leadgen|akquise|interessenten|neukundengewinnung|leadgenerierung/.test(t)) return 'leads';
  if (/automatisier|workflow|n8n|zapier|make\.com|integration|prozess/.test(t))     return 'automation';
  if (/preis|kosten|angebot|budget|€|euro|teuer|günstig/.test(t))                  return 'pricing';
  if (/experte|expertenkontakt|mensch|mitarbeiter|sprechen|ansprechpartner/.test(t)) return 'human';
  if (/datenschutz|dsgvo|privacy|sicher|konform/.test(t))                           return 'datenschutz';
  if (/wie viel uhr|welche uhrzeit|wie spät/.test(t))                               return 'time';
  if (/welcher tag|welches datum|was ist heute/.test(t))                             return 'date';
  if (/was macht afa|wer ist afa|was ist afa|was bietet|was kann afa|was könnt ihr/.test(t)) return 'about-afa';
  return 'unknown';
}

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  bg: '#09090b', s1: '#111113', s2: '#18181b', s3: '#1a1a20',
  acc: '#00bbfd', accBg: 'rgba(0,187,253,0.09)', accBd: 'rgba(0,187,253,0.22)',
  bd: 'rgba(255,255,255,0.07)', txt: '#f4f4f5', muted: '#71717a', soft: '#a1a1aa',
};

// ── Injected CSS (hover states, animations, transitions) ──────────────────
const CHAT_CSS = `
  /* Calendar day cells */
  .afa-dc {
    aspect-ratio: 1;
    display: flex; align-items: center; justify-content: center;
    border-radius: 9px; font-size: 13px; font-weight: 600;
    border: 1px solid transparent; cursor: default; position: relative;
    transition: background .12s, border-color .12s, transform .12s cubic-bezier(.22,1,.36,1), box-shadow .12s;
    user-select: none; color: rgba(255,255,255,0.13);
  }
  .afa-dc.available { color: #f4f4f5; cursor: pointer; }
  .afa-dc.available:hover {
    background: rgba(0,187,253,0.07);
    border-color: rgba(0,187,253,0.25);
    transform: scale(1.1);
  }
  .afa-dc.available:active { transform: scale(0.92); }
  .afa-dc.today { border-color: rgba(0,187,253,0.35) !important; color: #00bbfd; }
  .afa-dc.selected {
    background: #00bbfd !important; border-color: transparent !important;
    color: #08090a !important; font-weight: 800; transform: scale(1.08);
    box-shadow: 0 0 18px rgba(0,187,253,0.38); cursor: default;
  }

  /* Time slots */
  .afa-slot {
    padding: 10px 6px; border-radius: 10px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer;
    text-align: center; font-family: inherit;
    transition: background .12s, border-color .12s, color .12s, transform .12s cubic-bezier(.22,1,.36,1), box-shadow .12s;
  }
  .afa-slot:hover {
    background: rgba(0,187,253,0.07); border-color: rgba(0,187,253,0.22);
    color: #f4f4f5; transform: scale(1.04);
  }
  .afa-slot.sel {
    background: rgba(0,187,253,0.09); border-color: rgba(0,187,253,0.38);
    color: #00bbfd; font-weight: 700; box-shadow: 0 0 12px rgba(0,187,253,0.12);
  }
  .afa-slot:active { transform: scale(0.94); }

  /* Nav buttons */
  .afa-nbtn {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #a1a1aa; font-size: 17px;
    transition: background .14s, color .14s;
  }
  .afa-nbtn:hover:not([disabled]) { background: rgba(255,255,255,0.09); color: #f4f4f5; }
  .afa-nbtn[disabled] { opacity: .22; cursor: not-allowed; }

  /* Primary button hover */
  .afa-btn-prim {
    transition: transform .16s, filter .16s, box-shadow .16s;
  }
  .afa-btn-prim:hover:not([disabled]) {
    transform: translateY(-2px); filter: brightness(1.08);
    box-shadow: 0 8px 28px rgba(0,187,253,0.35);
  }
  .afa-btn-prim:active { transform: scale(0.97); }
  .afa-btn-prim[disabled] { opacity: .3; cursor: not-allowed; }

  /* Ghost button hover */
  .afa-btn-ghost { transition: background .13s, border-color .13s, color .13s; }
  .afa-btn-ghost:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.14) !important; color: #f4f4f5 !important; }
  .afa-btn-ghost:active { transform: scale(0.96); }

  /* Quick reply pill hover */
  .afa-pill { transition: background .13s, border-color .13s, color .13s; }
  .afa-pill:hover { background: rgba(0,187,253,0.14) !important; }

  /* Menu grid item hover */
  .afa-menu-item { transition: background .13s, border-color .13s; }
  .afa-menu-item:hover { background: rgba(255,255,255,0.07) !important; border-color: rgba(255,255,255,0.14) !important; }

  /* Launcher glow pulse */
  @keyframes afa-glow {
    0%,100% { box-shadow: 0 4px 24px rgba(0,187,253,0.32), 0 2px 8px rgba(0,0,0,0.5); }
    50%      { box-shadow: 0 4px 44px rgba(0,187,253,0.58), 0 2px 14px rgba(0,0,0,0.5); }
  }
  .afa-launcher { animation: afa-glow 2.8s ease-in-out infinite; }
  .afa-launcher:hover {
    animation: none;
    transform: scale(1.1) !important;
    box-shadow: 0 4px 56px rgba(0,187,253,0.70), 0 2px 18px rgba(0,0,0,0.55) !important;
  }
  .afa-launcher:active { transform: scale(0.96) !important; }

  /* Chat window animations */
  @keyframes afa-open {
    from { opacity:0; transform: scale(0.86) translateY(16px); }
    to   { opacity:1; transform: scale(1)    translateY(0); }
  }
  @keyframes afa-close {
    from { opacity:1; transform: scale(1)    translateY(0); }
    to   { opacity:0; transform: scale(0.86) translateY(16px); }
  }
  .afa-win-open  { animation: afa-open  0.32s cubic-bezier(0.34,1.56,0.64,1); }
  .afa-win-close { animation: afa-close 0.22s cubic-bezier(0.4,0,0.2,1) forwards; }

  /* Zurück button */
  .afa-back-link {
    background: transparent; border: none; color: #71717a;
    cursor: pointer; font-size: 11px; font-family: inherit;
    transition: color .14s;
  }
  .afa-back-link:hover { color: #a1a1aa; }

  /* Calendar / confirm panel reveal */
  @keyframes cal-reveal {
    from { opacity: 0; transform: translateY(12px); filter: blur(2px); }
    to   { opacity: 1; transform: none;              filter: none; }
  }
  .afa-cal-wrap { animation: cal-reveal 0.38s cubic-bezier(0.22,1,0.36,1); }

  /* Anti-aliased sharp text */
  .afa-chat-root * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Avatar breathing glow */
  @keyframes afa-breathe {
    0%, 100% { box-shadow: 0 0 10px rgba(0,187,253,0.12); }
    50%       { box-shadow: 0 0 26px rgba(0,187,253,0.38), 0 0 0 3px rgba(0,187,253,0.07); }
  }
  .afa-avatar-hdr { animation: afa-breathe 3.2s ease-in-out infinite; }

  /* Radar ring spin */
  @keyframes afa-spin {
    to { transform: rotate(360deg); }
  }
  .afa-spin-ring {
    border: 1.5px solid transparent;
    border-top-color: rgba(0,187,253,0.6);
    border-right-color: rgba(0,187,253,0.18);
    animation: afa-spin 2.2s linear infinite;
  }

  /* Online dot pulse */
  @keyframes afa-pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
    50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
  }
  .afa-online-dot { animation: afa-pulse-dot 2.4s ease-in-out infinite; }

  /* Typing dots — cyan wave */
  @keyframes afa-tdot {
    0%, 70%, 100% { transform: translateY(0); opacity: 0.35; }
    35%           { transform: translateY(-5px); opacity: 1; }
  }
  .afa-td {
    width: 5px; height: 5px; border-radius: 50%;
    background: #00bbfd; animation: afa-tdot 1.1s ease-in-out infinite;
  }

  /* Teaser bubble glow pulse */
  @keyframes afa-tsr-pulse {
    0%   { box-shadow: 0 18px 52px rgba(0,0,0,0.72), 0 4px 18px rgba(0,0,0,0.5), 0 0 0 0   rgba(0,187,253,0.24); }
    50%  { box-shadow: 0 18px 52px rgba(0,0,0,0.72), 0 4px 18px rgba(0,0,0,0.5), 0 0 0 10px rgba(0,187,253,0.05); }
    100% { box-shadow: 0 18px 52px rgba(0,0,0,0.72), 0 4px 18px rgba(0,0,0,0.5), 0 0 0 0   rgba(0,187,253,0); }
  }
  .afa-tsr-pulse { animation: afa-tsr-pulse 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }

  /* Teaser bubble hover */
  .afa-teaser:hover { border-color: rgba(255,255,255,0.16) !important; }
  .afa-teaser:hover .afa-tsr-cta { color: rgba(0,187,253,0.95) !important; }

  /* Crafted by AFA credit */
  .afa-credit {
    text-align: center; font-size: 9.5px; letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.14); padding: 4px 0 5px;
    cursor: default; transition: color 0.25s; user-select: none;
    border-top: 1px solid rgba(255,255,255,0.04);
    font-family: var(--font-chivo,"Chivo Mono",monospace);
    background: rgba(12,12,15,0.6);
  }
  .afa-credit:hover { color: rgba(0,187,253,0.52); text-shadow: 0 0 10px rgba(0,187,253,0.18); }

  /* Refined pill hover */
  .afa-pill:hover {
    background: rgba(0,187,253,0.14) !important;
    border-color: rgba(0,187,253,0.38) !important;
    box-shadow: 0 0 8px rgba(0,187,253,0.12) !important;
  }

  /* Refined menu item hover */
  .afa-menu-item:hover {
    background: rgba(255,255,255,0.06) !important;
    border-color: rgba(255,255,255,0.16) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 10px rgba(0,0,0,0.3) !important;
  }
`;

// ── Component ─────────────────────────────────────────────────────────────
export default function PremiumChatbot() {
  const [open,       setOpen]      = useState(false);
  const [closing,    setClosing]   = useState(false);
  const [step,       setStep]      = useState<Step>('welcome');
  const [msgs,       setMsgs]      = useState<Msg[]>([]);
  const [lead,       setLead]      = useState<Partial<Lead>>({});
  const [leadGoal,   setLeadGoal]  = useState<LeadGoal>('book');
  const [selDate,    setSelDate]   = useState<{ year: number; month: number; day: number } | null>(null);
  const [selTime,    setSelTime]   = useState<string | null>(null);
  const [calYear,    setCalYear]   = useState(() => new Date().getFullYear());
  const [calMonth,   setCalMonth]  = useState(() => new Date().getMonth());
  const [typing,     setTyping]    = useState(false);
  const [input,      setInput]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pulse,      setPulse]     = useState(true);
  const [micTip,     setMicTip]    = useState(false);
  const [isMobile,   setIsMobile]  = useState(false);
  const [editingLead,   setEditingLead]   = useState(false);
  const [teaserIdx,     setTeaserIdx]     = useState(0);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [teaserPulse,   setTeaserPulse]   = useState(false);
  const [availability,  setAvailability]  = useState<AvailabilityResponse | null>(null);
  const [availLoading,  setAvailLoading]  = useState(false);
  const [availError,    setAvailError]    = useState(false);
  const [availRetryTick, setAvailRetryTick] = useState(0);
  const [dateSlots,          setDateSlots]          = useState<string[] | null>(null);
  const [dateSlotsLoading,   setDateSlotsLoading]   = useState(false);
  const [dateSlotsError,     setDateSlotsError]     = useState(false);
  const [dateSlotsRetryTick, setDateSlotsRetryTick] = useState(0);
  const [pendingCancellationAppointment, setPendingCancellationAppointment] = useState<{
    event_id: string; email: string; name: string;
    interesse: string; terminFormatted: string; besprechungslink: string;
    cancel_url: string;
  } | null>(null);
  const [pendingRescheduleAppointment, setPendingRescheduleAppointment] = useState<{
    event_id: string; email: string; name: string;
    interesse: string; terminFormatted: string;
  } | null>(null);
  const [privacyAccepted,  setPrivacyAccepted]  = useState(false);
  const [pendingLeadGoal,  setPendingLeadGoal]  = useState<LeadGoal>('book');
  const [pendingLeadIntro, setPendingLeadIntro] = useState<string | null>(null);

  const scrollRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const calRef         = useRef<HTMLDivElement>(null);
  const idRef          = useRef(0);
  const handleOpenRef  = useRef<(mode?: string) => void>(() => {});
  const teaserTimerRef = useRef<ReturnType<typeof setTimeout>  | undefined>(undefined);
  const teaserCycleRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const nextId    = () => ++idRef.current;

  const lastBotId = useMemo(
    () => [...msgs].reverse().find(m => m.role === 'bot')?.id ?? -1,
    [msgs],
  );

  useEffect(() => {
    console.log('AFA_CHATBOT_V4');
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    (window as Window & { AFAChatbot?: { open: (mode?: string) => void } }).AFAChatbot = {
      open: (mode?: string) => handleOpenRef.current(mode),
    };
  }, []);

  // Scroll to bottom only on new text messages and typing indicator changes.
  // Calendar panels are NOT included — they appear below the message and the
  // user scrolls down manually if they want to see them.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Proactive teaser messages while chat is closed
  useEffect(() => {
    clearTimeout(teaserTimerRef.current);
    clearInterval(teaserCycleRef.current);
    if (open) { setTeaserVisible(false); return; }

    let msgIdx = 0;
    let shown  = 0;
    const MAX  = TEASER_MSGS.length + 1; // show each message at most once, then stop

    teaserTimerRef.current = setTimeout(() => {
      setTeaserIdx(0);
      setTeaserVisible(true);

      teaserCycleRef.current = setInterval(() => {
        shown++;
        if (shown >= MAX) {
          clearInterval(teaserCycleRef.current);
          setTeaserVisible(false);
          return;
        }
        // Fade out → swap message → fade in
        setTeaserVisible(false);
        setTimeout(() => {
          msgIdx = (msgIdx + 1) % TEASER_MSGS.length;
          setTeaserIdx(msgIdx);
          setTeaserVisible(true);
        }, 420);
      }, 13000);
    }, 5000);

    return () => {
      clearTimeout(teaserTimerRef.current);
      clearInterval(teaserCycleRef.current);
    };
  }, [open]);

  // Fire a brief glow pulse each time the teaser becomes visible
  useEffect(() => {
    if (!teaserVisible) return;
    const t = setTimeout(() => {
      setTeaserPulse(true);
      setTimeout(() => setTeaserPulse(false), 850);
    }, 360);
    return () => clearTimeout(t);
  }, [teaserVisible]);

  // Fetch real availability from n8n whenever the booking calendar is open or month changes
  useEffect(() => {
    if (step !== 'cal-date' && step !== 'reschedule-cal-date') return;
    const startDate = `${calYear}-${pad2(calMonth + 1)}-01`;
    const lastDay   = new Date(calYear, calMonth + 1, 0).getDate();
    const endDate   = `${calYear}-${pad2(calMonth + 1)}-${pad2(lastDay)}`;
    let cancelled   = false;
    setAvailLoading(true);
    setAvailError(false);
    setAvailability(null);
    console.log('[AFA Cal] Availability URL:', AVAILABILITY_WEBHOOK);
    fetch(AVAILABILITY_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })
      .then(r => r.json())
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        console.log('[AFA Cal] Full availability response:', data);
        if (data.success) setAvailability(data);
        else setAvailError(true);
      })
      .catch(() => { if (!cancelled) setAvailError(true); })
      .finally(() => { if (!cancelled) setAvailLoading(false); });
    return () => { cancelled = true; };
  }, [step, calYear, calMonth, availRetryTick]);

  // Per-date fetch: fires every time the user enters cal-time for a selected date.
  // Always queries the webhook with the specific date so n8n checks Google Calendar in real time.
  // Never falls back to hardcoded slots — only uses what n8n returns.
  useEffect(() => {
    if ((step !== 'cal-time' && step !== 'reschedule-cal-time') || !selDate) return;
    const ds = `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}`;
    let cancelled = false;
    setDateSlots(null);
    setDateSlotsLoading(true);
    setDateSlotsError(false);
    console.log('[AFA availability request]', { date: ds, startDate: ds, endDate: ds });
    fetch(AVAILABILITY_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: ds, startDate: ds, endDate: ds }),
    })
      .then(r => r.json())
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        console.log('[AFA availability response]', data);
        if (data.success) {
          const slots = extractSlotsForDate(data, ds);
          console.log('[AFA selected date]', ds);
          console.log('[AFA slots rendered]', slots);
          setDateSlots(slots);
        } else {
          setDateSlotsError(true);
        }
      })
      .catch(() => { if (!cancelled) setDateSlotsError(true); })
      .finally(() => { if (!cancelled) setDateSlotsLoading(false); });
    return () => { cancelled = true; };
  }, [step, selDate, dateSlotsRetryTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core messaging ────────────────────────────────────────────────────────
  function botReply(text: string, qr?: string[], delay = 950, menuGrid?: boolean) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text, quickReplies: qr, menuGrid }]);
    }, delay);
  }

  function addUserMsg(text: string) {
    setMsgs(m => [...m, { id: nextId(), role: 'user', text }]);
  }

  function showMenu(intro?: string) {
    botReply(
      intro ?? 'Ich helfe dir gerne weiter. Wähle einfach einen Bereich aus oder beschreibe kurz dein Anliegen.',
      MAIN_MENU, 700, true,
    );
  }

  function closeChat() {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 240);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleOpen(mode?: string) {
    setOpen(true);
    if (msgs.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        if (mode === 'appointment_booking') {
          setMsgs([{ id: nextId(), role: 'bot', text: 'Sehr gerne. Ich helfe dir, einen passenden Beratungstermin zu buchen.' }]);
          setTimeout(() => startLead('book', 'Gerne buche ich einen Termin für dich! Wie ist dein **Vorname**?'), 800);
        } else {
          setMsgs([{
            id: nextId(), role: 'bot',
            text: 'Willkommen bei **AFA**. Ich bin dein KI-Assistent für moderne Unternehmenslösungen. Ich helfe dir bei Beratungsterminen, KI-Telefon, KI-Chatbots und Premium-Websites. Wobei darf ich helfen?',
            quickReplies: MAIN_MENU, menuGrid: true,
          }]);
        }
      }, 700);
    }
    setTimeout(() => inputRef.current?.focus(), 800);
  }
  handleOpenRef.current = handleOpen;

  function startLeadInternal(goal: LeadGoal, intro?: string) {
    setLeadGoal(goal);
    setLead({});
    setEditingLead(false);
    setStep('lead-vorname');
    botReply(intro ?? 'Gerne! Wie ist dein **Vorname**?', ['Zurück zum Start']);
  }

  function startLead(goal: LeadGoal, intro?: string) {
    if (!privacyAccepted) {
      setPendingLeadGoal(goal);
      setPendingLeadIntro(intro ?? null);
      setStep('privacy-notice');
      botReply(
        'Bevor wir deine Kontaktdaten aufnehmen:\n\nDeine Angaben werden ausschließlich zur Bearbeitung deiner Anfrage und zur Terminorganisation verwendet.',
        ['Einverstanden', 'Datenschutzerklärung öffnen', 'Abbrechen'],
      );
      return;
    }
    startLeadInternal(goal, intro);
  }

  function handleIntent(intent: string) {
    const back = ['Zurück zum Start'];
    switch (intent) {
      case 'book':
        startLead('book', 'Sehr gerne buche ich einen Termin für dich! Wie ist dein **Vorname**?');
        return;
      case 'ki-telefon':
        botReply(FAQ['ki-telefon'], ['Termin buchen', 'Preise anfragen', 'Expertenkontakt', ...back]);
        return;
      case 'ki-chat':
        botReply(FAQ['ki-chat'],    ['Termin buchen', 'Preise anfragen', 'Expertenkontakt', ...back]);
        return;
      case 'website':
        botReply(FAQ['website'],    ['Demo anfragen',  'Preise anfragen', 'Expertenkontakt', ...back]);
        return;
      case 'leads':
        botReply(FAQ['leads'],      ['Termin buchen', 'Expertenkontakt', ...back]);
        return;
      case 'automation':
        botReply(FAQ['automation'], ['Demo anfragen', 'Termin buchen', ...back]);
        return;
      case 'pricing':
        botReply(FAQ['preise'],     ['Beratung buchen', 'Details anfragen', 'Expertenkontakt', ...back]);
        return;
      case 'datenschutz':
        botReply(FAQ['datenschutz'],['Expertenkontakt', 'Beratung buchen', ...back]);
        return;
      case 'cancel':
        setPendingCancellationAppointment(null);
        setStep('cancel-email');
        botReply('Gerne. Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start']);
        return;
      case 'reschedule':
        setPendingRescheduleAppointment(null);
        setLead({});
        setStep('reschedule-email');
        botReply('Gerne. Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start']);
        return;
      case 'human':
        startLead('handoff', 'Kein Problem! Ich verbinde dich mit einem Experten. Wie ist dein **Vorname**?');
        return;
      case 'time': {
        const timeStr = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        botReply(`Es ist gerade **${timeStr} Uhr** (lokale Browserzeit). Kann ich dir noch helfen?`, MAIN_MENU, 500, true);
        return;
      }
      case 'date': {
        const dateStr2 = new Date().toLocaleDateString('de-DE', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
        botReply(`Heute ist **${dateStr2}**. Kann ich dir noch mit etwas helfen?`, MAIN_MENU, 500, true);
        return;
      }
      case 'about-afa':
        botReply('**AFA** entwickelt KI-Mitarbeiter für moderne Unternehmen: KI-Telefon-Agenten, KI-Chatbots, Premium Websites, Leadgenerierung und automatisierte Terminbuchung – alles aus einer Hand.', ['Beratung buchen', 'Preise / Angebot', 'Expertenkontakt', 'Zurück zum Start']);
        return;
      default:
        showMenu();
    }
  }

  // ── Input dispatcher ──────────────────────────────────────────────────────
  function handleUserInput(rawText: string) {
    const text = rawText.trim();
    if (!text || submitting || typing) return;

    addUserMsg(text);
    setInput('');

    if (text === 'Zurück zum Start' || text === 'Neue Anfrage starten') { reset(); return; }
    if (text === 'Weitere Fragen')     { showMenu(); return; }

    // ── Confirm / deny cancellation — must run BEFORE isCancelAppointmentIntent ──
    if (text === 'Ja, Termin stornieren' && step === 'cancel-confirm') {
      if (pendingCancellationAppointment) {
        setTyping(true);
        doCancelAppointment(pendingCancellationAppointment.cancel_url);
      }
      return;
    }
    if (text === 'Nein, nicht stornieren') {
      setPendingCancellationAppointment(null);
      setStep('welcome');
      botReply('Alles klar, der Termin wurde nicht storniert.', ['Zurück zum Start']);
      return;
    }

    // ── Reschedule confirm/deny — must run BEFORE isRescheduleAppointmentIntent ──
    if (text === 'Ja, Termin verschieben' && step === 'reschedule-confirm') {
      if (pendingRescheduleAppointment) {
        setSelDate(null);
        setSelTime(null);
        setCalYear(new Date().getFullYear());
        setCalMonth(new Date().getMonth());
        setAvailability(null);
        setAvailError(false);
        setDateSlots(null);
        setDateSlotsError(false);
        setStep('reschedule-cal-date');
        botReply('Bitte wähle jetzt den neuen Termin aus.', undefined, 600);
      }
      return;
    }
    if (text === 'Nein' && step === 'reschedule-confirm') {
      setPendingRescheduleAppointment(null);
      setStep('welcome');
      botReply('Alles klar. Der Termin bleibt unverändert.', ['Zurück zum Start', 'Termin stornieren', 'Beratung buchen']);
      return;
    }

    // ── Reschedule datetime step (manual fallback) — bypass intent detection ──
    if (step === 'reschedule-datetime') {
      if (text === 'Andere Uhrzeit wählen' || text === 'Kalender öffnen') {
        setSelDate(null);
        setSelTime(null);
        setAvailability(null);
        setAvailError(false);
        setDateSlots(null);
        setDateSlotsError(false);
        setStep('reschedule-cal-date');
        botReply('Bitte wähle jetzt den neuen Termin aus.', undefined, 400);
        return;
      }
      const dt = parseGermanDatetime(text);
      if (!dt) {
        botReply('Bitte gib den neuen Termin im Format **TT.MM.JJJJ um HH:MM** an, zum Beispiel: 18.06.2026 um 14:30 Uhr.', ['Kalender öffnen', 'Zurück zum Start'], 500);
        return;
      }
      if (!pendingRescheduleAppointment) {
        botReply('Es ist ein Fehler aufgetreten. Bitte starte von vorne.', ['Zurück zum Start'], 400);
        setStep('welcome');
        return;
      }
      setTyping(true);
      doRescheduleAppointment(pendingRescheduleAppointment.event_id, pendingRescheduleAppointment.email, dt);
      return;
    }

    // ── Reschedule cal steps — bypass intent detection ──
    if (step === 'reschedule-cal-date' || step === 'reschedule-cal-time') {
      return; // all interaction happens via the visual picker; ignore free text
    }

    // ── Weitere Optionen — show secondary menu ──
    if (text === 'Weitere Optionen') {
      botReply('Weitere Optionen:', SECONDARY_MENU, 400, true);
      return;
    }

    // ── Privacy notice step ──
    if (step === 'privacy-notice') {
      if (text === 'Einverstanden') {
        setPrivacyAccepted(true);
        startLeadInternal(pendingLeadGoal, pendingLeadIntro ?? undefined);
        return;
      }
      if (text === 'Datenschutzerklärung öffnen') {
        window.open('/datenschutz', '_blank');
        botReply(
          'Die Datenschutzerklärung wurde in einem neuen Tab geöffnet. Möchtest du fortfahren?',
          ['Einverstanden', 'Abbrechen'],
          400,
        );
        return;
      }
      reset();
      return;
    }

    // ── Cancellation intent — absolute highest priority, interrupts any active flow ──
    if (text === 'Termin stornieren' || isCancelAppointmentIntent(text)) {
      setPendingCancellationAppointment(null);
      setLead({});
      setStep('cancel-email');
      botReply('Gerne. Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start']);
      return;
    }

    // ── Reschedule intent — second priority after cancel ──
    if (text === 'Termin verschieben' || isRescheduleAppointmentIntent(text)) {
      setPendingRescheduleAppointment(null);
      setLead({});
      setStep('reschedule-email');
      botReply('Gerne. Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start']);
      return;
    }

    if (text === 'Details anfragen' || text === 'Demo anfragen') {
      startLead('book', 'Super! Für dein individuelles Angebot brauche ich kurz deine Daten. Wie ist dein **Vorname**?');
      return;
    }

    switch (step) {
      case 'welcome': handleIntent(detectIntent(text)); return;

      case 'lead-vorname':
        setLead(l => ({ ...l, vorname: text }));
        setStep('lead-nachname');
        botReply(`Perfekt, ${text}. Wie lautet dein **Nachname**?`, ['Zurück zum Start']);
        return;

      case 'lead-nachname':
        setLead(l => ({ ...l, nachname: text }));
        setStep('lead-email');
        botReply('Perfekt! Und deine **E-Mail-Adresse**?', ['Zurück zum Start']);
        return;

      case 'lead-email':
        if (!validateEmail(text)) {
          botReply('Das scheint keine gültige E-Mail zu sein. Bitte nochmal versuchen. 📧', ['Zurück zum Start'], 500);
          return;
        }
        setLead(l => ({ ...l, email: text }));
        setStep('lead-telefon');
        botReply('Danke! Wie lautet deine **Telefonnummer**?', ['Zurück zum Start']);
        return;

      case 'lead-telefon': {
        const digits = text.replace(/\D/g, '');
        if (digits.length < 5) {
          botReply('Bitte gib eine gültige **Telefonnummer** ein (z.B. +49 151 12345678).', ['Zurück zum Start'], 500);
          return;
        }
        setLead(l => ({ ...l, telefon: text }));
        setStep('lead-unternehmen');
        botReply('Und wie heißt dein **Unternehmen**?', ['Zurück zum Start']);
        return;
      }

      case 'lead-unternehmen': {
        if (text.trim().length < 2) {
          botReply('Bitte gib deinen **Unternehmensnamen** ein.', ['Zurück zum Start'], 500);
          return;
        }
        setLead(l => ({ ...l, unternehmen: text }));
        if (leadGoal === 'handoff') {
          setStep('submitting');
          setTyping(true);
          const final = { ...lead, unternehmen: text };
          setTimeout(() => { doHandoff(final); }, 600);
          return;
        }
        setStep('lead-interesse');
        botReply('Fast geschafft! Wofür interessierst du dich am meisten?', [...INTEREST_REPLIES, 'Zurück zum Start']);
        return;
      }

      case 'lead-interesse': {
        if (text === 'Eigenes Anliegen') {
          setStep('lead-custom');
          botReply('Beschreibe kurz dein Anliegen. Wir prüfen es und melden uns persönlich bei dir.', ['Zurück zum Start'], 600);
          return;
        }
        const interesse = text;
        setLead(l => ({ ...l, interesse }));
        if (editingLead) {
          setEditingLead(false);
          setStep('confirm');
          botReply('Danke! Prüfe deine aktualisierte **Zusammenfassung** unten. 📋', undefined, 500);
          return;
        }
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Super! Wähle jetzt deinen **Wunschtermin** im Kalender. 📅' }]);
          setTimeout(() => setStep('cal-date'), 1200);
        }, 600);
        return;
      }

      case 'lead-custom': {
        setLead(l => ({ ...l, interesse: text }));
        // Fire lead webhook with the custom request (non-blocking)
        sendLeadWebhook({ ...lead, interesse: text }, text);
        if (editingLead) {
          setEditingLead(false);
          setStep('confirm');
          botReply('Danke! Prüfe deine aktualisierte **Zusammenfassung** unten. 📋', undefined, 500);
          return;
        }
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Vielen Dank! Wähle jetzt deinen **Wunschtermin** im Kalender, damit wir uns persönlich bei dir melden können. 📅' }]);
          setTimeout(() => setStep('cal-date'), 1200);
        }, 700);
        return;
      }

      case 'sms-confirm':
        handleSmsConfirm(text === 'Ja, SMS senden');
        return;

      case 'cancel-email': {
        if (text === 'Erneut versuchen') {
          botReply('Kein Problem! Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start'], 400);
          return;
        }
        if (!validateEmail(text)) {
          botReply('Das scheint keine gültige E-Mail zu sein. Bitte nochmal versuchen. 📧', ['Zurück zum Start'], 500);
          return;
        }
        setTyping(true);
        doFindAppointment(text);
        return;
      }

      case 'cancel-confirm': {
        // Ja/Nein already handled above; catch-all if user types something else
        botReply('Bitte wähle eine Option.', ['Ja, Termin stornieren', 'Nein, nicht stornieren'], 400);
        return;
      }

      case 'reschedule-email': {
        if (text === 'E-Mail erneut eingeben' || text === 'Erneut versuchen') {
          botReply('Kein Problem! Bitte nenne mir die **E-Mail-Adresse**, mit der der Termin gebucht wurde.', ['Zurück zum Start'], 400);
          return;
        }
        if (text === 'Termin vereinbaren') {
          startLead('book', 'Sehr gerne buche ich einen Termin für dich! Wie ist dein **Vorname**?');
          return;
        }
        if (!validateEmail(text)) {
          botReply('Das scheint keine gültige E-Mail zu sein. Bitte nochmal versuchen. 📧', ['Zurück zum Start'], 500);
          return;
        }
        setTyping(true);
        doFindAppointmentForReschedule(text);
        return;
      }

      case 'reschedule-confirm': {
        // Ja/Nein handled above; catch-all
        botReply('Bitte wähle eine Option.', ['Ja, Termin verschieben', 'Nein'], 400);
        return;
      }

      case 'cal-date': case 'cal-time': case 'confirm': case 'submitting':
        botReply('Bitte nutze die Auswahl unten. 👇', undefined, 400);
        return;

      case 'success': case 'handoff-done':
        showMenu('Ich bin weiterhin für dich da:');
        return;

      case 'error':
        if (text === 'Erneut versuchen' && selDate && selTime) { submitBooking(); return; }
        botReply('Möchtest du es erneut versuchen?', ['Erneut versuchen', 'Neue Anfrage starten'], 400);
        return;

      default: handleIntent(detectIntent(text));
    }
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  // Shared lead webhook — fire-and-forget is OK for side-effect calls
  async function sendLeadWebhook(finalLead: Partial<Lead>, customAnliegen = '') {
    const payload = {
      type: 'lead',
      vorname:       finalLead.vorname      ?? '',
      nachname:      finalLead.nachname     ?? '',
      email:         finalLead.email        ?? '',
      telefon:       finalLead.telefon      ?? '',
      unternehmen:   finalLead.unternehmen  ?? '',
      interesse:     finalLead.interesse    ?? '',
      customAnliegen,
      quelle:  'Website Chatbot',
      status:  'Neu',
    };
    console.log('[AFA Lead webhook]', payload);
    try {
      if (LEAD_WEBHOOK) {
        const res = await fetch(LEAD_WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        console.log('[AFA Lead response]', res.status);
      }
    } catch (err) {
      console.error('[AFA Lead error]', err);
    }
  }

  // Human handoff — fires lead webhook then shows result
  async function doHandoff(finalLead: Partial<Lead>) {
    try {
      await sendLeadWebhook(finalLead);
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role:'bot', text:'Danke! Deine Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei dir.', quickReplies:['Neue Anfrage starten'] }]);
      setStep('handoff-done');
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role:'bot', text:'Es gab ein Problem bei der Übermittlung. Bitte versuche es erneut.', quickReplies:['Erneut versuchen','Neue Anfrage starten'] }]);
      setStep('error');
    }
  }

  // Core booking submission — fires termin webhook with smsWanted resolved
  async function doTermin(smsWanted: boolean) {
    if (!selDate || !selTime) return;
    const dateStr     = `${selDate.year}-${pad2(selDate.month+1)}-${pad2(selDate.day)}`;
    // Plain local string — never toISOString() as that converts to UTC
    const dateTimeStr = `${dateStr}T${selTime}:00`;
    const payload = {
      type: 'termin',
      vorname:             lead.vorname     ?? '',
      nachname:            lead.nachname    ?? '',
      email:               lead.email       ?? '',
      telefon:             lead.telefon     ?? '',
      unternehmen:         lead.unternehmen ?? '',
      interesse:           lead.interesse   ?? '',
      appointmentDate:     dateStr,       // "2026-06-18"
      appointmentTime:     selTime,       // "16:00"
      appointmentDateTime: dateTimeStr,   // "2026-06-18T16:00:00" — no UTC offset
      terminDatumZeit:     dateTimeStr,
      datum:               dateStr,
      uhrzeit:             selTime,       // use this in n8n emails to avoid tz shift
      sms:                 smsWanted ? 'Ja' : 'Nein',
      smsWanted,
      quelle:  'Website Chatbot',
      status:  'Termin gebucht',
    };
    console.log('[AFA Termin webhook] Payload:', payload);
    try {
      if (!TERMIN_WEBHOOK) throw new Error('TERMIN_WEBHOOK URL not configured');

      const res = await fetch(TERMIN_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[AFA Termin response] Status:', res.status);

      // Always read body first — n8n may return slot_taken details even on 409
      const body = await res.json().catch(() => ({}));
      console.log('[AFA Termin response] Body:', body);

      // Slot taken — either HTTP 409 or explicit error payload
      if (!res.ok || body.success === false || body.error === 'slot_taken') {
        const msg = body.message || 'Dieser Termin ist leider bereits vergeben. Bitte wähle eine andere Uhrzeit.';
        setTyping(false); setSubmitting(false);
        setSelTime(null);
        botReply(msg, undefined, 400);
        setStep('cal-time');
        // Re-fetch fresh availability so the occupied slot disappears from the picker
        if (selDate && AVAILABILITY_WEBHOOK) {
          fetch(AVAILABILITY_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: dateStr, endDate: dateStr }),
          })
            .then(r => r.json())
            .then((fresh: AvailabilityResponse) => {
              if (fresh.success && (fresh.availableDates?.length ?? 0) > 0) {
                setAvailability(prev => {
                  if (!prev) return fresh;
                  const merged = (prev.availableDates ?? []).map(d => {
                    const updated = fresh.availableDates?.find(fd => fd.date === d.date);
                    return updated ?? d;
                  });
                  const added = (fresh.availableDates ?? []).filter(fd => !(prev.availableDates ?? []).find(d => d.date === fd.date));
                  return { ...prev, availableDates: [...merged, ...added] };
                });
              }
            })
            .catch(() => {});
        }
        return;
      }

      setTyping(false); setSubmitting(false);
      const confirmText = smsWanted
        ? `📱 SMS wird gesendet! Perfekt! Dein Termin wurde erfolgreich gebucht. Du erhältst in Kürze eine Bestätigung per E-Mail an **${lead.email}**.`
        : `Perfekt! Dein Termin wurde erfolgreich gebucht. Du erhältst in Kürze eine Bestätigung per E-Mail an **${lead.email}**.`;
      setMsgs(m => [...m, { id:nextId(), role:'bot', text:confirmText, quickReplies:['Neue Anfrage starten'] }]);
      setStep('success');
    } catch (err) {
      console.error('[AFA Termin error]', err);
      setTyping(false); setSubmitting(false);
      setMsgs(m => [...m, { id:nextId(), role:'bot', text:'Es gab ein Problem bei der Terminbuchung. Bitte versuche es erneut oder kontaktiere uns direkt.', quickReplies:['Erneut versuchen','Neue Anfrage starten'] }]);
      setStep('error');
    }
  }

  // Called from "Termin bestätigen" button on confirm screen
  async function submitBooking() {
    if (!selDate || !selTime || submitting) return;

    const ds = `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}`;
    setSubmitting(true);  // block double-clicks during re-check

    // Final re-check: fetch fresh availability for this date before booking
    try {
      const checkRes = await fetch(AVAILABILITY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: ds, endDate: ds }),
      });
      const freshData: AvailabilityResponse = await checkRes.json();
      console.log('[AFA Cal] Pre-booking re-check:', freshData);

      if (freshData.success) {
        setAvailability(freshData);  // update cached data with fresh response
        const freshDay    = freshData.availableDates?.find(a => a.date === ds);
        const freshBlocked = new Set<string>(freshDay?.blockedSlots ?? []);
        const slotAllowed  = !!(freshDay?.slots ?? []).filter(s => !freshBlocked.has(s)).includes(selTime);
        console.log('[AFA Cal] Selected time allowed (re-check):', slotAllowed, selTime);

        if (!slotAllowed) {
          setSubmitting(false);
          botReply('Dieser Termin ist leider gerade vergeben. Bitte wähle eine andere Uhrzeit.', undefined, 400);
          setStep('cal-time');
          return;
        }
      }
    } catch {
      // Network error on re-check — fall back to cached availability
      console.warn('[AFA Cal] Pre-booking re-check failed, using cached availability');
      if (availability) {
        const av         = availability.availableDates?.find(a => a.date === ds);
        const blocked    = new Set<string>(av?.blockedSlots ?? []);
        const slotAllowed = !!(av?.slots ?? []).filter(s => !blocked.has(s)).includes(selTime);
        if (!slotAllowed) {
          setSubmitting(false);
          botReply('Dieser Termin ist leider gerade vergeben. Bitte wähle eine andere Uhrzeit.', undefined, 400);
          setStep('cal-time');
          return;
        }
      }
    }

    setSubmitting(false);  // release before SMS or final submit

    if (lead.telefon) {
      // Collect SMS preference first — webhook fires in handleSmsConfirm
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(m => [...m, { id:nextId(), role:'bot', text:`Möchtest du eine **SMS-Bestätigung** an **${lead.telefon}** erhalten?`, quickReplies:['Ja, SMS senden','Nein, danke'] }]);
        setStep('sms-confirm');
      }, 420);
    } else {
      setSubmitting(true); setStep('submitting'); setTyping(true);
      await doTermin(false);
    }
  }

  async function handleSmsConfirm(wantsSms: boolean) {
    setSubmitting(true); setStep('submitting'); setTyping(true);
    await doTermin(wantsSms);
  }

  async function doFindAppointment(email: string) {
    try {
      const res  = await fetch(FIND_APPT_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      setTyping(false);
      if (!data.success) {
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Ich konnte leider keine aktive Buchung mit dieser E-Mail-Adresse finden. Bitte prüfe die E-Mail-Adresse oder kontaktiere uns direkt unter info@afa-ai.com.', quickReplies: ['Erneut versuchen', 'Zurück zum Start'] }]);
        setStep('cancel-email');
      } else {
        const besprechungslink: string = data.besprechungslink || data.meetLink || data.hangoutLink || data.conferenceLink || data.videoCallLink || '';
        const appt = {
          event_id:        String(data.event_id ?? ''),
          email,
          name:            String(data.name ?? ''),
          interesse:       String(data.interesse ?? ''),
          terminFormatted: String(data.terminFormatted ?? ''),
          besprechungslink,
          cancel_url:      String(data.cancel_url ?? ''),
        };
        setPendingCancellationAppointment(appt);
        const lines: string[] = [
          'Ich habe diesen Termin gefunden:',
          '',
          `**Name:** ${appt.name}`,
          `**Leistung:** ${appt.interesse}`,
          `**Termin:** ${appt.terminFormatted}`,
        ];
        if (besprechungslink) lines.push(`**Besprechungslink:** ${besprechungslink}`);
        lines.push('', 'Ist das der Termin, den du stornieren möchtest?');
        setStep('cancel-confirm');
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: lines.join('\n'), quickReplies: ['Ja, Termin stornieren', 'Nein, nicht stornieren'] }]);
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Es gab ein Problem bei der Suche. Bitte versuche es erneut.', quickReplies: ['Erneut versuchen', 'Zurück zum Start'] }]);
      setStep('cancel-email');
    }
  }

  async function doCancelAppointment(cancelUrl: string) {
    setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Einen Moment, ich storniere deinen Termin...' }]);
    console.log('Cancelling appointment via hidden cancel_url:', cancelUrl);
    try {
      const res = await fetch(cancelUrl, { method: 'GET' });
      console.log('Cancel response status:', res.status);
      setTyping(false);
      if (res.ok) {
        setPendingCancellationAppointment(null);
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Dein Termin wurde erfolgreich storniert. Du erhältst zusätzlich eine Bestätigung per E-Mail.', quickReplies: ['Neue Anfrage starten'] }]);
        setStep('success');
      } else {
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Der Termin konnte leider nicht automatisch storniert werden. Bitte kontaktiere uns direkt unter info@afa-ai.com.', quickReplies: ['Zurück zum Start'] }]);
        setStep('welcome');
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Der Termin konnte leider nicht automatisch storniert werden. Bitte kontaktiere uns direkt unter info@afa-ai.com.', quickReplies: ['Zurück zum Start'] }]);
      setStep('welcome');
    }
  }

  async function doFindAppointmentForReschedule(email: string) {
    try {
      const res  = await fetch(FIND_APPT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'Website Chatbot' }),
      });
      const data = await res.json();
      setTyping(false);
      if (!data.success) {
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Ich konnte zu dieser E-Mail-Adresse leider keinen aktiven Termin finden. Bitte prüfe die E-Mail-Adresse.', quickReplies: ['E-Mail erneut eingeben', 'Termin vereinbaren', 'Zurück zum Start'] }]);
        setStep('reschedule-email');
      } else {
        const appt = {
          event_id:        String(data.event_id ?? ''),
          email,
          name:            String(data.name ?? ''),
          interesse:       String(data.interesse ?? ''),
          terminFormatted: String(data.terminFormatted ?? ''),
        };
        setPendingRescheduleAppointment(appt);
        const lines: string[] = [
          'Ich habe diesen Termin gefunden:',
          '',
          `**Name:** ${appt.name}`,
          `**Leistung:** ${appt.interesse}`,
          `**Termin:** ${appt.terminFormatted}`,
          '',
          'Möchtest du diesen Termin verschieben?',
        ];
        setStep('reschedule-confirm');
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: lines.join('\n'), quickReplies: ['Ja, Termin verschieben', 'Nein'] }]);
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Es gab ein Problem bei der Suche. Bitte versuche es erneut.', quickReplies: ['E-Mail erneut eingeben', 'Zurück zum Start'] }]);
      setStep('reschedule-email');
    }
  }

  async function doRescheduleAppointment(eventId: string, email: string, newDatetime: string) {
    setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Einen Moment, ich prüfe die Verfügbarkeit und verschiebe deinen Termin...' }]);
    const payload = {
      event_id:         eventId,
      email,
      new_datetime:     newDatetime,
      duration_minutes: 30,
      timezone:         'Europe/Berlin',
      source:           'Website Chatbot',
      message:          'Terminverschiebung über Website Chatbot',
    };
    console.log('[AFA Reschedule] Payload:', payload);
    try {
      const res  = await fetch(RESCHEDULE_APPT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({})) as Record<string, unknown>;
      console.log('[AFA Reschedule] Response:', data);
      setTyping(false);
      const isSuccess = data.success === true || data.status === 'success';
      const isNotAvailable = !isSuccess && (data.error === 'not_available' || data.status === 'not_available');
      if (isSuccess) {
        setPendingRescheduleAppointment(null);
        const msg = (data.message as string) || 'Dein Termin wurde erfolgreich verschoben. Du erhältst zusätzlich eine Bestätigung per E-Mail.';
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: msg, quickReplies: ['Zurück zum Start', 'Beratung buchen', 'Termin stornieren'] }]);
        setStep('success');
      } else if (isNotAvailable) {
        setSelTime(null);
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Diese Uhrzeit ist leider nicht verfügbar. Bitte wähle eine andere Uhrzeit.' }]);
        setStep('reschedule-cal-time');
      } else {
        setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Der Termin konnte leider nicht automatisch verschoben werden. Bitte versuche es erneut oder kontaktiere uns direkt per E-Mail: info@afa-ai.com', quickReplies: ['Kalender öffnen', 'Zurück zum Start'] }]);
        setStep('reschedule-datetime');
      }
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text: 'Der Termin konnte leider nicht automatisch verschoben werden. Bitte versuche es erneut oder kontaktiere uns direkt per E-Mail: info@afa-ai.com', quickReplies: ['Kalender öffnen', 'Zurück zum Start'] }]);
      setStep('reschedule-datetime');
    }
  }

  function reset() {
    setStep('welcome'); setLead({}); setLeadGoal('book');
    setSelDate(null); setSelTime(null);
    setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth());
    setSubmitting(false); setEditingLead(false); setMsgs([]);
    setAvailability(null); setAvailError(false); setAvailRetryTick(0);
    setDateSlots(null); setDateSlotsLoading(false); setDateSlotsError(false); setDateSlotsRetryTick(0);
    setPendingCancellationAppointment(null);
    setPendingRescheduleAppointment(null);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs([{ id:nextId(), role:'bot', text:'Wie kann ich dir weiterhelfen?', quickReplies:MAIN_MENU, menuGrid:true }]);
    }, 500);
  }

  // ── Shared base styles ────────────────────────────────────────────────────
  const primBase: React.CSSProperties = {
    width: '100%', padding: '13px 20px',
    background: T.acc, border: 'none', borderRadius: 11,
    color: '#08090a', fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
    fontSize: 14, fontWeight: 800, letterSpacing: '-0.012em',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 20px rgba(0,187,253,0.24)',
  };
  const ghostBase: React.CSSProperties = {
    flex: 1, padding: '10px 10px',
    background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.bd}`, borderRadius: 10,
    color: T.soft, fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  };

  // ── Step dots ─────────────────────────────────────────────────────────────
  function stepDots(active: 1 | 2 | 3) {
    return (
      <div style={{ display:'flex', gap:5, marginBottom:12 }}>
        {([1,2,3] as const).map(n => (
          <div key={n} style={{ height:3, borderRadius:2, width: n===active ? 26 : 13, background: n===active ? T.acc : n<active ? 'rgba(0,187,253,0.35)' : T.s3, transition:'width .28s,background .28s' }} />
        ))}
      </div>
    );
  }

  // ── Card wrapper ──────────────────────────────────────────────────────────
  function Card({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ background: '#141418', border:`1px solid ${T.bd}`, borderRadius:18, overflow:'hidden', marginBottom:10 }}>
        <div style={{ height:2, background:'linear-gradient(90deg,transparent 0%,rgba(0,187,253,0.7) 40%,rgba(0,187,253,0.45) 70%,transparent 100%)' }} />
        {children}
      </div>
    );
  }

  // ── Zurück button ─────────────────────────────────────────────────────────
  function BackLink() {
    return (
      <div style={{ textAlign:'center', marginTop:8, marginBottom:4 }}>
        <button className="afa-back-link" onClick={reset}>← Zurück zum Start</button>
      </div>
    );
  }

  // ── Render: messages ──────────────────────────────────────────────────────
  function renderMsg(m: Msg) {
    const isBot  = m.role === 'bot';
    const html   = m.text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#00bbfd;text-decoration:underline;text-underline-offset:2px;">$1</a>');
    const showQR = !!m.quickReplies && m.id === lastBotId && !typing;
    return (
      <div key={m.id} style={{ marginBottom:12, animation:'msg-in 0.22s ease' }}>
        <div style={{ display:'flex', justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
          {isBot && <Avatar />}
          <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px', background: isBot ? '#18181b' : T.accBg, border:`1px solid ${isBot ? T.bd : T.accBd}`, color: isBot ? T.txt : '#c8f3ff', fontSize:13.5, lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html:html }} />
        </div>
        {showQR && m.menuGrid && (
          <div style={{ marginLeft:36, marginTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {m.quickReplies!.map(r => <button key={r} className="afa-menu-item" onClick={() => handleUserInput(r)} style={{ background:T.s3, border:`1px solid ${T.bd}`, color:T.txt, fontSize:12.5, padding:'9px 12px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', textAlign:'left', lineHeight:1.4 }}>{r}</button>)}
          </div>
        )}
        {showQR && !m.menuGrid && (
          <div style={{ marginLeft:36, marginTop:8, display:'flex', flexWrap:'wrap', gap:6 }}>
            {m.quickReplies!.map(r => <button key={r} className="afa-pill" onClick={() => handleUserInput(r)} style={{ background:'transparent', border:`1px solid ${T.accBd}`, color:T.acc, fontSize:12, padding:'5px 11px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', lineHeight:1.4, whiteSpace:'nowrap' }}>{r}</button>)}
          </div>
        )}
      </div>
    );
  }

  // ── Render: typing indicator ──────────────────────────────────────────────
  function renderTypingDots() {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Avatar />
        <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:'linear-gradient(135deg,rgba(26,26,32,1),rgba(20,20,26,1))', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:6, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize:11, color:'rgba(161,161,170,0.85)', marginRight:2, letterSpacing:'0.01em' }}>AFA Assistant arbeitet</span>
          {[0,1,2].map(i => <div key={i} className="afa-td" style={{ animationDelay:`${i*0.18}s` }} />)}
        </div>
      </div>
    );
  }

  // ── Render: premium calendar (date) ───────────────────────────────────────
  function renderCalDate() {
    const today = new Date();
    const tY = today.getFullYear(), tM = today.getMonth(), tD = today.getDate();
    const cells   = buildMonthGrid(calYear, calMonth);
    const canPrev = calYear > tY || (calYear === tY && calMonth > tM);

    function navMonth(dir: 1 | -1) {
      const nm = calMonth + dir;
      if (nm < 0)       { setCalMonth(11); setCalYear(y => y-1); }
      else if (nm > 11) { setCalMonth(0);  setCalYear(y => y+1); }
      else setCalMonth(nm);
      setSelDate(null);
    }

    function isOff(d: number) {
      if (calYear < tY || (calYear === tY && calMonth < tM)) return true;
      if (calYear === tY && calMonth === tM && d < tD) return true;
      if ([0, 6].includes(new Date(calYear, calMonth, d).getDay())) return true;
      if (availability) {
        const ds = `${calYear}-${pad2(calMonth + 1)}-${pad2(d)}`;
        const freeSlots = extractSlotsForDate(availability, ds);
        if (freeSlots.length === 0) return true;
      }
      return false;
    }

    // Error state — availability fetch failed
    if (availError) {
      return (
        <div className="afa-cal-wrap" ref={calRef}>
          {stepDots(1)}
          <Card>
            <div style={{ padding:'40px 28px', textAlign:'center' }}>
              <p style={{ margin:'0 0 18px', fontFamily:'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)', fontSize:13.5, color:T.soft, lineHeight:1.65 }}>
                Verfügbarkeit konnte gerade nicht geladen werden.<br />Bitte versuche es erneut.
              </p>
              <button className="afa-btn-prim" onClick={() => setAvailRetryTick(t => t + 1)} style={{ ...primBase, width:'auto', padding:'11px 28px' }}>
                Erneut versuchen
              </button>
            </div>
          </Card>
          <BackLink />
        </div>
      );
    }

    return (
      <div className="afa-cal-wrap" ref={calRef}>
        {stepDots(1)}
        <Card>
          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px 10px' }}>
            <button className="afa-nbtn" disabled={!canPrev} onClick={() => navMonth(-1)}>‹</button>
            <span style={{ fontSize:15, fontWeight:700, letterSpacing:'-.02em', color:T.txt }}>{DE_MONTHS[calMonth]} {calYear}</span>
            <button className="afa-nbtn" onClick={() => navMonth(1)}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 12px 4px', gap:2 }}>
            {DE_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.muted }}>{d}</div>)}
          </div>
          {/* Day grid — loading shimmer or real cells */}
          {availLoading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:160, gap:10 }}>
              <div style={{ display:'flex', gap:6 }}>
                {[0,1,2].map(i => <div key={i} className="afa-td" style={{ animationDelay:`${i*0.18}s` }} />)}
              </div>
              <span style={{ fontSize:11, color:T.muted, letterSpacing:'0.04em' }}>Verfügbarkeit wird geladen…</span>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 12px 10px', gap:2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const off = isOff(day);
                const tod = calYear===tY && calMonth===tM && day===tD;
                const sel = selDate?.day===day && selDate.month===calMonth && selDate.year===calYear;
                const cls = `afa-dc${sel?' selected':!off?' available'+(tod?' today':''):' past'}`;
                return <div key={i} className={cls} onClick={!off&&!sel ? ()=>setSelDate({year:calYear,month:calMonth,day}) : undefined}>{day}</div>;
              })}
            </div>
          )}
          {/* Legend */}
          <div style={{ display:'flex', gap:14, padding:'2px 18px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,187,253,0.28)', border:'1px solid rgba(0,187,253,0.38)' }} />Verfügbar
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:'rgba(255,255,255,0.07)' }} />Nicht verfügbar
            </div>
          </div>
        </Card>
        <button className="afa-btn-prim" disabled={!selDate || availLoading} onClick={() => {
          if (!selDate) return;
          addUserMsg(fmtDate(selDate.year,selDate.month,selDate.day));
          setStep('cal-time');
          botReply('Welche **Uhrzeit** passt dir am besten?', undefined, 500);
        }} style={{ ...primBase, opacity: selDate && !availLoading ? 1 : 0.35, marginBottom:4 }}>
          Weiter →
        </button>
        <BackLink />
      </div>
    );
  }

  // ── Render: premium time picker ───────────────────────────────────────────
  function renderCalTime() {
    const ds = selDate ? `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}` : '';

    // Slots come exclusively from the per-date fetch useEffect.
    // dateSlotsLoading=true → spinner; dateSlotsError=true → error UI; otherwise use dateSlots.
    const slotsReady = !dateSlotsLoading && !dateSlotsError && dateSlots !== null;
    const canProceed = slotsReady && !!selTime && dateSlots!.includes(selTime);

    function handleWeiter() {
      if (!selTime || !selDate || !slotsReady) return;
      if (!dateSlots!.includes(selTime)) {
        setSelTime(null);
        botReply('Diese Uhrzeit ist leider nicht mehr verfügbar. Bitte wähle eine andere Zeit.', undefined, 300);
        return;
      }
      addUserMsg(`${selTime} Uhr`);
      setStep('confirm');
      botReply('Fast geschafft! Prüfe deine **Terminübersicht** und bestätige.', undefined, 500);
    }

    return (
      <div className="afa-cal-wrap" ref={calRef}>
        {stepDots(2)}
        <Card>
          {/* Date strip */}
          {selDate && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'rgba(0,187,253,0.05)', borderBottom:'1px solid rgba(0,187,253,0.1)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00bbfd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize:13, fontWeight:600, color:T.txt }}>{fmtDate(selDate.year,selDate.month,selDate.day)}</span>
            </div>
          )}
          <div style={{ padding:'16px 18px 18px' }}>
            <div style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:10, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Verfügbare Zeiten</div>

            {/* Loading — per-date fetch in progress */}
            {dateSlotsLoading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:80, gap:8, marginBottom:16 }}>
                <div style={{ display:'flex', gap:6 }}>
                  {[0,1,2].map(i => <div key={i} className="afa-td" style={{ animationDelay:`${i*0.18}s` }} />)}
                </div>
                <span style={{ fontSize:11, color:T.muted, letterSpacing:'0.04em' }}>Lade verfügbare Zeiten…</span>
              </div>
            )}

            {/* Error — fetch failed */}
            {dateSlotsError && !dateSlotsLoading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginBottom:16, padding:'12px 0' }}>
                <p style={{ margin:0, fontSize:13, color:T.muted, lineHeight:1.65, textAlign:'center' }}>
                  Zeiten konnten nicht geladen werden.<br />Bitte versuche es erneut.
                </p>
                <button className="afa-btn-prim" onClick={() => setDateSlotsRetryTick(t => t + 1)} style={{ ...primBase, width:'auto', padding:'10px 22px' }}>
                  Erneut versuchen
                </button>
              </div>
            )}

            {/* No slots for this date */}
            {slotsReady && dateSlots!.length === 0 && (
              <p style={{ fontSize:13, color:T.muted, lineHeight:1.65, marginBottom:16 }}>
                Für diesen Tag sind leider keine Termine mehr verfügbar. Bitte wähle ein anderes Datum.
              </p>
            )}

            {/* Slot grid — rendered exclusively from webhook response, never from hardcoded list */}
            {slotsReady && dateSlots!.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:16 }}>
                {dateSlots!.map(t => (
                  <button key={t} className={`afa-slot${selTime===t?' sel':''}`} onClick={() => setSelTime(t)}>{t}</button>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button className="afa-btn-ghost" onClick={() => setStep('cal-date')} style={{ ...ghostBase, flex:'0 0 auto', padding:'10px 14px' }}>
                ‹ Datum
              </button>
              <button
                className="afa-btn-prim"
                disabled={!canProceed}
                onClick={handleWeiter}
                style={{ ...primBase, flex:1, width:'auto', opacity: canProceed ? 1 : 0.35 }}
              >
                Weiter →
              </button>
            </div>
          </div>
        </Card>
        <BackLink />
      </div>
    );
  }

  // ── Render: premium confirmation ──────────────────────────────────────────
  function renderConfirm() {
    const dateStr  = selDate ? fmtDate(selDate.year,selDate.month,selDate.day) : '';
    const fullName = `${lead.vorname??''} ${lead.nachname??''}`.trim();

    function LRow({ svg, value, sub }: { svg: React.ReactNode; value: string; sub: string }) {
      if (!value) return null;
      return (
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
          <div style={{ width:28, height:28, flexShrink:0, borderRadius:7, background:'rgba(255,255,255,0.04)', border:`1px solid ${T.bd}`, display:'flex', alignItems:'center', justifyContent:'center' }}>{svg}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:T.txt, lineHeight:1.4 }}>{value}</div>
            <div style={{ fontSize:11, color:T.muted, fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', letterSpacing:'.03em' }}>{sub}</div>
          </div>
        </div>
      );
    }

    const icoStroke = 'rgba(255,255,255,0.35)';
    return (
      <div className="afa-cal-wrap" ref={calRef}>
        {stepDots(3)}
        <Card>
          {/* Appointment box */}
          <div style={{ margin:'16px 18px 0', background:'rgba(0,187,253,0.06)', border:'1px solid rgba(0,187,253,0.14)', borderRadius:13, padding:'14px 16px' }}>
            <div style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:10, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.acc, marginBottom:7 }}>Dein Termin</div>
            <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-.02em', marginBottom:3, color:T.txt }}>{dateStr}</div>
            <div style={{ fontSize:12, color:T.muted }}>{selTime} Uhr · 30 Min. · Google Meet</div>
          </div>
          {/* Divider */}
          <div style={{ height:1, background:T.bd, margin:'14px 18px' }} />
          {/* Lead info */}
          <div style={{ padding:'0 18px 4px' }}>
            <div style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:10, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Deine Angaben</div>
            <LRow svg={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={icoStroke} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} value={fullName} sub="Name" />
            <LRow svg={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={icoStroke} strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>} value={lead.email??''} sub="E-Mail" />
            <LRow svg={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={icoStroke} strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.85 18.5 19.79 19.79 0 0 1 1.18 4.18 2 2 0 0 1 3.17 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} value={lead.telefon??''} sub="Telefon" />
            <LRow svg={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={icoStroke} strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>} value={lead.unternehmen??''} sub="Unternehmen" />
            <LRow svg={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={icoStroke} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>} value={lead.interesse??''} sub="Interesse" />
          </div>
          {/* Actions */}
          <div style={{ padding:'14px 18px 18px' }}>
            <button className="afa-btn-prim" disabled={submitting} onClick={submitBooking} style={{ ...primBase, marginBottom:10 }}>
              {submitting ? 'Wird gebucht…' : 'Termin bestätigen ✓'}
            </button>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <button className="afa-btn-ghost" onClick={() => setStep('cal-date')} style={ghostBase}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Datum ändern
              </button>
              <button className="afa-btn-ghost" onClick={() => setStep('cal-time')} style={ghostBase}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Uhrzeit ändern
              </button>
            </div>
            <button className="afa-btn-ghost" onClick={() => {
              setEditingLead(true);
              setStep('lead-vorname');
              botReply('Kein Problem! Lass uns deine Kontaktdaten aktualisieren. Wie ist dein **Vorname**?', ['Zurück zum Start'], 300);
            }} style={{ ...ghostBase, flex: 'none', width: '100%' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Kontaktdaten ändern
            </button>
          </div>
        </Card>
        <BackLink />
      </div>
    );
  }

  // ── Render: reschedule date picker ───────────────────────────────────────
  function renderRescheduleCalDate() {
    const today = new Date();
    const tY = today.getFullYear(), tM = today.getMonth(), tD = today.getDate();
    const cells   = buildMonthGrid(calYear, calMonth);
    const canPrev = calYear > tY || (calYear === tY && calMonth > tM);

    function navMonth(dir: 1 | -1) {
      const nm = calMonth + dir;
      if (nm < 0)       { setCalMonth(11); setCalYear(y => y - 1); }
      else if (nm > 11) { setCalMonth(0);  setCalYear(y => y + 1); }
      else setCalMonth(nm);
      setSelDate(null);
    }

    function isOff(d: number) {
      if (calYear < tY || (calYear === tY && calMonth < tM)) return true;
      if (calYear === tY && calMonth === tM && d < tD) return true;
      if ([0, 6].includes(new Date(calYear, calMonth, d).getDay())) return true;
      if (availability) {
        const ds = `${calYear}-${pad2(calMonth + 1)}-${pad2(d)}`;
        const freeSlots = extractSlotsForDate(availability, ds);
        if (freeSlots.length === 0) return true;
      }
      return false;
    }

    if (availError) {
      return (
        <div className="afa-cal-wrap" ref={calRef}>
          <Card>
            <div style={{ padding:'32px 24px', textAlign:'center' }}>
              <p style={{ margin:'0 0 14px', fontSize:13, color:T.soft, lineHeight:1.65 }}>Verfügbarkeit konnte nicht geladen werden.</p>
              <button className="afa-btn-prim" onClick={() => setAvailRetryTick(t => t + 1)} style={{ ...primBase, width:'auto', padding:'10px 24px' }}>Erneut versuchen</button>
            </div>
          </Card>
          <button className="afa-btn-ghost" onClick={() => {
            setStep('reschedule-datetime');
            botReply('Bitte gib den neuen Termin im Format **TT.MM.JJJJ um HH:MM** an, zum Beispiel: 18.06.2026 um 14:30 Uhr.', ['Zurück zum Start'], 400);
          }} style={{ ...ghostBase, width:'100%', marginTop:6 }}>Datum manuell eingeben</button>
          <BackLink />
        </div>
      );
    }

    return (
      <div className="afa-cal-wrap" ref={calRef}>
        {/* Label */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          <div style={{ width:3, height:18, borderRadius:2, background:T.acc }} />
          <span style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:9.5, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.acc }}>Neuen Termin wählen</span>
        </div>
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 8px' }}>
            <button className="afa-nbtn" disabled={!canPrev} onClick={() => navMonth(-1)}>‹</button>
            <span style={{ fontSize:14, fontWeight:700, letterSpacing:'-.02em', color:T.txt }}>{DE_MONTHS[calMonth]} {calYear}</span>
            <button className="afa-nbtn" onClick={() => navMonth(1)}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 10px 4px', gap:2 }}>
            {DE_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.muted }}>{d}</div>)}
          </div>
          {availLoading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:140, gap:8 }}>
              <div style={{ display:'flex', gap:6 }}>{[0,1,2].map(i => <div key={i} className="afa-td" style={{ animationDelay:`${i*0.18}s` }} />)}</div>
              <span style={{ fontSize:11, color:T.muted, letterSpacing:'0.04em' }}>Verfügbarkeit wird geladen…</span>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 10px 8px', gap:2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const off = isOff(day);
                const tod = calYear === tY && calMonth === tM && day === tD;
                const sel = selDate?.day === day && selDate.month === calMonth && selDate.year === calYear;
                const cls = `afa-dc${sel ? ' selected' : !off ? ' available' + (tod ? ' today' : '') : ' past'}`;
                return <div key={i} className={cls} onClick={!off && !sel ? () => setSelDate({ year: calYear, month: calMonth, day }) : undefined}>{day}</div>;
              })}
            </div>
          )}
          <div style={{ display:'flex', gap:12, padding:'2px 16px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}><div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,187,253,0.28)', border:'1px solid rgba(0,187,253,0.38)' }} />Verfügbar</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}><div style={{ width:8, height:8, borderRadius:2, background:'rgba(255,255,255,0.07)' }} />Nicht verfügbar</div>
          </div>
        </Card>
        <button className="afa-btn-prim" disabled={!selDate || availLoading} onClick={() => {
          if (!selDate) return;
          addUserMsg(fmtDate(selDate.year, selDate.month, selDate.day));
          setStep('reschedule-cal-time');
          botReply('Welche **Uhrzeit** passt dir am besten?', undefined, 500);
        }} style={{ ...primBase, opacity: selDate && !availLoading ? 1 : 0.35, marginBottom:6 }}>
          Weiter →
        </button>
        <button className="afa-btn-ghost" onClick={() => {
          setStep('reschedule-datetime');
          botReply('Bitte gib den neuen Termin im Format **TT.MM.JJJJ um HH:MM** an, zum Beispiel: 18.06.2026 um 14:30 Uhr.', ['Zurück zum Start'], 400);
        }} style={{ ...ghostBase, width:'100%', marginBottom:4 }}>Datum manuell eingeben</button>
        <BackLink />
      </div>
    );
  }

  // ── Render: reschedule time picker ───────────────────────────────────────
  function renderRescheduleCalTime() {
    const slotsReady = !dateSlotsLoading && !dateSlotsError && dateSlots !== null;
    const canProceed = slotsReady && !!selTime && dateSlots!.includes(selTime);

    function handleRescheduleWeiter() {
      if (!selTime || !selDate || !slotsReady || !pendingRescheduleAppointment) return;
      if (!dateSlots!.includes(selTime)) {
        setSelTime(null);
        botReply('Diese Uhrzeit ist leider nicht mehr verfügbar. Bitte wähle eine andere Zeit.', undefined, 300);
        return;
      }
      const ds          = `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}`;
      const newDatetime = `${ds} ${selTime}:00`;
      addUserMsg(`${fmtDate(selDate.year, selDate.month, selDate.day)} · ${selTime} Uhr`);
      setTyping(true);
      doRescheduleAppointment(pendingRescheduleAppointment.event_id, pendingRescheduleAppointment.email, newDatetime);
    }

    return (
      <div className="afa-cal-wrap" ref={calRef}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          <div style={{ width:3, height:18, borderRadius:2, background:T.acc }} />
          <span style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:9.5, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.acc }}>Neuen Termin wählen</span>
        </div>
        <Card>
          {selDate && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:'rgba(0,187,253,0.05)', borderBottom:'1px solid rgba(0,187,253,0.1)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00bbfd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize:13, fontWeight:600, color:T.txt }}>{fmtDate(selDate.year, selDate.month, selDate.day)}</span>
            </div>
          )}
          <div style={{ padding:'14px 16px 16px' }}>
            <div style={{ fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', fontSize:10, fontWeight:700, letterSpacing:'.13em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Verfügbare Zeiten</div>
            {dateSlotsLoading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:72, gap:8, marginBottom:14 }}>
                <div style={{ display:'flex', gap:6 }}>{[0,1,2].map(i => <div key={i} className="afa-td" style={{ animationDelay:`${i*0.18}s` }} />)}</div>
                <span style={{ fontSize:11, color:T.muted, letterSpacing:'0.04em' }}>Lade verfügbare Zeiten…</span>
              </div>
            )}
            {dateSlotsError && !dateSlotsLoading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:14, padding:'10px 0' }}>
                <p style={{ margin:0, fontSize:13, color:T.muted, lineHeight:1.65, textAlign:'center' }}>Zeiten konnten nicht geladen werden.</p>
                <button className="afa-btn-prim" onClick={() => setDateSlotsRetryTick(t => t + 1)} style={{ ...primBase, width:'auto', padding:'9px 20px' }}>Erneut versuchen</button>
              </div>
            )}
            {slotsReady && dateSlots!.length === 0 && (
              <p style={{ fontSize:13, color:T.muted, lineHeight:1.65, marginBottom:14 }}>
                Für diesen Tag sind keine Termine verfügbar. Bitte wähle ein anderes Datum.
              </p>
            )}
            {slotsReady && dateSlots!.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:14 }}>
                {dateSlots!.map(t => (
                  <button key={t} className={`afa-slot${selTime === t ? ' sel' : ''}`} onClick={() => setSelTime(t)}>{t}</button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button className="afa-btn-ghost" onClick={() => setStep('reschedule-cal-date')} style={{ ...ghostBase, flex:'0 0 auto', padding:'10px 14px' }}>‹ Datum</button>
              <button className="afa-btn-prim" disabled={!canProceed} onClick={handleRescheduleWeiter} style={{ ...primBase, flex:1, width:'auto', opacity: canProceed ? 1 : 0.35 }}>Termin verschieben →</button>
            </div>
          </div>
        </Card>
        <BackLink />
      </div>
    );
  }

  // ── Avatar ────────────────────────────────────────────────────────────────
  function Avatar() {
    return (
      <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00bbfd,#0066aa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#08090a', flexShrink:0, marginRight:8, marginTop:2 }}>A</div>
    );
  }

  // ── Dimensions ────────────────────────────────────────────────────────────
  const winW  = isMobile ? '94vw'  : '460px';
  const winH  = isMobile ? '85vh'  : '75vh';
  const winR  = isMobile ? '3vw'   : '24px';
  const winB  = isMobile ? '76px'  : '88px';
  const winRd = isMobile ? 16      : 22;

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{CHAT_CSS}</style>

      {/* Launcher */}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9998 }}>
        {/* Proactive teaser bubble */}
        {!open && (
          <div
            className={`afa-teaser${teaserPulse ? ' afa-tsr-pulse' : ''}`}
            onClick={() => handleOpen()}
            style={{
              position: 'absolute',
              bottom: isMobile ? 74 : 76,
              right: 0,
              width: isMobile ? 218 : 268,
              background: 'linear-gradient(145deg,rgba(18,18,23,0.97) 0%,rgba(13,13,18,0.98) 100%)',
              backdropFilter: 'blur(28px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 20,
              padding: isMobile ? '14px 16px 12px' : '16px 20px 14px',
              cursor: 'pointer',
              boxShadow: '0 18px 52px rgba(0,0,0,0.72), 0 4px 18px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,187,253,0.07)',
              opacity: teaserVisible ? 1 : 0,
              transform: teaserVisible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.94)',
              transition: 'opacity 0.38s cubic-bezier(0.22,1,0.36,1), transform 0.40s cubic-bezier(0.22,1,0.36,1)',
              pointerEvents: teaserVisible ? 'auto' : 'none',
            }}
          >
            {/* Top cyan accent bar */}
            <div style={{ position:'absolute', top:0, left:20, right:20, height:2, background:'linear-gradient(90deg,transparent,rgba(0,187,253,0.65),transparent)', borderRadius:'0 0 2px 2px', pointerEvents:'none' }} />

            {/* Header row: dot + label */}
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:T.acc, boxShadow:'0 0 7px rgba(0,187,253,0.7)', flexShrink:0 }} />
              <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:'rgba(0,187,253,0.6)', fontFamily:'var(--font-chivo,"Chivo Mono",monospace)', lineHeight:1 }}>AFA KI-Assistent</span>
            </div>

            {/* Message */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize: isMobile ? 13.5 : 14.5, fontWeight:700, color:'#f0f0f3', lineHeight:1.3, letterSpacing:'-0.02em', fontFamily:'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)', marginBottom:3 }}>
                {TEASER_MSGS[teaserIdx].title}
              </div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight:400, color:'rgba(161,161,170,0.82)', lineHeight:1.55, letterSpacing:'-0.005em', fontFamily:'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)' }}>
                {TEASER_MSGS[teaserIdx].body}
              </div>
            </div>

            {/* CTA row */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <span className="afa-tsr-cta" style={{ fontSize:12, fontWeight:700, color:'rgba(0,187,253,0.75)', letterSpacing:'0.01em', transition:'color 0.18s' }}>Jetzt chatten</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(0,187,253,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>

            {/* Arrow pointing down-right to the launcher */}
            <div style={{ position:'absolute', bottom:-5, right:26, width:10, height:10, background:'rgba(13,13,18,0.98)', border:'1px solid rgba(255,255,255,0.10)', borderTop:'none', borderLeft:'none', transform:'rotate(45deg)' }} />
          </div>
        )}
        <button
          className="afa-launcher"
          onClick={() => open ? closeChat() : handleOpen()}
          title="AFA Chat öffnen"
          style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${T.acc},#0077b6)`, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {open
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className={`afa-chat-root ${closing ? 'afa-win-close' : 'afa-win-open'}`}
          style={{ position:'fixed', bottom:winB, right:winR, zIndex:9997, width:winW, height:winH, background:'rgba(13,13,16,0.97)', backdropFilter:'blur(28px) saturate(1.6)', WebkitBackdropFilter:'blur(28px) saturate(1.6)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:winRd, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 44px 110px rgba(0,0,0,0.88), 0 14px 44px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,187,253,0.10), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div style={{ background:'linear-gradient(180deg,rgba(21,21,26,1) 0%,rgba(17,17,21,1) 100%)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'14px 18px', display:'flex', alignItems:'center', gap:12, flexShrink:0, boxShadow:'0 1px 0 rgba(0,0,0,0.4)' }}>
            <div style={{ position:'relative', flexShrink:0, width:40, height:40 }}>
              {/* Radar ring */}
              <div className="afa-spin-ring" style={{ position:'absolute', inset:-6, borderRadius:'50%', pointerEvents:'none' }} />
              {/* Avatar */}
              <div className="afa-avatar-hdr" style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#00bbfd 0%,#0077b8 55%,#004f8a 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#08090a' }}>A</div>
              {/* Online dot */}
              <div className="afa-online-dot" style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'#22c55e', border:'2px solid rgba(17,17,21,1)' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'#f4f4f5', fontSize:15, fontWeight:700, lineHeight:1.2, letterSpacing:'-0.01em', fontFamily:'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)' }}>AFA Assistant</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2, letterSpacing:'0.01em' }}>KI-Assistent · Antwortet sofort</div>
            </div>
            <button className="afa-btn-ghost" onClick={closeChat} style={{ background:'transparent', border:`1px solid ${T.bd}`, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:T.muted, cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'18px 18px 6px', display:'flex', flexDirection:'column', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent' }}>
            {msgs.map(renderMsg)}
            {typing && renderTypingDots()}
            {step==='cal-date'           && !typing && renderCalDate()}
            {step==='reschedule-cal-date' && !typing && renderRescheduleCalDate()}
            {step==='reschedule-cal-time' && !typing && renderRescheduleCalTime()}
            {step==='cal-time' && !typing && renderCalTime()}
            {step==='confirm'  && !typing && renderConfirm()}
            <div style={{ height:6 }} />
          </div>

          {/* Input bar */}
          <div style={{ background:'linear-gradient(0deg,rgba(16,16,20,1) 0%,rgba(20,20,25,0.98) 100%)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'11px 16px', display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {/* Mic */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button className="afa-btn-ghost" onClick={() => { setMicTip(v=>!v); setTimeout(()=>setMicTip(false),2800); }} style={{ background:'transparent', border:`1px solid ${T.bd}`, borderRadius:9, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.muted }} title="Sprachfunktion">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              {micTip && <div style={{ position:'absolute', bottom:'110%', left:'50%', transform:'translateX(-50%)', background:T.s3, border:`1px solid ${T.bd}`, borderRadius:8, padding:'6px 10px', fontSize:11, color:T.muted, whiteSpace:'nowrap', pointerEvents:'none', zIndex:10 }}>Sprachfunktion bald verfügbar</div>}
            </div>
            {/* Input */}
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleUserInput(input);}}} placeholder={typing?'AFA Assistant arbeitet…':'Nachricht eingeben…'} disabled={submitting} style={{ flex:1, background:'rgba(26,26,32,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 14px', color:T.txt, fontSize:13.5, outline:'none', fontFamily:'inherit', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.3)' }} />
            {/* Send */}
            <button onClick={()=>handleUserInput(input)} disabled={!input.trim()||submitting} style={{ background:input.trim()?T.acc:T.s3, border:`1px solid ${input.trim()?T.acc:T.bd}`, borderRadius:9, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()?'pointer':'default', flexShrink:0, transition:'background .15s,border-color .15s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim()?'#000':T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          {/* Signature */}
          <div className="afa-credit">Crafted by AFA</div>
        </div>
      )}
    </>
  );
}
