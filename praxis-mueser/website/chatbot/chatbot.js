/**
 * Praxis Müser – Chatbot Widget
 * German language, appointment booking flow
 * Embed: <script src="/chatbot/chatbot.js" defer></script>
 */
(function () {
  'use strict';
  if (document.getElementById('pm-cb-root')) return;

  /* ── PALETTE ── */
  const G = {
    mint:      '#a8d5c8',
    mintDark:  '#7dbcad',
    mintDeep:  '#5a9e8e',
    mintDim:   'rgba(168,213,200,0.18)',
    navy:      '#0d1b2e',
    navyMid:   '#1e3a5f',
    border:    '#c8e5de',
    text:      '#1a2a3a',
    muted:     '#5a7080',
    white:     '#ffffff',
    green:     '#4a9e6f',
    bg:        '#ffffff',
    bgOff:     '#f2faf8',
  };

  /* ── BUSINESS DATA ── */
  const BIZ = {
    name:      'Praxis Müser',
    fullName:  'Praxis Müser – Zahnärzte im Volksparkbogen',
    dentist:   'Dirk Müser',
    address:   'Karl-Marx-Straße 10, 58095 Hagen',
    phone:     '+49 2331 / 270 46',
    phoneHref: 'tel:+4923312704 6',
    fax:       '+49 2331 / 144 06',
    website:   'https://praxis-mueser.de',
    insurance: ['Kasse (gesetzlich versichert)', 'Privat', 'Selbstzahler'],
    /* PLACEHOLDER — CONFIRM WITH CLIENT: actual opening hours */
    hours:     'Bitte telefonisch erfragen: +49 2331 / 270 46',
    services:  [
      'Kariesbehandlung',
      'Professionelle Zahnreinigung',
      'Zahnfleischbehandlung (Parodontitis)',
      'Implantate',
      'Amalgam-Sanierung',
      'Bleaching (BriteSmile)',
      'Zahnschmuck (BrilliAnce)',
      'Zahntechnisches Labor',
      'Sonstiges / Allgemeine Frage',
    ],
  };

  /* ── STATE ── */
  let open = false;
  let bState = null; // null | 'name' | 'service' | 'datetime' | 'contact' | 'done'
  let bData  = {};

  /* ── INTENT ── */
  function intent(raw) {
    const m = raw.toLowerCase();
    const has = (...w) => w.some(x => m.includes(x));

    if (has('termin', 'buchen', 'buchung', 'reserv', 'anmeld', 'terminanfrage', 'termin anf'))
      return 'book';
    if (has('öffnungszeit', 'öffnet', 'wann', 'schließt', 'bis wann', 'ab wann', 'uhrzeit', 'zeiten', 'geöffnet'))
      return 'hours';
    if (has('adresse', 'wo ', 'standort', 'anfahrt', 'karl-marx', 'weg zu', 'wo ist', 'hagen'))
      return 'location';
    if (has('telefon', 'nummer', 'anruf', 'tel', 'rufnummer', 'anrufen', 'erreichbar'))
      return 'phone';
    if (has('kasse', 'privat', 'selbstzahler', 'versicherung', 'gesetzlich', 'krankenkasse', 'beihilfe'))
      return 'insurance';
    if (has('implantat', 'implant'))
      return 'implants';
    if (has('bleaching', 'aufhell', 'whitening', 'britesmile'))
      return 'bleaching';
    if (has('zahnschmuck', 'brilliance', 'brillianz', 'schmuck'))
      return 'jewelry';
    if (has('amalgam'))
      return 'amalgam';
    if (has('zahnreinigung', 'reinigung', 'pzr', 'professionell'))
      return 'cleaning';
    if (has('parodont', 'zahnfleisch', 'paro'))
      return 'gum';
    if (has('labor', 'zahntechnik'))
      return 'lab';
    if (has('karies', 'füllung', 'loch', 'bohren'))
      return 'caries';
    if (has('preis', 'kosten', 'was kostet', 'wie viel', 'gebühr'))
      return 'price';
    if (has('danke', 'dankeschön', 'tschüss', 'auf wiedersehen', 'bye'))
      return 'bye';
    return 'unknown';
  }

  /* ── RESPONSE BUILDER ── */
  function respond(raw) {
    /* booking flow */
    if (bState === 'name') {
      if (raw.trim().length < 2) return addBot('Bitte geben Sie Ihren vollständigen Namen ein.');
      bData.name = raw.trim();
      bState = 'service';
      return addBot(
        `Schön, ${bData.name}! Für welche Leistung möchten Sie einen Termin?`,
        BIZ.services.map(s => ({ label: s }))
      );
    }
    if (bState === 'service') {
      bData.service = raw.trim();
      bState = 'datetime';
      return addBot('Haben Sie einen Wunschtermin? Bitte nennen Sie uns Datum und Uhrzeit (oder schreiben Sie "flexibel").');
    }
    if (bState === 'datetime') {
      bData.datetime = raw.trim();
      bState = 'contact';
      return addBot('Fast geschafft! Wie können wir Sie erreichen? Bitte geben Sie Ihre Telefonnummer oder E-Mail-Adresse an.');
    }
    if (bState === 'contact') {
      bData.contact = raw.trim();
      bState = 'done';
      addBot(
        `✅ Vielen Dank, ${bData.name}!\n\nIhre Terminanfrage wurde übermittelt:\n• Leistung: ${bData.service}\n• Wunschtermin: ${bData.datetime}\n• Kontakt: ${bData.contact}\n\nWir melden uns schnellstmöglich bei Ihnen. Bei dringenden Anliegen erreichen Sie uns unter <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;">${BIZ.phone}</a>.`
      );
      return;
    }

    const i = intent(raw);
    switch (i) {
      case 'book':
        bState = 'name';
        bData = {};
        return addBot('Gerne helfe ich Ihnen bei der Terminanfrage! Wie lautet Ihr vollständiger Name?');
      case 'hours':
        return addBot(`Unsere Öffnungszeiten erfragen Sie bitte direkt telefonisch unter <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;">${BIZ.phone}</a> oder besuchen Sie <a href="${BIZ.website}" target="_blank" style="color:${G.mintDeep};">praxis-mueser.de</a>.`);
      case 'location':
        return addBot(`Wir befinden uns in der <strong>${BIZ.address}</strong>.<br>Einfach anrufen unter <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;">${BIZ.phone}</a> – wir helfen Ihnen gerne weiter.`);
      case 'phone':
        return addBot(`Unsere Telefonnummer lautet: <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;font-size:16px;">${BIZ.phone}</a><br>Fax: ${BIZ.fax}`);
      case 'insurance':
        return addBot(`Wir behandeln Patienten aller Kassen: <strong>gesetzlich Versicherte (Kasse)</strong>, <strong>Privatpatienten</strong> und <strong>Selbstzahler</strong> – alle mit dem gleichen hohen Standard.`);
      case 'implants':
        return addBot('Wir bieten hochwertige <strong>Zahnimplantate</strong> als dauerhafte, natürlich aussehende Lösung für fehlende Zähne. Sprechen Sie uns gerne für eine individuelle Beratung an.');
      case 'bleaching':
        return addBot('Wir bieten professionelles <strong>Bleaching mit BriteSmile</strong> für ein strahlendes, weißes Lächeln. Fragen Sie uns nach einem Beratungsgespräch!');
      case 'jewelry':
        return addBot('Mit <strong>Zahnschmuck von BrilliAnce</strong> verleihen wir Ihrem Lächeln ein besonderes Highlight. Wir beraten Sie gerne zu Möglichkeiten und Kosten.');
      case 'amalgam':
        return addBot('Unsere <strong>Amalgam-Sanierung</strong> erfolgt sicher und professionell nach modernen Schutzprotokollen. Sprechen Sie uns für weitere Informationen an.');
      case 'cleaning':
        return addBot('Die <strong>professionelle Zahnreinigung (PZR)</strong> gehört zur wichtigsten Vorsorge für gesunde Zähne und Zahnfleisch. Wir empfehlen eine PZR mindestens zweimal jährlich.');
      case 'gum':
        return addBot('Wir behandeln <strong>Zahnfleischerkrankungen (Parodontitis)</strong> und bieten Prophylaxemaßnahmen für langfristig gesundes Zahnfleisch.');
      case 'lab':
        return addBot('Wir verfügen über ein eigenes <strong>zahntechnisches Labor</strong> direkt in der Praxis – das garantiert höchste Qualität, perfekte Passgenauigkeit und kürzere Wartezeiten für Zahnersatz.');
      case 'caries':
        return addBot('Unsere <strong>Kariesbehandlung</strong> ist schonend und präzise. Wir erkennen Karies früh und behandeln sie schnell – für langfristig gesunde Zähne.');
      case 'price':
        return addBot(`Für genaue Kosteninformationen zu unseren Leistungen wenden Sie sich bitte direkt an uns: <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;">${BIZ.phone}</a>. Wir erstellen gerne einen transparenten Behandlungsplan.`);
      case 'bye':
        return addBot('Auf Wiedersehen! Bei weiteren Fragen stehen wir Ihnen jederzeit zur Verfügung. Bleiben Sie gesund! 😊');
      default:
        return addBot(`Das kann ich leider nicht direkt beantworten. Für persönliche Auskunft erreichen Sie uns unter <a href="${BIZ.phoneHref}" style="color:${G.mintDeep};font-weight:600;">${BIZ.phone}</a>.`, [
          { label: 'Termin anfragen' },
          { label: 'Öffnungszeiten' },
          { label: 'Leistungen' },
          { label: 'Versicherung' },
        ]);
    }
  }

  /* ── DOM HELPERS ── */
  function el(tag, css, html) {
    const e = document.createElement(tag);
    if (css) e.setAttribute('style', css);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  let msgs;

  function mkAvatar() {
    return el('div',
      `width:30px;height:30px;border-radius:50%;background:${G.mint};flex-shrink:0;` +
      `display:flex;align-items:center;justify-content:center;margin-top:2px;`,
      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${G.navy}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
    );
  }

  function addBot(text, chips) {
    /* inject dot-animation keyframes once */
    if (!document.getElementById('pm-cb-anim')) {
      const s = document.createElement('style');
      s.id = 'pm-cb-anim';
      s.textContent = '@keyframes pmDot{0%,60%,100%{opacity:0.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}';
      document.head.appendChild(s);
    }

    /* typing indicator */
    const typingWrap = el('div', `display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;`);
    const dotStyle = `width:7px;height:7px;border-radius:50%;background:${G.muted};display:inline-block;`;
    const tBubble = el('div',
      `background:${G.bgOff};border:1px solid ${G.border};border-radius:4px 14px 14px 14px;` +
      `padding:13px 16px;display:flex;gap:5px;align-items:center;`,
      `<span style="${dotStyle}animation:pmDot 1.2s infinite"></span>` +
      `<span style="${dotStyle}animation:pmDot 1.2s 0.2s infinite"></span>` +
      `<span style="${dotStyle}animation:pmDot 1.2s 0.4s infinite"></span>`
    );
    typingWrap.appendChild(mkAvatar());
    typingWrap.appendChild(tBubble);
    msgs.appendChild(typingWrap);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
      if (typingWrap.parentNode) typingWrap.parentNode.removeChild(typingWrap);

      const wrap = el('div', `display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;opacity:0;transition:opacity 0.4s ease;`);
      const bubble = el('div',
        `background:${G.bgOff};border:1px solid ${G.border};border-radius:4px 14px 14px 14px;` +
        `padding:12px 14px;font-size:14px;line-height:1.65;color:${G.text};max-width:80%;`,
        text.replace(/\n/g, '<br>')
      );
      wrap.appendChild(mkAvatar());
      wrap.appendChild(bubble);
      msgs.appendChild(wrap);
      requestAnimationFrame(() => requestAnimationFrame(() => { wrap.style.opacity = '1'; }));

      if (chips && chips.length) {
        const row = el('div', `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;padding-left:40px;opacity:0;transition:opacity 0.4s ease 0.15s;`);
        chips.forEach(c => {
          const btn = el('button',
            `padding:7px 14px;border-radius:20px;border:1px solid ${G.border};` +
            `background:${G.white};font-size:12px;font-weight:500;color:${G.navyMid};` +
            `cursor:pointer;transition:background 180ms,border-color 180ms,color 180ms;font-family:inherit;`,
            c.label
          );
          btn.onmouseenter = () => { btn.style.background = G.mint; btn.style.borderColor = G.mintDark; btn.style.color = G.navy; };
          btn.onmouseleave = () => { btn.style.background = G.white; btn.style.borderColor = G.border; btn.style.color = G.navyMid; };
          btn.onclick = () => { addUser(c.label); respond(c.label); };
          row.appendChild(btn);
        });
        msgs.appendChild(row);
        requestAnimationFrame(() => requestAnimationFrame(() => { row.style.opacity = '1'; }));
      }

      msgs.scrollTop = msgs.scrollHeight;
    }, 1400);
  }

  function addUser(text) {
    const wrap = el('div', `display:flex;justify-content:flex-end;margin-bottom:14px;`);
    const bubble = el('div',
      `background:${G.navy};color:#fff;border-radius:14px 4px 14px 14px;` +
      `padding:11px 14px;font-size:14px;line-height:1.55;max-width:78%;`,
      text
    );
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── BUILD UI ── */
  const root = el('div', `position:fixed;bottom:24px;right:24px;z-index:9000;font-family:'DM Sans',system-ui,sans-serif;`);
  root.id = 'pm-cb-root';

  /* panel — absolutely positioned above the launcher so the button never shifts */
  const panel = el('div',
    `width:440px;height:600px;background:${G.white};border-radius:18px;` +
    `box-shadow:0 20px 60px rgba(13,27,46,0.18),0 4px 16px rgba(13,27,46,0.08);` +
    `display:none;flex-direction:column;overflow:hidden;` +
    `border:1px solid ${G.border};` +
    `position:absolute;bottom:72px;right:0;`
  );

  /* header */
  const header = el('div',
    `background:${G.navy};padding:18px 18px 16px;display:flex;align-items:center;gap:12px;`
  );
  const hAvatar = el('div',
    `width:40px;height:40px;border-radius:50%;background:${G.mint};` +
    `display:flex;align-items:center;justify-content:center;flex-shrink:0;`,
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${G.navy}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
  );
  const hInfo = el('div', `flex:1;`);
  const hName = el('div', `font-size:15px;font-weight:600;color:#fff;line-height:1.2;`, 'Praxis Müser');
  const hSub  = el('div', `font-size:11px;color:${G.mint};opacity:0.8;margin-top:2px;`, 'Wir antworten sofort');
  const hClose = el('button',
    `background:none;border:none;color:rgba(255,255,255,0.6);font-size:20px;cursor:pointer;` +
    `padding:4px;line-height:1;transition:color 160ms;`,
    '×'
  );
  hClose.onmouseenter = () => { hClose.style.color = '#fff'; };
  hClose.onmouseleave = () => { hClose.style.color = 'rgba(255,255,255,0.6)'; };
  hClose.onclick = () => toggle();
  hInfo.appendChild(hName); hInfo.appendChild(hSub);
  header.appendChild(hAvatar); header.appendChild(hInfo); header.appendChild(hClose);

  /* messages */
  msgs = el('div',
    `flex:1;overflow-y:auto;padding:18px 16px 8px;scroll-behavior:smooth;` +
    `scrollbar-width:thin;scrollbar-color:${G.border} transparent;`
  );

  /* input row */
  const inputRow = el('div',
    `display:flex;gap:8px;padding:12px 14px;border-top:1px solid ${G.border};background:${G.bgOff};`
  );
  const inp = el('input', null);
  inp.type = 'text';
  inp.placeholder = 'Ihre Nachricht ...';
  inp.setAttribute('style',
    `flex:1;border:1px solid ${G.border};border-radius:20px;padding:10px 16px;` +
    `font-size:13px;font-family:inherit;color:${G.text};background:${G.white};outline:none;` +
    `transition:border-color 180ms;`
  );
  inp.onfocus = () => { inp.style.borderColor = G.mintDeep; };
  inp.onblur  = () => { inp.style.borderColor = G.border; };

  const sendBtn = el('button',
    `width:38px;height:38px;border-radius:50%;background:${G.navy};border:none;cursor:pointer;` +
    `display:flex;align-items:center;justify-content:center;flex-shrink:0;` +
    `transition:background 160ms,transform 150ms;`,
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
  );
  sendBtn.onmouseenter = () => { sendBtn.style.background = G.navyMid; sendBtn.style.transform = 'scale(1.08)'; };
  sendBtn.onmouseleave = () => { sendBtn.style.background = G.navy; sendBtn.style.transform = 'scale(1)'; };

  function send() {
    const v = inp.value.trim();
    if (!v) return;
    inp.value = '';
    addUser(v);
    respond(v);
  }
  sendBtn.onclick = send;
  inp.onkeydown = e => { if (e.key === 'Enter') send(); };

  inputRow.appendChild(inp); inputRow.appendChild(sendBtn);
  panel.appendChild(header); panel.appendChild(msgs); panel.appendChild(inputRow);

  /* launcher button */
  const btn = el('div',
    `width:58px;height:58px;border-radius:50%;background:${G.navy};cursor:pointer;` +
    `display:flex;align-items:center;justify-content:center;` +
    `box-shadow:0 6px 24px rgba(13,27,46,0.30),0 2px 8px rgba(13,27,46,0.15);` +
    `transition:transform 200ms,box-shadow 200ms;position:relative;`,
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  );
  btn.id = 'pm-btn';
  btn.onmouseenter = () => { btn.style.transform = 'scale(1.08)'; btn.style.boxShadow = `0 10px 30px rgba(13,27,46,0.35),0 2px 8px rgba(13,27,46,0.15)`; };
  btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = `0 6px 24px rgba(13,27,46,0.30),0 2px 8px rgba(13,27,46,0.15)`; };

  /* notification dot */
  const dot = el('div',
    `position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;` +
    `background:#e85c5c;border:2px solid #fff;`
  );
  btn.appendChild(dot);

  function toggle() {
    open = !open;
    panel.style.display = open ? 'flex' : 'none';
    dot.style.display = open ? 'none' : 'block';
    if (open && msgs.children.length === 0) {
      /* greeting */
      addBot(
        `Herzlich willkommen bei der <strong>Praxis Müser</strong>! 😊<br><br>` +
        `Ich helfe Ihnen gerne bei Terminanfragen, Fragen zu unseren Leistungen, Versicherung oder dem Weg zu uns.`,
        [
          { label: 'Termin anfragen' },
          { label: 'Öffnungszeiten' },
          { label: 'Leistungen' },
          { label: 'Versicherung' },
        ]
      );
    }
    if (open) setTimeout(() => inp.focus(), 120);
  }

  btn.onclick = toggle;

  root.appendChild(panel);
  root.appendChild(btn);
  document.body.appendChild(root);
})();
