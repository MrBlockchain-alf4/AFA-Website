(function(){
  'use strict';

  /* ── KNOWLEDGE BASE ─────────────────────────────────────────────── */
  var KB = [
    {
      keys: ['brautkleid','braut','hochzeit','wedding','brautkleidänderung','brautkleider','hochzeitskleid','brautkleid ändern'],
      text: 'Wir sind spezialisiert auf Brautkleid-Änderungen 👗 – vom einfachen Kürzen bis zur komplexen Figuranpassung. Vereinbaren Sie gerne einen Termin: <strong>0176 42761399</strong>'
    },
    {
      keys: ['änderung','ändern','anpassen','kürzen','weiten','enger','anpassung','schneiderei','kleider','kleid'],
      text: 'Schneiderei Farah übernimmt alle Arten von Kleideränderungen – Kleider, Hosen, Röcke, Abendmode und vieles mehr. Rufen Sie uns an: <strong>0176 42761399</strong>'
    },
    {
      keys: ['abendkleid','abendkleider','abend','festkleid','festmode','cocktailkleid'],
      text: 'Ja, wir ändern natürlich auch Abendkleider und festliche Mode. Melden Sie sich gerne telefonisch unter <strong>0176 42761399</strong> für einen Termin.'
    },
    {
      keys: ['hose','hosen','rock','röcke','jeans','anzug','anzughose'],
      text: 'Auch Hosen, Röcke und Alltagskleidung passen wir gerne an. Für einen persönlichen Termin erreichen Sie uns unter <strong>0176 42761399</strong>.'
    },
    {
      keys: ['reparatur','reparieren','reißverschluss','zipper','naht','knopf'],
      text: 'Ja, wir führen auch Reparaturen durch – Nähte, Reißverschlüsse, Knöpfe und mehr. Rufen Sie uns an: <strong>0176 42761399</strong>'
    },
    {
      keys: ['preis','preise','kosten','kosten','was kostet','wie viel','wieviel','euro'],
      text: 'Die Kosten richten sich nach dem Aufwand der Änderung. Bitte melden Sie sich direkt bei uns für ein individuelles Angebot: <strong>0176 42761399</strong>'
    },
    {
      keys: ['termin','appointment','beratung','wann','probe','anprobe'],
      text: 'Einen Termin vereinbaren Sie am besten telefonisch: <strong>0176 42761399</strong>. Wir freuen uns auf Ihre Anfrage!'
    },
    {
      keys: ['adresse','adress','wo','standort','ort','straße','hagen','elberfelder','lage','finden','hinfahren'],
      text: 'Sie finden uns in Hagen: <strong>Elberfelder Str. 80, 58095 Hagen</strong> 📍'
    },
    {
      keys: ['telefon','tel','anruf','nummer','kontakt','phone','reach','erreichen','rufen'],
      text: 'Unsere Telefonnummer: <strong>0176 42761399</strong> – wir freuen uns auf Ihren Anruf!'
    },
    {
      keys: ['bewertung','bewertungen','google','rezension','meinung','empfehlung'],
      text: 'Wir haben 4,9 von 5 Sternen auf Google mit 64 Bewertungen ⭐ – wir freuen uns sehr über das Vertrauen unserer Kundinnen!'
    },
    {
      keys: ['öffnungszeiten','öffnung','geöffnet','uhr','wann offen','stunden','zeiten'],
      text: 'Für aktuelle Informationen zu Terminen und Verfügbarkeit erreichen Sie uns direkt unter <strong>0176 42761399</strong>.'
    },
    {
      keys: ['hallo','hi','hey','guten morgen','guten tag','guten abend','servus','moin'],
      text: 'Hallo! Wie kann ich Ihnen helfen? Ich beantworte gerne Fragen zu unseren Schneiderei-Leistungen, Preisen oder wie Sie uns erreichen können. 😊'
    },
    {
      keys: ['danke','vielen dank','dankeschön','thx','thanks'],
      text: 'Gerne! Wenn Sie noch Fragen haben, stehe ich Ihnen jederzeit zur Verfügung. Wir freuen uns auf Ihren Besuch! ✂️'
    }
  ];

  var GREET = 'Willkommen bei <strong>Schneiderei Farah</strong> in Hagen! 👗<br/>Wie kann ich Ihnen helfen?';

  var FALLBACK = 'Für diese Frage empfehle ich Ihnen, uns direkt zu kontaktieren:<br/><br/>📍 <strong>Elberfelder Str. 80, 58095 Hagen</strong><br/>📞 <strong>0176 42761399</strong>';

  var CHIPS_DEFAULT = ['Brautkleid ändern','Preise anfragen','Anfahrt','Termin'];

  /* ── RESPOND ────────────────────────────────────────────────────── */
  function respond(input){
    var q = input.toLowerCase().trim();
    for(var i=0; i<KB.length; i++){
      var entry = KB[i];
      for(var j=0; j<entry.keys.length; j++){
        if(q.indexOf(entry.keys[j]) !== -1) return entry.text;
      }
    }
    return FALLBACK;
  }

  /* ── BUILD UI ───────────────────────────────────────────────────── */
  var GOLD = '#C9A34E';

  var style = document.createElement('style');
  style.textContent = [
    '#sf-fab{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:'+GOLD+';border:none;cursor:pointer;box-shadow:0 4px 20px rgba(201,163,78,.4);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}',
    '#sf-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(201,163,78,.5)}',
    '#sf-fab svg{width:26px;height:26px;stroke:#fff;stroke-width:1.8;fill:none}',
    '#sf-notif{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#e74c3c;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700}',
    '#sf-panel{position:fixed;bottom:92px;right:24px;z-index:9998;width:340px;max-width:calc(100vw - 48px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.14);display:none;flex-direction:column;overflow:hidden;transition:opacity .25s,transform .25s;opacity:0;transform:translateY(12px) scale(.97)}',
    '#sf-panel.open{display:flex;opacity:1;transform:none}',
    '#sf-head{background:'+GOLD+';padding:16px 18px;display:flex;align-items:center;gap:12px}',
    '#sf-head-icon{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:18px}',
    '#sf-head-name{font-weight:700;color:#fff;font-size:.9rem;font-family:system-ui}',
    '#sf-head-sub{font-size:.72rem;color:rgba(255,255,255,.75);margin-top:1px}',
    '#sf-close{margin-left:auto;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.8);font-size:1.4rem;line-height:1;padding:2px}',
    '#sf-close:hover{color:#fff}',
    '#sf-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:180px;max-height:320px}',
    '.sf-msg{max-width:82%;padding:9px 13px;border-radius:12px;font-size:.83rem;line-height:1.55;font-family:system-ui}',
    '.sf-msg.bot{background:#f3f4f6;color:#111;border-bottom-left-radius:4px;align-self:flex-start}',
    '.sf-msg.user{background:'+GOLD+';color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '#sf-chips{padding:0 14px 12px;display:flex;flex-wrap:wrap;gap:6px}',
    '.sf-chip{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:5px 13px;font-size:.76rem;font-weight:500;cursor:pointer;color:#333;font-family:system-ui;transition:background .15s,border-color .15s}',
    '.sf-chip:hover{background:#fdf4e3;border-color:'+GOLD+';color:'+GOLD+'}',
    '#sf-input-row{padding:12px 14px;border-top:1px solid #f0f0f0;display:flex;gap:8px}',
    '#sf-input{flex:1;border:1.5px solid #e5e7eb;border-radius:8px;padding:8px 12px;font-size:.83rem;font-family:system-ui;outline:none;transition:border-color .2s}',
    '#sf-input:focus{border-color:'+GOLD+'}',
    '#sf-send{background:'+GOLD+';border:none;border-radius:8px;padding:8px 14px;cursor:pointer;color:#fff;font-size:.83rem;font-weight:600;font-family:system-ui;transition:background .2s}',
    '#sf-send:hover{background:#a8872a}'
  ].join('');
  document.head.appendChild(style);

  /* FAB */
  var fab = document.createElement('button');
  fab.id = 'sf-fab';
  fab.setAttribute('aria-label','Chat öffnen');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    + '<div id="sf-notif">1</div>';
  document.body.appendChild(fab);

  /* Panel */
  var panel = document.createElement('div');
  panel.id = 'sf-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Schneiderei Farah Chat');
  panel.innerHTML = [
    '<div id="sf-head">',
      '<div id="sf-head-icon">✂️</div>',
      '<div><div id="sf-head-name">Schneiderei Farah</div><div id="sf-head-sub">Schreiben Sie uns!</div></div>',
      '<button id="sf-close" aria-label="Chat schließen">&times;</button>',
    '</div>',
    '<div id="sf-msgs"></div>',
    '<div id="sf-chips"></div>',
    '<div id="sf-input-row">',
      '<input id="sf-input" type="text" placeholder="Ihre Frage …" autocomplete="off" maxlength="200"/>',
      '<button id="sf-send">→</button>',
    '</div>'
  ].join('');
  document.body.appendChild(panel);

  var msgs   = panel.querySelector('#sf-msgs');
  var chips  = panel.querySelector('#sf-chips');
  var input  = panel.querySelector('#sf-input');
  var sendBtn= panel.querySelector('#sf-send');
  var closeBtn = panel.querySelector('#sf-close');
  var notif  = fab.querySelector('#sf-notif');

  function addMsg(text, who){
    var m = document.createElement('div');
    m.className = 'sf-msg ' + who;
    m.innerHTML = text;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setChips(list){
    chips.innerHTML = '';
    list.forEach(function(label){
      var c = document.createElement('button');
      c.className = 'sf-chip';
      c.textContent = label;
      c.addEventListener('click', function(){
        sendMsg(label);
      });
      chips.appendChild(c);
    });
  }

  function sendMsg(text){
    var q = text.trim();
    if(!q) return;
    addMsg(q, 'user');
    input.value = '';
    setChips([]);
    setTimeout(function(){
      var ans = respond(q);
      addMsg(ans, 'bot');
      setChips(CHIPS_DEFAULT);
    }, 420);
  }

  /* Init */
  addMsg(GREET, 'bot');
  setChips(CHIPS_DEFAULT);

  /* Toggle */
  var isOpen = false;
  function openPanel(){
    isOpen = true;
    panel.classList.add('open');
    notif.style.display = 'none';
    fab.setAttribute('aria-expanded','true');
    setTimeout(function(){ input.focus(); }, 50);
  }
  function closePanel(){
    isOpen = false;
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded','false');
  }

  fab.addEventListener('click', function(){ isOpen ? closePanel() : openPanel(); });
  closeBtn.addEventListener('click', closePanel);

  sendBtn.addEventListener('click', function(){ sendMsg(input.value); });
  input.addEventListener('keydown', function(e){ if(e.key === 'Enter') sendMsg(input.value); });

  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && isOpen) closePanel(); });

  /* Notification bubble auto-show after 3s if not opened */
  setTimeout(function(){
    if(!isOpen) notif.style.display = 'flex';
  }, 3000);

})();
