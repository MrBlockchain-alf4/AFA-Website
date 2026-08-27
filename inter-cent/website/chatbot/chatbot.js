/* Inter-Cent Fachübersetzungsdienst – Chatbot */
(function(){
  var PRIMARY='#1A5FA8',PRIMARY_DK='#0D3D73',GREEN='#2E7D52',GREEN_LT='#3DAA6B';
  var BG_USER='linear-gradient(135deg,'+PRIMARY+','+PRIMARY_DK+')';
  var PHONE='+4923313415441',PHONE_DISPLAY='+49 2331 3415441';
  var WH_URL='';

  /* ── DATA ─────────────────────────────────────────────── */
  var STEPS={};
  var data={};

  /* ── DOM ──────────────────────────────────────────────── */
  var style=document.createElement('style');
  style.textContent=`
  #ic-fab{position:fixed;bottom:28px;right:28px;z-index:1000;
    width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,${GREEN},${GREEN_LT});
    box-shadow:0 6px 26px rgba(46,125,82,0.5);
    display:flex;align-items:center;justify-content:center;
    transition:transform 200ms,box-shadow 200ms;}
  #ic-fab:hover{transform:scale(1.08);box-shadow:0 10px 34px rgba(46,125,82,0.6);}
  #ic-fab svg{width:26px;height:26px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
  #ic-panel{position:fixed;bottom:100px;right:28px;z-index:999;
    width:360px;max-width:calc(100vw - 56px);
    height:680px;max-height:calc(100vh - 120px);
    background:#fff;border-radius:16px;overflow:hidden;
    box-shadow:0 24px 80px rgba(13,61,115,0.22),0 4px 16px rgba(13,61,115,0.1);
    display:none;flex-direction:column;border:1px solid rgba(26,95,168,0.12);}
  @media(max-width:600px){
    #ic-panel{position:fixed;bottom:0;left:0;right:0;width:100%;max-width:100%;
      border-radius:16px 16px 0 0;max-height:82dvh;}
    #ic-fab{bottom:18px;right:18px;width:54px;height:54px;}
    #ic-fab svg{width:22px;height:22px;}
  }
  @media(max-width:430px){
    .ic-head{padding:13px 14px;gap:10px;}
    .ic-head-av{width:34px;height:34px;}
    .ic-head-name{font-size:13px;}
    .ic-body{padding:14px 12px;gap:8px;}
    .ic-bubble{font-size:12px;padding:10px 12px;}
    .ic-chips{padding:0 12px 10px;gap:6px;}
    .ic-chip{padding:7px 12px;font-size:11px;}
    .ic-foot{padding:9px 12px;gap:7px;}
    .ic-inp{font-size:13px;padding:10px 13px;}
    .ic-send{width:42px;height:42px;}
  }
  .ic-head{
    padding:16px 18px;display:flex;align-items:center;gap:12px;
    background:linear-gradient(135deg,${PRIMARY_DK},${PRIMARY});
    flex-shrink:0;}
  .ic-head-av{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);
    display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ic-head-av svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;}
  .ic-head-info{}
  .ic-head-name{font-size:14px;font-weight:700;color:#fff;font-family:'Montserrat',sans-serif;}
  .ic-head-sub{font-size:11px;color:rgba(255,255,255,0.65);display:flex;align-items:center;gap:5px;margin-top:2px;}
  .ic-head-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;}
  .ic-close{margin-left:auto;background:none;border:none;cursor:pointer;padding:4px;opacity:0.65;transition:opacity 150ms;}
  .ic-close:hover{opacity:1;}
  .ic-close svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;}
  .ic-body{flex:1;overflow-y:auto;padding:18px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}
  .ic-msg{display:flex;align-items:flex-end;gap:8px;}
  .ic-msg.user{flex-direction:row-reverse;}
  .ic-bubble{max-width:82%;padding:11px 14px;border-radius:16px;font-size:13px;line-height:1.6;font-family:'Montserrat',sans-serif;word-break:break-word;}
  .ic-msg.bot .ic-bubble{background:#F0F5FF;color:#111827;border-bottom-left-radius:4px;}
  .ic-msg.user .ic-bubble{background:${BG_USER};color:#fff;border-bottom-right-radius:4px;}
  .ic-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 12px;}
  .ic-chip{padding:8px 14px;border-radius:20px;border:1.5px solid ${PRIMARY};color:${PRIMARY};
    font-size:12px;font-weight:600;cursor:pointer;background:#fff;font-family:'Montserrat',sans-serif;
    transition:background 160ms,color 160ms,transform 140ms;}
  .ic-chip:hover{background:${PRIMARY};color:#fff;transform:translateY(-1px);}
  .ic-chip.green{border-color:${GREEN};color:${GREEN};}
  .ic-chip.green:hover{background:${GREEN};color:#fff;}
  .ic-foot{border-top:1px solid rgba(26,95,168,0.1);padding:10px 14px;display:flex;gap:8px;flex-shrink:0;}
  .ic-inp{flex:1;border:1.5px solid rgba(26,95,168,0.18);border-radius:20px;padding:9px 14px;
    font-size:13px;outline:none;font-family:'Montserrat',sans-serif;color:#111827;
    transition:border-color 180ms;}
  .ic-inp:focus{border-color:${PRIMARY};}
  .ic-send{width:38px;height:38px;border-radius:50%;background:${GREEN};border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    transition:background 160ms,transform 140ms;}
  .ic-send:hover{background:#1B5235;transform:scale(1.06);}
  .ic-send svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;}
  .ic-typing{display:flex;gap:4px;padding:10px 14px;}
  .ic-typing span{width:7px;height:7px;border-radius:50%;background:rgba(26,95,168,0.3);
    animation:icDot 1.2s ease-in-out infinite;}
  .ic-typing span:nth-child(2){animation-delay:0.18s;}
  .ic-typing span:nth-child(3){animation-delay:0.36s;}
  @keyframes icDot{0%,80%,100%{transform:scale(0.75);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
  .ic-rich{background:#F0F5FF;border-radius:14px;padding:16px;font-family:'Montserrat',sans-serif;font-size:13px;line-height:1.65;color:#111827;border:1px solid rgba(26,95,168,0.12);}
  .ic-rich-row{display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;}
  .ic-rich-row span:first-child{color:#6B7E9A;}
  .ic-rich-row span:last-child{font-weight:700;color:${PRIMARY};}
  .ic-rich-divider{height:1px;background:rgba(26,95,168,0.1);margin:10px 0;}
  `;
  document.head.appendChild(style);

  var fab=document.createElement('button');
  fab.id='ic-fab';fab.setAttribute('aria-label','Chat öffnen');
  fab.innerHTML='<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  document.body.appendChild(fab);

  var panel=document.createElement('div');
  panel.id='ic-panel';
  panel.innerHTML=`
  <div class="ic-head">
    <div class="ic-head-av">
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    </div>
    <div class="ic-head-info">
      <div class="ic-head-name">Inter-Cent</div>
      <div class="ic-head-sub"><span class="ic-head-dot"></span>Jetzt online</div>
    </div>
    <button class="ic-close" id="ic-close" aria-label="Schließen">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="ic-body" id="ic-body"></div>
  <div class="ic-chips" id="ic-chips"></div>
  <div class="ic-foot">
    <input class="ic-inp" id="ic-inp" placeholder="Nachricht eingeben…" autocomplete="off">
    <button class="ic-send" id="ic-send" aria-label="Senden">
      <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>`;
  document.body.appendChild(panel);

  var body=document.getElementById('ic-body');
  var chipsWrap=document.getElementById('ic-chips');
  var inp=document.getElementById('ic-inp');
  var isOpen=false;

  /* ── OPEN/CLOSE ───────────────────────────────────────── */
  function open(){isOpen=true;panel.style.display='flex';if(window.innerWidth<=600){fab.style.display='none';}else{fab.style.transform='scale(0.9)';}if(!body.children.length)start();}
  function close(){isOpen=false;panel.style.display='none';fab.style.display='';fab.style.transform='';}
  fab.addEventListener('click',function(){isOpen?close():open();});
  document.getElementById('ic-close').addEventListener('click',close);
  window.icCbOpen=open;

  /* ── MESSAGING ────────────────────────────────────────── */
  function msg(text,type){
    type=type||'bot';
    var d=document.createElement('div');d.className='ic-msg '+type;
    var b=document.createElement('div');b.className='ic-bubble';b.innerHTML=text;
    d.appendChild(b);body.appendChild(d);scroll();return b;
  }

  function typing(){
    var d=document.createElement('div');d.className='ic-msg bot';
    var t=document.createElement('div');t.className='ic-typing';
    t.innerHTML='<span></span><span></span><span></span>';
    d.appendChild(t);body.appendChild(d);scroll();return d;
  }

  function scroll(){body.scrollTop=body.scrollHeight;}

  function chips(opts){
    chipsWrap.innerHTML='';
    opts.forEach(function(o){
      var btn=document.createElement('button');
      btn.className='ic-chip'+(o.green?' green':'');
      btn.textContent=o.label;
      btn.addEventListener('click',function(){o.cb();});
      chipsWrap.appendChild(btn);
    });
  }

  function clearChips(){chipsWrap.innerHTML='';}

  async function bot(text,delay){
    delay=delay||420;
    var t=typing();
    await wait(delay);
    body.removeChild(t);
    msg(text,'bot');
  }

  function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}

  /* ── INPUT ────────────────────────────────────────────── */
  var step='';

  inp.addEventListener('keydown',function(e){if(e.key==='Enter')send();});
  document.getElementById('ic-send').addEventListener('click',send);

  function send(){
    var text=inp.value.trim();if(!text)return;
    inp.value='';
    msg(text,'user');
    clearChips();
    handleText(text);
  }

  async function handleText(text){
    if(step==='name'){
      data.name=text;
      await bot('Und Ihre Telefonnummer, damit wir Sie kontaktieren können?',320);
      step='phone';
    } else if(step==='phone'){
      data.phone=text;
      await bot('Haben Sie eine E-Mail-Adresse für die Auftragsbestätigung?',320);
      step='email';
    } else if(step==='email'){
      data.email=text;
      await STEPS.lang();
    } else if(step==='doc_detail'){
      data.docDetail=text;
      await STEPS.submit();
    } else {
      await bot('Bitte wählen Sie eine Option oben, oder schreiben Sie uns <a href="tel:'+PHONE+'" style="color:'+PRIMARY+';font-weight:600;">'+PHONE_DISPLAY+'</a>.',350);
    }
  }

  /* ── FLOW ─────────────────────────────────────────────── */
  async function start(){
    data={};step='';
    await bot('Hallo! Willkommen bei <strong>Inter-Cent Fachübersetzungsdienst</strong>. Wie kann ich Ihnen helfen?',480);
    chips([
      {label:'Termin anfragen',cb:function(){STEPS.service();}},
      {label:'Leistungen & Preise',cb:function(){STEPS.info();}},
      {label:'Beglaubigte Übersetzung',cb:function(){STEPS.serviceChosen('beglaubigt');}},
      {label:'Dolmetscher buchen',cb:function(){STEPS.serviceChosen('dolmetscher');}},
      {label:'Anrufen',cb:function(){window.location.href='tel:'+PHONE;},green:true},
    ]);
  }

  STEPS.service=async function(){
    clearChips();
    await bot('Welche Leistung benötigen Sie?',360);
    chips([
      {label:'Beglaubigte Übersetzung',cb:function(){STEPS.serviceChosen('beglaubigt');}},
      {label:'Fachübersetzung',cb:function(){STEPS.serviceChosen('fachübersetzung');}},
      {label:'Dolmetscher',cb:function(){STEPS.serviceChosen('dolmetscher');}},
      {label:'Eilübersetzung',cb:function(){STEPS.serviceChosen('eil');}},
    ]);
  };

  STEPS.info=async function(){
    clearChips();
    await bot('Wir bieten beglaubigte Übersetzungen, Fachübersetzungen (Technik, Medizin, Recht), Dolmetscherdienste und Eilübersetzungen an. Für ein konkretes Angebot rufen Sie uns gerne an:<br><a href="tel:'+PHONE+'" style="color:'+PRIMARY+';font-weight:700;">'+PHONE_DISPLAY+'</a>',480);
    await wait(300);
    chips([
      {label:'Termin anfragen',cb:function(){STEPS.service();}},
      {label:'Anrufen',cb:function(){window.location.href='tel:'+PHONE;},green:true},
      {label:'Zurück',cb:function(){start();}},
    ]);
  };

  STEPS.serviceChosen=async function(svc){
    clearChips();
    data.service=svc;
    var label={
      'beglaubigt':'Beglaubigte Übersetzung',
      'fachübersetzung':'Fachübersetzung',
      'dolmetscher':'Dolmetscher',
      'eil':'Eilübersetzung'
    }[svc]||svc;
    msg(label,'user');
    await bot('Super! Ich notiere: <strong>'+label+'</strong>.<br>Ihr Name bitte?',380);
    step='name';
  };

  STEPS.lang=async function(){
    clearChips();
    await bot('Welches Sprachpaar benötigen Sie?',320);
    chips([
      {label:'Deutsch → Türkisch',cb:function(){STEPS.langChosen('Deutsch → Türkisch');}},
      {label:'Türkisch → Deutsch',cb:function(){STEPS.langChosen('Türkisch → Deutsch');}},
      {label:'Deutsch → Arabisch',cb:function(){STEPS.langChosen('Deutsch → Arabisch');}},
      {label:'Deutsch → Russisch',cb:function(){STEPS.langChosen('Deutsch → Russisch');}},
      {label:'Andere Sprache',cb:function(){STEPS.langChosen('Andere');}},
    ]);
    step='';
  };

  STEPS.langChosen=async function(lang){
    clearChips();
    data.lang=lang;
    msg(lang,'user');
    await bot('Um welches Dokument handelt es sich? (z.B. Zeugnis, Urkunde, Vertrag, Attest…)',360);
    step='doc_detail';
  };

  STEPS.submit=async function(){
    clearChips();
    step='';
    var t=typing();await wait(600);body.removeChild(t);

    // Rich summary
    var d=document.createElement('div');d.className='ic-msg bot';
    var b=document.createElement('div');b.className='ic-bubble';b.style.padding='0';b.style.background='transparent';b.style.maxWidth='90%';
    var r=document.createElement('div');r.className='ic-rich';
    r.innerHTML=`<div style="font-weight:700;color:${PRIMARY};margin-bottom:12px;font-size:13px;">📋 Ihre Anfrage</div>`+
      row('Leistung',label(data.service))+
      row('Name',data.name)+
      row('Telefon',data.phone)+
      row('E-Mail',data.email)+
      row('Sprache',data.lang)+
      row('Dokument',data.docDetail)+
      `<div class="ic-rich-divider"></div>`+
      `<div style="font-size:11.5px;color:#6B7E9A;">Wir melden uns innerhalb von 24h bei Ihnen.</div>`;
    b.appendChild(r);d.appendChild(b);body.appendChild(d);scroll();

    await wait(500);
    await bot('Vielen Dank, <strong>'+data.name+'</strong>! Wir haben Ihre Anfrage erhalten und melden uns bald. Sie können uns auch direkt anrufen.',420);

    if(WH_URL){
      try{
        fetch(WH_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          source:'Inter-Cent Chatbot',service:data.service,name:data.name,
          phone:data.phone,email:data.email,lang:data.lang,doc:data.docDetail,
          ts:new Date().toISOString()
        })});
      }catch(e){}
    }

    chips([
      {label:'Anrufen',cb:function(){window.location.href='tel:'+PHONE;},green:true},
      {label:'Neue Anfrage',cb:function(){start();}},
    ]);
  };

  function label(svc){
    return {
      'beglaubigt':'Beglaubigte Übersetzung',
      'fachübersetzung':'Fachübersetzung',
      'dolmetscher':'Dolmetscher',
      'eil':'Eilübersetzung'
    }[svc]||svc||'—';
  }

  function row(k,v){
    return '<div class="ic-rich-row"><span>'+k+'</span><span>'+(v||'—')+'</span></div>';
  }

})();
