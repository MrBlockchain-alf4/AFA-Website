/**
 * Foruzan's Cuts & Kosmetik — Chatbot Widget
 * German language, appointment booking flow
 * Embed: <script src="/chatbot/chatbot.js" defer></script>
 */
(function () {
  'use strict';
  if (document.getElementById('fc-cb-root')) return;

  /* ── PALETTE ── */
  const G = {
    gold:      '#d94f7a',
    goldLight: '#e66d90',
    goldDim:   'rgba(217,79,122,0.12)',
    goldGlow:  'rgba(217,79,122,0.24)',
    dark:      '#2b2320',
    card:      '#221b19',
    elev:      '#342a26',
    border:    '#3d3028',
    text:      '#EDE8DE',
    muted:     '#9a8880',
    green:     '#5A9E6F',
  };

  /* ── BUSINESS DATA ── */
  const BIZ = {
    name:     "Foruzan's Cuts & Kosmetik",
    address:  'Rathausstraße 20, 58095 Hagen',
    phone:    '+49 2331 8424456',
    phoneHref:'tel:+4923318424456',
    ig:       '@foruzan_s_cut_kosmetik',
    igUrl:    'https://www.instagram.com/foruzan_s_cut_kosmetik/',
    hours: [
      { day: 'Mo – Fr', time: '09:00 – 18:30 Uhr' },
      { day: 'Samstag', time: '09:00 – 16:00 Uhr' },
      { day: 'Sonntag', time: 'Geschlossen' },
    ],
    services: ['Haarschnitt', 'Coloration & Balayage', 'Foliyage', 'Haarkosmetik & Regeneration', 'Sonstiges'],
  };

  /* ── INTENT DETECTION ── */
  function intent(raw) {
    const m = raw.toLowerCase();
    const has = (...w) => w.some(x => m.includes(x));

    if (has('termin', 'buchen', 'buchung', 'reserv', 'anmeld', 'terminanfrage'))
      return 'book';
    if (has('öffnungszeit', 'öffnet', 'schließt', 'offen', 'geöffnet', 'wann', 'bis wann', 'ab wann', 'uhrzeit', 'zeiten'))
      return 'hours';
    if (has('adresse', 'wo ', 'standort', 'anfahrt', 'rathausstraße', 'weg zu', 'wo sind', 'wo ist', 'hagen'))
      return 'location';
    if (has('telefon', 'nummer', 'anruf', 'erreichbar', 'tel', 'rufnummer', 'anrufen'))
      return 'phone';
    if (has('instagram', 'insta', 'follower', 'social'))
      return 'instagram';
    if (has('balayage', 'foliyage', 'coloration', 'farbe', 'färben', 'strähnchen', 'highlight', 'tönung', 'blondier'))
      return 'color';
    if (has('regeneration', 'haarkosmetik', 'pflegebehandlung', 'kur', 'behandlung'))
      return 'treatment';
    if (has('haarschnitt', 'schnitt', 'schneiden', 'haare schneid', 'föhn', 'waschen und legen'))
      return 'haircut';
    if (has('leistung', 'angebot', 'was macht', 'was bietet', 'was gibt', 'service', 'was können'))
      return 'services';
    if (has('preis', 'kosten', 'was kostet', 'wie viel', 'tarif', 'bezahl', 'preiswert', 'günstig', 'teuer', 'preisliste'))
      return 'price';
    if (has('danke', 'vielen dank', 'merci', 'super', 'toll', 'prima', 'perfekt', 'wunderbar', 'klasse'))
      return 'thanks';
    if (has('tschüss', 'wiedersehen', 'bye', 'ciao', 'auf wiedersehen'))
      return 'bye';
    if (has('hallo', 'hi', 'hey', 'guten tag', 'guten morgen', 'guten abend', 'moin', 'servus', 'grüß'))
      return 'greet';
    return 'unknown';
  }

  /* ── RESPONSES ── */
  function link(href, label) {
    return `<a href="${href}" style="color:${G.gold};text-decoration:none;font-weight:500;" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${label}</a>`;
  }
  function chip(label) {
    return `<span class="fc-inline-chip" onclick="fcSend('${label}')">${label}</span>`;
  }

  const R = {
    greet: () => `Guten Tag! Willkommen bei <strong>${BIZ.name}</strong> 💇‍♀️<br><br>Wie kann ich Ihnen helfen? Ich beantworte Fragen zu unseren Leistungen, Öffnungszeiten und Kontakt – oder helfe Ihnen bei einer ${chip('Terminanfrage')}.`,

    hours: () => `Unsere <strong>Öffnungszeiten</strong>:<br><br>${
      BIZ.hours.map(h => `🗓 <strong>${h.day}:</strong> ${h.time}`).join('<br>')
    }<br><br>Möchten Sie direkt einen ${chip('Termin anfragen')}?`,

    location: () => `Sie finden uns hier:<br><br>📍 <strong>Rathausstraße 20<br>58095 Hagen</strong><br><br>Wir freuen uns auf Ihren Besuch!`,

    phone: () => `Erreichen Sie uns unter:<br><br>📞 <strong>${link(BIZ.phoneHref, BIZ.phone)}</strong><br><br>Oder stellen Sie hier eine ${chip('Terminanfrage')}.`,

    instagram: () => `Folgen Sie uns auf Instagram!<br><br>📸 <strong>${link(BIZ.igUrl, BIZ.ig)}</strong><br><br>Über 7.260 Follower – aktuelle Looks &amp; Inspirationen warten auf Sie!`,

    services: () => `Unsere <strong>Leistungen</strong> im Überblick:<br><br>✂️ ${chip('Haarschnitt')} – Damen &amp; Herren<br>🎨 ${chip('Coloration & Balayage')} – inkl. Foliyage<br>✨ ${chip('Haarkosmetik & Regeneration')}<br><br>Soll ich Ihnen bei einer ${chip('Terminanfrage')} helfen?`,

    haircut: () => `Unsere <strong>Haarschnitte</strong> werden individuell auf Ihren Wunsch abgestimmt – klassisch, modern, kurz oder lang. Auf Wunsch inkl. Waschen &amp; Föhnen.<br><br>Preise variieren nach Aufwand – gerne bei uns nachfragen: ${link(BIZ.phoneHref, BIZ.phone)}.<br><br>Soll ich eine ${chip('Terminanfrage')} für Sie stellen?`,

    color: () => `Wir bieten folgende <strong>Colorationsleistungen</strong>:<br><br>🎨 Fullcoloration<br>🌊 Balayage &amp; Foliyage<br>💫 Strähnchen &amp; Highlights<br>🌈 Tönung<br><br>Für genaue Preise empfehlen wir ein persönliches Beratungsgespräch. ${chip('Termin anfragen')}?`,

    treatment: () => `Unsere <strong>Haarkosmetik &amp; Regenerationsbehandlungen</strong> sind ideal für strapaziertes Haar – für mehr Glanz, Kraft und Geschmeidigkeit.<br><br>Bei einem Besuch beraten wir Sie gerne zur passenden Behandlung. ${chip('Termin anfragen')}?`,

    price: () => `Unsere Preise sind <strong>abhängig von Haarlänge und Aufwand</strong>. Für eine genaue Auskunft rufen Sie uns gerne an:<br><br>📞 ${link(BIZ.phoneHref, BIZ.phone)}<br><br>Oder ${chip('Termin anfragen')} und wir besprechen alles persönlich!`,

    thanks: () => `Sehr gerne! 😊 Wir freuen uns auf Ihren Besuch.<br><br>Bis bald bei <strong>${BIZ.name}</strong>!`,

    bye: () => `Auf Wiedersehen! Wir freuen uns, Sie bald bei uns begrüßen zu dürfen. ✂️`,

    unknown: () => ({ text: `Entschuldigung, das habe ich nicht ganz verstanden. Ich helfe Ihnen gerne bei:`, chips: ['Öffnungszeiten', 'Leistungen', 'Preise', 'Adresse', 'Termin anfragen'] }),
  };

  /* ── BOOKING STATE MACHINE ── */
  let bState = null; // null | 'name' | 'service' | 'datetime' | 'contact'
  let bData  = {};

  function booking(text) {
    if (bState === 'name') {
      bData.name = text.trim();
      bState = 'service';
      return { text: `Schön, <strong>${bData.name}</strong>! 😊<br><br>Welchen Service wünschen Sie?`, chips: BIZ.services };
    }
    if (bState === 'service') {
      bData.service = text.trim();
      bState = 'datetime';
      return { text: `Super Wahl ✨<br><br>Wann würden Sie gerne kommen? Bitte nennen Sie <strong>Datum und Wunschzeit</strong>.` };
    }
    if (bState === 'datetime') {
      bData.datetime = text.trim();
      bState = 'contact';
      return { text: `Alles klar! Unter welcher <strong>Telefonnummer oder E-Mail</strong> dürfen wir Sie zurückrufen?` };
    }
    if (bState === 'contact') {
      bData.contact = text.trim();
      const d = { ...bData };
      bState = null; bData = {};
      return {
        text: `<div style="background:rgba(200,162,96,0.09);border:1px solid rgba(200,162,96,0.28);border-radius:10px;padding:16px 18px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${G.gold};margin-bottom:12px;">✓ Terminanfrage eingegangen</div>
          <div style="font-size:13px;line-height:1.85;color:${G.text};">
            <strong>Name:</strong> ${d.name}<br>
            <strong>Leistung:</strong> ${d.service}<br>
            <strong>Wunschtermin:</strong> ${d.datetime}<br>
            <strong>Kontakt:</strong> ${d.contact}
          </div>
        </div><br>Vielen Dank, <strong>${d.name}</strong>! 🙏 Wir melden uns baldmöglichst zur Bestätigung.<br><br>Für dringende Anfragen: ${link(BIZ.phoneHref, BIZ.phone)}`
      };
    }
    return null;
  }

  /* ── BUILD DOM ── */
  const root = document.createElement('div');
  root.id = 'fc-cb-root';
  root.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
    font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;`;
  document.body.appendChild(root);

  const css = document.createElement('style');
  css.textContent = `
  #fc-cb-root *{box-sizing:border-box;}

  /* Launcher */
  #fc-btn{
    width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;
    background:${G.gold};
    display:flex;align-items:center;justify-content:center;
    margin-left:auto;
    box-shadow:0 4px 22px ${G.goldGlow},0 2px 8px rgba(0,0,0,0.35);
    transition:transform 220ms ease,box-shadow 220ms ease;
  }
  #fc-btn:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 8px 30px ${G.goldGlow},0 4px 12px rgba(0,0,0,0.3);}
  #fc-btn:active{transform:scale(0.96);}

  /* Panel */
  #fc-panel{
    display:none;flex-direction:column;
    width:360px;height:530px;
    background:${G.dark};border:1px solid ${G.border};
    border-radius:16px;overflow:hidden;
    box-shadow:0 28px 64px rgba(0,0,0,0.55),0 8px 20px rgba(0,0,0,0.4);
    margin-bottom:12px;
  }
  #fc-panel.open{display:flex;animation:fcIn 220ms ease;}
  @keyframes fcIn{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:none;}}

  /* Header */
  #fc-head{
    display:flex;align-items:center;gap:12px;
    padding:15px 17px;
    background:${G.card};border-bottom:1px solid ${G.border};flex-shrink:0;
  }
  .fc-avatar{
    width:38px;height:38px;border-radius:50%;flex-shrink:0;
    background:rgba(200,162,96,0.11);border:1px solid rgba(200,162,96,0.28);
    display:flex;align-items:center;justify-content:center;
  }
  .fc-hname{font-size:13.5px;font-weight:600;color:${G.text};line-height:1.2;}
  .fc-hstatus{
    font-size:11px;color:${G.green};
    display:flex;align-items:center;gap:5px;margin-top:2px;
  }
  .fc-sdot{width:6px;height:6px;border-radius:50%;background:${G.green};}
  #fc-close{
    margin-left:auto;background:none;border:none;cursor:pointer;
    color:${G.muted};padding:4px;border-radius:4px;
    display:flex;align-items:center;justify-content:center;
    transition:color 180ms,background 180ms;
  }
  #fc-close:hover{color:${G.text};background:rgba(255,255,255,0.07);}

  /* Messages */
  #fc-msgs{
    flex:1;overflow-y:auto;padding:16px;
    display:flex;flex-direction:column;gap:10px;
    scrollbar-width:thin;scrollbar-color:${G.border} transparent;
  }
  #fc-msgs::-webkit-scrollbar{width:4px;}
  #fc-msgs::-webkit-scrollbar-thumb{background:${G.border};border-radius:2px;}

  .fc-msg{
    max-width:90%;font-size:13.5px;line-height:1.65;
    padding:10px 14px;border-radius:12px;word-break:break-word;
    animation:fcMsgIn 180ms ease;
  }
  @keyframes fcMsgIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:none;}}
  .fc-msg.bot{
    background:${G.elev};color:${G.text};
    border:1px solid ${G.border};
    align-self:flex-start;border-bottom-left-radius:4px;
  }
  .fc-msg.bot a{color:${G.gold};}
  .fc-msg.user{
    background:${G.gold};color:#0E0D0B;font-weight:500;
    align-self:flex-end;border-bottom-right-radius:4px;
  }
  .fc-inline-chip{
    display:inline-block;padding:2px 9px;border-radius:12px;
    background:rgba(200,162,96,0.12);border:1px solid rgba(200,162,96,0.3);
    color:${G.gold};font-size:12px;font-weight:500;
    cursor:pointer;white-space:nowrap;
    transition:background 150ms;
  }
  .fc-inline-chip:hover{background:rgba(200,162,96,0.22);}

  /* Chips row */
  #fc-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 10px;}
  .fc-chip{
    padding:7px 14px;border-radius:20px;cursor:pointer;
    background:rgba(200,162,96,0.09);border:1px solid rgba(200,162,96,0.28);
    color:${G.gold};font-size:12px;font-weight:500;font-family:inherit;
    transition:background 160ms,border-color 160ms;
  }
  .fc-chip:hover{background:rgba(200,162,96,0.2);border-color:rgba(200,162,96,0.5);}

  /* Footer */
  #fc-foot{padding:10px;border-top:1px solid ${G.border};background:${G.card};flex-shrink:0;}
  .fc-quick-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;}
  .fc-quick{
    padding:5px 10px;border-radius:16px;cursor:pointer;font-family:inherit;
    background:transparent;border:1px solid ${G.border};
    color:${G.muted};font-size:11px;font-weight:500;letter-spacing:0.02em;
    transition:border-color 180ms,color 180ms;
  }
  .fc-quick:hover{border-color:rgba(200,162,96,0.4);color:${G.gold};}
  #fc-form{display:flex;gap:8px;align-items:center;}
  #fc-input{
    flex:1;background:${G.elev};border:1px solid ${G.border};border-radius:8px;
    padding:10px 14px;font-size:13px;color:${G.text};font-family:inherit;outline:none;
    transition:border-color 180ms;
  }
  #fc-input::placeholder{color:${G.muted};}
  #fc-input:focus{border-color:rgba(200,162,96,0.45);}
  #fc-send{
    width:38px;height:38px;border-radius:8px;border:none;cursor:pointer;
    background:${G.gold};flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    transition:background 180ms,transform 160ms;
  }
  #fc-send:hover{background:${G.goldLight};transform:scale(1.07);}
  #fc-send:active{transform:scale(0.94);}
  `;
  document.head.appendChild(css);

  /* Launcher button */
  const btn = document.createElement('button');
  btn.id = 'fc-btn';
  btn.setAttribute('aria-label', 'Chat öffnen');
  btn.innerHTML = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#0E0D0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  /* Panel */
  const panel = document.createElement('div');
  panel.id = 'fc-panel';
  panel.innerHTML = `
    <div id="fc-head">
      <div class="fc-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${G.gold}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      </div>
      <div style="flex:1">
        <div class="fc-hname">Foruzan's Cuts &amp; Kosmetik</div>
        <div class="fc-hstatus"><div class="fc-sdot"></div>Online · Wir helfen gerne!</div>
      </div>
      <button id="fc-close" aria-label="Schließen">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="fc-msgs"></div>
    <div id="fc-chips"></div>
    <div id="fc-foot">
      <div class="fc-quick-row">
        <button class="fc-quick" data-q="Öffnungszeiten">Öffnungszeiten</button>
        <button class="fc-quick" data-q="Leistungen">Leistungen</button>
        <button class="fc-quick" data-q="Termin anfragen">Termin anfragen</button>
        <button class="fc-quick" data-q="Preise">Preise</button>
      </div>
      <div id="fc-form">
        <input id="fc-input" type="text" placeholder="Nachricht eingeben…" autocomplete="off"/>
        <button id="fc-send" aria-label="Senden">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E0D0B" stroke-width="2.5" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  root.appendChild(panel);
  root.appendChild(btn);

  const msgs     = document.getElementById('fc-msgs');
  const chipsEl  = document.getElementById('fc-chips');
  const inputEl  = document.getElementById('fc-input');

  function addMsg(html, role) {
    const d = document.createElement('div');
    d.className = `fc-msg ${role}`;
    d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setChips(arr) {
    chipsEl.innerHTML = '';
    if (!arr?.length) return;
    arr.forEach(label => {
      const b = document.createElement('button');
      b.className = 'fc-chip';
      b.textContent = label;
      b.onclick = () => { chipsEl.innerHTML = ''; fcSend(label); };
      chipsEl.appendChild(b);
    });
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* Global so inline chips can call it */
  window.fcSend = function(text) {
    const t = (text || inputEl.value).trim();
    if (!t) return;
    inputEl.value = '';
    addMsg(t, 'user');
    chipsEl.innerHTML = '';

    /* Booking flow takes priority */
    if (bState) {
      const res = booking(t);
      if (res) { setTimeout(() => { addMsg(res.text, 'bot'); setChips(res.chips); }, 320); return; }
    }

    const i = intent(t);

    if (i === 'book' && !bState) {
      bState = 'name';
      setTimeout(() => addMsg(`Gerne helfe ich bei der <strong>Terminanfrage</strong>! ✂️<br><br>Wie lautet Ihr <strong>Name</strong>?`, 'bot'), 320);
      return;
    }

    const fn = R[i] || R.unknown;
    const result = fn();
    setTimeout(() => {
      if (typeof result === 'string') {
        addMsg(result, 'bot');
        if (['haircut','color','treatment','hours','phone','services','price'].includes(i))
          setChips(['Termin anfragen']);
      } else {
        addMsg(result.text, 'bot');
        setChips(result.chips);
      }
    }, 320);
  };

  document.getElementById('fc-send').addEventListener('click', () => window.fcSend());
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.fcSend(); } });
  document.getElementById('fc-close').addEventListener('click', () => panel.classList.remove('open'));
  document.querySelectorAll('.fc-quick').forEach(b =>
    b.addEventListener('click', () => { chipsEl.innerHTML = ''; window.fcSend(b.dataset.q); })
  );

  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    if (open && !msgs.children.length) {
      setTimeout(() => addMsg(
        `Guten Tag! Herzlich willkommen bei <strong>${BIZ.name}</strong> 💇‍♀️<br><br>` +
        `Ich helfe Ihnen gerne weiter – ob Fragen zu Leistungen, Öffnungszeiten oder einer ${window.fcSend ? `<span class="fc-inline-chip" onclick="fcSend('Termin anfragen')">Terminanfrage</span>` : 'Terminanfrage'}.<br><br>` +
        `Wie kann ich Ihnen helfen?`,
        'bot'
      ), 180);
    }
  });

  /* Wire quick buttons (panel is in DOM now) */
  panel.querySelectorAll('.fc-quick').forEach(b =>
    b.addEventListener('click', () => { chipsEl.innerHTML = ''; window.fcSend(b.dataset.q); })
  );
})();
