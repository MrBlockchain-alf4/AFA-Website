/**
 * AFA Booking Calendar — Voiceflow Web Chat Extension
 *
 * SETUP (3 steps):
 *
 * 1. Host this file on your server (e.g. /booking-calendar-extension.js)
 *
 * 2. Load it + wire it into the Voiceflow chat init on your website:
 *
 *      <script src="/booking-calendar-extension.js"></script>
 *      <script>
 *        (function(d,t){
 *          var v=d.createElement(t),s=d.getElementsByTagName(t)[0];
 *          v.onload=function(){
 *            window.voiceflowChat.load({
 *              verify:    { projectID: 'YOUR_PROJECT_ID' },
 *              url:       'https://general-runtime.voiceflow.com',
 *              versionID: 'production',
 *              extensions: [window.VFBookingCalendar],  // ← register extension
 *            });
 *          };
 *          v.src='https://cdn.voiceflow.com/widget/latest/voiceflow.js';
 *          v.type='text/javascript'; s.parentNode.insertBefore(v,s);
 *        })(document,'script');
 *      </script>
 *
 * 3. In Voiceflow, add a Function step that fires the custom trace:
 *
 *      trace.addTrace({
 *        type: 'ext_booking_calendar',
 *        payload: {
 *          name:        'booking_calendar',
 *          vorname:     '{vorname}',
 *          nachname:    '{nachname}',
 *          email:       '{email}',
 *          telefon:     '{telefon}',
 *          unternehmen: '{unternehmen}',
 *          interesse:   '{interesse}',
 *        }
 *      });
 *
 *    Connect the "Complete" path to the next step in the flow.
 *    The payload returned to Voiceflow will contain all booking fields.
 */

