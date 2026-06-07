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
}

// ── Constants ─────────────────────────────────────────────────────────────
const WEBHOOK = process.env.NEXT_PUBLIC_AFA_CHATBOT_WEBHOOK_URL ?? '';

const WELCOME_REPLIES = [
  'Beratung buchen', 'Termin vereinbaren', 'KI-Telefon',
  'KI-Chatbot', 'Premium Website', 'Preise / Angebot', 'Expertenkontakt',
];

const INTEREST_REPLIES = [
  'KI-Telefon', 'KI-Chatbot', 'Premium Website',
  'Lead-Generierung', 'Automatisierung', 'Allgemeine Beratung',
];

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00',
];

const FAQ: Record<string, string> = {
  'ki-telefon':
    'Unser **KI-Telefon-Mitarbeiter** nimmt Anrufe rund um die Uhr entgegen, qualifiziert Interessenten automatisch und bucht Termine direkt in deinen Kalender – ganz ohne manuellen Aufwand. Er klingt natürlich, spricht perfektes Deutsch und passt sich vollständig an dein Unternehmen an.',
  'ki-chat':
    'Der **KI-Chat-Assistent** übernimmt Website-Anfragen 24/7, beantwortet häufige Fragen, qualifiziert Leads und bucht Termine – vollautomatisch und in deinem Unternehmens-Stil.',
  'website':
    'Wir entwickeln hochperformante, konversionsorientierte **Premium-Websites** mit eingebettetem KI-Chat und automatisierter Lead-Erfassung. Design, Technik und KI aus einer Hand.',
  'leads':
    'Unser System erfasst Interessenten über mehrere Kanäle, qualifiziert sie per KI und übergibt kaufbereite **Leads direkt in dein CRM** – mit sofortiger Benachrichtigung an dein Team.',
  'preise':
    'Unsere Lösungen sind individuell auf dein Unternehmen abgestimmt. Einstiegspakete beginnen ab **990 € einmalig**, monatliche Betreuungspakete ab **299 € / Monat**. Gerne erstellen wir ein persönliches Angebot.',
  'datenschutz':
    'Alle Daten werden auf **deutschen Servern** verarbeitet und gespeichert. Wir sind vollständig DSGVO-konform und stellen auf Anfrage eine Auftragsverarbeitungsvereinbarung (**AVV**) bereit.',
  'automation':
    'Wir automatisieren repetitive Geschäftsprozesse mit KI und **No-Code-Workflows** (n8n, Make, Zapier). Typische Anwendungsfälle: Lead-Routing, E-Mail-Automatisierung, CRM-Anbindung, Reporting.',
  'termin':
    'Du kannst jederzeit einen **kostenlosen 30-Minuten-Beratungstermin** buchen – kein Anruf nötig. Wähle einfach Datum und Uhrzeit im Kalender.',
};

const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni',
                   'Juli','August','September','Oktober','November','Dezember'];
const DE_DAYS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

// ── Pure helpers ───────────────────────────────────────────────────────────
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
  return new Date(y, m, d).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/termin|buchen|vereinbaren|beratung|gespräch|meeting|angebot anfordern|demo anfragen/.test(t)) return 'book';
  if (/ki.?telefon|voicebot|telefonassistent|phone.?ai|sprachassistent/.test(t))                    return 'ki-telefon';
  if (/ki.?chat|chatbot|chat.assistent/.test(t))                                                     return 'ki-chat';
  if (/premium.?web|webseite|homepage|landing|website/.test(t))                                      return 'website';
  if (/lead.?gen|leadgen|akquise|interessenten|neukundengewinnung/.test(t))                          return 'leads';
  if (/preis|kosten|angebot|budget|€|euro|teuer|günstig/.test(t))                                   return 'pricing';
  if (/experte|expertenkontakt|mensch|mitarbeiter|sprechen|ansprechpartner/.test(t))                 return 'human';
  if (/datenschutz|dsgvo|privacy|sicher|konform/.test(t))                                            return 'datenschutz';
  if (/automatisierung|workflow|n8n|zapier|make\.com|integration|prozess/.test(t))                  return 'automation';
  return 'unknown';
}

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  bg: '#09090b', s1: '#111113', s2: '#18181b', s3: '#1a1a20',
  acc: '#00bbfd', accBg: 'rgba(0,187,253,0.09)', accBd: 'rgba(0,187,253,0.22)',
  bd: 'rgba(255,255,255,0.08)', txt: '#e7e7e7', muted: '#a1a1aa', err: '#ef4444',
};

