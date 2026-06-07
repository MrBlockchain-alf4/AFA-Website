'use client';
import { useState, useRef, useEffect, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type Step =
  | 'welcome'
  | 'lead-vorname' | 'lead-nachname' | 'lead-email'
  | 'lead-telefon' | 'lead-unternehmen' | 'lead-interesse'
  | 'cal-date' | 'cal-time' | 'confirm' | 'submitting'
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

// ── Constants ─────────────────────────────────────────────────────────────
const WEBHOOK = process.env.NEXT_PUBLIC_AFA_CHATBOT_WEBHOOK_URL ?? '';

const MAIN_MENU: string[] = [
  'Beratung buchen',     'Termin vereinbaren',
  'KI-Telefon',          'KI-Chatbot',
  'Premium Website',     'Leadgenerierung',
  'Automatisierung',     'Preise / Angebot',
  'DSGVO / Datenschutz', 'Expertenkontakt',
];

const INTEREST_REPLIES = [
  'KI-Telefon', 'KI-Chatbot', 'Premium Website',
  'Leadgenerierung', 'Automatisierung', 'Allgemeine Beratung',
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

const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni',
                   'Juli','August','September','Oktober','November','Dezember'];
const DE_DAYS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];
const DE_DAYS_L = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

// ── Helpers ───────────────────────────────────────────────────────────────
function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function pad2(n: number) { return String(n).padStart(2, '0'); }

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

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/\b(termin|buchen|vereinbaren|beratung|gespräch|meeting|angebot anfordern|demo anfragen|erstgespräch)\b/.test(t)) return 'book';
  if (/ki.?telefon|voicebot|telefonassistent|phone.?ai|sprachassistent/.test(t))  return 'ki-telefon';
  if (/ki.?chat|chatbot|chat.assistent/.test(t))                                    return 'ki-chat';
  if (/premium.?web|webseite|homepage|landing|website/.test(t))                     return 'website';
  if (/lead.?gen|leadgen|akquise|interessenten|neukundengewinnung|leadgenerierung/.test(t)) return 'leads';
  if (/automatisierung|workflow|n8n|zapier|make\.com|integration|prozess/.test(t)) return 'automation';
  if (/preis|kosten|angebot|budget|€|euro|teuer|günstig/.test(t))                  return 'pricing';
  if (/experte|expertenkontakt|mensch|mitarbeiter|sprechen|ansprechpartner/.test(t)) return 'human';
  if (/datenschutz|dsgvo|privacy|sicher|konform/.test(t))                           return 'datenschutz';
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
    50%      { box-shadow: 0 4px 42px rgba(0,187,253,0.62), 0 0 0 9px rgba(0,187,253,0.09), 0 2px 12px rgba(0,0,0,0.5); }
  }
  .afa-launcher { animation: afa-glow 2.8s ease-in-out infinite; }
  .afa-launcher:hover {
    animation: none;
    transform: scale(1.1) !important;
    box-shadow: 0 4px 52px rgba(0,187,253,0.72), 0 0 0 12px rgba(0,187,253,0.11), 0 2px 16px rgba(0,0,0,0.55) !important;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const idRef     = useRef(0);
  const nextId    = () => ++idRef.current;

  const lastBotId = useMemo(
    () => [...msgs].reverse().find(m => m.role === 'bot')?.id ?? -1,
    [msgs],
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, step, typing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

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
  function handleOpen() {
    setOpen(true);
    if (msgs.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs([{
          id: nextId(), role: 'bot',
          text: 'Willkommen bei **AFA**! Ich bin dein KI-Assistent für autonome Unternehmenslösungen. Wie kann ich dir heute helfen? 👋',
          quickReplies: MAIN_MENU, menuGrid: true,
        }]);
      }, 700);
    }
    setTimeout(() => inputRef.current?.focus(), 800);
  }

  function startLead(goal: LeadGoal, intro?: string) {
    setLeadGoal(goal);
    setLead({});
    setStep('lead-vorname');
    botReply(intro ?? 'Gerne! Wie ist dein **Vorname**?', ['Zurück zum Start']);
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
      case 'human':
        startLead('handoff', 'Kein Problem! Ich verbinde dich mit einem Experten. Wie ist dein **Vorname**?');
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
    if (text === 'Details anfragen' || text === 'Demo anfragen') {
      startLead('book', 'Super! Für dein individuelles Angebot brauche ich kurz deine Daten. Wie ist dein **Vorname**?');
      return;
    }

    switch (step) {
      case 'welcome': handleIntent(detectIntent(text)); return;

      case 'lead-vorname':
        setLead(l => ({ ...l, vorname: text }));
        setStep('lead-nachname');
        botReply(`Schön, **${text}**! Wie lautet dein **Nachname**?`, ['Zurück zum Start']);
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
        botReply('Danke! Hast du eine **Telefonnummer**, unter der wir dich erreichen können?', ['Überspringen', 'Zurück zum Start']);
        return;

      case 'lead-telefon': {
        const val = text.toLowerCase() === 'überspringen' ? '' : text;
        setLead(l => ({ ...l, telefon: val }));
        setStep('lead-unternehmen');
        botReply('Und wie heißt dein **Unternehmen**?', ['Überspringen', 'Zurück zum Start']);
        return;
      }

      case 'lead-unternehmen': {
        const val = text.toLowerCase() === 'überspringen' ? '' : text;
        setLead(l => ({ ...l, unternehmen: val }));
        if (leadGoal === 'handoff') {
          setStep('submitting');
          setTyping(true);
          const final = { ...lead, unternehmen: val };
          setTimeout(() => { doHandoff(final); }, 600);
          return;
        }
        setStep('lead-interesse');
        botReply('Fast geschafft! Wofür interessierst du dich am meisten?', [...INTEREST_REPLIES, 'Zurück zum Start']);
        return;
      }

      case 'lead-interesse':
        setLead(l => ({ ...l, interesse: text }));
        setStep('cal-date');
        botReply('Super! Wähle jetzt deinen **Wunschtermin** im Kalender. 📅', undefined, 600);
        return;

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
  async function doHandoff(finalLead: Partial<Lead>) {
    try {
      if (WEBHOOK) await fetch(WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...finalLead, requestType:'human_handoff', source:'AFA Website Chatbot', status:'Neu' }) });
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role:'bot', text:'✅ Deine Anfrage wurde weitergeleitet! Ein Experte meldet sich in Kürze bei dir. Du erreichst uns auch direkt unter **kontakt@afa-ai.com**.', quickReplies:['Neue Anfrage starten'] }]);
      setStep('handoff-done');
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role:'bot', text:'Es gab ein technisches Problem. Bitte kontaktiere uns direkt unter **kontakt@afa-ai.com**.', quickReplies:['Erneut versuchen','Neue Anfrage starten'] }]);
      setStep('error');
    }
  }

  async function submitBooking() {
    if (!selDate || !selTime) return;
    setSubmitting(true); setStep('submitting'); setTyping(true);
    const dateStr = `${selDate.year}-${pad2(selDate.month+1)}-${pad2(selDate.day)}`;
    try {
      if (WEBHOOK) await fetch(WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...lead, appointmentDate:dateStr, appointmentTime:selTime, appointmentDateTime:`${dateStr}T${selTime}:00`, source:'AFA Website Chatbot', status:'Neu' }) });
      setTyping(false); setSubmitting(false);
      setMsgs(m => [...m, { id:nextId(), role:'bot', text:'🎉 Perfekt! Dein Termin wurde erfolgreich gebucht. Du erhältst in Kürze eine **Bestätigung per E-Mail**.', quickReplies:['Neue Anfrage starten'] }]);
      setStep('success');
    } catch {
      setTyping(false); setSubmitting(false);
      setMsgs(m => [...m, { id:nextId(), role:'bot', text:'Es gab ein technisches Problem beim Buchen. Bitte versuche es erneut oder kontaktiere uns direkt.', quickReplies:['Erneut versuchen','Neue Anfrage starten'] }]);
      setStep('error');
    }
  }

  function reset() {
    setStep('welcome'); setLead({}); setLeadGoal('book');
    setSelDate(null); setSelTime(null);
    setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth());
    setSubmitting(false); setMsgs([]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs([{ id:nextId(), role:'bot', text:'Wie kann ich dir weiterhelfen? 👋', quickReplies:MAIN_MENU, menuGrid:true }]);
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
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,rgba(0,187,253,0.5),transparent)' }} />
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
    const html   = m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
        <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:'#18181b', border:`1px solid ${T.bd}`, display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ fontSize:11, color:T.muted, marginRight:3 }}>AFA Assistant schreibt</span>
          {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:T.muted, animation:`typing-bounce 1.1s ease-in-out ${i*0.18}s infinite` }} />)}
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
      if (nm < 0)    { setCalMonth(11); setCalYear(y => y-1); }
      else if (nm > 11) { setCalMonth(0);  setCalYear(y => y+1); }
      else setCalMonth(nm);
      setSelDate(null);
    }
    function isOff(d: number) {
      if (calYear < tY || (calYear === tY && calMonth < tM)) return true;
      if (calYear === tY && calMonth === tM && d < tD) return true;
      return [0,6].includes(new Date(calYear, calMonth, d).getDay());
    }

    return (
      <div>
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
          {/* Day grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 12px 10px', gap:2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const off  = isOff(day);
              const tod  = calYear===tY && calMonth===tM && day===tD;
              const sel  = selDate?.day===day && selDate.month===calMonth && selDate.year===calYear;
              const cls  = `afa-dc${sel?' selected':!off?' available'+(tod?' today':''):' past'}`;
              return <div key={i} className={cls} onClick={!off&&!sel ? ()=>setSelDate({year:calYear,month:calMonth,day}) : undefined}>{day}</div>;
            })}
          </div>
          {/* Legend */}
          <div style={{ display:'flex', gap:14, padding:'2px 18px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:'rgba(0,187,253,0.28)', border:'1px solid rgba(0,187,253,0.38)' }} />Verfügbar
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10.5, color:T.muted }}>
              <div style={{ width:8, height:8, borderRadius:2, background:'rgba(255,255,255,0.07)' }} />Wochenende
            </div>
          </div>
        </Card>
        <button className="afa-btn-prim" disabled={!selDate} onClick={() => {
          if (!selDate) return;
          addUserMsg(fmtDate(selDate.year,selDate.month,selDate.day));
          setStep('cal-time');
          botReply('Welche **Uhrzeit** passt dir am besten?', undefined, 500);
        }} style={{ ...primBase, opacity: selDate ? 1 : 0.35, marginBottom:4 }}>
          Weiter →
        </button>
        <BackLink />
      </div>
    );
  }

  // ── Render: premium time picker ───────────────────────────────────────────
  function renderCalTime() {
    return (
      <div>
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
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:16 }}>
              {TIME_SLOTS.map(t => (
                <button key={t} className={`afa-slot${selTime===t?' sel':''}`} onClick={() => setSelTime(t)}>{t}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="afa-btn-ghost" onClick={() => setStep('cal-date')} style={{ ...ghostBase, flex:'0 0 auto', padding:'10px 14px' }}>
                ‹ Datum
              </button>
              <button className="afa-btn-prim" disabled={!selTime} onClick={() => {
                if (!selTime||!selDate) return;
                addUserMsg(`${selTime} Uhr`);
                setStep('confirm');
                botReply('Fast geschafft! Prüfe deine **Terminübersicht** und bestätige.', undefined, 500);
              }} style={{ ...primBase, flex:1, width:'auto', opacity: selTime?1:0.35 }}>
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
      <div>
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
                Datum
              </button>
              <button className="afa-btn-ghost" onClick={() => setStep('cal-time')} style={ghostBase}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Uhrzeit
              </button>
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
        {pulse && !open && (
          <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:`2px solid ${T.acc}`, opacity:0.45, animation:'ring-pulse 2s ease-in-out infinite', pointerEvents:'none' }} />
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
          className={closing ? 'afa-win-close' : 'afa-win-open'}
          style={{ position:'fixed', bottom:winB, right:winR, zIndex:9997, width:winW, height:winH, background:'#111113', border:`1px solid ${T.bd}`, borderRadius:winRd, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.8),0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(0,187,253,0.06)' }}
        >
          {/* Header */}
          <div style={{ background:'#18181b', borderBottom:`1px solid ${T.bd}`, padding:'15px 18px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#00bbfd,#0066aa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'#08090a', boxShadow:'0 0 0 3px rgba(0,187,253,0.18)' }}>A</div>
              <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:'#22c55e', border:'2px solid #18181b' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:'#fff', fontSize:15, fontWeight:700, lineHeight:1.2, fontFamily:'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)' }}>AFA Assistant</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>KI-Assistent · Antwortet sofort</div>
            </div>
            <button className="afa-btn-ghost" onClick={closeChat} style={{ background:'transparent', border:`1px solid ${T.bd}`, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:T.muted, cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex:1, overflowY:'auto', padding:'18px 18px 6px', display:'flex', flexDirection:'column', scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent' }}>
            {msgs.map(renderMsg)}
            {typing && renderTypingDots()}
            {step==='cal-date' && !typing && renderCalDate()}
            {step==='cal-time' && !typing && renderCalTime()}
            {step==='confirm'  && !typing && renderConfirm()}
            <div style={{ height:6 }} />
          </div>

          {/* Input bar */}
          <div style={{ background:'#18181b', borderTop:`1px solid ${T.bd}`, padding:'11px 16px', display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {/* Mic */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button className="afa-btn-ghost" onClick={() => { setMicTip(v=>!v); setTimeout(()=>setMicTip(false),2800); }} style={{ background:'transparent', border:`1px solid ${T.bd}`, borderRadius:9, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.muted }} title="Sprachfunktion">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              {micTip && <div style={{ position:'absolute', bottom:'110%', left:'50%', transform:'translateX(-50%)', background:T.s3, border:`1px solid ${T.bd}`, borderRadius:8, padding:'6px 10px', fontSize:11, color:T.muted, whiteSpace:'nowrap', pointerEvents:'none', zIndex:10 }}>Sprachfunktion bald verfügbar</div>}
            </div>
            {/* Input */}
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleUserInput(input);}}} placeholder={typing?'AFA Assistant schreibt…':'Nachricht eingeben…'} disabled={submitting} style={{ flex:1, background:T.s3, border:`1px solid ${T.bd}`, borderRadius:10, padding:'10px 14px', color:T.txt, fontSize:13.5, outline:'none', fontFamily:'inherit' }} />
            {/* Send */}
            <button onClick={()=>handleUserInput(input)} disabled={!input.trim()||submitting} style={{ background:input.trim()?T.acc:T.s3, border:`1px solid ${input.trim()?T.acc:T.bd}`, borderRadius:9, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()?'pointer':'default', flexShrink:0, transition:'background .15s,border-color .15s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={input.trim()?'#000':T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