(function () {
  'use strict';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONFIG — update WEBHOOK before going live
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var WEBHOOK      = 'https://your-n8n-instance.com/webhook/afa-booking';
  var BOOKED_DATES = [
    '2026-06-09','2026-06-15','2026-06-16','2026-06-22','2026-06-29',
    '2026-07-06','2026-07-13','2026-07-20','2026-07-21',
  ];
  var CLOSED_DAYS = [0, 6]; // 0=Sun, 6=Sat
  var ALL_SLOTS   = ['09:00','09:30','10:00','10:30','11:00','11:30',
                     '14:00','14:30','15:00','15:30','16:00','16:30'];
  var REDUCED     = { '2026-06-10':6, '2026-06-17':6, '2026-06-24':4 };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STYLES — scoped under .afa-cal to avoid conflicts
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var STYLE = '\
.afa-cal*,.afa-cal *::before,.afa-cal *::after{box-sizing:border-box;margin:0;padding:0}\
.afa-cal{\
  --acc:#00bbfd;--s2:#141418;--s3:#1a1a20;\
  --bd:rgba(255,255,255,.07);--bd2:rgba(255,255,255,.12);\
  --text:#f4f4f5;--muted:#71717a;--soft:#a1a1aa;\
  --aLow:rgba(0,187,253,.07);--aMid:rgba(0,187,253,.18);--aHigh:rgba(0,187,253,.32);\
  --warn:rgba(255,160,60,.10);--warnB:rgba(255,160,60,.26);\
  font-family:"Plus Jakarta Sans",-apple-system,sans-serif;\
  -webkit-font-smoothing:antialiased;color:var(--text);padding:4px 0 6px;\
}\
.afa-cal .card{background:var(--s2);border:1px solid var(--bd);border-radius:16px;overflow:hidden}\
.afa-cal .card-top{height:2px;background:linear-gradient(90deg,transparent,rgba(0,187,253,.5),transparent)}\
.afa-cal .hd{display:flex;align-items:center;gap:10px;margin-bottom:12px}\
.afa-cal .hd-back{width:32px;height:32px;border-radius:50%;background:var(--s2);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--soft);flex-shrink:0;transition:background .15s,color .15s}\
.afa-cal .hd-back:hover{background:var(--s3);color:var(--text)}\
.afa-cal .hd-eyebrow{font-family:"Chivo Mono",monospace;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--acc);margin-bottom:2px}\
.afa-cal .hd-title{font-size:17px;font-weight:800;letter-spacing:-.03em}\
.afa-cal .steps{display:flex;gap:5px;margin-bottom:12px}\
.afa-cal .sd{height:3px;border-radius:2px;background:var(--s3);transition:width .28s,background .28s}\
.afa-cal .sd.active{width:24px;background:var(--acc)}\
.afa-cal .sd.done{width:12px;background:rgba(0,187,253,.35)}\
.afa-cal .sd.pending{width:12px}\
.afa-cal .mnav{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 10px}\
.afa-cal .mlabel{font-size:14px;font-weight:700;letter-spacing:-.02em}\
.afa-cal .nbtn{width:28px;height:28px;border-radius:7px;background:var(--s3);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--soft);transition:background .13s,color .13s}\
.afa-cal .nbtn:hover:not([disabled]){background:rgba(255,255,255,.08);color:var(--text)}\
.afa-cal .nbtn[disabled]{opacity:.22;cursor:not-allowed}\
.afa-cal .wdays{display:grid;grid-template-columns:repeat(7,1fr);padding:0 10px 3px;gap:2px}\
.afa-cal .wday{text-align:center;font-family:"Chivo Mono",monospace;font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}\
.afa-cal .dgrid{display:grid;grid-template-columns:repeat(7,1fr);padding:0 10px 10px;gap:2px}\
.afa-cal .dc{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;font-weight:600;border:1px solid transparent;cursor:default;position:relative;transition:background .12s,border-color .12s,transform .11s;user-select:none}\
.afa-cal .dc.available{color:var(--text);cursor:pointer}\
.afa-cal .dc.available:hover{background:var(--aLow);border-color:rgba(0,187,253,.2);transform:scale(1.09)}\
.afa-cal .dc.available:active{transform:scale(.93)}\
.afa-cal .dc.today{border-color:rgba(0,187,253,.32);color:var(--acc)}\
.afa-cal .dc.selected{background:var(--acc)!important;border-color:transparent!important;color:#08090a!important;font-weight:800;transform:scale(1.07);box-shadow:0 0 14px rgba(0,187,253,.3)}\
.afa-cal .dc.booked,.afa-cal .dc.past{color:rgba(255,255,255,.13)}\
.afa-cal .dc.booked::after{content:"";position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.15)}\
.afa-cal .legend{display:flex;gap:14px;padding:1px 16px 12px}\
.afa-cal .li{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted)}\
.afa-cal .lp{width:7px;height:7px;border-radius:2px}\
.afa-cal .dstrip{display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(0,187,253,.05);border-bottom:1px solid rgba(0,187,253,.1)}\
.afa-cal .dstrip-txt{font-size:12px;font-weight:600}\
.afa-cal .dstrip-slot{margin-left:auto;font-family:"Chivo Mono",monospace;font-size:11px;font-weight:700;color:var(--acc)}\
.afa-cal .swrap{padding:14px 16px 16px}\
.afa-cal .ey{font-family:"Chivo Mono",monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}\
.afa-cal .sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}\
.afa-cal .slot{padding:9px 4px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid var(--bd);color:var(--soft);font-family:"Plus Jakarta Sans",sans-serif;font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:background .12s,border-color .12s,color .12s,transform .11s}\
.afa-cal .slot:hover{background:var(--aLow);border-color:rgba(0,187,253,.22);color:var(--text)}\
.afa-cal .slot.sel{background:var(--aLow);border-color:var(--aHigh);color:var(--acc);font-weight:700;box-shadow:0 0 9px rgba(0,187,253,.1)}\
.afa-cal .slot:active{transform:scale(.94)}\
.afa-cal .conf-appt{margin:14px 16px 0;background:var(--aLow);border:1px solid rgba(0,187,253,.14);border-radius:11px;padding:12px 14px}\
.afa-cal .appt-label{font-family:"Chivo Mono",monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);margin-bottom:5px}\
.afa-cal .appt-date{font-size:13px;font-weight:800;letter-spacing:-.02em;margin-bottom:2px}\
.afa-cal .appt-sub{font-size:11px;color:var(--muted)}\
.afa-cal .divider{height:1px;background:var(--bd);margin:12px 16px}\
.afa-cal .conf-lead{margin:0 16px}\
.afa-cal .lead-label{font-family:"Chivo Mono",monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:9px}\
.afa-cal .lrow{display:flex;align-items:flex-start;gap:8px;margin-bottom:7px}\
.afa-cal .lrow:last-child{margin-bottom:0}\
.afa-cal .licon{width:24px;height:24px;flex-shrink:0;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center}\
.afa-cal .lmain{font-size:12px;font-weight:600;color:var(--text);line-height:1.4}\
.afa-cal .lsub{font-size:10px;color:var(--muted);font-family:"Chivo Mono",monospace;letter-spacing:.03em}\
.afa-cal .notice{margin:11px 16px 0;background:var(--warn);border:1px solid var(--warnB);border-radius:9px;padding:9px 11px;display:flex;align-items:flex-start;gap:7px}\
.afa-cal .notice-txt{font-size:11px;color:rgba(255,190,100,.9);line-height:1.6}\
.afa-cal .actions{padding:12px 16px 14px}\
.afa-cal .btn-primary{width:100%;padding:12px 16px;background:var(--acc);border:none;border-radius:10px;color:#08090a;font-family:"Plus Jakarta Sans",sans-serif;font-size:13px;font-weight:800;letter-spacing:-.012em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:transform .15s,filter .15s,box-shadow .15s;box-shadow:0 4px 16px rgba(0,187,253,.24);margin-bottom:7px}\
.afa-cal .btn-primary:hover:not([disabled]){transform:translateY(-1px);filter:brightness(1.06);box-shadow:0 7px 22px rgba(0,187,253,.3)}\
.afa-cal .btn-primary:active{transform:scale(.97)}\
.afa-cal .btn-primary[disabled]{opacity:.28;cursor:not-allowed;transform:none!important;filter:none!important;box-shadow:none!important}\
.afa-cal .btn-row{display:flex;gap:7px;margin-bottom:7px}\
.afa-cal .btn-ghost{flex:1;padding:9px 7px;background:rgba(255,255,255,.04);border:1px solid var(--bd);border-radius:9px;color:var(--soft);font-family:"Plus Jakarta Sans",sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:background .12s,border-color .12s,color .12s,transform .11s}\
.afa-cal .btn-ghost:hover{background:rgba(255,255,255,.07);border-color:var(--bd2);color:var(--text)}\
.afa-cal .btn-ghost:active{transform:scale(.96)}\
.afa-cal .btn-ghost.full{flex:none;width:100%}\
.afa-cal .edit-wrap{padding:14px 16px 16px}\
.afa-cal .fg{margin-bottom:10px}\
.afa-cal .fl{display:block;font-family:"Chivo Mono",monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}\
.afa-cal .fi{width:100%;background:rgba(255,255,255,.03);border:1px solid var(--bd);border-radius:9px;padding:10px 12px;color:var(--text);font-family:"Plus Jakarta Sans",sans-serif;font-size:13px;font-weight:500;outline:none;transition:border-color .15s,background .15s}\
.afa-cal .fi:focus{border-color:rgba(0,187,253,.36);background:rgba(0,187,253,.04)}\
.afa-cal .fi::placeholder{color:rgba(255,255,255,.17);font-weight:400}\
.afa-cal .success-wrap{padding:32px 18px 28px;text-align:center}\
.afa-cal .sbadge{width:58px;height:58px;border-radius:50%;background:rgba(0,187,253,.07);border:1px solid rgba(0,187,253,.3);box-shadow:0 0 0 6px rgba(0,187,253,.04),0 0 24px rgba(0,187,253,.14);display:flex;align-items:center;justify-content:center;margin:0 auto 16px}\
.afa-cal .stitle{font-size:18px;font-weight:800;letter-spacing:-.03em;margin-bottom:6px}\
.afa-cal .ssub{font-size:12px;color:var(--muted);line-height:1.75;max-width:250px;margin:0 auto 16px}\
.afa-cal .scard{background:var(--aLow);border:1px solid rgba(0,187,253,.13);border-radius:11px;padding:13px 14px;text-align:left}\
.afa-cal .snote{margin-top:11px;font-family:"Chivo Mono",monospace;font-size:10px;color:rgba(255,255,255,.17);letter-spacing:.05em}\
@keyframes afa-fu{from{opacity:0;transform:translateY(10px);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}\
.afa-cal .fu{animation:afa-fu .28s cubic-bezier(.22,1,.36,1) both}\
';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ICONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var IC = {
    cal:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00bbfd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    clk:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00bbfd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    usr:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    mail: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>',
    tel:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.85 18.5 19.79 19.79 0 0 1 1.18 4.18 2 2 0 0 1 3.17 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    biz:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>',
    idea: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
    chk:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00bbfd" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    aL:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    aR:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    pen:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    warn: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,160,60,.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXTENSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  var BookingCalendarExtension = {
    name: 'BookingCalendar',
    type: 'response',

    // Matches the trace type fired from the Voiceflow Function step
    match: function (args) {
      var trace = args.trace;
      return trace.type === 'ext_booking_calendar' ||
             (trace.payload && trace.payload.name === 'booking_calendar');
    },

    render: function (args) {
      var trace   = args.trace;
      var element = args.element;

      // ── Inject fonts once into document head ─────────────────
      if (!document.querySelector('#afa-cal-fonts')) {
        var lnk  = document.createElement('link');
        lnk.id   = 'afa-cal-fonts';
        lnk.rel  = 'stylesheet';
        lnk.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Chivo+Mono:wght@400;500;700&display=swap';
        document.head.appendChild(lnk);
      }

      // ── Inject styles once ───────────────────────────────────
      if (!document.querySelector('#afa-cal-style')) {
        var stEl       = document.createElement('style');
        stEl.id        = 'afa-cal-style';
        stEl.textContent = STYLE;
        document.head.appendChild(stEl);
      }

      // ── Lead data from Voiceflow trace payload ───────────────
      var p    = trace.payload || {};
      var lead = {
        vorname:     (p.vorname     || '').trim(),
        nachname:    (p.nachname    || '').trim(),
        email:       (p.email       || '').trim(),
        telefon:     (p.telefon     || '').trim(),
        unternehmen: (p.unternehmen || '').trim(),
        interesse:   (p.interesse   || '').trim(),
      };

      // ── Root container ───────────────────────────────────────
      var root = document.createElement('div');
      root.className = 'afa-cal';
      element.appendChild(root);

      // ── Namespace all handlers to avoid global pollution ─────
      // Each extension instance gets a unique key on window.
      var ns = '__afaCal_' + Date.now();
      var H  = (window[ns] = {});

      // ── State ────────────────────────────────────────────────
      var S = {
        step:     'date',
        yr:       new Date().getFullYear(),
        mo:       new Date().getMonth(),
        date:     null,
        slot:     null,
        lead:     lead,
        editMode: 'all',
        loading:  false,
      };

      var MONTHS   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
      var WD_S     = ['Mo','Di','Mi','Do','Fr','Sa','So'];
      var WD_L     = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
      var REQUIRED = ['vorname', 'email'];
      var FIELD_META = {
        vorname:     { label:'Vorname',           type:'text',  ph:'Max',                     req:true  },
        nachname:    { label:'Nachname',          type:'text',  ph:'Mustermann',              req:false },
        email:       { label:'E-Mail-Adresse',    type:'email', ph:'max@firma.de',            req:true  },
        telefon:     { label:'Telefon',           type:'tel',   ph:'+49 123 456789',          req:false },
        unternehmen: { label:'Unternehmen',       type:'text',  ph:'Muster GmbH',            req:false },
        interesse:   { label:'Interesse / Thema', type:'text',  ph:'z.B. KI-Automatisierung', req:false },
      };

      // ── Helpers ──────────────────────────────────────────────
      function pad(n)     { return String(n).padStart(2,'0'); }
      function dk(y,m,d)  { return y+'-'+pad(m+1)+'-'+pad(d); }
      function esc(s)     { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
      function isPast(y,m,d)  { var t=new Date(); t.setHours(0,0,0,0); return new Date(y,m,d)<t; }
      function isToday(y,m,d) { var t=new Date(); return t.getFullYear()===y&&t.getMonth()===m&&t.getDate()===d; }
      function isBooked(y,m,d){ return BOOKED_DATES.indexOf(dk(y,m,d))!==-1; }
      function isClosed(y,m,d){ return CLOSED_DAYS.indexOf(new Date(y,m,d).getDay())!==-1; }
      function missingRequired(){ return REQUIRED.filter(function(k){ return !S.lead[k]; }); }
      function hasAllRequired() { return missingRequired().length===0; }

      function fmtLong(ds) {
        var parts = ds.split('-').map(Number);
        var y=parts[0], mo=parts[1], d=parts[2];
        var jsDay = new Date(y,mo-1,d).getDay();
        var idx   = jsDay===0 ? 6 : jsDay-1;
        return WD_L[idx]+', den '+d+'. '+MONTHS[mo-1]+' '+y;
      }
      function slotsFor(ds) {
        var n = REDUCED[ds];
        return n!==undefined ? ALL_SLOTS.slice(0,n) : ALL_SLOTS;
      }
      function buildIso(ds, slot) {
        var parts = ds.split('-').map(Number);
        var tp    = slot.split(':').map(Number);
        var d     = new Date(parts[0],parts[1]-1,parts[2],tp[0],tp[1],0);
        var off   = -d.getTimezoneOffset();
        var sign  = off>=0?'+':'-';
        return ds+'T'+slot+':00.000'+sign+pad(Math.floor(Math.abs(off)/60))+':'+pad(Math.abs(off)%60);
      }

      // ── Fragment builders ────────────────────────────────────
      function stepDots(cur) {
        return '<div class="steps">'+[1,2,3].map(function(n){
          return '<div class="sd '+(n===cur?'active':n<cur?'done':'pending')+'"></div>';
        }).join('')+'</div>';
      }
      function hdr(title) {
        var back = S.step!=='date'
          ? '<button class="hd-back" onclick="window[\''+ns+'\'].goBack()">'+IC.aL+'</button>'
          : '';
        return '<div class="hd">'+back+'<div>'
          +'<div class="hd-eyebrow">Termin buchen · AFA</div>'
          +'<div class="hd-title">'+title+'</div>'
          +'</div></div>';
      }
      function dateStrip() {
        if (!S.date) return '';
        return '<div class="dstrip">'+IC.cal
          +'<span class="dstrip-txt">'+fmtLong(S.date)+'</span>'
          +(S.slot?'<span class="dstrip-slot">'+S.slot+' Uhr</span>':'')
          +'</div>';
      }
      function lrow(icon, value, sublabel) {
        if (!value) return '';
        return '<div class="lrow"><div class="licon">'+icon+'</div>'
          +'<div><div class="lmain">'+esc(value)+'</div><div class="lsub">'+sublabel+'</div></div></div>';
      }

      // ── Render steps ─────────────────────────────────────────
      function renderDate() {
        var y=S.yr, m=S.mo;
        var now       = new Date();
        var firstDay  = new Date(y,m,1).getDay();
        var offset    = firstDay===0?6:firstDay-1;
        var total     = new Date(y,m+1,0).getDate();
        var atMin     = y===now.getFullYear()&&m===now.getMonth();
        var cells = '';
        for (var i=0;i<offset;i++) cells+='<div class="dc"></div>';
        for (var d=1;d<=total;d++) {
          var key   = dk(y,m,d);
          var sel   = S.date===key;
          var avail = !isPast(y,m,d)&&!isBooked(y,m,d)&&!isClosed(y,m,d);
          var tod   = isToday(y,m,d);
          var cls   = sel?'selected':avail?'available'+(tod?' today':''):isBooked(y,m,d)?'booked':'past';
          var click = (avail&&!sel)?'onclick="window[\''+ns+'\'].pickDate(\''+key+'\')"':'';
          cells+='<div class="dc '+cls+'" '+click+'>'+d+'</div>';
        }
        return hdr('Datum wählen')+stepDots(1)
          +'<div class="card fu"><div class="card-top"></div>'
          +'<div class="mnav">'
          +'<button class="nbtn" onclick="window[\''+ns+'\'].prevMo()" '+(atMin?'disabled':'')+'>'+IC.aL+'</button>'
          +'<div class="mlabel">'+MONTHS[m]+' '+y+'</div>'
          +'<button class="nbtn" onclick="window[\''+ns+'\'].nextMo()">'+IC.aR+'</button>'
          +'</div>'
          +'<div class="wdays">'+WD_S.map(function(w){return '<div class="wday">'+w+'</div>';}).join('')+'</div>'
          +'<div class="dgrid">'+cells+'</div>'
          +'<div class="legend">'
          +'<div class="li"><div class="lp" style="background:rgba(0,187,253,.28);border:1px solid rgba(0,187,253,.38);"></div>Verfügbar</div>'
          +'<div class="li"><div class="lp" style="background:rgba(255,255,255,.07);"></div>Ausgebucht</div>'
          +'</div></div>';
      }

      function renderTime() {
        var slots = slotsFor(S.date);
        var btns  = slots.map(function(s){
          return '<button class="slot'+(S.slot===s?' sel':'')+'" onclick="window[\''+ns+'\'].pickSlot(\''+s+'\')">'+s+'</button>';
        }).join('');
        return hdr('Uhrzeit wählen')+stepDots(2)
          +'<div class="card fu"><div class="card-top"></div>'
          +dateStrip()
          +'<div class="swrap"><div class="ey">Verfügbare Zeiten</div>'
          +'<div class="sgrid">'+btns+'</div>'
          +'<div style="margin-top:14px;">'
          +'<button class="btn-primary" onclick="window[\''+ns+'\'].afterTime()" '+(S.slot?'':'disabled')+'>Weiter '+IC.aR+'</button>'
          +'</div></div></div>';
      }

      function renderConfirm() {
        var L       = S.lead;
        var missing = missingRequired();
        var full    = [L.vorname,L.nachname].filter(Boolean).join(' ');
        var notice  = missing.length
          ? '<div class="notice">'+IC.warn+'<div class="notice-txt">Bitte ergänze noch: <strong>'
            +missing.map(function(k){return k==='vorname'?'Vorname':'E-Mail';}).join(', ')
            +'</strong> um den Termin zu bestätigen.</div></div>'
          : '';
        return hdr('Zusammenfassung')+stepDots(3)
          +'<div class="card fu"><div class="card-top"></div>'
          +'<div class="conf-appt">'
          +'<div class="appt-label">Dein Termin</div>'
          +'<div class="appt-date">'+fmtLong(S.date)+'</div>'
          +'<div class="appt-sub">'+S.slot+' Uhr &nbsp;·&nbsp; 15–30 Min. &nbsp;·&nbsp; Google Meet</div>'
          +'</div>'
          +'<div class="divider"></div>'
          +'<div class="conf-lead"><div class="lead-label">Deine Angaben</div>'
          +lrow(IC.usr,  full||L.vorname, 'Name')
          +lrow(IC.mail, L.email,         'E-Mail')
          +lrow(IC.tel,  L.telefon,       'Telefon')
          +lrow(IC.biz,  L.unternehmen,   'Unternehmen')
          +lrow(IC.idea, L.interesse,     'Interesse')
          +'</div>'
          +notice
          +'<div class="actions">'
          +'<button class="btn-primary" onclick="window[\''+ns+'\'].confirmBook()" '+((missing.length||S.loading)?'disabled':'')+'>'+
          (S.loading?'<span>Wird gebucht…</span>':'Termin bestätigen '+IC.aR)+'</button>'
          +'<div class="btn-row">'
          +'<button class="btn-ghost" onclick="window[\''+ns+'\'].changeDate()">'+IC.cal+' Datum ändern</button>'
          +'<button class="btn-ghost" onclick="window[\''+ns+'\'].changeTime()">'+IC.clk+' Uhrzeit ändern</button>'
          +'</div>'
          +'<button class="btn-ghost full" onclick="window[\''+ns+'\'].editContact()">'+IC.pen+' Kontaktdaten ändern</button>'
          +'</div></div>';
      }

      function renderEdit() {
        var missing  = missingRequired();
        var fields   = S.editMode==='required' ? missing : Object.keys(FIELD_META);
        var title    = S.editMode==='required' ? 'Angaben ergänzen' : 'Kontaktdaten';
        var canSave  = hasAllRequired();
        var inputs   = fields.map(function(k){
          var m = FIELD_META[k];
          return '<div class="fg"><label class="fl">'+m.label+(m.req?' *':'')+'</label>'
            +'<input class="fi" type="'+m.type+'" placeholder="'+m.ph+'" value="'+esc(S.lead[k])+'"'
            +' oninput="window[\''+ns+'\'].updField(\''+k+'\',this.value)"></div>';
        }).join('');
        return hdr(title)+stepDots(3)
          +'<div class="card fu"><div class="card-top"></div>'
          +'<div class="edit-wrap">'+inputs
          +'<button class="btn-primary" id="afa-edit-save" onclick="window[\''+ns+'\'].saveEdit()" '+(canSave?'':'disabled')+'>Speichern '+IC.aR+'</button>'
          +'<div style="height:7px;"></div>'
          +'<button class="btn-ghost full" onclick="window[\''+ns+'\'].goToConfirm()">Abbrechen</button>'
          +'</div></div>';
      }

      function renderSuccess() {
        var L    = S.lead;
        var full = [L.vorname,L.nachname].filter(Boolean).join(' ');
        return '<div class="card fu"><div class="card-top"></div>'
          +'<div class="success-wrap">'
          +'<div class="sbadge">'+IC.chk+'</div>'
          +'<h2 class="stitle">Termin bestätigt</h2>'
          +'<p class="ssub">Super'+(L.vorname?', '+esc(L.vorname):'')+' 👋 Wir freuen uns auf das Gespräch.</p>'
          +'<div class="scard">'
          +lrow(IC.cal, fmtLong(S.date)+' · '+S.slot+' Uhr','Termin')
          +'<div style="height:8px;"></div>'
          +lrow(IC.usr, full, 'Name')
          +(L.email       ? '<div style="height:5px;"></div>'+lrow(IC.mail,L.email,'E-Mail')       : '')
          +(L.unternehmen ? '<div style="height:5px;"></div>'+lrow(IC.biz,L.unternehmen,'Unternehmen') : '')
          +'</div>'
          +(L.email?'<p class="snote">Bestätigung an '+esc(L.email)+'</p>':'')
          +'</div></div>';
      }

      function render() {
        var fn = { date:renderDate, time:renderTime, confirm:renderConfirm, edit:renderEdit, success:renderSuccess }[S.step];
        root.innerHTML = fn ? fn() : '';
      }

      // ── Handlers ─────────────────────────────────────────────
      H.prevMo = function(){
        var now=new Date();
        if(S.yr===now.getFullYear()&&S.mo===now.getMonth()) return;
        S.mo--; if(S.mo<0){S.mo=11;S.yr--;} render();
      };
      H.nextMo     = function(){ S.mo++; if(S.mo>11){S.mo=0;S.yr++;} render(); };
      H.pickDate   = function(d){ S.date=d; S.slot=null; S.step='time'; render(); };
      H.pickSlot   = function(s){ S.slot=s; render(); };
      H.afterTime  = function(){
        if(!S.slot) return;
        if(!hasAllRequired()){S.editMode='required';S.step='edit';}
        else{S.step='confirm';}
        render();
      };
      H.goBack = function(){
        var map={time:'date',confirm:'time',edit:'confirm'};
        if(S.step==='time') S.slot=null;
        S.step=map[S.step]||'date'; render();
      };
      H.changeDate  = function(){ S.step='date'; S.slot=null; render(); };
      H.changeTime  = function(){ S.step='time'; render(); };
      H.editContact = function(){ S.editMode='all'; S.step='edit'; render(); };
      H.goToConfirm = function(){ S.step='confirm'; render(); };
      H.updField    = function(k,v){
        S.lead[k]=v;
        var btn=document.getElementById('afa-edit-save');
        if(btn) btn.disabled=!hasAllRequired();
      };
      H.saveEdit = function(){ if(!hasAllRequired()) return; S.step='confirm'; render(); };

      H.confirmBook = function(){
        if(!hasAllRequired()||S.loading) return;
        S.loading=true; render();

        var iso = buildIso(S.date,S.slot);
        var tz  = (typeof Intl!=='undefined'&&Intl.DateTimeFormat().resolvedOptions().timeZone)||'Europe/Berlin';
        var L   = S.lead;

        var bookingPayload = {
          vorname:         L.vorname,
          nachname:        L.nachname,
          email:           L.email,
          telefon:         L.telefon,
          unternehmen:     L.unternehmen,
          interesse:       L.interesse,
          selectedDate:    S.date,
          selectedTime:    S.slot,
          terminDatumZeit: iso,
          timezone:        tz,
          source:          'Website Chatbot',
        };

        // Fire n8n webhook
        var webhookDone = fetch(WEBHOOK,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(bookingPayload),
        }).catch(function(e){ console.warn('[AFA Booking] Webhook unreachable:',e.message); });

        // Continue Voiceflow flow — fires on Complete path
        webhookDone.finally(function(){
          try {
            window.voiceflow.chat.interact({
              type:    'complete',
              payload: bookingPayload,
            });
          } catch(e) {
            console.warn('[AFA Booking] voiceflow.chat.interact failed:',e.message);
          }

          S.loading=false;
          S.step='success';
          render();

          // Release global namespace after the success screen is shown
          setTimeout(function(){ delete window[ns]; }, 8000);
        });
      };

      // ── Initial render ───────────────────────────────────────
      render();
    }
  };

  // Export — referenced in the Voiceflow chat init extensions array
  window.VFBookingCalendar = BookingCalendarExtension;

}());
