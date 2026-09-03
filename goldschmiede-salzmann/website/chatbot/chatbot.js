(function(){
  'use strict';

  var INK='#0A0A0A',INK2='#262626',PAPER='#F4F4F2',MUTED='#6E6E6C',WHITE='#FFFFFF';

  // ── Knowledge Base — grounded only in real info about Goldschmiede Salzmann ──
  var KB=[
    {keys:['maßanfertigung','massanfertigung','individuell','entwerfen','entwurf','neu anfertigen','neuanfertigung'],
     text:'Wir fertigen Schmuck ganz nach Ihren Wünschen!\n\n• Individuelles Design, gemeinsam mit Ihnen entwickelt\n• Von der ersten Idee bis zum fertigen Stück\n• Handwerkliche Fertigung direkt in unserer Werkstatt in Hagen\n\nGerne beraten wir Sie persönlich — kommen Sie vorbei oder rufen Sie uns an!'},
    {keys:['umarbeitung','reparatur','erbstück','erbstuck','memoire','altes schmuckstück','umarbeiten'],
     text:'Gerne arbeiten wir bestehenden Schmuck oder Erbstücke für Sie um — zum Beispiel einen Memoire-Ring oder ein anderes besonderes Stück.\n\nIn einem persönlichen Gespräch besprechen wir gemeinsam, wie Ihr Schmuckstück eine neue Form finden kann.'},
    {keys:['trauring','ehering','hochzeitsring','heiraten','hochzeit','verlobung','verlobungsring'],
     text:'Wir fertigen handgemachte Eheringe, die wir gemeinsam mit Ihnen entwerfen — ganz für den Beginn Ihres gemeinsamen Weges.\n\nPersönliche Beratung in Hagen — vereinbaren Sie gerne einen Termin.'},
    {keys:['öffnungszeit','geöffnet','öffnen','uhrzeit','wann haben','stunden','zeiten','heute offen','offen'],
     text:'Unsere Öffnungszeiten:\n\nDienstag – Freitag: 9:00–13:00 & 15:00–18:00 Uhr\nSamstag: 10:00–14:00 Uhr\nMontag & Sonntag: Geschlossen'},
    {keys:['adresse','standort','wo sind','hagen','konkordia','finden sie','anfahrt','lage','ort'],
     text:'Sie finden uns hier:\n\nKonkordiastraße 14\n58095 Hagen\n\nWir freuen uns auf Ihren Besuch!'},
    {keys:['telefon','anrufen','tel','telefonnummer','telefonisch','rufen','nummer'],
     text:'Rufen Sie uns gerne an:\n\n☎️ 02331 27069\n\nErreichbar zu unseren Öffnungszeiten.'},
    {keys:['email','e-mail','mail','schreiben sie','kontaktformular'],
     text:'Schreiben Sie uns gerne eine E-Mail:\n\n✉️ info@salzmann-goldschmie.de\n\nWir melden uns so schnell wie möglich zurück.'},
    {keys:['bewertung','erfahrung','google','rezension','empfehlung'],
     text:'Wir freuen uns über 5,0 von 5 Sternen bei 13 Google-Bewertungen!\n\nVielen Dank an alle Kundinnen und Kunden für das Vertrauen.'},
    {keys:['schmuck','ring','kette','halskette','armband','ohrring','anhänger','collier'],
     text:'Wir fertigen individuellen Schmuck — Ringe (mit und ohne Stein), Colliers, Armbänder und weitere Einzelstücke, ganz nach Ihren persönlichen Vorstellungen.\n\nSchauen Sie gerne bei uns in der Werkstatt vorbei!'},
    {keys:['beratung','preis','kosten','wieviel','wie viel','termin'],
     text:'Gerne beraten wir Sie persönlich und ehrlich — ob zu einer Maßanfertigung, einer Umarbeitung oder einem anderen Anliegen.\n\nKommen Sie zu unseren Öffnungszeiten vorbei oder rufen Sie uns unter 02331 27069 an.'}
  ];

  var GREET='Herzlich willkommen bei Goldschmiede Salzmann!\n\nIch beantworte gerne Ihre Fragen zu individueller Anfertigung, Umarbeitung sowie unseren Öffnungszeiten. Wie kann ich Ihnen helfen?';
  var FALLBACK='Das beantworte ich Ihnen gerne persönlich!\n\n📍 Konkordiastraße 14, 58095 Hagen\n☎️ 02331 27069\n✉️ info@salzmann-goldschmie.de\n\nÖffnungszeiten:\nDi–Fr 9–13 & 15–18 Uhr\nSa 10–14 Uhr';

  var CHIPS_DEFAULT=[
    {l:'Öffnungszeiten',m:'Wann haben Sie geöffnet?'},
    {l:'Maßanfertigung',m:'Können Sie Schmuck individuell anfertigen?'},
    {l:'Umarbeitung',m:'Können Sie Schmuck umarbeiten?'},
    {l:'Adresse & Lage',m:'Wo finden Sie sich?'},
    {l:'Telefon',m:'Wie kann ich Sie anrufen?'}
  ];

  function respond(msg){
    var lc=msg.toLowerCase();
    for(var i=0;i<KB.length;i++){
      var entry=KB[i];
      for(var j=0;j<entry.keys.length;j++){
        if(lc.indexOf(entry.keys[j])!==-1)return entry.text;
      }
    }
    return FALLBACK;
  }

  function fmt(text){
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  var css=[
    '#gs-fab{position:fixed;bottom:28px;right:28px;z-index:9000;width:60px;height:60px;border-radius:50%;background:'+INK+';border:2px solid '+WHITE+';display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 24px rgba(0,0,0,0.35),0 2px 8px rgba(0,0,0,0.20);transition:transform 0.2s,box-shadow 0.2s;padding:14px;}',
    '#gs-fab:hover{transform:scale(1.08);box-shadow:0 8px 32px rgba(0,0,0,0.45),0 4px 12px rgba(0,0,0,0.22);}',
    '#gs-fab svg{width:100%;height:100%;display:block;}',
    '#gs-panel{position:fixed;bottom:100px;right:28px;z-index:9000;width:360px;display:flex;flex-direction:column;border-radius:8px;box-shadow:0 16px 64px rgba(0,0,0,0.32);overflow:hidden;height:0;opacity:0;pointer-events:none;transition:height 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s;}',
    '#gs-panel.gs-open{height:520px;opacity:1;pointer-events:all;}',
    '#gs-head{background:'+INK+';padding:18px 20px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.14);flex-shrink:0;}',
    '#gs-head-left{display:flex;align-items:center;gap:12px;}',
    '.gs-avatar{width:36px;height:36px;border-radius:50%;background:'+WHITE+';border:1.5px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;flex-shrink:0;padding:7px;overflow:hidden;}',
    '.gs-avatar svg{width:100%;height:100%;display:block;}',
    '.gs-head-name{font-family:"Playfair Display",Georgia,serif;font-size:15px;font-weight:700;color:#fff;line-height:1.2;}',
    '.gs-head-sub{font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px;letter-spacing:0.06em;}',
    '#gs-close{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.50);font-size:18px;line-height:1;padding:4px;transition:color 0.2s;font-family:sans-serif;}',
    '#gs-close:hover{color:#fff;}',
    '#gs-msgs{flex:1;overflow-y:auto;padding:18px 16px;background:'+PAPER+';display:flex;flex-direction:column;gap:12px;}',
    '#gs-msgs::-webkit-scrollbar{width:3px;}',
    '#gs-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.20);border-radius:2px;}',
    '.gs-msg{max-width:84%;line-height:1.58;font-size:13.5px;font-family:"Inter","Helvetica Neue",sans-serif;animation:gs-up 0.22s ease;}',
    '.gs-bot{align-self:flex-start;background:'+WHITE+';border:1px solid rgba(0,0,0,0.10);border-radius:2px 12px 12px 2px;padding:11px 14px;color:'+INK2+';box-shadow:0 2px 8px rgba(0,0,0,0.06);}',
    '.gs-user{align-self:flex-end;background:'+INK+';color:#fff;border-radius:12px 2px 2px 12px;padding:11px 14px;}',
    '#gs-chips{padding:10px 12px;background:'+PAPER+';border-top:1px solid rgba(0,0,0,0.08);display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0;min-height:44px;}',
    '.gs-chip{background:'+WHITE+';border:1.5px solid rgba(0,0,0,0.16);color:'+MUTED+';font-family:"Inter","Helvetica Neue",sans-serif;font-size:11px;font-weight:700;letter-spacing:0.05em;padding:5px 11px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:background 0.18s,border-color 0.18s,color 0.18s;}',
    '.gs-chip:hover{background:'+INK+';border-color:'+INK+';color:#fff;}',
    '#gs-foot{display:flex;gap:8px;padding:10px 12px;background:'+PAPER+';border-top:1px solid rgba(0,0,0,0.08);flex-shrink:0;}',
    '#gs-input{flex:1;background:'+WHITE+';border:1.5px solid rgba(0,0,0,0.16);border-radius:3px;padding:9px 13px;font-family:"Inter","Helvetica Neue",sans-serif;font-size:13px;color:'+INK+';outline:none;transition:border-color 0.2s;}',
    '#gs-input:focus{border-color:'+INK+';}',
    '#gs-send{background:'+INK+';border:none;color:#fff;padding:9px 16px;border-radius:3px;cursor:pointer;font-family:"Inter","Helvetica Neue",sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;transition:background 0.18s;}',
    '#gs-send:hover{background:#000;}',
    '@keyframes gs-up{from{transform:translateY(7px);opacity:0;}to{transform:translateY(0);opacity:1;}}',
    '@media(max-width:480px){#gs-panel{width:calc(100vw - 20px);right:10px;bottom:90px;}#gs-panel.gs-open{height:500px;}}'
  ].join('');

  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);

  // ── Standard chat-bubble icon — used for fab + avatar (no separate image asset needed) ──
  var chatIconInk='<svg viewBox="0 0 32 32" fill="none" stroke="'+WHITE+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M27 15.5c0 5.8-5.1 10.5-11.4 10.5-1.4 0-2.7-.2-3.9-.6L5 27l1.7-4.9C5.2 20.3 4.2 18 4.2 15.5 4.2 9.7 9.3 5 15.6 5S27 9.7 27 15.5z"/><circle cx="10.4" cy="15.5" r="1.15" fill="'+WHITE+'" stroke="none"/><circle cx="15.6" cy="15.5" r="1.15" fill="'+WHITE+'" stroke="none"/><circle cx="20.8" cy="15.5" r="1.15" fill="'+WHITE+'" stroke="none"/></svg>';
  var chatIconWhite='<svg viewBox="0 0 32 32" fill="none" stroke="'+INK+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M27 15.5c0 5.8-5.1 10.5-11.4 10.5-1.4 0-2.7-.2-3.9-.6L5 27l1.7-4.9C5.2 20.3 4.2 18 4.2 15.5 4.2 9.7 9.3 5 15.6 5S27 9.7 27 15.5z"/><circle cx="10.4" cy="15.5" r="1.15" fill="'+INK+'" stroke="none"/><circle cx="15.6" cy="15.5" r="1.15" fill="'+INK+'" stroke="none"/><circle cx="20.8" cy="15.5" r="1.15" fill="'+INK+'" stroke="none"/></svg>';

  // ── DOM ───────────────────────────────────────────────────────────────────
  var wrap=document.createElement('div');
  wrap.innerHTML=
    '<div id="gs-fab" role="button" aria-label="Chat mit Goldschmiede Salzmann öffnen" title="Chat mit Goldschmiede Salzmann">'+chatIconInk+'</div>'+
    '<div id="gs-panel" role="dialog" aria-modal="true" aria-label="Goldschmiede Salzmann Chat">'+
      '<div id="gs-head">'+
        '<div id="gs-head-left">'+
          '<div class="gs-avatar">'+chatIconWhite+'</div>'+
          '<div>'+
            '<div class="gs-head-name">Goldschmiede Salzmann</div>'+
            '<div class="gs-head-sub">Virtueller Assistent · Hagen</div>'+
          '</div>'+
        '</div>'+
        '<button id="gs-close" aria-label="Chat schließen">&#x2715;</button>'+
      '</div>'+
      '<div id="gs-msgs" role="log" aria-live="polite"></div>'+
      '<div id="gs-chips"></div>'+
      '<div id="gs-foot">'+
        '<input id="gs-input" type="text" placeholder="Ihre Frage..." maxlength="300" autocomplete="off" aria-label="Nachricht eingeben">'+
        '<button id="gs-send">Senden</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(wrap);

  var fab=document.getElementById('gs-fab');
  var panel=document.getElementById('gs-panel');
  var msgs=document.getElementById('gs-msgs');
  var input=document.getElementById('gs-input');
  var sendBtn=document.getElementById('gs-send');
  var closeBtn=document.getElementById('gs-close');
  var isOpen=false;
  var greeted=false;

  // ── Chips renderer ────────────────────────────────────────────────────────
  function renderChips(arr){
    var el=document.getElementById('gs-chips');
    if(!el)return;
    el.innerHTML=arr.map(function(c){
      return '<button class="gs-chip">'+c.l+'</button>';
    }).join('');
    el.querySelectorAll('.gs-chip').forEach(function(btn,i){
      btn.addEventListener('click',function(){
        if(!isOpen)open();
        setTimeout(function(){send(arr[i].m,arr[i].l);},isOpen?0:380);
      });
    });
  }

  // ── Message helpers ───────────────────────────────────────────────────────
  function addMsg(text,who){
    var d=document.createElement('div');
    d.className='gs-msg gs-'+who;
    d.innerHTML=fmt(text);
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }

  function send(text,displayLabel){
    text=(text||'').trim();
    if(!text)return;
    var shown=displayLabel||text;
    addMsg(shown,'user');
    input.value='';
    setTimeout(function(){addMsg(respond(text),'bot');},420);
  }

  // ── Open / Close ──────────────────────────────────────────────────────────
  function open(){
    panel.classList.add('gs-open');
    fab.setAttribute('aria-label','Chat schließen');
    isOpen=true;
    if(!greeted){addMsg(GREET,'bot');greeted=true;}
    setTimeout(function(){input.focus();},360);
  }

  function close(){
    panel.classList.remove('gs-open');
    fab.setAttribute('aria-label','Chat mit Goldschmiede Salzmann öffnen');
    isOpen=false;
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  fab.addEventListener('click',function(){isOpen?close():open();});
  closeBtn.addEventListener('click',close);
  sendBtn.addEventListener('click',function(){send(input.value);});
  input.addEventListener('keydown',function(e){if(e.key==='Enter')send(input.value);});

  renderChips(CHIPS_DEFAULT);

})();
