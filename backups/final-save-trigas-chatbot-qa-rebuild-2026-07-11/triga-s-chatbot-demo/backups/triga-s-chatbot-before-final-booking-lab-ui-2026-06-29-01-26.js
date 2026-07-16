/* ═══════════════════════════════════════════════════════════════
   TRIGA-S CHATBOT — v11 — Premium Rebuild
   Flows: Lead · Booking · Find · Reschedule · Cancel · SMS
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── ASSET BASE ──────────────────────────────────────────────── */
  const _SCRIPT = document.currentScript || document.querySelector('script[data-tgs]');
  const _SRC    = _SCRIPT && _SCRIPT.src ? _SCRIPT.src : 'http://localhost:5500/triga-s-chatbot.js';
  const _BASE   = _SRC.split('/').slice(0, -1).join('/') + '/';
  const A       = (f) => `${_BASE}assets/${f}`;

  /* ── WEBHOOKS (never touch) ──────────────────────────────────── */
  const WH = {
    LEAD:       'https://afa-team.app.n8n.cloud/webhook/TrigaS-ChatBot-Lead',
    AVAIL:      'https://afa-team.app.n8n.cloud/webhook/TrigaS-calendar-availability',
    FIND:       'https://afa-team.app.n8n.cloud/webhook/TrigaS-chatbot-find-appointment',
    BOOKING:    'https://afa-team.app.n8n.cloud/webhook/Termine%20TrigaS',
    RESCHEDULE: 'https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-verschieben-auto',
    CANCEL:     'https://afa-team.app.n8n.cloud/webhook/TrigaS-termin-cancel',
    SMS:        'https://afa-team.app.n8n.cloud/webhook/send_sms_confirmation_trigas',
  };

  /* ── STATE ───────────────────────────────────────────────────── */
  let S = { open:false, flow:null, data:{}, appointment:null, busy:false,
            cal:{ year:0, month:0, selDate:null, selTime:null, slots:[] } };

  /* ── CSS ─────────────────────────────────────────────────────── */
  const CSS = `
/* ─── TEASER ─────────────────────────────────────── */
#tgs-teaser{
  position:fixed;
  bottom:102px;right:28px;
  z-index:2147483646;
  width:232px;
  background:#fff;
  border-radius:16px;
  border:1px solid rgba(0,84,160,.12);
  box-shadow:
    0 2px 8px rgba(0,20,60,.06),
    0 12px 32px rgba(0,28,80,.11),
    0 26px 56px rgba(0,28,80,.07);
  display:flex;align-items:flex-start;
  overflow:visible;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  opacity:0;transform:translateY(10px) scale(.97);pointer-events:none;}
#tgs-teaser.tgs-hidden{display:none!important;}
#tgs-teaser.tgs-t-in{
  opacity:1;transform:translateY(0) scale(1);pointer-events:auto;
  transition:opacity .42s cubic-bezier(.22,1,.36,1),transform .42s cubic-bezier(.22,1,.36,1);}
#tgs-teaser.tgs-t-out{
  opacity:0;transform:translateY(8px) scale(.97);pointer-events:none;
  transition:opacity .26s cubic-bezier(.4,0,.2,1),transform .26s cubic-bezier(.4,0,.2,1);}
/* tail border (shadow layer) */
#tgs-teaser::before{
  content:'';position:absolute;bottom:-9px;right:24px;
  border-left:9px solid transparent;
  border-right:9px solid transparent;
  border-top:9px solid rgba(0,84,160,.14);}
/* tail fill (white layer) */
#tgs-teaser::after{
  content:'';position:absolute;bottom:-8px;right:25px;
  border-left:8px solid transparent;
  border-right:8px solid transparent;
  border-top:8px solid #fff;}
#tgs-teaser-content{
  flex:1;min-width:0;padding:14px 0 13px 14px;}
#tgs-teaser-title{
  font-size:13px;font-weight:700;color:#003B70;
  line-height:1.35;margin-bottom:3px;}
#tgs-teaser-sub{
  font-size:12px;font-weight:400;color:#667085;line-height:1.45;}
#tgs-teaser-close{
  background:none;border:none;cursor:pointer;
  color:#C4D0DC;font-size:12px;line-height:1;
  padding:10px 10px 0 0;flex-shrink:0;
  width:26px;display:flex;align-items:center;justify-content:center;
  transition:color .14s;}
#tgs-teaser-close:hover{color:#56718E;}

/* ─── LAUNCHER ───────────────────────────────────── */
#tgs-launcher{
  position:fixed!important;bottom:24px!important;right:28px!important;
  z-index:2147483647!important;
  width:66px!important;height:66px!important;border-radius:18px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  cursor:pointer!important;padding:0!important;outline:none!important;
  overflow:hidden!important;
  opacity:1!important;visibility:visible!important;pointer-events:auto!important;
  transition:background .32s ease,border-color .32s ease,box-shadow .32s ease,
             transform .28s cubic-bezier(.34,1.56,.64,1);
  animation:tgsLaunchIn .5s .1s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes tgsLaunchIn{from{opacity:0;transform:scale(.3);}to{opacity:1;transform:scale(1);}}
#tgs-launcher.tgs-launcher-dark-bg{
  background:linear-gradient(135deg,#005BAA 0%,#003B70 100%)!important;
  border:2px solid rgba(255,255,255,.72)!important;
  box-shadow:0 18px 42px rgba(0,43,84,.34)!important;}
#tgs-launcher.tgs-launcher-light-bg{
  background:rgba(255,255,255,.98)!important;
  border:2px solid #005BAA!important;
  box-shadow:0 18px 42px rgba(0,43,84,.22)!important;}
#tgs-launcher:hover{transform:scale(1.08)!important;}
#tgs-launcher:active{transform:scale(.93)!important;}
#tgs-launcher .tgs-li-wrap{position:relative;width:46px;height:46px;pointer-events:none;flex-shrink:0;}
#tgs-launcher .tgs-launcher-icon{
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:contain;display:block;pointer-events:none;
  transition:opacity .32s ease,transform .32s ease;}
#tgs-launcher .tgs-launcher-icon-white{opacity:0;transform:scale(.94);}
#tgs-launcher .tgs-launcher-icon-color{opacity:0;transform:scale(.94);}
#tgs-launcher.tgs-launcher-dark-bg .tgs-launcher-icon-white{opacity:1!important;transform:scale(1)!important;}
#tgs-launcher.tgs-launcher-dark-bg .tgs-launcher-icon-color{opacity:0!important;transform:scale(.94)!important;}
#tgs-launcher.tgs-launcher-light-bg .tgs-launcher-icon-white{opacity:0!important;transform:scale(.94)!important;}
#tgs-launcher.tgs-launcher-light-bg .tgs-launcher-icon-color{opacity:1!important;transform:scale(1)!important;}
#tgs-launcher .tgs-lx{display:none;pointer-events:none;}
#tgs-launcher::after{
  content:'';position:absolute;top:6px;right:6px;
  width:10px;height:10px;border-radius:50%;
  background:#22C55E;border:2px solid #fff;
  box-shadow:0 0 0 0 rgba(34,197,94,.45);
  animation:tgsStatusPulse 2.6s cubic-bezier(.4,0,.6,1) infinite;
  transition:opacity .2s,transform .2s;}
#tgs-launcher.open::after{opacity:0;transform:scale(0);animation:none;}
@keyframes tgsStatusPulse{
  0%{box-shadow:0 0 0 0 rgba(34,197,94,.40);}
  55%{box-shadow:0 0 0 5px rgba(34,197,94,0);}
  100%{box-shadow:0 0 0 0 rgba(34,197,94,0);}
}

/* ─── PANEL ──────────────────────────────────────── */
#tgs-panel{
  position:fixed!important;
  right:28px!important;bottom:120px!important;
  z-index:2147483646!important;
  width:520px;max-width:calc(100vw - 48px);
  height:680px;max-height:calc(100vh - 130px);
  border-radius:26px;overflow:hidden;
  background:#ffffff;
  box-shadow:0 28px 80px rgba(0,30,80,.30),0 6px 20px rgba(0,0,0,.08);
  display:flex;flex-direction:column;
  opacity:0;pointer-events:none;
  transform:translateY(22px) scale(.96);
  transition:opacity .22s cubic-bezier(.4,0,.2,1),transform .30s cubic-bezier(.34,1.56,.64,1);
  box-sizing:border-box;}
#tgs-panel.open{
  opacity:1!important;pointer-events:all!important;
  transform:translateY(0) scale(1)!important;}

/* ─── HEADER ─────────────────────────────────────── */
#tgs-hd{
  background:linear-gradient(135deg,#003B70 0%,#005BAA 100%);
  min-height:118px;padding:20px 68px 18px 22px;
  display:flex;align-items:center;gap:0;
  position:relative;overflow:hidden;
  border-bottom:2px solid #FFD23F;
  flex-shrink:0;}
.tgs-lines-wrap{
  position:absolute;right:0;bottom:0;
  width:225px;height:150px;
  pointer-events:none;z-index:1;}
.tgs-lines-img{
  position:absolute;inset:0;
  width:100%;height:100%;
  object-fit:contain;object-position:right bottom;
  opacity:.24;
  background:transparent!important;
  border:none!important;box-shadow:none!important;
  mix-blend-mode:screen;}
#tgs-hd-text{flex:1;min-width:0;position:relative;z-index:2;}
#tgs-hd-name{
  font-size:17px;font-weight:700;color:#fff;
  letter-spacing:-.02em;line-height:1.2;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
#tgs-hd-sub{
  font-size:12.5px;color:rgba(255,255,255,.62);margin-top:3px;line-height:1.15;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
#tgs-hd-label{
  font-size:10px;color:rgba(255,255,255,.34);margin-top:5px;
  text-transform:uppercase;letter-spacing:.08em;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
#tgs-hd-close{
  width:38px;height:38px;border-radius:12px;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.22);
  cursor:pointer!important;color:#fff;font-size:22px;
  display:flex;align-items:center;justify-content:center;
  z-index:10;position:absolute;top:17px;right:17px;
  line-height:1;padding:0;
  pointer-events:auto!important;
  transition:background .15s,color .15s;}
#tgs-hd-close:hover{background:rgba(255,255,255,.22);color:#fff;}
/* ─── HEADER MASKED SWEEP ────────────────────────── */
.tgs-lines-sweep{
  position:absolute;inset:0;
  pointer-events:none;
  overflow:hidden;
  -webkit-mask-image:url("${A('lineas-header.png')}");
  -webkit-mask-repeat:no-repeat;
  -webkit-mask-size:contain;
  -webkit-mask-position:right bottom;
  mask-image:url("${A('lineas-header.png')}");
  mask-repeat:no-repeat;
  mask-size:contain;
  mask-position:right bottom;}
.tgs-lines-sweep::before{
  content:'';
  position:absolute;
  left:0;right:0;
  top:-70%;
  height:55%;
  background:linear-gradient(180deg,
    rgba(255,255,255,0) 0%,
    rgba(210,235,255,.16) 34%,
    rgba(230,246,255,.66) 50%,
    rgba(150,210,255,.34) 62%,
    rgba(255,255,255,0) 100%);
  opacity:0;
  transform:translate3d(0,-20%,0);
  will-change:transform,opacity;
  backface-visibility:hidden;
  animation:tgsSmoothLineSweep 4.4s cubic-bezier(.45,0,.2,1) infinite;}
@keyframes tgsSmoothLineSweep{
  0%  {opacity:0;transform:translate3d(0,-20%,0);}
  18% {opacity:0;transform:translate3d(0,-20%,0);}
  30% {opacity:.68;}
  58% {opacity:.62;}
  72% {opacity:0;transform:translate3d(0,260%,0);}
  100%{opacity:0;transform:translate3d(0,260%,0);}
}

/* ─── BODY ───────────────────────────────────────── */
#tgs-body{
  flex:1;min-height:0;overflow-y:auto;
  padding:22px 22px 16px;
  display:flex;flex-direction:column;gap:14px;
  background:#fff;scroll-behavior:smooth;}
#tgs-body::-webkit-scrollbar{width:3px;}
#tgs-body::-webkit-scrollbar-track{background:transparent;}
#tgs-body::-webkit-scrollbar-thumb{background:rgba(0,59,112,.08);border-radius:2px;}

/* ─── MESSAGE ROWS ───────────────────────────────── */
.tgs-row{display:flex;gap:12px;animation:tgsIn .2s cubic-bezier(.4,0,.2,1);}
@keyframes tgsIn{from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:none;}}
.tgs-row.bot{align-items:flex-start;}
.tgs-row.usr{justify-content:flex-end;}

/* ─── AVATAR ─────────────────────────────────────── */
.tgs-av{
  width:42px;height:42px;border-radius:14px;
  background:#003B70;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;overflow:hidden;
  box-shadow:0 3px 12px rgba(0,59,112,.28);}
.tgs-av img{width:28px;height:28px;object-fit:contain;display:block;}

/* ─── BUBBLES ────────────────────────────────────── */
.tgs-bbl{
  padding:15px 16px;
  font-size:14px;line-height:1.6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
.tgs-row.bot .tgs-bbl{
  background:#F6F8FB;border:1px solid #DDE6F0;
  border-radius:20px 20px 20px 7px;
  color:#1F2933;max-width:390px;}
.tgs-row.usr .tgs-bbl{
  background:#005BAA;color:#fff;
  border-radius:20px 20px 7px 20px;
  max-width:78%;padding:14px 16px;
  margin-left:auto;
  font-size:14px;line-height:1.55;
  box-shadow:0 8px 22px rgba(0,91,170,.18);}

/* ─── TYPING ─────────────────────────────────────── */
.tgs-typing-bubble{
  display:inline-flex;align-items:center;gap:10px;
  padding:12px 16px;
  background:linear-gradient(180deg,#FFFFFF 0%,#F8FAFE 100%);
  border:1px solid rgba(0,91,170,.18);
  border-radius:20px 20px 20px 7px;
  box-shadow:0 12px 30px rgba(0,43,84,.10);
  flex-shrink:0;
  animation:tgsMsgEnter .3s cubic-bezier(.22,1,.36,1) both;}
.tgs-typing-label{
  font-size:13px;font-weight:700;color:#003B70;
  line-height:1.2;letter-spacing:-.01em;white-space:nowrap;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
.tgs-typing-dots{
  display:inline-flex;align-items:center;gap:5px;
  transform:translateY(1px);}
.tgs-typing-dot{
  width:6px;height:6px;border-radius:999px;
  background:rgba(0,91,170,.55);
  animation:tgsTypingDot 1.25s ease-in-out infinite;}
.tgs-typing-dot:nth-child(2){animation-delay:.16s;}
.tgs-typing-dot:nth-child(3){animation-delay:.32s;}
@keyframes tgsTypingDot{
  0%,80%,100%{opacity:.35;transform:translateY(0) scale(.9);}
  40%{opacity:1;transform:translateY(-3px) scale(1.08);}
}
/* ─── MESSAGE ENTRANCE ───────────────────────────── */
.tgs-msg-enter{
  animation:tgsMsgEnter .36s cubic-bezier(.22,1,.36,1) both;}
@keyframes tgsMsgEnter{
  from{opacity:0;transform:translateY(8px) scale(.985);}
  to{opacity:1;transform:translateY(0) scale(1);}
}
/* ─── OPTION ENTRANCE ────────────────────────────── */
.tgs-option-enter{
  animation:tgsOptionEnter .34s cubic-bezier(.22,1,.36,1) both;}
@keyframes tgsOptionEnter{
  from{opacity:0;transform:translateY(10px) scale(.98);}
  to{opacity:1;transform:translateY(0) scale(1);}
}

/* ─── CHIPS ROW ──────────────────────────────────── */
.tgs-chips{
  display:flex;flex-wrap:wrap;gap:8px;
  padding-left:54px;
  align-items:flex-start;justify-content:flex-start;
  animation:tgsIn .22s cubic-bezier(.4,0,.2,1);}

/* ─── CHIP BUTTON ────────────────────────────────── */
.tgs-chip{
  display:inline-flex;align-items:center;justify-content:center;
  width:auto;min-width:0;max-width:none;
  height:34px;padding:0 13px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:#005BAA;color:#fff;
  font-size:12.5px;font-weight:600;line-height:1;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  white-space:nowrap;cursor:pointer;
  box-shadow:0 6px 14px rgba(0,91,170,.18);
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease;
  flex-shrink:0;}
.tgs-chip:hover:not(:disabled){
  background:#004987;transform:translateY(-1px);
  box-shadow:0 10px 22px rgba(0,91,170,.26);}
.tgs-chip:active:not(:disabled){transform:none;opacity:.88;}
.tgs-chip:disabled{opacity:.32;cursor:not-allowed;}

/* primary — full width */
.tgs-chip.p{
  width:100%;height:42px;border-radius:12px;
  background:#005BAA;box-shadow:0 6px 16px rgba(0,91,170,.22);}
.tgs-chip.p:hover:not(:disabled){background:#004987;}

/* accent / confirm — yellow */
.tgs-chip.a{
  width:100%;height:42px;border-radius:12px;
  background:#FFD23F;color:#002B54;border-color:rgba(0,0,0,.06);
  box-shadow:0 5px 16px rgba(255,210,63,.32);}
.tgs-chip.a:hover:not(:disabled){background:#F5C800;box-shadow:0 8px 22px rgba(255,210,63,.42);}

/* danger */
.tgs-chip.d{
  width:100%;height:42px;border-radius:12px;
  background:#B91C1C;border-color:transparent;
  box-shadow:0 4px 12px rgba(185,28,28,.22);}
.tgs-chip.d:hover:not(:disabled){background:#991818;}

/* ghost */
.tgs-chip.g{
  background:transparent;color:#56718E;
  border:1.5px solid #C8D8E8;
  box-shadow:none;font-size:12px;}
.tgs-chip.g:hover:not(:disabled){background:#F0F6FC;border-color:#9AB4CC;color:#1A3A5C;}

/* full-width chip row */
.tgs-chips.fw{padding-left:0;flex-direction:column;}
.tgs-chips.fw .tgs-chip.g{width:100%;height:42px;border-radius:12px;}

/* ─── INPUT AREA ─────────────────────────────────── */
#tgs-inp-area{
  border-top:1px solid #E6ECF3;
  padding:14px 18px 10px;
  background:#fff;flex-shrink:0;display:block;}
.tgs-inp-row{display:flex;gap:10px;align-items:center;}
#tgs-inp{
  flex:1;height:46px;border-radius:12px;
  border:1.5px solid #D9E3EF;
  padding:0 18px;font-size:14px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  color:#1F2933;outline:none;background:#ffffff;
  transition:border-color .16s,box-shadow .16s,background .16s;}
#tgs-inp:focus{border-color:#005BAA;background:#fff;box-shadow:0 0 0 3px rgba(0,91,170,.09);}
#tgs-inp::placeholder{color:#B0C2D4;}
#tgs-snd{
  width:48px;height:48px;border-radius:14px;
  background:#FFD23F;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  box-shadow:0 4px 14px rgba(255,210,63,.38);
  transition:background .14s,transform .16s cubic-bezier(.34,1.56,.64,1),box-shadow .14s;}
#tgs-snd:hover:not(:disabled){background:#F5C800;transform:translateY(-2px) scale(1.04);
  box-shadow:0 10px 24px rgba(255,210,63,.44);}
#tgs-snd:active:not(:disabled){transform:scale(.94);}
#tgs-snd:disabled{opacity:.28;cursor:not-allowed;box-shadow:none;}

/* ─── FOOTER ─────────────────────────────────────── */
#tgs-footer{
  text-align:center;padding:5px 0 10px;margin-top:0;
  font-size:11px;color:#8FA3B4;flex-shrink:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  letter-spacing:.01em;}
#tgs-footer a{
  color:#005BAA;text-decoration:none;font-weight:600;
  position:relative;transition:color .14s;}
#tgs-footer a::after{
  content:'';position:absolute;left:0;bottom:-1px;
  width:100%;height:1px;background:#003B70;
  transform:scaleX(0);transform-origin:left center;
  transition:transform .22s cubic-bezier(.22,1,.36,1);}
#tgs-footer a:hover{color:#003B70;}
#tgs-footer a:hover::after{transform:scaleX(1);}

/* ─── BOOKING STAGE — premium clinical dashboard ── */
.tgs-book-stage{
  background:#fff;border-radius:12px;border:1px solid #BDD0E2;
  overflow:hidden;flex-shrink:0;
  box-shadow:0 1px 4px rgba(0,28,64,.06),0 6px 22px rgba(0,28,64,.10);
  animation:tgsMsgEnter .3s cubic-bezier(.22,1,.36,1) both;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
/* Header strip */
.tgs-bk-hd{
  background:linear-gradient(135deg,#001A34 0%,#003060 100%);
  padding:10px 14px 8px;}
.tgs-bk-hd-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
.tgs-bk-nav-btn{
  width:21px;height:21px;border-radius:4px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
  cursor:pointer;color:rgba(255,255,255,.82);
  font-size:13px;display:flex;align-items:center;justify-content:center;
  transition:background .13s,border-color .13s;line-height:1;}
.tgs-bk-nav-btn:hover:not(:disabled){background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.22);}
.tgs-bk-nav-btn:disabled{opacity:.15;cursor:not-allowed;}
/* Step indicator — precision bars */
.tgs-bk-dots{display:flex;gap:3px;align-items:center;}
.tgs-bk-dot{height:2px;border-radius:1px;transition:background .2s,width .2s;}
.tgs-bk-dot.done{background:rgba(255,210,63,.44);width:16px;}
.tgs-bk-dot.active{background:#FFD23F;width:22px;}
.tgs-bk-dot.todo{background:rgba(255,255,255,.12);width:16px;}
/* Header info */
.tgs-bk-hd-info{display:flex;flex-direction:column;gap:0;}
.tgs-bk-hd-sub{color:rgba(255,255,255,.36);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.10em;}
.tgs-bk-hd-main{color:#fff;font-size:12.5px;font-weight:700;letter-spacing:.01em;margin-top:2px;}
.tgs-bk-month{color:#fff;font-size:12.5px;font-weight:700;letter-spacing:.01em;}
/* Calendar body */
.tgs-bk-body{padding:10px 13px 5px;}
/* 5-col weekday grid */
.tgs-bk-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}
.tgs-bk-dow{
  font-size:8.5px;font-weight:700;color:#7090B0;text-align:center;
  padding:2px 0 5px;text-transform:uppercase;letter-spacing:.07em;}
/* Date cells — clean tabular premium */
.tgs-bk-day{
  border-radius:5px;border:1px solid rgba(0,50,100,.09);background:#fff;
  cursor:pointer;font-size:11.5px;font-weight:500;color:#1B3350;
  display:flex;align-items:center;justify-content:center;height:30px;
  transition:background .1s,border-color .1s,color .1s;}
.tgs-bk-day:hover:not(:disabled):not(.sel):not(.past):not(.blank){
  background:#EEF5FC;border-color:rgba(0,80,160,.20);color:#001E3C;}
.tgs-bk-day.today{
  background:#E4F2FF;border-color:rgba(0,80,160,.36);color:#00286A;font-weight:700;}
.tgs-bk-day.sel{
  background:#002C58;border-color:#002050;color:#fff;font-weight:700;
  box-shadow:0 2px 7px rgba(0,40,88,.22);}
.tgs-bk-day.past{
  background:transparent;border-color:rgba(0,50,100,.05);color:#CBD6DF;cursor:not-allowed;}
.tgs-bk-day.blank{
  background:transparent;border:none;cursor:default;pointer-events:none;}
.tgs-bk-day:disabled:not(.past){
  background:#F8FAFB;border-color:rgba(0,50,100,.06);color:#C2CDD6;cursor:not-allowed;}
/* Time slots area — NO scrollbar, 3 cols, no clip */
.tgs-bk-slots-area{padding:8px 13px 4px;overflow:hidden;}
.tgs-bk-slot-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:4px;width:100%;box-sizing:border-box;}
.tgs-bk-slot{
  height:28px;border-radius:5px;border:1px solid rgba(0,50,100,.09);
  background:#fff;font-size:11px;font-weight:600;color:#1B3350;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .1s,border-color .1s,color .1s;
  white-space:nowrap;overflow:hidden;}
.tgs-bk-slot:hover:not(.sel){background:#EEF5FC;border-color:rgba(0,80,160,.20);color:#001E3C;}
.tgs-bk-slot.sel{
  background:#002C58;border-color:#002050;color:#fff;
  box-shadow:0 1px 5px rgba(0,40,88,.20);}
.tgs-bk-slot-msg{
  padding:12px 8px;text-align:center;font-size:12px;color:#8FA5B8;font-style:italic;}
/* Footer — shared across all steps */
.tgs-bk-footer{
  padding:7px 13px 10px;display:flex;flex-direction:column;gap:5px;
  border-top:1px solid rgba(0,50,100,.07);}
.tgs-bk-footer-row{display:flex;gap:5px;}
/* Buttons */
.tgs-bk-btn{
  flex:1;height:34px;border-radius:7px;border:none;cursor:pointer;
  font-size:12px;font-weight:600;
  display:flex;align-items:center;justify-content:center;
  transition:background .12s,box-shadow .12s,opacity .12s;}
.tgs-bk-btn.pri{
  background:#FFD23F;color:#1A1800;
  box-shadow:0 2px 10px rgba(255,210,63,.24);}
.tgs-bk-btn.pri:hover:not(:disabled){background:#F5C800;box-shadow:0 4px 14px rgba(255,210,63,.34);}
.tgs-bk-btn.pri:active:not(:disabled){background:#E8B800;}
.tgs-bk-btn.pri:disabled{opacity:.28;cursor:not-allowed;box-shadow:none;}
.tgs-bk-btn.sec{
  background:#F0F5FA;color:#2C4560;
  border:1px solid rgba(0,50,100,.14);}
.tgs-bk-btn.sec:hover:not(:disabled){background:#E4EFF8;border-color:rgba(0,80,160,.24);color:#162D42;}
.tgs-bk-btn.sec:active:not(:disabled){background:#D8E9F4;}
/* Confirmation data table */
.tgs-bk-conf-body{padding:9px 13px 3px;}
.tgs-bk-conf-row{
  display:flex;justify-content:space-between;align-items:baseline;
  gap:10px;padding:5px 0;font-size:12.5px;
  border-bottom:1px solid rgba(0,50,100,.05);}
.tgs-bk-conf-row:last-child{border-bottom:none;}
.tgs-bk-sec-lbl{color:#5A7898;font-weight:500;white-space:nowrap;flex-shrink:0;font-size:11.5px;}
.tgs-bk-sec-val{color:#0C1D2E;font-weight:700;text-align:right;word-break:break-word;font-size:12.5px;}
.tgs-bk-conf-sep{border:none;height:1px;background:rgba(0,50,100,.08);margin:4px 0;}
.tgs-bk-conf-footer{
  padding:7px 13px 10px;display:flex;flex-direction:column;gap:5px;
  border-top:1px solid rgba(0,50,100,.07);}
.tgs-bk-conf-sec-row{display:flex;gap:5px;}
/* ─── CONFIRM CARD DIVIDER (kept for info cards) ─── */
.tgs-cr-sep{border:none;border-top:1px solid #E6EDF4;margin:5px 0;}

/* ─── INFO CARDS ─────────────────────────────────── */
.tgs-cc{background:#F2F8FF;border:1px solid #D0E4F4;border-radius:13px;
  padding:12px 16px;animation:tgsIn .2s ease;}
.tgs-cr{display:flex;justify-content:space-between;align-items:baseline;
  font-size:13px;padding:3px 0;gap:10px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
.tgs-cl{color:#56718E;font-weight:500;flex-shrink:0;}
.tgs-cv{color:#1A2636;font-weight:600;text-align:right;}
.tgs-ac{background:#F2F8FF;border:1px solid #D0E4F4;border-left:3px solid #003B70;
  border-radius:0 13px 13px 0;padding:12px 16px;animation:tgsIn .2s ease;}
.tgs-ar{display:flex;gap:10px;font-size:13px;padding:3px 0;color:#1A2636;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
.tgs-al{color:#56718E;font-weight:500;min-width:68px;flex-shrink:0;}
.tgs-avc{font-weight:500;word-break:break-word;}

/* ─── RESPONSIVE ─────────────────────────────────── */
@media(max-width:640px){
  #tgs-panel{
    width:calc(100vw - 24px)!important;
    height:calc(100vh - 120px)!important;
    right:12px!important;bottom:84px!important;
    max-height:none!important;}
  .tgs-chips{padding-left:0;}
  .tgs-row.bot .tgs-bbl{max-width:calc(100vw - 120px);}
}
`;

  /* ── MONTHS / DAYS ───────────────────────────────────────────── */
  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const DOWS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  /* ── PURE HELPERS ────────────────────────────────────────────── */
  const pad    = n => String(n).padStart(2,'0');
  const nowStr = () => { const d=new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); };
  const esc    = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function getBerlinOffset(y,m,d){
    const ls=(yr,mi)=>{const ld=new Date(Date.UTC(yr,mi+1,0));return ld.getUTCDate()-ld.getUTCDay();};
    let dst=false;
    if(m>3&&m<10)dst=true;
    else if(m===3)dst=d>=ls(y,2);
    else if(m===10)dst=d<ls(y,9);
    return dst?'+02:00':'+01:00';
  }
  const toRFC = (date,time) => {
    const[y,mo,d]=date.split('-').map(Number);
    const[h,mi]=time.split(':').map(Number);
    return `${date}T${pad(h)}:${pad(mi)}:00${getBerlinOffset(y,mo,d)}`;
  };
  const fmtDate = ds => {
    const[y,m,d]=ds.split('-').map(Number);
    const wd=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'][new Date(Date.UTC(y,m-1,d)).getUTCDay()];
    return `${wd}, ${pad(d)}.${pad(m)}.${y}`;
  };

  async function apiPost(url,body){
    const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const t=await r.text();
    try{return JSON.parse(t);}catch{return {};}
  }

  function normalizeSlots(raw){
    if(!raw)return[];
    const arr=Array.isArray(raw)?raw:Array.isArray(raw.slots)?raw.slots:Array.isArray(raw.availableSlots)?raw.availableSlots:Array.isArray(raw.times)?raw.times:Array.isArray(raw.available_times)?raw.available_times:[];
    return arr.map(s=>typeof s==='string'?s.slice(0,5):(s.time||s.start||'').slice(0,5)).filter(s=>/^\d{2}:\d{2}$/.test(s));
  }

  function normalizeAppt(raw){
    if(!raw)return null;
    const arr=Array.isArray(raw)?raw:null;
    const o=arr?(arr[0]||null):(raw.appointment||raw.appointments?.[0]||raw);
    if(!o||typeof o!=='object')return null;
    const vn=o.vorname||o.Vorname||'',nn=o.nachname||o.Nachname||'';
    return {
      event_id:  o.event_id||o.eventId||o['Google Kalender Termin-ID']||'',
      email:     o.email||o['E-Mail']||'',
      vorname:vn, nachname:nn,
      name:o.name||o['Vollständiger Name']||`${vn} ${nn}`.trim()||'Unbekannt',
      unternehmen:o.unternehmen||o.Unternehmen||'',
      interesse:  o.interesse||o.Interesse||'',
      termin:o.termin_formatted||o.terminDatumZeit||`${o['Termin-Datum']||''} ${o['Termin-Uhrzeit']||''}`.trim()||'',
      besprechungslink:o.besprechungslink||o.hangoutLink||o.meeting_link||'',
    };
  }

  /* ── DOM REFS ────────────────────────────────────────────────── */
  let $body, $chipsEl, $typWrap, $inpArea, $inp, $snd;
  let teaser, launcher, panel;

  /* ── TEASER SCHEDULER ───────────────────────────────────────── */
  const TGS_MSGS=[
    {title:'Unterstützung bei Ihrem Projekt?',            sub:'Ich bin bereit.'},
    {title:'Fragen zu IVD, CDx oder Pharma?',             sub:'Ich unterstütze Sie direkt.'},
    {title:'Termin buchen oder verschieben?',              sub:'Ich helfe Ihnen sofort weiter.'},
    {title:'Studie, Probenmanagement oder Biostatistik?', sub:'Stellen Sie Ihre Frage.'},
    {title:'Projektanfrage vorbereiten?',                 sub:'Ich begleite Sie Schritt für Schritt.'},
  ];
  let _tIdx=0, _tTimer=null, _tShowing=false;

  function _tgsTeaseApply(msg){
    const t=teaser&&teaser.querySelector('#tgs-teaser-title');
    const s=teaser&&teaser.querySelector('#tgs-teaser-sub');
    if(t) t.textContent=msg.title;
    if(s) s.textContent=msg.sub;
  }
  function _tgsTeaseShow(){
    if(S.open||_tShowing||!teaser) return;
    _tgsTeaseApply(TGS_MSGS[_tIdx]);
    teaser.classList.remove('tgs-hidden','tgs-t-out');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      teaser.classList.add('tgs-t-in');
      _tShowing=true;
      _tTimer=setTimeout(_tgsTeaseAutoHide, 8000);
    }));
  }
  function _tgsTeaseOut(cb){
    teaser.classList.remove('tgs-t-in');
    teaser.classList.add('tgs-t-out');
    _tShowing=false;
    setTimeout(()=>{
      teaser.classList.add('tgs-hidden');
      teaser.classList.remove('tgs-t-out');
      if(cb) cb();
    }, 280);
  }
  function _tgsTeaseAutoHide(){
    if(!_tShowing) return;
    _tgsTeaseOut(()=>{
      _tIdx=(_tIdx+1)%TGS_MSGS.length;
      _tTimer=setTimeout(_tgsTeaseShow, 50000);
    });
  }
  function _tgsTeaseManualClose(){
    clearTimeout(_tTimer);
    if(_tShowing){
      _tgsTeaseOut(()=>{
        _tIdx=(_tIdx+1)%TGS_MSGS.length;
        _tTimer=setTimeout(_tgsTeaseShow, 120000);
      });
    }else{
      _tTimer=setTimeout(_tgsTeaseShow, 120000);
    }
  }
  function _tgsTeaseHideNow(){
    clearTimeout(_tTimer); _tTimer=null;
    if(_tShowing&&teaser){
      teaser.classList.remove('tgs-t-in','tgs-t-out');
      teaser.classList.add('tgs-hidden');
      _tShowing=false;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════════ */
  function boot(){
    ['tgs-launcher','tgs-panel','tgs-style','tgs-teaser'].forEach(id=>{
      const el=document.getElementById(id); if(el)el.remove();
    });

    const st=document.createElement('style');
    st.id='tgs-style'; st.textContent=CSS;
    document.head.appendChild(st);

    S.open=false; S.flow=null; S.data={}; S.appointment=null; S.busy=false;

    /* teaser */
    clearTimeout(_tTimer); _tTimer=null; _tShowing=false; _tIdx=0;
    teaser=document.createElement('div');
    teaser.id='tgs-teaser';
    teaser.innerHTML=`
<div id="tgs-teaser-content">
  <div id="tgs-teaser-title"></div>
  <div id="tgs-teaser-sub"></div>
</div>
<button id="tgs-teaser-close" aria-label="Schließen">&#x2715;</button>`;
    teaser.classList.add('tgs-hidden');
    document.body.appendChild(teaser);
    teaser.querySelector('#tgs-teaser-close').addEventListener('click',e=>{
      e.stopPropagation(); _tgsTeaseManualClose();
    });
    _tTimer=setTimeout(_tgsTeaseShow, 3000);

    /* launcher */
    launcher=document.createElement('button');
    launcher.id='tgs-launcher';
    launcher.setAttribute('aria-label','TRIGA-S Assistenz öffnen');
    const liWrap=document.createElement('div'); liWrap.className='tgs-li-wrap';
    const liW=document.createElement('img');
    liW.className='tgs-launcher-icon tgs-launcher-icon-white'; liW.alt='';
    liW.src=A('triga-s-mark-white.png');
    const liC=document.createElement('img');
    liC.className='tgs-launcher-icon tgs-launcher-icon-color'; liC.alt='TRIGA-S';
    liC.src=A('triga-s-mark-color.png');
    liWrap.appendChild(liW); liWrap.appendChild(liC);
    const lx=document.createElement('span'); lx.className='tgs-lx'; lx.textContent='×';
    launcher.appendChild(liWrap); launcher.appendChild(lx);
    document.body.appendChild(launcher);
    launcher.addEventListener('click',()=>S.open?closePanel():openPanel());

    /* ── adaptive icon: ONE theme system, inline-style enforced ── */
    function setLauncherTheme(isLight){
      if(!launcher) return;
      const whiteIcon=launcher.querySelector('.tgs-launcher-icon-white');
      const colorIcon=launcher.querySelector('.tgs-launcher-icon-color');
      launcher.classList.toggle('tgs-launcher-light-bg', isLight);
      launcher.classList.toggle('tgs-launcher-dark-bg', !isLight);
      launcher.style.display='flex';
      launcher.style.opacity='1';
      launcher.style.visibility='visible';
      launcher.style.pointerEvents='auto';
      if(isLight){
        launcher.style.background='rgba(255,255,255,0.98)';
        launcher.style.border='2px solid #005BAA';
        launcher.style.boxShadow='0 18px 42px rgba(0,43,84,0.22)';
        if(whiteIcon){whiteIcon.style.opacity='0';whiteIcon.style.transform='scale(.94)';}
        if(colorIcon){colorIcon.style.opacity='1';colorIcon.style.transform='scale(1)';}
      }else{
        launcher.style.background='linear-gradient(135deg,#005BAA 0%,#003B70 100%)';
        launcher.style.border='2px solid rgba(255,255,255,0.75)';
        launcher.style.boxShadow='0 18px 42px rgba(0,43,84,0.34)';
        if(whiteIcon){whiteIcon.style.opacity='1';whiteIcon.style.transform='scale(1)';}
        if(colorIcon){colorIcon.style.opacity='0';colorIcon.style.transform='scale(.94)';}
      }
      launcher.dataset.theme=isLight?'light':'dark';
    }
    function findSmallestElWithText(text){
      return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div,section'))
        .filter(n=>{
          if(n===document.body||n===document.documentElement) return false;
          return (n.textContent||'').replace(/\s+/g,' ').trim().includes(text);
        })
        .sort((a,b)=>{
          const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
          return (ar.width*ar.height)-(br.width*br.height);
        })[0]||null;
    }
    function findStatsSection(){
      const textEl=findSmallestElWithText('Unsere Erfahrung in Zahlen');
      if(!textEl) return null;
      let el=textEl;
      while(el&&el!==document.body){
        const rect=el.getBoundingClientRect();
        const content=(el.textContent||'').replace(/\s+/g,' ').trim();
        const hasStats=content.includes('Unsere Erfahrung in Zahlen')&&
          (content.includes('500')||content.includes('120')||content.includes('2,5 Mio')||content.includes('18+'));
        if(hasStats&&rect.width>window.innerWidth*0.7&&rect.height>120) return el;
        el=el.parentElement;
      }
      return textEl.closest('section')||textEl.parentElement;
    }
    function updateLauncherTheme(){
      if(!launcher) return;
      const statsSection=findStatsSection();
      if(!statsSection){setLauncherTheme(false);return;}
      const launcherRect=launcher.getBoundingClientRect();
      const launcherCenterY=launcherRect.top+launcherRect.height/2;
      const statsRect=statsSection.getBoundingClientRect();
      const blueWhiteBoundaryY=statsRect.bottom;
      const isLight=launcherCenterY>=blueWhiteBoundaryY;
      setLauncherTheme(isLight);
      console.log('[TRIGA-S launcher theme]',{isLight,launcherCenterY,blueWhiteBoundaryY,statsTop:statsRect.top,statsBottom:statsRect.bottom,theme:launcher.dataset.theme});
    }
    let launcherThemeRAF=null;
    function scheduleLauncherThemeUpdate(){
      if(launcherThemeRAF) return;
      launcherThemeRAF=requestAnimationFrame(()=>{launcherThemeRAF=null;updateLauncherTheme();});
    }
    window.addEventListener('scroll',scheduleLauncherThemeUpdate,{passive:true});
    window.addEventListener('resize',scheduleLauncherThemeUpdate);
    setLauncherTheme(false);
    updateLauncherTheme();
    setTimeout(updateLauncherTheme,100);
    setTimeout(updateLauncherTheme,500);
    setTimeout(updateLauncherTheme,1000);
    setTimeout(updateLauncherTheme,2000);

    /* panel */
    panel=document.createElement('div');
    panel.id='tgs-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','TRIGA-S Assistenz');
    panel.innerHTML=`
<div id="tgs-hd">
  <div class="tgs-lines-wrap" aria-hidden="true">
    <img class="tgs-lines-img" src="${A('lineas-header.png')}" alt="">
    <div class="tgs-lines-sweep"></div>
  </div>
  <div id="tgs-hd-text">
    <div id="tgs-hd-name">TRIGA-S Assistenz</div>
    <div id="tgs-hd-sub">Studies. Services. Solutions.</div>
    <div id="tgs-hd-label">Digitale Projektassistenz</div>
  </div>
  <button id="tgs-hd-close" aria-label="Schließen">×</button>
</div>
<div id="tgs-body"></div>
<div id="tgs-inp-area">
  <div class="tgs-inp-row">
    <input id="tgs-inp" type="text" autocomplete="off" placeholder="Wie können wir Sie unterstützen?" aria-label="Nachricht an TRIGA-S schreiben">
    <button id="tgs-snd" aria-label="Senden">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style="pointer-events:none;display:block;flex-shrink:0">
        <path fill="#005BAA" d="M22 2L2 9L11 13Z"/>
        <path fill="#003B70" d="M22 2L11 13L15 22Z"/>
      </svg>
    </button>
  </div>
</div>
<div id="tgs-footer">Crafted by <a href="https://www.afa-ai.com/" target="_blank" rel="noopener noreferrer">AFA</a></div>`;
    document.body.appendChild(panel);

    $body    = panel.querySelector('#tgs-body');
    $inpArea = panel.querySelector('#tgs-inp-area');
    $inp     = panel.querySelector('#tgs-inp');
    $snd     = panel.querySelector('#tgs-snd');

    panel.querySelector('#tgs-hd-close').addEventListener('click', closePanel);

    resetCal();
    window.TrigaSChatbot = { open:openPanel, close:closePanel };
    const cta=document.getElementById('open-chat-btn');
    if(cta){ cta.removeEventListener('click',openPanel); cta.addEventListener('click',openPanel); }
  }

  /* ── OPEN / CLOSE ────────────────────────────────────────────── */
  function openPanel(){
    S.open=true;
    panel.classList.add('open');
    launcher.classList.add('open');
    _tgsTeaseHideNow();
    if(!$body.children.length) showMenu();
  }
  function closePanel(){
    S.open=false;
    panel.classList.remove('open');
    launcher.classList.remove('open');
    clearTimeout(_tTimer);
    _tTimer=setTimeout(_tgsTeaseShow, 20000);
  }

  /* ── RENDER HELPERS ──────────────────────────────────────────── */
  const scroll = () => { $body.scrollTop=$body.scrollHeight; };

  function bot(text, isHtml){
    const row=document.createElement('div'); row.className='tgs-row bot tgs-msg-enter';
    const av=document.createElement('div'); av.className='tgs-av';
    const ai=document.createElement('img');
    ai.src=A('triga-s-mark-white.png'); ai.alt='';
    ai.onerror=function(){ this.style.display='none'; };
    av.appendChild(ai);
    const bbl=document.createElement('div'); bbl.className='tgs-bbl';
    if(isHtml) bbl.innerHTML=text; else bbl.textContent=text;
    row.appendChild(av); row.appendChild(bbl);
    $body.appendChild(row); scroll();
    return row;
  }

  function usr(text){
    clearChips(); hideInp();
    const row=document.createElement('div'); row.className='tgs-row usr';
    const bbl=document.createElement('div'); bbl.className='tgs-bbl';
    bbl.textContent=text;
    row.appendChild(bbl);
    $body.appendChild(row); scroll();
    return row;
  }

  function showTyping(){
    const row=document.createElement('div'); row.className='tgs-row bot';
    const av=document.createElement('div'); av.className='tgs-av';
    const ai=document.createElement('img'); ai.src=A('triga-s-mark-white.png'); ai.alt=''; av.appendChild(ai);
    const typ=document.createElement('div'); typ.className='tgs-typing-bubble';
    typ.innerHTML='<span class="tgs-typing-label">TRIGA-S schreibt</span><span class="tgs-typing-dots"><span class="tgs-typing-dot"></span><span class="tgs-typing-dot"></span><span class="tgs-typing-dot"></span></span>';
    row.appendChild(av); row.appendChild(typ);
    $body.appendChild(row); scroll();
    $typWrap=row;
  }
  function hideTyping(){ if($typWrap){ $typWrap.remove(); $typWrap=null; } }

  function clearChips(){ if($chipsEl){ $chipsEl.remove(); $chipsEl=null; } }

  function acts(items, fullWidth){
    clearChips();
    $chipsEl=document.createElement('div');
    $chipsEl.className='tgs-chips'+(fullWidth?' fw':'');
    items.forEach((it,idx)=>{
      const b=document.createElement('button');
      b.className='tgs-chip tgs-option-enter'+(it.cls?' '+it.cls:'');
      b.textContent=it.label;
      b.style.animationDelay=`${idx*70}ms`;
      if(it.disabled) b.disabled=true;
      b.addEventListener('click',()=>{
        if(S.busy) return;
        clearChips();
        it.fn();
      });
      $chipsEl.appendChild(b);
    });
    $body.appendChild($chipsEl); scroll();
  }

  function appendEl(el){ $body.appendChild(el); scroll(); return el; }

  function inp(placeholder, onSubmit, type){
    clearChips();
    $inp.placeholder=placeholder||'Ihre Antwort…';
    $inp.value=''; $inp.type=type||'text';
    setTimeout(()=>$inp.focus(),50);
    const go=()=>{
      const v=$inp.value.trim(); if(!v) return;
      usr(v); onSubmit(v);
    };
    $snd.onclick=go;
    $inp.onkeydown=e=>{ if(e.key==='Enter') go(); };
    scroll();
  }

  function inpOpt(placeholder, onSubmit){
    clearChips();
    $inp.placeholder=placeholder||'Optional – Enter zum Überspringen';
    $inp.value=''; $inp.type='text';
    setTimeout(()=>$inp.focus(),50);
    const go=v=>{ usr(v||'(Überspringen)'); hideInp(); onSubmit(v||''); };
    $snd.onclick=()=>go($inp.value.trim());
    $inp.onkeydown=e=>{ if(e.key==='Enter') go($inp.value.trim()); };
    $chipsEl=document.createElement('div'); $chipsEl.className='tgs-chips';
    const sk=document.createElement('button'); sk.className='tgs-chip g'; sk.textContent='Überspringen';
    sk.addEventListener('click',()=>{ clearChips(); go(''); });
    $chipsEl.appendChild(sk); $body.appendChild($chipsEl); scroll();
  }

  function hideInp(){
    $inp.value='';
    $inp.placeholder='Wie können wir Sie unterstützen?';
    $snd.onclick=null; $inp.onkeydown=null;
  }

  function busy(v){
    S.busy=v;
    $body.querySelectorAll('.tgs-chip').forEach(b=>b.disabled=v);
    $snd.disabled=v;
  }

  /* ═══════════════════════════════════════════════════════════
     MENUS
     ═══════════════════════════════════════════════════════════ */
  function showMenu(){
    S.flow=null; S.data={}; S.appointment=null; resetCal(); hideInp(); clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Willkommen bei TRIGA-S. Ich unterstütze Sie bei IVD-Studien, CDx-/Pharma-Projekten, Probenmanagement, Biostatistik und Projektanfragen. Wie kann ich Ihnen helfen?');
      const fallback=()=>{
        const v=$inp.value.trim(); if(!v) return;
        usr(v); showTyping();
        setTimeout(()=>{ hideTyping(); bot('Bitte wählen Sie eine der oben angezeigten Optionen oder starten Sie eine neue Anfrage.'); showMenu(); }, 1050);
      };
      $snd.onclick=fallback;
      $inp.onkeydown=e=>{ if(e.key==='Enter') fallback(); };
      acts([
        {label:'IVD-Studie',        fn:()=>leadStart('Projektberatung','Leistungsstudien (IVDR)')},
        {label:'CDx / Pharma',      fn:()=>leadStart('Projektberatung','CDx / Pharma Services')},
        {label:'Probenmanagement',  fn:()=>leadStart('Projektberatung','Probenmanagement')},
        {label:'Biostatistik',      fn:()=>leadStart('Projektberatung','Biostatistik & Evidenz')},
        {label:'Service-Beratung',  fn:()=>serviceBeratungMenu()},
        {label:'Allgemeine Frage',  fn:()=>leadStart('Frage')},
        {label:'Termin verwalten',  fn:()=>terminVerwaltenMenu()},
      ]);
    }, 1300);
  }

  function serviceBeratungMenu(){
    usr('Service-Beratung');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Möchten Sie direkt einen Termin verwalten oder eine Projektanfrage stellen?');
      acts([
        {label:'Termin buchen',      fn:()=>bookStart()},
        {label:'Termin verschieben', fn:()=>findStart('reschedule')},
        {label:'Termin stornieren',  fn:()=>findStart('cancel')},
        {label:'Projektanfrage',     fn:()=>leadStart('Projektberatung','Sonstiges')},
      ]);
    }, 1050);
  }

  function terminVerwaltenMenu(){
    usr('Termin verwalten');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Gerne. Was möchten Sie mit Ihrem Termin tun?');
      acts([
        {label:'Termin vereinbaren', fn:()=>bookStart()},
        {label:'Termin verschieben', fn:()=>findStart('reschedule')},
        {label:'Termin stornieren',  fn:()=>findStart('cancel')},
        {label:'Zurück',             cls:'g', fn:()=>showMenu()},
      ]);
    }, 1050);
  }

  function goBack(){
    hideInp(); clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Kann ich Ihnen noch anderweitig helfen?');
      acts([{label:'Zum Hauptmenü', cls:'g', fn:showMenu}]);
    }, 1050);
  }

  /* ═══════════════════════════════════════════════════════════
     LEAD FLOW
     ═══════════════════════════════════════════════════════════ */
  function leadStart(type, interesse){
    S.flow='lead';
    S.data={_type:type, interesse:interesse||(type==='Projektberatung'?'Projektberatung':'')};
    usr(interesse||(type==='Projektberatung'?'Projektberatung anfragen':'Allgemeine Frage'));
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot(type==='Projektberatung'
        ?'Gerne. Ich erfasse kurz Ihre Kontaktdaten und leite Ihre Anfrage an das TRIGA-S Team weiter.'
        :'Gerne helfe ich Ihnen weiter. Zunächst benötige ich einige kurze Angaben.');
      leadStep(0);
    }, 1050);
  }

  const LEAD_Q=[
    {k:'vorname',     q:'Wie lautet Ihr Vorname?',               ph:'Vorname'},
    {k:'nachname',    q:'Und Ihr Nachname?',                     ph:'Nachname'},
    {k:'email',       q:'Ihre geschäftliche E-Mail-Adresse?',    ph:'name@firma.de', t:'email'},
    {k:'unternehmen', q:'Für welches Unternehmen arbeiten Sie?', ph:'Firmenname'},
  ];

  function leadStep(i){
    if(i>=LEAD_Q.length){
      showTyping();
      setTimeout(()=>{ hideTyping(); bot('Ihre Telefonnummer (optional):'); inpOpt('+49 89 …', v=>{ S.data.telefon=v; leadInteresse(); }); }, 1050);
      return;
    }
    const q=LEAD_Q[i];
    showTyping();
    setTimeout(()=>{ hideTyping(); bot(q.q); inp(q.ph, v=>{ S.data[q.k]=v; leadStep(i+1); }, q.t); }, 1050);
  }

  function leadInteresse(){
    if(S.data.interesse && S.data._type!=='Frage'){ leadMsg(); return; }
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Zu welchem Bereich haben Sie eine Anfrage?');
      const opts=['Leistungsstudien (IVDR)','CDx / Pharma Services','Biostatistik & Evidenz','Probenmanagement','Sonstiges'];
      acts(opts.map(o=>({label:o, fn:()=>{ usr(o); S.data.interesse=o; leadMsg(); }})));
    }, 1050);
  }

  function leadMsg(){
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot(S.data._type==='Frage'?'Was ist Ihre Frage?':'Beschreiben Sie kurz Ihr Anliegen (optional):');
      inpOpt('Ihre Nachricht…', v=>{ S.data.message=v; S.data.notizen=v; leadSubmit(); });
    }, 1050);
  }

  async function leadSubmit(){
    busy(true); clearChips(); hideInp(); showTyping();
    try{
      await apiPost(WH.LEAD,{
        vorname:S.data.vorname||'', nachname:S.data.nachname||'',
        name:`${S.data.vorname||''} ${S.data.nachname||''}`.trim(),
        email:S.data.email||'', telefon:S.data.telefon||'',
        unternehmen:S.data.unternehmen||'', interesse:S.data.interesse||'',
        message:S.data.message||'', notizen:S.data.notizen||'',
        source:'TRIGA-S Chatbot',
      });
      hideTyping();
      bot('Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Das TRIGA-S Team meldet sich in der Regel innerhalb von 48 Stunden bei Ihnen.');
    }catch(e){
      hideTyping(); console.error('[TGS Lead]',e);
      bot('Vielen Dank! Ihre Anfrage wurde entgegengenommen. Das TRIGA-S Team wird sich zeitnah bei Ihnen melden.');
    }
    busy(false); setTimeout(goBack, 600);
  }

  /* ═══════════════════════════════════════════════════════════
     BOOKING FLOW
     ═══════════════════════════════════════════════════════════ */
  function bookStart(){
    S.flow='booking'; S.data={}; resetCal();
    usr('Termin buchen');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Ich helfe Ihnen gerne einen Beratungstermin zu buchen. Zunächst einige kurze Angaben.');
      bookStep(0);
    }, 1050);
  }

  const BOOK_Q=[
    {k:'vorname',     q:'Wie lautet Ihr Vorname?',               ph:'Vorname'},
    {k:'nachname',    q:'Und Ihr Nachname?',                     ph:'Nachname'},
    {k:'email',       q:'Ihre geschäftliche E-Mail-Adresse?',    ph:'name@firma.de', t:'email'},
    {k:'unternehmen', q:'Für welches Unternehmen arbeiten Sie?', ph:'Firmenname'},
  ];

  function bookStep(i){
    if(i>=BOOK_Q.length){
      showTyping();
      setTimeout(()=>{ hideTyping(); bot('Ihre Telefonnummer (optional):'); inpOpt('+49 89 …', v=>{ S.data.telefon=v; bookInteresse(); }); }, 1050);
      return;
    }
    const q=BOOK_Q[i];
    showTyping();
    setTimeout(()=>{ hideTyping(); bot(q.q); inp(q.ph, v=>{ S.data[q.k]=v; bookStep(i+1); }, q.t); }, 1050);
  }

  function bookInteresse(){
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Zu welchem Thema möchten Sie sich beraten lassen?');
      const opts=['Leistungsstudien (IVDR)','CDx / Pharma Services','Biostatistik & Evidenz','Probenmanagement','Sonstiges'];
      acts(opts.map(o=>({label:o, fn:()=>{ usr(o); S.data.interesse=o; bookCalendar(); }})));
    }, 1050);
  }

  function bookCalendar(){
    clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Wir prüfen verfügbare Termine für Sie …');
      setTimeout(()=>{
        bot('Wählen Sie Ihren Wunschtermin:');
        paintDateStep('booking');
      }, 650);
    }, 1050);
  }

  /* ═══════════════════════════════════════════════════════════
     FIND FLOW
     ═══════════════════════════════════════════════════════════ */
  function findStart(next){
    S.flow='find'; S.data={_next:next}; S.appointment=null;
    usr(next==='reschedule'?'Termin verschieben':'Termin stornieren');
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Bitte geben Sie die E-Mail-Adresse ein, mit der der Termin gebucht wurde.');
      inp('ihre@email.de', async v=>{
        S.data.email=v; busy(true); showTyping();
        try{
          const res=await apiPost(WH.FIND,{email:v, source:'TRIGA-S Chatbot'});
          hideTyping();
          const a=normalizeAppt(res);
          if(!a||!a.event_id){
            bot('Ich konnte keinen Termin zu dieser E-Mail-Adresse finden. Bitte überprüfen Sie die Adresse.');
            busy(false); setTimeout(goBack,400); return;
          }
          S.appointment=a; busy(false); showFoundAppt(next);
        }catch(e){
          hideTyping(); console.error('[TGS Find]',e);
          bot('Bei der Suche ist ein Fehler aufgetreten. Bitte wenden Sie sich direkt an das TRIGA-S Team.');
          busy(false); setTimeout(goBack,400);
        }
      },'email');
    }, 1050);
  }

  function showFoundAppt(next){
    const a=S.appointment;
    showTyping();
    setTimeout(()=>{
    hideTyping();
    bot('Ich habe folgenden Termin gefunden:');
    const card=document.createElement('div'); card.className='tgs-ac';
    card.innerHTML=`
<div class="tgs-ar"><span class="tgs-al">Name</span><span class="tgs-avc">${esc(a.name)}</span></div>
<div class="tgs-ar"><span class="tgs-al">Termin</span><span class="tgs-avc">${esc(a.termin||'Nicht angegeben')}</span></div>
<div class="tgs-ar"><span class="tgs-al">Thema</span><span class="tgs-avc">${esc(a.interesse||'–')}</span></div>
<div class="tgs-ar"><span class="tgs-al">Firma</span><span class="tgs-avc">${esc(a.unternehmen||'–')}</span></div>`;
    appendEl(card);
    if(next==='reschedule'){
      acts([
        {label:'Termin verschieben', cls:'p', fn:()=>reschedStart()},
        {label:'Zurück',             cls:'g', fn:showMenu},
      ], true);
    }else{
      bot('Möchten Sie diesen Termin wirklich stornieren?');
      acts([
        {label:'Ja, stornieren', cls:'d', fn:()=>cancelConfirm()},
        {label:'Nein, zurück',   cls:'g', fn:showMenu},
      ], true);
    }
    }, 1050);
  }

  /* ═══════════════════════════════════════════════════════════
     RESCHEDULE
     ═══════════════════════════════════════════════════════════ */
  function reschedStart(){
    S.flow='reschedule'; resetCal(); clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Wir prüfen verfügbare Termine für Sie …');
      setTimeout(()=>{
        bot('Wählen Sie den neuen Wunschtermin:');
        paintDateStep('reschedule');
      }, 650);
    }, 1050);
  }

  async function reschedSubmit(){
    if(!S.cal.selDate||!S.cal.selTime||!S.appointment) return;
    busy(true); clearChips(); showTyping();
    const payload={
      event_id:S.appointment.event_id||'',
      email:S.appointment.email||S.data.email||'',
      new_datetime:toRFC(S.cal.selDate,S.cal.selTime),
      new_date:S.cal.selDate, new_time:S.cal.selTime,
      duration_minutes:30, timezone:'Europe/Berlin',
      source:'TRIGA-S Chatbot', message:'Terminverschiebung über TRIGA-S Chatbot',
    };
    try{
      const res=await apiPost(WH.RESCHEDULE, payload);
      hideTyping(); busy(false);
      if(res&&res.success===false){
        const er=res.error||'';
        if(['outside_business_hours','not_available','slot_unavailable','appointment_not_available'].includes(er)||res.chatbot_not_available_message){
          bot(res.chatbot_not_available_message||'Diese Uhrzeit ist leider nicht verfügbar. Bitte wählen Sie eine andere Uhrzeit.');
          document.getElementById('tgs-book-stage')?.remove();
          acts([
            {label:'Anderen Termin', cls:'p', fn:()=>{
              S.cal.selDate=null; S.cal.selTime=null; clearChips();
              bot('Wählen Sie den neuen Wunschtermin:');
              paintDateStep('reschedule');
            }},
            {label:'Hauptmenü', cls:'g', fn:showMenu},
          ], true);
        }else{
          bot(`⚠️ ${res.message||'Der Termin konnte nicht verschoben werden.'}`);
          setTimeout(goBack,600);
        }
        return;
      }
      const m=res?.chatbot_success_message||`Ihr Termin wurde erfolgreich auf ${fmtDate(S.cal.selDate)} um ${S.cal.selTime} Uhr verschoben. Sie erhalten eine Bestätigung per E-Mail.`;
      bot('✓ '+m); setTimeout(goBack,600);
    }catch(e){
      hideTyping(); console.error('[TGS Reschedule]',e);
      bot('Bei der Terminverschiebung ist ein Fehler aufgetreten. Bitte wenden Sie sich an das TRIGA-S Team.');
      busy(false); setTimeout(goBack,600);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     CANCEL
     ═══════════════════════════════════════════════════════════ */
  function cancelConfirm(){
    acts([
      {label:'Ja, endgültig stornieren', cls:'d', fn:()=>cancelSubmit()},
      {label:'Nein, zurück',             cls:'g', fn:showMenu},
    ], true);
  }

  async function cancelSubmit(){
    busy(true); clearChips(); showTyping();
    const a=S.appointment;
    try{
      const res=await apiPost(WH.CANCEL,{
        event_id:a.event_id||'', email:a.email||S.data.email||'',
        reason:'Stornierung über TRIGA-S Chatbot',
        message:'Termin wurde über den TRIGA-S Chatbot storniert.',
        source:'TRIGA-S Chatbot',
      });
      hideTyping(); busy(false);
      if(res&&res.success===false){
        bot(`⚠️ ${res.message||res.error||'Fehler bei der Stornierung.'}`);
      }else{
        bot('✓ Ihr Termin wurde erfolgreich storniert. Sie erhalten eine Bestätigung per E-Mail.');
      }
    }catch(e){
      hideTyping(); console.error('[TGS Cancel]',e);
      bot('Bei der Stornierung ist ein Fehler aufgetreten. Bitte wenden Sie sich direkt an das TRIGA-S Team.');
      busy(false);
    }
    setTimeout(goBack,600);
  }

  /* ═══════════════════════════════════════════════════════════
     CALENDAR
     ═══════════════════════════════════════════════════════════ */
  function resetCal(){
    const t=new Date();
    S.cal={year:t.getFullYear(), month:t.getMonth(), selDate:null, selTime:null, slots:[], _timeMsgShown:false};
  }

  function bkStage(){
    let s=document.getElementById('tgs-book-stage');
    if(!s){s=document.createElement('div');s.id='tgs-book-stage';s.className='tgs-book-stage';}
    return s;
  }

  function mkDots(active){
    const c=document.createElement('div'); c.className='tgs-bk-dots';
    [1,2,3].forEach(i=>{
      const d=document.createElement('div');
      d.className='tgs-bk-dot '+(i<active?'done':i===active?'active':'todo');
      c.appendChild(d);
    });
    return c;
  }

  function paintDateStep(mode){
    const stage=bkStage();
    stage.innerHTML='';
    const c=S.cal;
    const today=new Date(); today.setHours(0,0,0,0);
    const lastDay=new Date(c.year,c.month+1,0).getDate();
    const prevDis=new Date(c.year,c.month-1,1)<new Date(today.getFullYear(),today.getMonth(),1);

    const hd=document.createElement('div'); hd.className='tgs-bk-hd';
    const hdNav=document.createElement('div'); hdNav.className='tgs-bk-hd-nav';
    const prevBtn=document.createElement('button'); prevBtn.className='tgs-bk-nav-btn'; prevBtn.textContent='‹';
    if(prevDis) prevBtn.disabled=true;
    const moLbl=document.createElement('span'); moLbl.className='tgs-bk-month';
    moLbl.textContent=`${MONTHS[c.month]} ${c.year}`;
    const nextBtn=document.createElement('button'); nextBtn.className='tgs-bk-nav-btn'; nextBtn.textContent='›';
    hdNav.appendChild(prevBtn); hdNav.appendChild(moLbl); hdNav.appendChild(nextBtn);
    hd.appendChild(hdNav); hd.appendChild(mkDots(1));

    const body=document.createElement('div'); body.className='tgs-bk-body';
    const grid=document.createElement('div'); grid.className='tgs-bk-grid';
    ['Mo','Di','Mi','Do','Fr'].forEach(d=>{
      const h=document.createElement('div'); h.className='tgs-bk-dow'; h.textContent=d; grid.appendChild(h);
    });
    let firstWdNum=1;
    for(let n=1;n<=lastDay;n++){
      if(((new Date(c.year,c.month,n).getDay()+6)%7)<5){firstWdNum=n;break;}
    }
    const firstWdCol=(new Date(c.year,c.month,firstWdNum).getDay()+6)%7;
    for(let b=0;b<firstWdCol;b++){
      const bl=document.createElement('div'); bl.className='tgs-bk-day blank'; grid.appendChild(bl);
    }
    for(let dn=1;dn<=lastDay;dn++){
      const dt=new Date(c.year,c.month,dn);
      if(((dt.getDay()+6)%7)>=5) continue;
      const ds=`${c.year}-${pad(c.month+1)}-${pad(dn)}`;
      const btn=document.createElement('button'); btn.className='tgs-bk-day';
      btn.textContent=dn;
      if(dt<today){ btn.classList.add('past'); btn.disabled=true; }
      else{
        if(dt.toDateString()===today.toDateString()) btn.classList.add('today');
        if(c.selDate===ds) btn.classList.add('sel');
        btn.dataset.d=ds;
        btn.addEventListener('click',()=>{ c.selDate=ds; paintDateStep(mode); });
      }
      grid.appendChild(btn);
    }
    body.appendChild(grid);

    const footer=document.createElement('div'); footer.className='tgs-bk-footer';
    const weitBtn=document.createElement('button'); weitBtn.className='tgs-bk-btn pri';
    weitBtn.textContent='Weiter'; weitBtn.disabled=!c.selDate;
    weitBtn.addEventListener('click',()=>showTimeStep(mode));
    footer.appendChild(weitBtn);

    stage.appendChild(hd); stage.appendChild(body); stage.appendChild(footer);
    if(!stage.isConnected) appendEl(stage);

    prevBtn.addEventListener('click',()=>{
      c.month--; if(c.month<0){c.month=11;c.year--;}
      c.selDate=null; c.slots=[]; paintDateStep(mode);
    });
    nextBtn.addEventListener('click',()=>{
      c.month++; if(c.month>11){c.month=0;c.year++;}
      c.selDate=null; c.slots=[]; paintDateStep(mode);
    });
    scroll();
  }

  function showTimeStep(mode){
    const stage=bkStage(); stage.remove(); clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      if(!S.cal._timeMsgShown){ bot('Bitte wählen Sie Ihre bevorzugte Uhrzeit:'); S.cal._timeMsgShown=true; }
      paintTimeStep(mode);
    }, 900);
  }

  function paintTimeStep(mode){
    const stage=bkStage();
    stage.innerHTML='';

    const hd=document.createElement('div'); hd.className='tgs-bk-hd';
    const hdInfo=document.createElement('div'); hdInfo.className='tgs-bk-hd-info';
    const sub=document.createElement('span'); sub.className='tgs-bk-hd-sub'; sub.textContent='Gewähltes Datum';
    const main=document.createElement('span'); main.className='tgs-bk-hd-main'; main.textContent=fmtDate(S.cal.selDate);
    hdInfo.appendChild(sub); hdInfo.appendChild(main);
    hd.appendChild(hdInfo); hd.appendChild(mkDots(2));

    const slotsArea=document.createElement('div'); slotsArea.className='tgs-bk-slots-area';
    slotsArea.innerHTML='<div class="tgs-bk-slot-msg">Verfügbare Zeiten werden geladen…</div>';

    const ftr=document.createElement('div'); ftr.className='tgs-bk-footer';
    const ftrRow=document.createElement('div'); ftrRow.className='tgs-bk-footer-row';
    const backBtn=document.createElement('button'); backBtn.className='tgs-bk-btn sec';
    backBtn.textContent='Datum ändern';
    backBtn.addEventListener('click',()=>{ S.cal.selDate=null; S.cal.selTime=null; paintDateStep(mode); });
    const contBtn=document.createElement('button'); contBtn.id='tgs-time-cont';
    contBtn.className='tgs-bk-btn pri'; contBtn.textContent='Weiter'; contBtn.disabled=true;
    contBtn.addEventListener('click',()=>showConfirm(mode));
    ftrRow.appendChild(backBtn); ftrRow.appendChild(contBtn);
    ftr.appendChild(ftrRow);

    stage.appendChild(hd); stage.appendChild(slotsArea); stage.appendChild(ftr);
    if(!stage.isConnected) appendEl(stage);

    loadSlots(slotsArea, S.cal.selDate, mode, ()=>{
      const cb=document.getElementById('tgs-time-cont');
      if(cb) cb.disabled=false;
    });
    scroll();
  }

  async function loadSlots(area, dateStr, mode, onSelect){
    area.innerHTML='<div class="tgs-bk-slot-msg">Verfügbare Zeiten werden geladen…</div>';
    scroll();
    try{
      const res=await apiPost(WH.AVAIL,{date:dateStr, timezone:'Europe/Berlin', source:'TRIGA-S Chatbot'});
      const slots=normalizeSlots(res);
      S.cal.slots=slots;
      if(!slots.length){ area.innerHTML='<div class="tgs-bk-slot-msg">Keine freien Termine an diesem Tag.</div>'; return; }
      area.innerHTML='';
      const grid=document.createElement('div'); grid.className='tgs-bk-slot-grid';
      slots.forEach(t=>{
        const b=document.createElement('button');
        b.className='tgs-bk-slot'+(S.cal.selTime===t?' sel':'');
        b.textContent=t+' Uhr';
        b.addEventListener('click',()=>{
          S.cal.selTime=t;
          grid.querySelectorAll('.tgs-bk-slot').forEach(x=>x.classList.remove('sel'));
          b.classList.add('sel');
          if(onSelect) onSelect(t); else showConfirm(mode);
        });
        grid.appendChild(b);
      });
      area.appendChild(grid);
    }catch(e){
      console.error('[TGS Avail]',e);
      area.innerHTML='<div class="tgs-bk-slot-msg">Verfügbarkeit konnte nicht geladen werden.</div>';
    }
    scroll();
  }

  function showConfirm(mode){
    const stage=bkStage(); stage.remove(); clearChips();
    showTyping();
    setTimeout(()=>{
      hideTyping();
      bot('Bitte überprüfen Sie Ihren Terminwunsch:');
      stage.innerHTML='';

      const hd=document.createElement('div'); hd.className='tgs-bk-hd';
      const hdInfo=document.createElement('div'); hdInfo.className='tgs-bk-hd-info';
      const sub=document.createElement('span'); sub.className='tgs-bk-hd-sub'; sub.textContent='Zusammenfassung';
      const main=document.createElement('span'); main.className='tgs-bk-hd-main'; main.textContent='Terminübersicht';
      hdInfo.appendChild(sub); hdInfo.appendChild(main);
      hd.appendChild(hdInfo); hd.appendChild(mkDots(3));

      const body=document.createElement('div'); body.className='tgs-bk-conf-body';
      function mkRow(lbl,val){
        const r=document.createElement('div'); r.className='tgs-bk-conf-row';
        r.innerHTML=`<span class="tgs-bk-sec-lbl">${lbl}</span><span class="tgs-bk-sec-val">${val}</span>`;
        return r;
      }
      body.appendChild(mkRow('Datum',fmtDate(S.cal.selDate)));
      body.appendChild(mkRow('Uhrzeit',S.cal.selTime+' Uhr'));
      if(mode==='booking'){
        const sep=document.createElement('hr'); sep.className='tgs-bk-conf-sep'; body.appendChild(sep);
        const nm=`${S.data.vorname||''} ${S.data.nachname||''}`.trim();
        if(nm) body.appendChild(mkRow('Name',esc(nm)));
        if(S.data.email) body.appendChild(mkRow('E-Mail',esc(S.data.email)));
        if(S.data.telefon) body.appendChild(mkRow('Telefon',esc(S.data.telefon)));
        if(S.data.unternehmen) body.appendChild(mkRow('Firma',esc(S.data.unternehmen)));
        if(S.data.interesse) body.appendChild(mkRow('Anliegen',esc(S.data.interesse)));
      }
      if(mode==='reschedule'){
        body.appendChild(mkRow('Aktuell',esc(S.appointment?.termin||'–')));
      }

      const ftr=document.createElement('div'); ftr.className='tgs-bk-conf-footer';
      const confirmBtn=document.createElement('button'); confirmBtn.className='tgs-bk-btn pri';
      confirmBtn.style.width='100%';
      confirmBtn.textContent='Termin bestätigen';
      confirmBtn.addEventListener('click',()=>{ stage.remove(); mode==='booking'?bookSubmit():reschedSubmit(); });
      ftr.appendChild(confirmBtn);

      const secRow=document.createElement('div'); secRow.className='tgs-bk-conf-sec-row';
      const datumBtn=document.createElement('button'); datumBtn.className='tgs-bk-btn sec';
      datumBtn.textContent='Datum ändern';
      datumBtn.addEventListener('click',()=>{ S.cal.selDate=null; S.cal.selTime=null; paintDateStep(mode); });
      const uhrzeitBtn=document.createElement('button'); uhrzeitBtn.className='tgs-bk-btn sec';
      uhrzeitBtn.textContent='Uhrzeit ändern';
      uhrzeitBtn.addEventListener('click',()=>{ S.cal.selTime=null; paintTimeStep(mode); });
      secRow.appendChild(datumBtn); secRow.appendChild(uhrzeitBtn);
      ftr.appendChild(secRow);
      if(mode==='booking'){
        const dataBtn=document.createElement('button'); dataBtn.className='tgs-bk-btn sec';
        dataBtn.style.width='100%';
        dataBtn.textContent='Kontaktdaten bearbeiten';
        dataBtn.addEventListener('click',()=>{ stage.remove(); clearChips(); editContactData(); });
        ftr.appendChild(dataBtn);
      }

      stage.appendChild(hd); stage.appendChild(body); stage.appendChild(ftr);
      appendEl(stage);
      scroll();
    }, 600);
  }

  function editContactData(){
    function step(i){
      if(i>=BOOK_Q.length){
        showTyping();
        setTimeout(()=>{ hideTyping(); bot('Ihre Telefonnummer (optional):'); inpOpt('+49 89 …', v=>{ S.data.telefon=v; showConfirm('booking'); }); }, 1050);
        return;
      }
      const q=BOOK_Q[i];
      showTyping();
      setTimeout(()=>{ hideTyping(); bot(q.q); inp(q.ph, v=>{ S.data[q.k]=v; step(i+1); }, q.t); }, 1050);
    }
    bot('Bitte geben Sie Ihre Kontaktdaten erneut ein:');
    step(0);
  }

  /* ═══════════════════════════════════════════════════════════
     BOOKING SUBMIT
     ═══════════════════════════════════════════════════════════ */
  async function bookSubmit(){
    if(!S.cal.selDate||!S.cal.selTime) return;
    busy(true); clearChips(); showTyping();
    const dt=toRFC(S.cal.selDate, S.cal.selTime);
    try{
      const res=await apiPost(WH.BOOKING,{
        vorname:S.data.vorname||'', nachname:S.data.nachname||'',
        name:`${S.data.vorname||''} ${S.data.nachname||''}`.trim(),
        email:S.data.email||'', telefon:S.data.telefon||'',
        unternehmen:S.data.unternehmen||'', interesse:S.data.interesse||'',
        appointmentDateTime:dt, terminDatumZeit:dt,
        terminDatum:S.cal.selDate, terminUhrzeit:S.cal.selTime,
        appointment_date:S.cal.selDate, appointment_time:S.cal.selTime,
        duration_minutes:30, timezone:'Europe/Berlin',
        smsWanted:S.data.telefon?'Ja':'Nein', notizen:'', source:'TRIGA-S Chatbot',
      });
      hideTyping(); busy(false);
      if(res&&res.success===false){
        bot(`⚠️ ${res.message||'Der Termin konnte nicht gebucht werden.'}`);
        setTimeout(goBack,600); return;
      }
      bot(`✓ Ihr Termin am ${fmtDate(S.cal.selDate)} um ${S.cal.selTime} Uhr wurde erfolgreich gebucht. Sie erhalten eine Bestätigung per E-Mail.`);
      if(S.data.telefon){ setTimeout(()=>askSms(), 500); }
      else{ setTimeout(goBack, 600); }
    }catch(e){
      hideTyping(); console.error('[TGS Booking]',e);
      bot('Beim Buchen ist ein Fehler aufgetreten. Bitte wenden Sie sich an das TRIGA-S Team: sales@triga-s.de');
      busy(false); setTimeout(goBack, 600);
    }
  }

  function askSms(){
    bot('Möchten Sie eine SMS-Bestätigung erhalten?');
    acts([
      {label:'Ja, SMS senden', cls:'p', fn:async()=>{
        busy(true); clearChips(); showTyping();
        try{
          await apiPost(WH.SMS,{
            vorname:S.data.vorname||'', nachname:S.data.nachname||'',
            name:`${S.data.vorname||''} ${S.data.nachname||''}`.trim(),
            phone:S.data.telefon||'', telefon:S.data.telefon||'',
            appointment_date:S.cal.selDate, appointment_time:S.cal.selTime,
            appointment_type:S.data.interesse||'', interesse:S.data.interesse||'',
            unternehmen:S.data.unternehmen||'', smsWanted:'Ja', source:'TRIGA-S Chatbot',
          });
          hideTyping(); bot('✓ Die SMS-Bestätigung wurde gesendet.');
        }catch(e){
          hideTyping(); console.error('[TGS SMS]',e);
          bot('Die SMS konnte leider nicht gesendet werden. Ihre E-Mail-Bestätigung folgt in Kürze.');
        }
        busy(false); setTimeout(goBack, 500);
      }},
      {label:'Nein, danke', cls:'g', fn:()=>setTimeout(goBack, 200)},
    ]);
  }

  /* ── BOOT ────────────────────────────────────────────────────── */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  }else{
    boot();
  }

})();
