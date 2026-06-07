'use client';
import { useState, useRef, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type FlowStep =
  | 'welcome'
  | 'lead'
  | 'cal-date'
  | 'cal-time'
  | 'confirm'
  | 'submitting'
  | 'success'
  | 'error'
  | 'faq'
  | 'handoff-lead'
  | 'handoff-done';

interface Lead {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  unternehmen: string;
  interesse: string;
}

interface Msg {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const WEBHOOK = process.env.NEXT_PUBLIC_AFA_CHATBOT_WEBHOOK_URL ?? '';

const INTERESTS = [
  'KI-Telefon',
  'KI-Chat',
  'Premium Website',
  'Lead-Generierung',
  'Termin / Beratung',
  'Preise & Angebot',
];

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00',
];

const FAQ_MAP: Record<string, { label: string; answer: string }> = {
  'ki-telefon': {
    label: 'Fragen zu KI-Telefon',
    answer: 'Unser **KI-Telefon-Mitarbeiter** beantwortet Anrufe rund um die Uhr, qualifiziert Interessenten automatisch und bucht Termine direkt in deinen Kalender – ohne manuellen Aufwand. Klingt natürlich, spricht Deutsch und passt sich vollständig deinem Unternehmen an.',
  },
  'ki-chat': {
    label: 'Fragen zu KI-Chat',
    answer: 'Der **KI-Chat-Assistent** übernimmt Website-Anfragen 24/7, beantwortet häufige Fragen, qualifiziert Leads und bucht Termine – vollautomatisch und in deinem Unternehmens-Stil.',
  },
  'websites': {
    label: 'Fragen zu Premium Websites',
    answer: 'Wir entwickeln hochperformante, konversionsorientierte **Premium-Websites** mit eingebettetem KI-Chat und automatisierter Lead-Erfassung. Design, Technik und KI aus einer Hand.',
  },
  'leads': {
    label: 'Fragen zu Lead-Generierung',
    answer: 'Unser System erfasst Interessenten automatisch, qualifiziert sie per KI und übergibt qualifizierte Leads direkt in dein CRM – oder sendet sofort eine Benachrichtigung an dein Team.',
  },
  'preise': {
    label: 'Preise & Angebot',
    answer: 'Unsere Lösungen sind individuell auf dein Unternehmen abgestimmt. Für ein persönliches Angebot buche gerne ein **kostenloses Beratungsgespräch** oder schreib uns direkt.',
  },
  'datenschutz': {
    label: 'Datenschutz / DSGVO',
    answer: 'Alle Daten werden auf **europäischen Servern** verarbeitet und gespeichert. Wir sind vollständig DSGVO-konform und stellen auf Anfrage eine Auftragsverarbeitungsvereinbarung (AVV) zur Verfügung.',
  },
};

const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const DE_DAYS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

// ── Helpers ───────────────────────────────────────────────────────────────
function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDow === 0 ? 6 : firstDow - 1; // Mon-first
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function fmtGermanDate(year: number, month: number, day: number) {
  return new Date(year, month, day).toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

// ── Design tokens ─────────────────────────────────────────────────────────
const T = {
  bg:    '#09090b',
  s1:    '#111113',
  s2:    '#18181b',
  s3:    '#1a1a20',
  acc:   '#00bbfd',
  accBg: 'rgba(0,187,253,0.09)',
  accBd: 'rgba(0,187,253,0.22)',
  bd:    'rgba(255,255,255,0.08)',
  txt:   '#e7e7e7',
  muted: '#a1a1aa',
  soft:  '#71717a',
  err:   '#ef4444',
};

// ── Component ─────────────────────────────────────────────────────────────
export default function PremiumChatbot() {
  const [open,       setOpen]       = useState(false);
  const [step,       setStep]       = useState<FlowStep>('welcome');
  const [msgs,       setMsgs]       = useState<Msg[]>([]);
  const [lead,       setLead]       = useState<Partial<Lead>>({});
  const [leadErrs,   setLeadErrs]   = useState<Partial<Record<keyof Lead, string>>>({});
  const [selDate,    setSelDate]    = useState<{ year: number; month: number; day: number } | null>(null);
  const [selTime,    setSelTime]    = useState<string | null>(null);
  const [calYear,    setCalYear]    = useState(() => new Date().getFullYear());
  const [calMonth,   setCalMonth]   = useState(() => new Date().getMonth());
  const [submitting, setSubmitting] = useState(false);
  const [pulse,      setPulse]      = useState(true);
  const [hovBtn,     setHovBtn]     = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef     = useRef(0);
  const nextId    = () => ++idRef.current;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, step]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // ── Message helpers ──────────────────────────────────────────────────────
  function addMsg(role: 'bot' | 'user', text: string) {
    setMsgs(m => [...m, { id: nextId(), role, text }]);
  }

  // ── Navigation helpers ───────────────────────────────────────────────────
  function handleOpen() {
    setOpen(true);
    if (msgs.length === 0) {
      setMsgs([{ id: nextId(), role: 'bot', text: 'Willkommen bei **AFA**! Ich bin dein KI-Assistent. Wie kann ich dir heute helfen?' }]);
    }
  }

  function goToLead(interesse?: string) {
    if (interesse) setLead(l => ({ ...l, interesse }));
    setStep('lead');
    setTimeout(() => addMsg('bot', 'Bitte gib uns deine Kontaktdaten, damit wir dich optimal betreuen können.'), 200);
  }

  function goToFaq(key: string, userLabel: string) {
    addMsg('user', userLabel);
    setStep('faq');
    setTimeout(() => addMsg('bot', FAQ_MAP[key].answer), 200);
  }

  function goToHandoff(userLabel: string) {
    addMsg('user', userLabel);
    setStep('handoff-lead');
    setTimeout(() => addMsg('bot', 'Kein Problem! Damit ein Experte dich direkt kontaktieren kann, gib bitte kurz deine Kontaktdaten ein.'), 200);
  }

  function validateLead(): boolean {
    const errs: Partial<Record<keyof Lead, string>> = {};
    if (!lead.vorname?.trim()) errs.vorname = 'Pflichtfeld';
    if (!lead.email?.trim())   errs.email   = 'Pflichtfeld';
    else if (!validateEmail(lead.email)) errs.email = 'Ungültige E-Mail';
    setLeadErrs(errs);
    return Object.keys(errs).length === 0;
  }

  function submitLead() {
    if (!validateLead()) return;
    addMsg('user', `${lead.vorname ?? ''} ${lead.nachname ?? ''} — ${lead.email ?? ''}`);
    setTimeout(() => addMsg('bot', 'Danke! Wähle jetzt deinen Wunschtermin.'), 200);
    setStep('cal-date');
  }

  async function submitBooking() {
    if (!selDate || !selTime) return;
    setSubmitting(true);
    setStep('submitting');
    const dateStr = `${selDate.year}-${pad2(selDate.month + 1)}-${pad2(selDate.day)}`;
    const payload = {
      vorname:           lead.vorname ?? '',
      nachname:          lead.nachname ?? '',
      email:             lead.email ?? '',
      telefon:           lead.telefon ?? '',
      unternehmen:       lead.unternehmen ?? '',
      interesse:         lead.interesse ?? '',
      appointmentDate:   dateStr,
      appointmentTime:   selTime,
      appointmentDateTime: `${dateStr}T${selTime}:00`,
      source:            'AFA Website Chatbot',
      status:            'Neu',
    };
    try {
      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      addMsg('bot', 'Perfekt! Dein Termin wurde erfolgreich gebucht! Du erhältst in Kürze eine Bestätigung per E-Mail.');
      setStep('success');
    } catch {
      addMsg('bot', 'Es gab ein technisches Problem. Bitte versuche es erneut oder kontaktiere uns direkt.');
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitHandoff() {
    if (!validateLead()) return;
    addMsg('user', `${lead.vorname ?? ''} ${lead.nachname ?? ''} — ${lead.email ?? ''}`);
    const payload = {
      ...lead,
      requestType: 'human_handoff',
      source:      'AFA Website Chatbot',
      status:      'Neu',
    };
    try {
      if (WEBHOOK) {
        await fetch(WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch { /* silent */ }
    addMsg('bot', 'Deine Anfrage wurde weitergeleitet! Ein Experte meldet sich so schnell wie möglich bei dir. Du kannst uns auch direkt unter kontakt@afa-ai.com erreichen.');
    setStep('handoff-done');
  }

  function reset() {
    setStep('welcome');
    setMsgs([{ id: nextId(), role: 'bot', text: 'Willkommen bei **AFA**! Ich bin dein KI-Assistent. Wie kann ich dir heute helfen?' }]);
    setLead({});
    setLeadErrs({});
    setSelDate(null);
    setSelTime(null);
  }

  // ── Style helpers ────────────────────────────────────────────────────────
  const qBtn: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${T.accBd}`,
    color: T.acc,
    fontSize: 12,
    padding: '6px 11px',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'inherit',
    lineHeight: 1.4,
  };

  const primBtn: React.CSSProperties = {
    background: T.acc,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const ghostBtn: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${T.bd}`,
    color: T.muted,
    borderRadius: 8,
    padding: '9px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const navBtn: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${T.bd}`,
    color: T.txt,
    width: 28,
    height: 28,
    borderRadius: 6,
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: T.s3,
    border: `1px solid ${T.bd}`,
    borderRadius: 7,
    padding: '7px 10px',
    color: T.txt,
    fontSize: 12,
    outline: 'none',
    fontFamily: 'inherit',
  };

  const inputErrStyle: React.CSSProperties = { ...inputStyle, border: `1px solid ${T.err}` };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: T.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'block',
    marginBottom: 3,
  };

  // ── Render: message bubble ───────────────────────────────────────────────
  function renderMsg(m: Msg) {
    const isBot = m.role === 'bot';
    const html = m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <div
        key={m.id}
        style={{
          display: 'flex',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
          marginBottom: 8,
          animation: 'msg-in 0.22s ease',
        }}
      >
        {isBot && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,#00bbfd,#0066aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#08090a',
            flexShrink: 0, marginRight: 8, marginTop: 2,
          }}>A</div>
        )}
        <div
          style={{
            maxWidth: '78%',
            padding: '9px 13px',
            borderRadius: isBot ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
            background: isBot ? T.s2 : T.accBg,
            border: `1px solid ${isBot ? T.bd : T.accBd}`,
            color: isBot ? T.txt : '#c8f3ff',
            fontSize: 13,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // ── Render: welcome buttons ──────────────────────────────────────────────
  function renderWelcome() {
    const opts = [
      { label: 'Beratung buchen',             act: () => { addMsg('user','Beratung buchen');              goToLead('Termin / Beratung'); } },
      { label: 'Termin vereinbaren',          act: () => { addMsg('user','Termin vereinbaren');           goToLead('Termin / Beratung'); } },
      { label: 'Fragen zu KI-Telefon',        act: () => goToFaq('ki-telefon',   'Fragen zu KI-Telefon') },
      { label: 'Fragen zu KI-Chat',           act: () => goToFaq('ki-chat',      'Fragen zu KI-Chat') },
      { label: 'Fragen zu Premium Websites',  act: () => goToFaq('websites',     'Fragen zu Premium Websites') },
      { label: 'Fragen zu Lead-Generierung',  act: () => goToFaq('leads',        'Fragen zu Lead-Generierung') },
      { label: 'Preise / Angebot',            act: () => goToFaq('preise',       'Preise / Angebot') },
      { label: 'Mit einem Experten sprechen', act: () => goToHandoff('Mit einem Experten sprechen') },
    ];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0 8px' }}>
        {opts.map(o => (
          <button key={o.label} onClick={o.act} style={qBtn}>{o.label}</button>
        ))}
      </div>
    );
  }

  // ── Render: lead form ────────────────────────────────────────────────────
  function renderLeadForm(isHandoff = false) {
    type LK = keyof Lead;
    const fields: { key: LK; label: string; type?: string; span?: number }[] = [
      { key: 'vorname',     label: 'Vorname *' },
      { key: 'nachname',    label: 'Nachname' },
      { key: 'email',       label: 'E-Mail *',   type: 'email', span: 2 },
      { key: 'telefon',     label: 'Telefon',     type: 'tel' },
      { key: 'unternehmen', label: 'Unternehmen', span: 2 },
    ];
    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: '14px', marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', marginBottom: 10 }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={(lead[f.key] as string) ?? ''}
                onChange={e => { setLead(l => ({ ...l, [f.key]: e.target.value })); setLeadErrs(er => ({ ...er, [f.key]: undefined })); }}
                style={leadErrs[f.key] ? inputErrStyle : inputStyle}
              />
              {leadErrs[f.key] && <div style={{ fontSize: 10, color: T.err, marginTop: 2 }}>{leadErrs[f.key]}</div>}
            </div>
          ))}
          {!isHandoff && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Interesse</label>
              <select
                value={lead.interesse ?? ''}
                onChange={e => setLead(l => ({ ...l, interesse: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' as const }}
              >
                <option value="">Bitte wählen…</option>
                {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          )}
        </div>
        <button
          onClick={isHandoff ? submitHandoff : submitLead}
          style={{ ...primBtn, width: '100%' }}
        >
          {isHandoff ? 'Experten kontaktieren →' : 'Weiter zur Terminauswahl →'}
        </button>
      </div>
    );
  }

  // ── Render: calendar date picker ─────────────────────────────────────────
  function renderCalDate() {
    const today    = new Date();
    const todayY   = today.getFullYear();
    const todayM   = today.getMonth();
    const todayD   = today.getDate();
    const canPrev  = calYear > todayY || (calYear === todayY && calMonth > todayM);
    const cells    = buildMonthGrid(calYear, calMonth);

    function isDisabled(day: number) {
      if (calYear === todayY && calMonth === todayM && day < todayD) return true;
      if (calYear === todayY && calMonth < todayM) return true;
      if (calYear < todayY) return true;
      const dow = new Date(calYear, calMonth, day).getDay();
      return dow === 0 || dow === 6;
    }

    const navMonth = (dir: 1 | -1) => {
      const nm = calMonth + dir;
      if (nm < 0)  { setCalMonth(11); setCalYear(y => y - 1); }
      else if (nm > 11) { setCalMonth(0);  setCalYear(y => y + 1); }
      else setCalMonth(nm);
      setSelDate(null);
    };

    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: '14px', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => navMonth(-1)} disabled={!canPrev} style={{ ...navBtn, opacity: canPrev ? 1 : 0.3 }}>‹</button>
          <span style={{ color: T.txt, fontSize: 13, fontWeight: 700 }}>{DE_MONTHS[calMonth]} {calYear}</span>
          <button onClick={() => navMonth(1)} style={navBtn}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
          {DE_DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, color: T.muted, padding: '2px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dis = isDisabled(day);
            const sel = selDate?.day === day && selDate?.month === calMonth && selDate?.year === calYear;
            return (
              <button
                key={i}
                disabled={dis}
                onClick={() => setSelDate({ year: calYear, month: calMonth, day })}
                style={{
                  background:  sel ? T.acc : 'transparent',
                  color:       dis ? '#3f3f46' : sel ? '#000' : T.txt,
                  border:      `1px solid ${sel ? T.acc : 'transparent'}`,
                  borderRadius: 6,
                  padding:     '5px 0',
                  fontSize:    12,
                  cursor:      dis ? 'default' : 'pointer',
                  fontFamily:  'inherit',
                }}
              >{day}</button>
            );
          })}
        </div>

        <button
          disabled={!selDate}
          onClick={() => {
            if (!selDate) return;
            addMsg('user', fmtGermanDate(selDate.year, selDate.month, selDate.day));
            setTimeout(() => addMsg('bot', 'Welche Uhrzeit passt dir am besten?'), 200);
            setStep('cal-time');
          }}
          style={{ ...primBtn, width: '100%', marginTop: 12, opacity: selDate ? 1 : 0.35 }}
        >Weiter →</button>
      </div>
    );
  }

  // ── Render: time slot picker ─────────────────────────────────────────────
  function renderCalTime() {
    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: '14px', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verfügbare Zeiten</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
          {TIME_SLOTS.map(t => (
            <button
              key={t}
              onClick={() => setSelTime(t)}
              style={{
                background:  selTime === t ? T.acc : 'transparent',
                color:       selTime === t ? '#000' : T.txt,
                border:      `1px solid ${selTime === t ? T.acc : T.bd}`,
                borderRadius: 7,
                padding:     '7px 0',
                fontSize:    12,
                cursor:      'pointer',
                fontFamily:  'inherit',
              }}
            >{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep('cal-date')} style={ghostBtn}>‹ Datum</button>
          <button
            disabled={!selTime}
            onClick={() => {
              if (!selTime || !selDate) return;
              addMsg('user', `${selTime} Uhr`);
              setTimeout(() => addMsg('bot', 'Bitte prüfe deine Angaben und bestätige den Termin.'), 200);
              setStep('confirm');
            }}
            style={{ ...primBtn, flex: 1, opacity: selTime ? 1 : 0.35 }}
          >Weiter →</button>
        </div>
      </div>
    );
  }

  // ── Render: confirmation summary ─────────────────────────────────────────
  function renderConfirm() {
    const dateStr = selDate ? fmtGermanDate(selDate.year, selDate.month, selDate.day) : '';
    const rows: [string, string][] = [
      ['Datum',       dateStr],
      ['Uhrzeit',     (selTime ?? '') + ' Uhr'],
      ['Name',        `${lead.vorname ?? ''} ${lead.nachname ?? ''}`.trim()],
      ['E-Mail',      lead.email ?? ''],
      ...(lead.telefon     ? [['Telefon',     lead.telefon]     as [string,string]] : []),
      ...(lead.unternehmen ? [['Unternehmen', lead.unternehmen] as [string,string]] : []),
      ...(lead.interesse   ? [['Interesse',   lead.interesse]   as [string,string]] : []),
    ];
    return (
      <div style={{ background: T.s2, border: `1px solid ${T.bd}`, borderRadius: 12, padding: '14px', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Terminübersicht</div>
        <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, color: T.muted, minWidth: 84, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 12, color: T.txt }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep('cal-date')} style={{ ...ghostBtn, fontSize: 11 }}>Datum ändern</button>
          <button
            onClick={submitBooking}
            disabled={submitting}
            style={{ ...primBtn, flex: 1 }}
          >
            {submitting ? 'Wird gebucht…' : 'Termin bestätigen ✓'}
          </button>
        </div>
      </div>
    );
  }

  // ── Render: post-FAQ actions ─────────────────────────────────────────────
  function renderFaqActions() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0 8px' }}>
        <button onClick={() => { addMsg('user','Termin buchen'); goToLead(); }} style={qBtn}>Termin buchen</button>
        <button onClick={() => { addMsg('user','Weitere Fragen'); setStep('welcome'); }} style={qBtn}>Weitere Fragen</button>
        <button onClick={() => goToHandoff('Mit einem Experten sprechen')} style={qBtn}>Mit einem Experten sprechen</button>
      </div>
    );
  }

  // ── Render: success / reset ──────────────────────────────────────────────
  function renderSuccess() {
    return (
      <div style={{ padding: '4px 0 8px' }}>
        <button onClick={reset} style={ghostBtn}>Neue Anfrage starten</button>
      </div>
    );
  }

  // ── Render: error / retry ────────────────────────────────────────────────
  function renderError() {
    return (
      <div style={{ display: 'flex', gap: 8, padding: '4px 0 8px' }}>
        <button onClick={() => setStep('confirm')} style={qBtn}>Erneut versuchen</button>
        <button onClick={reset} style={qBtn}>Neu starten</button>
      </div>
    );
  }

  // ── Render: active panel ─────────────────────────────────────────────────
  function renderPanel() {
    switch (step) {
      case 'welcome':      return renderWelcome();
      case 'lead':         return renderLeadForm(false);
      case 'handoff-lead': return renderLeadForm(true);
      case 'cal-date':     return renderCalDate();
      case 'cal-time':     return renderCalTime();
      case 'confirm':      return renderConfirm();
      case 'submitting':   return <div style={{ color: T.muted, fontSize: 12, padding: '8px 0' }}>Termin wird gebucht…</div>;
      case 'faq':          return renderFaqActions();
      case 'success':      return renderSuccess();
      case 'handoff-done': return renderSuccess();
      case 'error':        return renderError();
      default:             return null;
    }
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating chat button */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9998 }}>
        {/* Pulse ring */}
        {pulse && !open && (
          <div style={{
            position:  'absolute',
            inset:     -10,
            borderRadius: '50%',
            border:    `2px solid ${T.acc}`,
            opacity:   0.5,
            animation: 'ring-pulse 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        <button
          onClick={() => open ? setOpen(false) : handleOpen()}
          onMouseEnter={() => setHovBtn(true)}
          onMouseLeave={() => setHovBtn(false)}
          title="AFA Chat öffnen"
          style={{
            width:        56,
            height:       56,
            borderRadius: '50%',
            background:   `linear-gradient(135deg, ${T.acc}, #0077b6)`,
            border:       'none',
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            boxShadow:    `0 4px 24px rgba(0,187,253,0.35), 0 2px 8px rgba(0,0,0,0.5)`,
            transform:    hovBtn ? 'scale(1.08)' : 'scale(1)',
            transition:   'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div style={{
          position:   'fixed',
          bottom:     92,
          right:      24,
          zIndex:     9997,
          width:      'min(420px, calc(100vw - 32px))',
          maxHeight:  'min(620px, calc(100vh - 110px))',
          background: T.s1,
          border:     `1px solid ${T.bd}`,
          borderRadius: 20,
          overflow:   'hidden',
          display:    'flex',
          flexDirection: 'column',
          boxShadow:  '0 24px 64px rgba(0,0,0,0.75), 0 8px 24px rgba(0,0,0,0.45)',
          animation:  'chatbot-appear 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Header */}
          <div style={{
            background:   T.s2,
            borderBottom: `1px solid ${T.bd}`,
            padding:      '13px 16px',
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            flexShrink:   0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00bbfd,#0066aa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#08090a', flexShrink: 0,
            }}>A</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>AFA Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#22c55e' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                Online
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'transparent', border: 'none', color: T.muted, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex:      1,
              overflowY: 'auto',
              padding:   '14px 14px 4px',
              display:   'flex',
              flexDirection: 'column',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.1) transparent',
            }}
          >
            {msgs.map(renderMsg)}
          </div>

          {/* Interactive panel */}
          <div style={{ padding: '0 14px 14px', flexShrink: 0 }}>
            {renderPanel()}
          </div>
        </div>
      )}
    </>
  );
}