// ── Component ─────────────────────────────────────────────────────────────
export default function PremiumChatbot() {
  const [open,       setOpen]      = useState(false);
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
  const [btnHov,     setBtnHov]    = useState(false);
  const [micTip,     setMicTip]    = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const idRef     = useRef(0);
  const nextId    = () => ++idRef.current;

  // ID of the last bot message — drives which quick-reply row is visible
  const lastBotId = useMemo(
    () => [...msgs].reverse().find(m => m.role === 'bot')?.id ?? -1,
    [msgs],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, step, typing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // ── Messaging helpers ────────────────────────────────────────────────────
  function botReply(text: string, quickReplies?: string[], delay = 950) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: nextId(), role: 'bot', text, quickReplies }]);
    }, delay);
  }

  function addUserMsg(text: string) {
    setMsgs(m => [...m, { id: nextId(), role: 'user', text }]);
  }

  // ── Navigation helpers ───────────────────────────────────────────────────
  function handleOpen() {
    setOpen(true);
    if (msgs.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs([{
          id: nextId(), role: 'bot',
          text: 'Willkommen bei **AFA**! Ich bin dein KI-Assistent. Wie kann ich dir heute helfen? 👋',
          quickReplies: WELCOME_REPLIES,
        }]);
      }, 700);
    }
    setTimeout(() => inputRef.current?.focus(), 800);
  }

  function startLead(goal: LeadGoal, intro?: string) {
    setLeadGoal(goal);
    setLead({});
    setStep('lead-vorname');
    botReply(intro ?? 'Gerne! Wie ist dein **Vorname**?');
  }

  function handleIntent(intent: string) {
    switch (intent) {
      case 'book':
        startLead('book', 'Sehr gerne! Um einen Termin zu buchen, starte ich kurz die Datenerfassung. Wie ist dein **Vorname**?');
        return;
      case 'ki-telefon':
        botReply(FAQ['ki-telefon'], ['Termin buchen', 'Preise anfragen', 'Expertenkontakt']);
        return;
      case 'ki-chat':
        botReply(FAQ['ki-chat'], ['Termin buchen', 'Preise anfragen', 'Expertenkontakt']);
        return;
      case 'website':
        botReply(FAQ['website'], ['Demo anfragen', 'Preise anfragen', 'Expertenkontakt']);
        return;
      case 'leads':
        botReply(FAQ['leads'], ['Termin buchen', 'Expertenkontakt']);
        return;
      case 'pricing':
        botReply(FAQ['preise'], ['Angebot anfordern', 'Termin buchen', 'Expertenkontakt']);
        return;
      case 'datenschutz':
        botReply(FAQ['datenschutz'], ['Weitere Fragen', 'Termin buchen']);
        return;
      case 'automation':
        botReply(FAQ['automation'], ['Demo anfragen', 'Termin buchen']);
        return;
      case 'human':
        startLead('handoff', 'Kein Problem! Ich verbinde dich mit einem Experten. Wie ist dein **Vorname**?');
        return;
      default:
        botReply('Ich habe das nicht ganz verstanden. Womit kann ich dir helfen?', WELCOME_REPLIES);
    }
  }

  // ── Main input dispatcher ────────────────────────────────────────────────
  function handleUserInput(rawText: string) {
    const text = rawText.trim();
    if (!text || submitting || typing) return;

    addUserMsg(text);
    setInput('');

    // Global commands reachable from any step
    if (text === 'Neue Anfrage starten') { reset(); return; }
    if (text === 'Weitere Fragen')        { botReply('Womit kann ich dir helfen?', WELCOME_REPLIES); return; }

    switch (step) {
      // ── Lead capture: one field at a time ────────────────────────────────
      case 'welcome':
      case 'lead-vorname':
        if (step === 'welcome') { handleIntent(detectIntent(text)); return; }
        setLead(l => ({ ...l, vorname: text }));
        setStep('lead-nachname');
        botReply(`Schön, **${text}**! Wie lautet dein **Nachname**?`);
        return;

      case 'lead-nachname':
        setLead(l => ({ ...l, nachname: text }));
        setStep('lead-email');
        botReply('Perfekt! Und deine **E-Mail-Adresse**?');
        return;

      case 'lead-email':
        if (!validateEmail(text)) {
          botReply('Das scheint keine gültige E-Mail zu sein. Bitte nochmal versuchen. 📧', undefined, 500);
          return;
        }
        setLead(l => ({ ...l, email: text }));
        setStep('lead-telefon');
        botReply('Super! Hast du eine **Telefonnummer**, unter der wir dich erreichen können?', ['Überspringen']);
        return;

      case 'lead-telefon': {
        const val = text.toLowerCase() === 'überspringen' ? '' : text;
        setLead(l => ({ ...l, telefon: val }));
        setStep('lead-unternehmen');
        botReply('Und der Name deines **Unternehmens**?', ['Überspringen']);
        return;
      }

      case 'lead-unternehmen': {
        const val = text.toLowerCase() === 'überspringen' ? '' : text;
        setLead(l => ({ ...l, unternehmen: val }));
        if (leadGoal === 'handoff') {
          setStep('submitting');
          setTyping(true);
          const finalLead = { ...lead, unternehmen: val };
          setTimeout(() => { doHandoff(finalLead); }, 600);
          return;
        }
        setStep('lead-interesse');
        botReply('Fast geschafft! Wofür interessierst du dich am meisten?', INTEREST_REPLIES);
        return;
      }

      case 'lead-interesse':
        setLead(l => ({ ...l, interesse: text }));
        setStep('cal-date');
        botReply('Super! Wähle jetzt deinen **Wunschtermin** im Kalender. 📅', undefined, 600);
        return;

      // ── Calendar / confirm: guard free text ──────────────────────────────
      case 'cal-date':
      case 'cal-time':
      case 'confirm':
      case 'submitting':
        botReply('Bitte nutze die Auswahl oben. 👆', undefined, 400);
        return;

      // ── Terminal states ──────────────────────────────────────────────────
      case 'success':
      case 'handoff-done':
        botReply('Der Chat ist abgeschlossen. Möchtest du etwas anderes wissen?', ['Neue Anfrage starten'], 400);
        return;

      case 'error':
        if (text === 'Erneut versuchen' && selDate && selTime) { submitBooking(); return; }
        botReply('Möchtest du es nochmal versuchen?', ['Erneut versuchen', 'Neue Anfrage starten'], 400);
        return;

      // ── Free chat (idle after FAQ, etc.) ─────────────────────────────────
      default:
        handleIntent(detectIntent(text));
    }
  }

  // ── Webhook calls ─────────────────────────────────────────────────────────
  async function doHandoff(finalLead: Partial<Lead>) {
    try {
      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...finalLead, requestType: 'human_handoff', source: 'AFA Website Chatbot', status: 'Neu' }),
        });
      }
      setTyping(false);
      setMsgs(m => [...m, {
        id: nextId(), role: 'bot',
        text: '✅ Deine Anfrage wurde weitergeleitet! Ein Experte meldet sich in Kürze bei dir. Du erreichst uns auch direkt unter **kontakt@afa-ai.com**.',
        quickReplies: ['Neue Anfrage starten'],
      }]);
      setStep('handoff-done');
    } catch {
      setTyping(false);
      setMsgs(m => [...m, {
        id: nextId(), role: 'bot',
        text: 'Es gab ein technisches Problem. Bitte kontaktiere uns direkt unter **kontakt@afa-ai.com** oder versuche es erneut.',
        quickReplies: ['Erneut versuchen', 'Neue Anfrage starten'],
      }]);
      setStep('error');
    }
  }

  async function submitBooking() {
    if (!selDate || !selTime) return;
    setSubmitting(true);
    setStep('submitting');
    setTyping(true);
    const dateStr = `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}`;
    try {
      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lead,
            appointmentDate:     dateStr,
            appointmentTime:     selTime,
            appointmentDateTime: `${dateStr}T${selTime}:00`,
            source:              'AFA Website Chatbot',
            status:              'Neu',
          }),
        });
      }
      setTyping(false);
      setSubmitting(false);
      setMsgs(m => [...m, {
        id: nextId(), role: 'bot',
        text: '🎉 Perfekt! Dein Termin wurde erfolgreich gebucht. Du erhältst in Kürze eine **Bestätigung per E-Mail**.',
        quickReplies: ['Neue Anfrage starten'],
      }]);
      setStep('success');
    } catch {
      setTyping(false);
      setSubmitting(false);
      setMsgs(m => [...m, {
        id: nextId(), role: 'bot',
        text: 'Es gab ein technisches Problem beim Buchen. Bitte versuche es erneut oder kontaktiere uns direkt.',
        quickReplies: ['Erneut versuchen', 'Neue Anfrage starten'],
      }]);
      setStep('error');
    }
  }

  function reset() {
    setStep('welcome');
    setLead({});
    setLeadGoal('book');
    setSelDate(null);
    setSelTime(null);
    setSubmitting(false);
    setMsgs([]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs([{
        id: nextId(), role: 'bot',
        text: 'Wie kann ich dir helfen? 👋',
        quickReplies: WELCOME_REPLIES,
      }]);
    }, 500);
  }

  // ── Shared button styles ──────────────────────────────────────────────────
  const qBtn: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${T.accBd}`, color: T.acc,
    fontSize: 12, padding: '5px 10px', borderRadius: 20, cursor: 'pointer',
    fontFamily: 'inherit', lineHeight: 1.4, whiteSpace: 'nowrap' as const,
  };
  const primBtn: React.CSSProperties = {
    background: T.acc, color: '#000', border: 'none', borderRadius: 8,
    padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  };
  const ghostBtn: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${T.bd}`, color: T.muted,
    borderRadius: 8, padding: '9px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
  };
  const navBtnSt: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${T.bd}`, color: T.txt,
    width: 28, height: 28, borderRadius: 6, fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderMsg(m: Msg) {
    const isBot  = m.role === 'bot';
    const html   = m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const showQR = !!m.quickReplies && m.id === lastBotId && !typing;
    return (
      <div key={m.id} style={{ marginBottom: 10, animation: 'msg-in 0.22s ease' }}>
        <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end' }}>
          {isBot && <Avatar />}
          <div
            style={{
              maxWidth: '78%', padding: '9px 13px',
              borderRadius: isBot ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
              background: isBot ? T.s2 : T.accBg,
              border: `1px solid ${isBot ? T.bd : T.accBd}`,
              color: isBot ? T.txt : '#c8f3ff', fontSize: 13, lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        {showQR && (
          <div style={{ marginLeft: 34, marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {m.quickReplies!.map(r => (
              <button key={r} onClick={() => handleUserInput(r)} style={qBtn}>{r}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderTypingDots() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Avatar />
        <div style={{
          padding: '9px 14px', borderRadius: '14px 14px 14px 4px',
          background: T.s2, border: `1px solid ${T.bd}`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ fontSize: 11, color: T.muted, marginRight: 2 }}>AFA Assistant schreibt</span>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: T.muted,
              animation: `typing-bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  function renderCalDate() {
    const today = new Date();
    const tY = today.getFullYear(), tM = today.getMonth(), tD = today.getDate();
    const cells = buildMonthGrid(calYear, calMonth);
    const canPrev = calYear > tY || (calYear === tY && calMonth > tM);

    function navMonth(dir: 1 | -1) {
      const nm = calMonth + dir;
      if (nm < 0)   { setCalMonth(11); setCalYear(y => y - 1); }
      else if (nm > 11) { setCalMonth(0);  setCalYear(y => y + 1); }
      else setCalMonth(nm);
      setSelDate(null);
    }

    function isOff(day: number) {
      if (calYear < tY || (calYear === tY && calMonth < tM)) return true;
      if (calYear === tY && calMonth === tM && day < tD)     return true;
      const dow = new Date(calYear, calMonth, day).getDay();
      return dow === 0 || dow === 6;
    }

    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => navMonth(-1)} disabled={!canPrev} style={{ ...navBtnSt, opacity: canPrev ? 1 : 0.3 }}>‹</button>
          <span style={{ color: T.txt, fontSize: 13, fontWeight: 700 }}>{DE_MONTHS[calMonth]} {calYear}</span>
          <button onClick={() => navMonth(1)} style={navBtnSt}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
          {DE_DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: T.muted }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const off = isOff(day);
            const sel = selDate?.day === day && selDate.month === calMonth && selDate.year === calYear;
            return (
              <button key={i} disabled={off} onClick={() => setSelDate({ year: calYear, month: calMonth, day })}
                style={{
                  background:   sel ? T.acc : 'transparent',
                  color:        off ? '#3f3f46' : sel ? '#000' : T.txt,
                  border:       `1px solid ${sel ? T.acc : 'transparent'}`,
                  borderRadius: 6, padding: '5px 0', fontSize: 12,
                  cursor: off ? 'default' : 'pointer', fontFamily: 'inherit',
                }}
              >{day}</button>
            );
          })}
        </div>
        <button
          disabled={!selDate}
          onClick={() => {
            if (!selDate) return;
            addUserMsg(fmtDate(selDate.year, selDate.month, selDate.day));
            setStep('cal-time');
            botReply('Welche **Uhrzeit** passt dir am besten?', undefined, 500);
          }}
          style={{ ...primBtn, width: '100%', marginTop: 12, opacity: selDate ? 1 : 0.35 }}
        >Weiter →</button>
      </div>
    );
  }

  function renderCalTime() {
    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Verfügbare Zeiten</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
          {TIME_SLOTS.map(t => (
            <button key={t} onClick={() => setSelTime(t)} style={{
              background:   selTime === t ? T.acc : 'transparent',
              color:        selTime === t ? '#000' : T.txt,
              border:       `1px solid ${selTime === t ? T.acc : T.bd}`,
              borderRadius: 7, padding: '7px 0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep('cal-date')} style={ghostBtn}>‹ Datum</button>
          <button
            disabled={!selTime}
            onClick={() => {
              if (!selTime || !selDate) return;
              addUserMsg(`${selTime} Uhr`);
              setStep('confirm');
              botReply('Fast geschafft! Prüfe bitte deine **Terminübersicht** und bestätige.', undefined, 500);
            }}
            style={{ ...primBtn, flex: 1, opacity: selTime ? 1 : 0.35 }}
          >Weiter →</button>
        </div>
      </div>
    );
  }

  function renderConfirm() {
    const dateStr = selDate ? fmtDate(selDate.year, selDate.month, selDate.day) : '';
    const rows: [string, string][] = [
      ['Datum',   dateStr],
      ['Uhrzeit', (selTime ?? '') + ' Uhr'],
      ['Name',    `${lead.vorname ?? ''} ${lead.nachname ?? ''}`.trim()],
      ['E-Mail',  lead.email ?? ''],
      ...(lead.telefon     ? [['Telefon',     lead.telefon]     as [string, string]] : []),
      ...(lead.unternehmen ? [['Unternehmen', lead.unternehmen] as [string, string]] : []),
      ...(lead.interesse   ? [['Interesse',   lead.interesse]   as [string, string]] : []),
    ];
    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Terminübersicht</div>
        <div style={{ display: 'grid', gap: 7, marginBottom: 14 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, color: T.muted, minWidth: 84, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 12, color: T.txt }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep('cal-date')} style={{ ...ghostBtn, fontSize: 11 }}>Datum ändern</button>
          <button onClick={submitBooking} disabled={submitting} style={{ ...primBtn, flex: 1 }}>
            {submitting ? 'Wird gebucht…' : 'Termin bestätigen ✓'}
          </button>
        </div>
      </div>
    );
  }

  // ── Avatar sub-component ─────────────────────────────────────────────────
  function Avatar() {
    return (
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'linear-gradient(135deg,#00bbfd,#0066aa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 800, color: '#08090a',
        flexShrink: 0, marginRight: 8, marginTop: 2,
      }}>A</div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating chat button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998 }}>
        {pulse && !open && (
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: `2px solid ${T.acc}`, opacity: 0.5,
            animation: 'ring-pulse 1.8s ease-in-out infinite', pointerEvents: 'none',
          }} />
        )}
        <button
          onClick={() => open ? setOpen(false) : handleOpen()}
          onMouseEnter={() => setBtnHov(true)}
          onMouseLeave={() => setBtnHov(false)}
          title="AFA Chat öffnen"
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg,${T.acc},#0077b6)`,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,187,253,0.35),0 2px 8px rgba(0,0,0,0.5)',
            transform: btnHov ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {open
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9997,
          width: 'min(420px,calc(100vw - 32px))',
          maxHeight: 'min(640px,calc(100vh - 110px))',
          background: T.s1, border: `1px solid ${T.bd}`, borderRadius: 20,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.75),0 8px 24px rgba(0,0,0,0.45)',
          animation: 'chatbot-appear 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Header */}
          <div style={{
            background: T.s2, borderBottom: `1px solid ${T.bd}`,
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00bbfd,#0066aa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#08090a', flexShrink: 0,
            }}>A</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)' }}>AFA Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#22c55e' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                Online · KI-Assistent
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages + inline panels */}
          <div
            ref={scrollRef}
            style={{
              flex: 1, overflowY: 'auto', padding: '14px 14px 4px',
              display: 'flex', flexDirection: 'column',
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            }}
          >
            {msgs.map(renderMsg)}
            {typing && renderTypingDots()}
            {step === 'cal-date' && !typing && renderCalDate()}
            {step === 'cal-time' && !typing && renderCalTime()}
            {step === 'confirm'  && !typing && renderConfirm()}
            <div style={{ height: 4 }} />
          </div>

          {/* Input bar */}
          <div style={{
            background: T.s2, borderTop: `1px solid ${T.bd}`,
            padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
          }}>
            {/* Mic button */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => { setMicTip(v => !v); setTimeout(() => setMicTip(false), 2800); }}
                style={{
                  background: 'transparent', border: `1px solid ${T.bd}`,
                  borderRadius: 8, width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: T.muted,
                }}
                title="Sprachfunktion"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8"  y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              {micTip && (
                <div style={{
                  position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
                  background: T.s3, border: `1px solid ${T.bd}`, borderRadius: 8,
                  padding: '6px 10px', fontSize: 11, color: T.muted,
                  whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
                }}>
                  Sprachfunktion bald verfügbar
                </div>
              )}
            </div>

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserInput(input); } }}
              placeholder={typing ? 'AFA Assistant schreibt…' : 'Nachricht eingeben…'}
              disabled={submitting}
              style={{
                flex: 1, background: T.s3, border: `1px solid ${T.bd}`,
                borderRadius: 10, padding: '9px 12px', color: T.txt,
                fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />

            {/* Send button */}
            <button
              onClick={() => handleUserInput(input)}
              disabled={!input.trim() || submitting}
              style={{
                background:  input.trim() ? T.acc : T.s3,
                border:      `1px solid ${input.trim() ? T.acc : T.bd}`,
                borderRadius: 8, width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
                transition: 'background 0.15s,border-color 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#000' : T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

        </div>
      )}
    </>
  );
}
