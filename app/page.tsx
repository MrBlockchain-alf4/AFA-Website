"use client";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ─── Design tokens ─────────────────────────────────────────────────── */
const C = {
  bg:    "#09090b",
  s1:    "#0f0f11",
  s2:    "#141418",
  s3:    "#1a1a20",
  bd:    "rgba(255,255,255,0.07)",
  bd2:   "rgba(255,255,255,0.12)",
  text:  "#f4f4f5",
  muted: "#71717a",
  soft:  "#a1a1aa",
  acc:   "#00bbfd",
  aLow:  "rgba(0,187,253,0.07)",
  aMid:  "rgba(0,187,253,0.18)",
  aHigh: "rgba(0,187,253,0.32)",
  H: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
  M: 'var(--font-chivo,"Chivo Mono",monospace)',
};

/* ─── Shared animation helpers ──────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1];

/** Fade + lift reveal — resets when scrolled away */
function Reveal({ children, delay = 0, y = 22 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y, filter: "blur(6px)" }}
      transition={{ duration: 0.72, ease, delay }}>
      {children}
    </motion.div>
  );
}

/** Simple opacity fade — resets when scrolled away */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}

/** Premium card reveal: opacity + lift + scale + blur */
function CardReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 44, scale: 0.96, filter: "blur(14px)" }}
      animate={inView
        ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        : { opacity: 0, y: 44, scale: 0.96, filter: "blur(14px)" }}
      transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

/** Re-mounts children each time the element enters the viewport — restarts inner animations */
function InViewReset({ children, margin = "-60px" }: { children: React.ReactNode; margin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin });
  const [epoch, setEpoch] = useState(0);
  const prevInView = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevInView.current === false && inView) setEpoch(e => e + 1);
    prevInView.current = inView;
  }, [inView]);
  return <div ref={ref}><div key={epoch}>{children}</div></div>;
}

/** Word-by-word headline reveal — restarts on each viewport entry */
function H2Reveal({ lines, center, delay = 0, size = "clamp(2rem,3.5vw,3rem)" }: {
  lines: React.ReactNode[]; center?: boolean; delay?: number; size?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  return (
    <h2 ref={ref} style={{
      fontFamily: C.H, fontWeight: 800, letterSpacing: "-0.04em",
      fontSize: size, lineHeight: 1.08,
      color: "#fff", textAlign: center ? "center" : "left",
      margin: 0,
    }}>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          style={{ display: "block" }}
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={inView
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 22, filter: "blur(10px)" }}
          transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.09 }}
        >{line}</motion.span>
      ))}
    </h2>
  );
}

/* ─── Section label ─────────────────────────────────────────────────── */
function Label({ children }: { children: string }) {
  return (
    <p style={{ fontFamily: C.M, fontSize: 11, letterSpacing: "0.14em",
                textTransform: "uppercase", color: C.acc, marginBottom: 16 }}>
      {children}
    </p>
  );
}

/* ─── Section heading (static, use H2Reveal for animated version) ────── */
function H2({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{
      fontFamily: C.H, fontWeight: 800, letterSpacing: "-0.04em",
      fontSize: "clamp(2rem,3.5vw,3rem)", lineHeight: 1.08,
      color: "#fff", textAlign: center ? "center" : "left",
    }}>
      {children}
    </h2>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1440);
  useEffect(() => {
    const u = () => setW(window.innerWidth);
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);
  return { isMobile: w < 768, isTablet: w < 1024 };
}

function Section({ id, bg, border, children }: {
  id?: string; bg?: string; border?: boolean; children: React.ReactNode;
}) {
  const { isMobile } = useBreakpoint();
  return (
    <section id={id} style={{
      background: bg ?? C.bg,
      borderTop: border !== false ? `1px solid ${C.bd}` : "none",
      padding: isMobile ? "48px 0" : "100px 0",
    }}>
      <div className="ctr">{children}</div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: "Telefon",    id: "telefon"    },
  { label: "Chat",       id: "chat"       },
  { label: "Websites",   id: "websites"   },
  { label: "System",     id: "system"     },
  { label: "Ergebnisse", id: "ergebnisse" },
];

function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function NavLink({ label, id, active, onNavClick }: {
  label: string; id: string; active: boolean;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = active || hovered;
  return (
    <a
      href={`#${id}`}
      onClick={e => onNavClick(e, id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: C.M, fontSize: 13,
        color: active ? C.acc : hovered ? C.text : C.muted,
        transition: "color 0.18s",
        position: "relative",
        paddingBottom: 4,
        textDecoration: "none",
      }}
    >
      {label}
      <motion.span
        initial={false}
        animate={{ scaleX: lit ? 1 : 0, opacity: active ? 0.9 : 0.75 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute", bottom: 0, left: 0,
          width: "100%", height: 1.5,
          background: C.acc,
          transformOrigin: "left center",
          display: "block", borderRadius: 2,
        }}
      />
    </a>
  );
}

function MobileMenuItem({ label, index, onClick }: { label: string; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block", width: "100%", textAlign: "left",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: C.M, fontSize: 15,
          color: hovered ? C.acc : "rgba(255,255,255,0.6)",
          padding: "13px 20px 14px",
          transition: "color 0.18s",
          position: "relative",
        }}
      >
        {label}
        <motion.span
          initial={false}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute", bottom: 8, left: 20,
            width: "calc(100% - 40px)", height: 1.5,
            background: C.acc,
            transformOrigin: "left center",
            display: "block", borderRadius: 2,
          }}
        />
      </button>
    </motion.div>
  );
}

function Nav() {
  const [activeId, setActiveId] = useState("");
  const isScrolling = useRef(false);
  const { isMobile } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when user starts scrolling
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  const handleMobileMenuClick = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    setTimeout(() => window.scrollTo({ top: y, behavior: "smooth" }), 80);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    isScrolling.current = true;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;

    if (Math.abs(window.scrollY - y) < 4) {
      isScrolling.current = false;
      return;
    }

    window.scrollTo({ top: y, behavior: "smooth" });

    let endTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(endTimer);
      endTimer = setTimeout(() => {
        isScrolling.current = false;
        window.removeEventListener("scroll", onScroll);
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    setTimeout(() => {
      isScrolling.current = false;
      window.removeEventListener("scroll", onScroll);
    }, 2500);
  };

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.id);
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(entries => {
      if (isScrolling.current) return;
      entries.forEach(e => ratios.set(e.target.id, e.intersectionRatio));
      let best = ""; let bestR = 0;
      ratios.forEach((r, id) => { if (r > bestR) { bestR = r; best = id; } });
      if (best) setActiveId(best);
    }, { threshold: [0, 0.15, 0.4], rootMargin: "-72px 0px -38% 0px" });

    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header style={{
        position: "fixed", inset: "0 0 auto 0", zIndex: 50, height: 72,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(9,9,11,0.9)", backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          width: "100%", maxWidth: "75rem", margin: "0 auto",
          padding: isMobile ? "0 1.25rem" : "0 2rem",
          display: isMobile ? "flex" : "grid",
          gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : undefined,
          columnGap: isMobile ? undefined : 40,
        }}>

          {/* Logo — compact "AFA" text on mobile, full image on desktop */}
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer", transition: "opacity 0.18s" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.72")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isMobile ? "/afa-logo-mark.png" : "/afa-logo-cropped.png"}
              alt="AFA"
              style={{
                height: isMobile ? 32 : "clamp(28px, 3.2vw, 40px)",
                width: "auto",
                objectFit: "contain",
                display: "block",
                maxWidth: isMobile ? 80 : 240,
                flexShrink: 0,
              }}
            />
          </div>

          {/* Nav links — desktop only */}
          <nav style={{ display: isMobile ? "none" : "flex", gap: 38 }}>
            {NAV_LINKS.map(({ label, id }) => (
              <NavLink key={id} label={label} id={id} active={activeId === id} onNavClick={handleLinkClick} />
            ))}
          </nav>

          {/* Right side — hamburger + CTA on mobile, CTA only on desktop */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Menu"
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, cursor: "pointer",
                  width: 38, height: 38,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.7)", flexShrink: 0,
                  transition: "border-color 0.15s, color 0.15s",
                }}
              >
                {menuOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                )}
              </button>
            )}
            <a
              href="#kontakt"
              onClick={e => handleNavClick(e, "kontakt")}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
              style={{
                fontFamily: C.H, fontWeight: 700, fontSize: 13,
                background: C.acc, color: "#000",
                padding: isMobile ? "8px 16px" : "9px 22px", borderRadius: 6,
                transition: "filter 0.15s", whiteSpace: "nowrap",
              }}
            >Beratung buchen</a>
          </div>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 72, left: 0, right: 0, zIndex: 48,
              background: "rgba(9,9,11,0.97)", backdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "6px 0 14px",
            }}
          >
            {NAV_LINKS.map(({ label, id }, index) => (
              <MobileMenuItem
                key={id}
                label={label}
                index={index}
                onClick={() => handleMobileMenuClick(id)}
              />
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
═══════════════════════════════════════════════════════════════════════ */
/* ─── Hero Industries ─────────────────────────────────────────── */
interface HeroIndustry {
  name: string; label: string; color: string; rgb: string;
  outcome: string; outcomeDetail: string;
  conv: { from: "lead" | "ai"; text: string }[];
  mobileConv: { from: "lead" | "ai"; text: string }[];
}

const HERO_INDUSTRIES: HeroIndustry[] = [
  {
    name: "Zahnarztpraxis Dr. Klein", label: "ZAHNARZT",
    color: "#a78bfa", rgb: "167,139,250",
    outcome: "Notfalltermin gebucht",
    outcomeDetail: "Mo. 08:15 Uhr · SMS-Bestätigung versendet",
    conv: [
      { from: "lead", text: "Ich brauche dringend einen Termin." },
      { from: "ai",   text: "Morgen früh 08:15 Uhr ist noch frei — soll ich den Termin für Sie reservieren?" },
      { from: "lead", text: "Ja bitte, sofort!" },
      { from: "ai",   text: "Termin morgen 08:15 Uhr ist gebucht. Eine Bestätigung kommt gleich per SMS." },
    ],
    mobileConv: [
      { from: "lead", text: "Dringend einen Termin bitte." },
      { from: "ai",   text: "Morgen 08:15 Uhr frei — soll ich buchen?" },
      { from: "lead", text: "Ja, sofort bitte!" },
      { from: "ai",   text: "Gebucht! Bestätigung per SMS folgt." },
    ],
  },
  {
    name: "FitLife Studio Hamburg", label: "FITNESS",
    color: "#fb923c", rgb: "251,146,60",
    outcome: "Probestunde gebucht",
    outcomeDetail: "Sa. 10:00 Uhr · Trainer Markus zugewiesen",
    conv: [
      { from: "lead", text: "Was kostet eine Mitgliedschaft?" },
      { from: "ai",   text: "Hey! Ab 39€/Monat — Samstag 10:00 Uhr haben wir eine kostenlose Probestunde frei!" },
      { from: "lead", text: "Samstag 10 Uhr klingt perfekt!" },
      { from: "ai",   text: "Super! Probestunde Samstag 10:00 Uhr gebucht. Coach Markus erwartet dich dort." },
    ],
    mobileConv: [
      { from: "lead", text: "Was kostet eine Mitgliedschaft?" },
      { from: "ai",   text: "Ab 39€/Monat. Sa. 10:00 Probestunde frei!" },
      { from: "lead", text: "Samstag 10 Uhr — perfekt!" },
      { from: "ai",   text: "Gebucht! Coach Markus erwartet dich." },
    ],
  },
  {
    name: "Immobilien Schmidt & Co.", label: "IMMOBILIEN",
    color: "#00bbfd", rgb: "0,187,253",
    outcome: "Besichtigung gebucht",
    outcomeDetail: "Sa. 14:00 Uhr · Exposé per E-Mail versendet",
    conv: [
      { from: "lead", text: "3-Zimmer München, Budget 1.400€ — frei?" },
      { from: "ai",   text: "Wir haben 2 passende Objekte! Samstag den 8. um 14:00 Uhr hätte ich Zeit für Sie." },
      { from: "lead", text: "Samstag 14 Uhr passt mir sehr gut." },
      { from: "ai",   text: "Besichtigung Samstag 14:00 Uhr eingetragen. Das Exposé sende ich Ihnen gleich zu." },
    ],
    mobileConv: [
      { from: "lead", text: "3-Zimmer München, 1.400€ — frei?" },
      { from: "ai",   text: "2 Objekte frei! Sa. 14:00 passt?" },
      { from: "lead", text: "Samstag 14 Uhr passt gut." },
      { from: "ai",   text: "Termin Sa. 14:00 gebucht. Exposé folgt!" },
    ],
  },
  {
    name: "Kanzlei Müller & Partner", label: "KANZLEI",
    color: "#fbbf24", rgb: "251,191,36",
    outcome: "Erstgespräch gebucht",
    outcomeDetail: "Di. 11:00 Uhr · Unterlagen angefordert",
    conv: [
      { from: "lead", text: "Ich wurde fristlos gekündigt." },
      { from: "ai",   text: "Ich helfe Ihnen gerne. Dienstag 11:00 Uhr wäre ein kostenloses Erstgespräch möglich." },
      { from: "lead", text: "Dienstag 11 Uhr ist gut, vielen Dank." },
      { from: "ai",   text: "Erstgespräch Dienstag 11:00 Uhr eingetragen. Bitte bringen Sie die Kündigung mit." },
    ],
    mobileConv: [
      { from: "lead", text: "Ich wurde fristlos gekündigt." },
      { from: "ai",   text: "Di. 11:00 Uhr kostenloses Erstgespräch?" },
      { from: "lead", text: "Dienstag 11 Uhr, danke." },
      { from: "ai",   text: "Gebucht! Kündigung bitte mitbringen." },
    ],
  },
  {
    name: "ShopWelt Online GmbH", label: "E-COMMERCE",
    color: "#34d399", rgb: "52,211,153",
    outcome: "Anfrage gelöst",
    outcomeDetail: "Tracking-Link versendet · Ticket geschlossen",
    conv: [
      { from: "lead", text: "Meine Bestellung #EX-4821 fehlt." },
      { from: "ai",   text: "Bestellung #EX-4821 wurde heute früh versendet — Lieferung voraussichtlich morgen." },
      { from: "lead", text: "Gut! Kann ich den Tracking-Link haben?" },
      { from: "ai",   text: "Tracking-Link ist gerade per E-Mail raus. Danke für Ihre Geduld!" },
    ],
    mobileConv: [
      { from: "lead", text: "Bestellung #EX-4821 fehlt." },
      { from: "ai",   text: "Heute versendet — Lieferung morgen." },
      { from: "lead", text: "Kann ich den Tracking-Link haben?" },
      { from: "ai",   text: "Link per E-Mail gerade gesendet!" },
    ],
  },
];

const PIPELINE = ["Empfangen", "KI Analyse", "Qualifiziert", "Abgeschlossen"];

function HeroDemo() {
  const { isMobile } = useBreakpoint();
  const [idx, setIdx]             = useState(0);
  const [msgs, setMsgs]           = useState<{ id: number; from: string; text: string; typing?: boolean }[]>([]);
  const [showDots, setShowDots]   = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending]     = useState(false);
  const [step, setStep]           = useState(0);
  const [showOutcome, setOutcome] = useState(false);
  const [alpha, setAlpha]         = useState(0);
  const rid = useRef(0);
  const mid = useRef(0);

  useEffect(() => {
    const id = ++rid.current;
    const gone = () => rid.current !== id;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    setMsgs([]); setShowDots(false);
    setInputText(""); setSending(false);
    setStep(0); setOutcome(false); setAlpha(0);

    (async () => {
      await wait(80);
      if (gone()) return;
      setAlpha(1);
      await wait(500);

      const c = isMobile ? HERO_INDUSTRIES[idx].mobileConv : HERO_INDUSTRIES[idx].conv;

      // ── msg 1: user types in input bar ──
      await wait(320); if (gone()) return;
      for (let i = 1; i <= c[0].text.length; i++) {
        if (gone()) return;
        setInputText(c[0].text.slice(0, i));
        await wait(36);
      }
      await wait(180); if (gone()) return;
      // send: flash the button, clear input, bubble appears in chat
      setSending(true);
      await wait(120); if (gone()) return;
      setSending(false);
      setInputText("");
      setMsgs(p => [...p, { id: ++mid.current, from: "user", text: c[0].text }]);
      setStep(1);
      await wait(260);

      // ── msg 2: AI ──
      await wait(200); if (gone()) return;
      setShowDots(true); setStep(2);
      await wait(900); if (gone()) return;
      setShowDots(false);
      const nid2 = ++mid.current;
      setMsgs(p => [...p, { id: nid2, from: "ai", text: c[1].text.slice(0, 1), typing: true }]);
      for (let i = 2; i <= c[1].text.length; i++) {
        if (gone()) return;
        setMsgs(p => p.map(m => m.id === nid2 ? { ...m, text: c[1].text.slice(0, i) } : m));
        await wait(18);
      }
      if (gone()) return;
      setMsgs(p => p.map(m => m.id === nid2 ? { ...m, typing: false } : m));
      setStep(3);
      await wait(380);

      // ── msg 3: user types in input bar ──
      await wait(280); if (gone()) return;
      for (let i = 1; i <= c[2].text.length; i++) {
        if (gone()) return;
        setInputText(c[2].text.slice(0, i));
        await wait(36);
      }
      await wait(180); if (gone()) return;
      setSending(true);
      await wait(120); if (gone()) return;
      setSending(false);
      setInputText("");
      setMsgs(p => [...p, { id: ++mid.current, from: "user", text: c[2].text }]);
      await wait(260);

      // ── msg 4: AI ──
      await wait(200); if (gone()) return;
      setShowDots(true);
      await wait(900); if (gone()) return;
      setShowDots(false);
      const nid4 = ++mid.current;
      setMsgs(p => [...p, { id: nid4, from: "ai", text: c[3].text.slice(0, 1), typing: true }]);
      for (let i = 2; i <= c[3].text.length; i++) {
        if (gone()) return;
        setMsgs(p => p.map(m => m.id === nid4 ? { ...m, text: c[3].text.slice(0, i) } : m));
        await wait(18);
      }
      if (gone()) return;
      setMsgs(p => p.map(m => m.id === nid4 ? { ...m, typing: false } : m));
      setStep(4);
      await wait(340);

      // ── outcome ──
      await wait(200); if (gone()) return;
      setOutcome(true);
      await wait(1800);

      // ── next ──
      if (gone()) return;
      setAlpha(0);
      await wait(600);
      if (gone()) return;
      setIdx(p => (p + 1) % HERO_INDUSTRIES.length);
    })();
  }, [idx]);

  const ind  = HERO_INDUSTRIES[idx];
  const glow = `rgba(${ind.rgb},`;

  return (
    <div style={{ position: "relative", maxWidth: isMobile ? 340 : "none", margin: isMobile ? "0 auto" : undefined }}>

      {/* large ambient orb behind card */}
      <div style={{
        position: "absolute", top: -80, right: -100,
        width: 620, height: 620, borderRadius: "50%",
        background: `radial-gradient(circle, ${glow}0.14) 0%, transparent 60%)`,
        zIndex: 0, pointerEvents: "none",
        transition: "background 1.4s ease",
      }}/>
      <div style={{
        position: "absolute", bottom: -60, left: -80,
        width: 380, height: 380, borderRadius: "50%",
        background: `radial-gradient(circle, ${glow}0.07) 0%, transparent 65%)`,
        zIndex: 0, pointerEvents: "none",
        transition: "background 1.4s ease",
      }}/>

      {/* ── card ── */}
      <div style={{
        position: "relative", zIndex: 1,
        height: isMobile ? 460 : 590,
        background: "rgba(7, 7, 13, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 22,
        border: `1px solid rgba(${ind.rgb},0.22)`,
        boxShadow: `0 50px 150px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 100px ${glow}0.06)`,
        overflow: "hidden",
        transition: "border-color 1.2s ease, box-shadow 1.2s ease",
        opacity: alpha, transitionProperty: "border-color, box-shadow, opacity",
        transitionDuration: "1.2s, 1.2s, 0.52s",
        transitionTimingFunction: "ease",
      }}>

        {/* subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}/>

        {/* ── header ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "22px 28px", zIndex: 20,
          display: "flex", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: ind.color, display: "inline-block",
              boxShadow: `0 0 10px ${ind.color}80`,
              transition: "background 1.2s ease, box-shadow 1.2s ease",
            }}/>
            <span style={{
              fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 12 : 14, color: "rgba(255,255,255,0.88)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {ind.name}
            </span>
            <span style={{
              fontFamily: C.M, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", flexShrink: 0,
              background: `${glow}0.12)`, border: `1px solid ${glow}0.3)`,
              color: ind.color, borderRadius: 4, padding: "2px 7px",
              transition: "all 1.2s ease",
            }}>{ind.label}</span>
          </div>
          <div style={{ marginLeft: 8, display: isMobile ? "none" : "flex", gap: 6, flexShrink: 0 }}>
            {["Website","WhatsApp","Telefon"].map(ch => (
              <span key={ch} style={{
                fontFamily: C.M, fontSize: 9,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.3)", borderRadius: 4, padding: "3px 8px",
              }}>{ch}</span>
            ))}
          </div>
        </div>

        {/* ── top gradient mask ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 110,
          background: "linear-gradient(to bottom, rgba(7,7,13,1) 35%, transparent 100%)",
          zIndex: 10, pointerEvents: "none",
        }}/>

        {/* ── bottom gradient mask ── */}
        <div style={{
          position: "absolute", bottom: 140, left: 0, right: 0, height: 50,
          background: "linear-gradient(to top, rgba(7,7,13,0.85) 0%, transparent 100%)",
          zIndex: 10, pointerEvents: "none",
        }}/>

        {/* ── message stream ── */}
        <div style={{
          position: "absolute",
          top: 68, bottom: 140, left: 0, right: 0,
          padding: "0 26px 12px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          gap: 12, overflow: "hidden",
        }}>

          <AnimatePresence initial={false}>
            {msgs.map(msg => {
              const isAI = msg.from === "ai";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end", flexShrink: 0 }}>
                  <div style={{
                    maxWidth: "82%", padding: isMobile ? "9px 13px" : "13px 18px",
                    background: isAI ? `${glow}0.12)` : "rgba(255,255,255,0.07)",
                    border: `1px solid ${isAI ? `${glow}0.24)` : "rgba(255,255,255,0.10)"}`,
                    borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                    fontFamily: C.M, fontSize: isMobile ? 12 : 13.5,
                    color: isAI ? "#fff" : "rgba(255,255,255,0.82)",
                    lineHeight: 1.5,
                    boxShadow: isAI ? `0 0 28px ${glow}0.10)` : "none",
                    transition: "background 1.2s ease, border-color 1.2s ease, box-shadow 1.2s ease",
                    wordBreak: "break-word",
                  }}>
                    {msg.text}
                    {msg.typing && <span style={{
                      display: "inline-block", width: 2, height: "0.82em",
                      background: ind.color, marginLeft: 2, verticalAlign: "middle",
                      animation: "cursor-blink 0.7s step-end infinite",
                    }}/>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* AI typing dots — LEFT */}
          <AnimatePresence>
            {showDots && (
              <motion.div
                key="dots"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", justifyContent: "flex-start", flexShrink: 0 }}>
                <div style={{
                  padding: "13px 18px",
                  background: `${glow}0.1)`, border: `1px solid ${glow}0.22)`,
                  borderRadius: "4px 18px 18px 18px",
                  display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: ind.color, display: "inline-block",
                      animation: `typing-bounce 0.8s ease ${i * 0.14}s infinite`,
                    }}/>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* outcome card */}
          <AnimatePresence>
            {showOutcome && (
              <motion.div
                key="outcome"
                initial={{ opacity: 0, scale: 0.9, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1,   y: 0,  filter: "blur(0px)" }}
                transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: `${glow}0.12)`,
                  border: `1px solid ${glow}0.36)`,
                  borderRadius: 14, padding: "14px 22px",
                  boxShadow: `0 0 60px ${glow}0.22), 0 0 100px ${glow}0.08)`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: ind.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontFamily: C.H, fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 2 }}>
                      {ind.outcome}
                    </p>
                    <p style={{ fontFamily: C.M, fontSize: 11, color: ind.color }}>
                      {ind.outcomeDetail}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── input bar ── */}
        <div style={{
          position: "absolute", bottom: 60, left: 0, right: 0, height: 80,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "0 16px",
          display: "flex", alignItems: "center", gap: 10,
          zIndex: 20,
          background: "rgba(7,7,13,0.97)",
        }}>
          {/* text field — single line, no clipping */}
          <div style={{
            flex: 1, height: 40,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 22,
            padding: "0 14px",
            display: "flex", alignItems: "center",
            fontFamily: C.M, fontSize: 12,
            color: "rgba(255,255,255,0.82)",
            overflow: "hidden",
            minWidth: 0,
          }}>
            {inputText ? (
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>
                {inputText}
                <span style={{
                  display: "inline-block", width: 2, height: "0.78em",
                  background: ind.color, marginLeft: 1, verticalAlign: "middle",
                  animation: "cursor-blink 0.65s step-end infinite",
                }}/>
              </span>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 12 }}>Nachricht schreiben…</span>
            )}
          </div>
          {/* send button */}
          <motion.div
            animate={sending
              ? { scale: 0.82, opacity: 0.6 }
              : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: inputText ? ind.color : "rgba(255,255,255,0.05)",
              border: `1px solid ${inputText ? "transparent" : "rgba(255,255,255,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.25s ease, border-color 0.25s ease",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={inputText ? "#000" : "rgba(255,255,255,0.18)"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "stroke 0.25s ease" }}>
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </motion.div>
        </div>

        {/* ── pipeline ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          zIndex: 20,
          background: "rgba(7,7,13,0.98)",
        }}>
          {PIPELINE.map((label, i) => {
            const active = step > i;
            return (
              <div key={label} style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 5,
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: active ? `${glow}0.05)` : "transparent",
                transition: "background 0.5s ease",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: active ? ind.color : "rgba(255,255,255,0.12)",
                  boxShadow: active ? `0 0 7px ${ind.color}70` : "none",
                  transition: "all 0.5s ease",
                }}/>
                <span style={{
                  fontFamily: C.M, fontSize: 9,
                  color: active ? ind.color : "rgba(255,255,255,0.22)",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.5s ease",
                  letterSpacing: "0.02em",
                }}>{label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function Hero() {
  const he = [0.16, 1, 0.3, 1] as const;
  const { isMobile, isTablet } = useBreakpoint();

  return (
    <section style={{
      paddingTop: isMobile ? 84 : 100,
      paddingBottom: isMobile ? 44 : 100,
      borderBottom: `1px solid ${C.bd}`,
    }}>
      <div className="ctr">
        <div style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "1fr 1.3fr",
          gap: isMobile ? 40 : 80,
          alignItems: isTablet ? "flex-start" : "center",
          minHeight: isTablet ? "auto" : "calc(100vh - 96px)",
        }}>

          {/* ── left copy — staggered mount animation ── */}
          <div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: he, delay: 0 }}
              style={{
                fontFamily: C.M, fontSize: 11, letterSpacing: "0.15em",
                textTransform: "uppercase", color: C.acc, marginBottom: 28,
              }}
            >
              AFA — Agentur für Automatisierung
            </motion.p>

            {/* Headline — each line reveals separately */}
            <h1 style={{
              fontFamily: C.H, fontWeight: 800, letterSpacing: "-0.048em",
              fontSize: "clamp(2.8rem,5vw,5.2rem)", lineHeight: 1.04,
              color: "#fff", marginBottom: 28,
            }}>
              {["KI-Mitarbeiter", "für moderne", "Unternehmen."].map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.75, ease: he, delay: 0.08 + i * 0.13 }}
                  style={{ display: "block" }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            {/* Subtext — line by line, after headline */}
            <p style={{
              fontFamily: C.M, fontSize: isMobile ? 15 : 16, color: C.soft, lineHeight: 1.82,
              maxWidth: isMobile ? "100%" : 380, marginBottom: 40,
            }}>
              {[
                "Telefon. Chat. Website.",
                "Kunden gewinnen. Termine buchen.",
                "24/7 automatisch.",
              ].map((line, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.65, ease: he, delay: 0.52 + i * 0.09 }}
                  style={{ display: "block" }}
                >
                  {line}
                </motion.span>
              ))}
            </p>

            {/* Service pills — hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: he, delay: 0.82 }}
              style={{ display: isMobile ? "none" : "flex", flexWrap: "wrap", gap: 8, marginBottom: 48 }}
            >
              {["KI Telefon", "KI Chat", "KI Website", "Lead Gen", "Terminbuchung"].map(item => (
                <span key={item} style={{
                  fontFamily: C.M, fontSize: 11,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.46)",
                  borderRadius: 100, padding: "5px 14px",
                }}>{item}</span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: he, delay: 0.96 }}
              style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 14 : 18 }}
            >
              <a href="#kontakt"
                onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
                onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
                style={{
                  fontFamily: C.H, fontWeight: 700, fontSize: 15,
                  background: C.acc, color: "#000",
                  padding: "14px 32px", borderRadius: 8,
                  display: "inline-block",
                  boxShadow: "0 0 32px rgba(0,187,253,0.45)",
                  transition: "filter 0.15s",
                }}>Beratung buchen</a>
              <a href="#chat"
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.soft)}
                style={{
                  fontFamily: C.M, fontSize: 14, color: C.soft,
                  display: "flex", alignItems: "center", gap: 7,
                  transition: "color 0.15s",
                }}>
                Live Demo ansehen
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </motion.div>
          </div>

          {/* ── right demo ── */}
          <FadeIn delay={0.3}>
            <InViewReset margin="-100px">
              <HeroDemo />
            </InViewReset>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — KI CHAT ASSISTANT
═══════════════════════════════════════════════════════════════════════ */
/* --- 5 rotating industry demos --------------------------------- */
interface Industry {
  name: string; label: string; color: string; rgb: string;
  success: string; mobileSuccess: string;
  conv: { from: "lead" | "ai"; text: string }[];
  mobileConv: { from: "lead" | "ai"; text: string }[];
}

const INDUSTRIES: Industry[] = [
  {
    name: "Dental Studio Becker", label: "ZAHNARZT",
    color: "#a78bfa", rgb: "167,139,250",
    success: "Termin gebucht · Patientenakte angelegt · Bestätigung versendet",
    mobileSuccess: "Termin gebucht · Bestätigung versendet",
    conv: [
      { from: "lead", text: "Zahnreinigung diese Woche, bitte." },
      { from: "ai",   text: "Gerne! Dienstag 14:30 oder Freitag 10:00 Uhr wäre frei. Was passt Ihnen besser?" },
      { from: "lead", text: "Dienstag 14:30 Uhr wäre perfekt." },
      { from: "ai",   text: "Ihr Termin am Dienstag, 14:30 Uhr ist reserviert. Wir freuen uns auf Sie!" },
    ],
    mobileConv: [
      { from: "lead", text: "Zahnreinigung diese Woche bitte." },
      { from: "ai",   text: "Di. 14:30 oder Fr. 10:00 — was passt?" },
      { from: "lead", text: "Dienstag 14:30 Uhr bitte." },
      { from: "ai",   text: "Gebucht! Wir freuen uns auf Sie." },
    ],
  },
  {
    name: "PhysioPlus Berlin", label: "PHYSIO",
    color: "#34d399", rgb: "52,211,153",
    success: "Ersttermin gebucht · Vorbefund angefordert · SMS-Erinnerung aktiv",
    mobileSuccess: "Ersttermin gebucht · SMS-Erinnerung aktiv",
    conv: [
      { from: "lead", text: "Ich habe starke Rückenschmerzen." },
      { from: "ai",   text: "Das klingt unangenehm — ich helfe Ihnen sofort. Haben Sie eine Verordnung vom Arzt?" },
      { from: "lead", text: "Ja, die Verordnung habe ich dabei." },
      { from: "ai",   text: "Dann können wir morgen früh um 08:30 Uhr beginnen. Termin ist für Sie reserviert!" },
    ],
    mobileConv: [
      { from: "lead", text: "Ich habe starke Rückenschmerzen." },
      { from: "ai",   text: "Haben Sie eine Verordnung dabei?" },
      { from: "lead", text: "Ja, die habe ich." },
      { from: "ai",   text: "Morgen 08:30 Uhr gebucht — bis dann!" },
    ],
  },
  {
    name: "FitPro Hamburg", label: "FITNESS",
    color: "#fb923c", rgb: "251,146,60",
    success: "Probestunde gebucht · Trainer zugewiesen · Begrüßungsmail versendet",
    mobileSuccess: "Probestunde gebucht · Trainer zugewiesen",
    conv: [
      { from: "lead", text: "Was kostet eine Mitgliedschaft?" },
      { from: "ai",   text: "Ab 39€/Monat — und Samstag 10:00 Uhr haben wir eine kostenlose Probestunde frei. Interesse?" },
      { from: "lead", text: "Ja, Samstag 10 Uhr klingt perfekt!" },
      { from: "ai",   text: "Deine Probestunde ist gebucht! Coach Markus erwartet dich. Infos kommen gleich per Mail." },
    ],
    mobileConv: [
      { from: "lead", text: "Was kostet eine Mitgliedschaft?" },
      { from: "ai",   text: "Ab 39€. Sa. 10:00 Probestunde frei!" },
      { from: "lead", text: "Samstag 10 Uhr — perfekt!" },
      { from: "ai",   text: "Gebucht! Coach Markus erwartet dich." },
    ],
  },
  {
    name: "ShopPro Solutions", label: "E-COMMERCE",
    color: "#00bbfd", rgb: "0,187,253",
    success: "Tracking-Link versendet · Ticket geschlossen · Bewertungsanfrage geplant",
    mobileSuccess: "Tracking-Link versendet · Ticket geschlossen",
    conv: [
      { from: "lead", text: "Meine Bestellung kam noch nicht an." },
      { from: "ai",   text: "Bestellung #SP-29847 wurde heute früh versendet — Lieferung voraussichtlich morgen." },
      { from: "lead", text: "Super! Gibt es einen Tracking-Link?" },
      { from: "ai",   text: "Natürlich — ich schicke Ihnen den Link gerade per E-Mail. Noch weitere Fragen?" },
    ],
    mobileConv: [
      { from: "lead", text: "Bestellung noch nicht angekommen." },
      { from: "ai",   text: "Heute versendet — Lieferung morgen." },
      { from: "lead", text: "Super! Gibt es einen Tracking-Link?" },
      { from: "ai",   text: "Link per E-Mail gerade raus!" },
    ],
  },
  {
    name: "ImmoGroup Berlin", label: "IMMOBILIEN",
    color: "#fbbf24", rgb: "251,191,36",
    success: "Besichtigung gebucht · Exposé versendet · Lead im CRM erfasst",
    mobileSuccess: "Besichtigung gebucht · Exposé versendet",
    conv: [
      { from: "lead", text: "3-Zimmer Berlin-Mitte, bis 1.500€?" },
      { from: "ai",   text: "Wir haben 3 passende Objekte. Samstag den 7. hätte ich 14:00 und 16:00 Uhr frei — passt das?" },
      { from: "lead", text: "Beide Termine nehme ich, danke!" },
      { from: "ai",   text: "Beide Besichtigungen sind reserviert. Die Exposés erhalten Sie gleich per E-Mail!" },
    ],
    mobileConv: [
      { from: "lead", text: "3-Zimmer Berlin, bis 1.500€?" },
      { from: "ai",   text: "3 Objekte. Sa. 14:00 oder 16:00?" },
      { from: "lead", text: "Beide Termine nehme ich!" },
      { from: "ai",   text: "Beide gebucht! Exposés folgen." },
    ],
  },
];

function ChatMockup() {
  const { isMobile } = useBreakpoint();
  const [idx, setIdx]             = useState(0);
  const [msgs, setMsgs]           = useState<{ id: number; from: string; text: string; typing?: boolean }[]>([]);
  const [showDots, setShowDots]   = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending]     = useState(false);
  const [showSuccess, setSuccess] = useState(false);
  const [alpha, setAlpha]         = useState(0);
  const rid = useRef(0);
  const mid = useRef(0);

  useEffect(() => {
    const id = ++rid.current;
    const gone = () => rid.current !== id;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    setMsgs([]); setShowDots(false);
    setInputText(""); setSending(false); setSuccess(false); setAlpha(0);

    (async () => {
      await wait(80); if (gone()) return;
      setAlpha(1);
      await wait(500);

      const activeConv = isMobile ? INDUSTRIES[idx].mobileConv : INDUSTRIES[idx].conv;
      for (const msg of activeConv) {
        if (gone()) return;
        if (msg.from === "lead") {
          // user types in input bar
          await wait(380); if (gone()) return;
          for (let i = 1; i <= msg.text.length; i++) {
            if (gone()) return;
            setInputText(msg.text.slice(0, i));
            await wait(28);
          }
          await wait(160); if (gone()) return;
          setSending(true);
          await wait(110); if (gone()) return;
          setSending(false);
          setInputText("");
          setMsgs(p => [...p, { id: ++mid.current, from: "lead", text: msg.text }].slice(-6));
          await wait(240);
        } else {
          // AI: dots → typewriter in-place inside the committed bubble
          await wait(200); if (gone()) return;
          setShowDots(true);
          await wait(920); if (gone()) return;
          setShowDots(false);
          const nid = ++mid.current;
          setMsgs(p => [...p, { id: nid, from: "ai", text: msg.text.slice(0, 1), typing: true }].slice(-6));
          for (let i = 2; i <= msg.text.length; i++) {
            if (gone()) return;
            setMsgs(p => p.map(m => m.id === nid ? { ...m, text: msg.text.slice(0, i) } : m));
            await wait(18);
          }
          if (gone()) return;
          setMsgs(p => p.map(m => m.id === nid ? { ...m, typing: false } : m));
          await wait(360);
        }
      }

      if (gone()) return;
      await wait(180);
      setSuccess(true);
      await wait(2200);
      if (gone()) return;
      setAlpha(0);
      await wait(640);
      if (gone()) return;
      setIdx(p => (p + 1) % INDUSTRIES.length);
    })();
  }, [idx]);

  const ind  = INDUSTRIES[idx];
  const glow = `rgba(${ind.rgb},`;

  return (
    <div style={{
      position: "relative", height: isMobile ? 520 : 660,
      background: "rgba(6,6,11,0.99)", borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.07)",
      boxShadow: `0 48px 140px rgba(0,0,0,.82), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 120px ${glow}0.03)`,
      overflow: "hidden", transition: "box-shadow 1.4s ease",
      maxWidth: isMobile ? 340 : "none", margin: isMobile ? "0 auto" : undefined,
    }}>

      {/* ambient colour orbs */}
      <div style={{
        position: "absolute", right: -120, bottom: 0,
        width: 560, height: 560, borderRadius: "50%", pointerEvents: "none",
        background: `radial-gradient(circle, ${glow}0.12) 0%, transparent 60%)`,
        transition: "background 1.4s ease",
      }}/>
      <div style={{
        position: "absolute", left: -140, top: 20,
        width: 400, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: `radial-gradient(circle, ${glow}0.07) 0%, transparent 60%)`,
        transition: "background 1.4s ease",
      }}/>

      {/* gradient masks */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 130,
        background: "linear-gradient(to bottom, rgba(6,6,11,1) 30%, transparent 100%)",
        zIndex: 10, pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: 72, left: 0, right: 0, height: 56,
        background: "linear-gradient(to top, rgba(6,6,11,0.9) 0%, transparent 100%)",
        zIndex: 10, pointerEvents: "none",
      }}/>

      {/* header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: isMobile ? "18px 20px" : "24px 30px", zIndex: 20,
        display: "flex", alignItems: "center",
        opacity: alpha, transition: "opacity 0.52s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", display: "inline-block", flexShrink: 0,
            background: ind.color, boxShadow: `0 0 10px ${ind.color}90`,
            transition: "background 1.2s ease, box-shadow 1.2s ease",
          }}/>
          <span style={{
            fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 12 : 15, color: "rgba(255,255,255,0.9)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {ind.name}
          </span>
          <span style={{
            fontFamily: C.M, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", flexShrink: 0,
            background: `${glow}0.12)`, border: `1px solid ${glow}0.32)`,
            color: ind.color, borderRadius: 4, padding: "2px 8px",
            transition: "all 1.2s ease",
          }}>{ind.label}</span>
        </div>
        <div style={{ marginLeft: 8, display: isMobile ? "none" : "flex", gap: 6, flexShrink: 0 }}>
          {["Website", "WhatsApp", "Instagram"].map(ch => (
            <span key={ch} style={{
              fontFamily: C.M, fontSize: 10,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.32)", borderRadius: 4, padding: "3px 9px",
            }}>{ch}</span>
          ))}
        </div>
      </div>

      {/* message stream — stops above input bar */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 72, left: 0, right: 0,
        padding: "88px 28px 16px",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        gap: 14,
        opacity: alpha, transition: "opacity 0.52s ease",
        overflow: "hidden",
      }}>

        <AnimatePresence initial={false}>
          {msgs.map(msg => {
            const isAI = msg.from === "ai";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end", flexShrink: 0 }}>
                <div style={{
                  maxWidth: "82%", padding: isMobile ? "9px 13px" : "14px 20px",
                  background: isAI ? `${glow}0.10)` : "rgba(255,255,255,0.07)",
                  border: `1px solid ${isAI ? `${glow}0.22)` : "rgba(255,255,255,0.10)"}`,
                  borderRadius: isAI ? "5px 20px 20px 20px" : "20px 5px 20px 20px",
                  fontFamily: C.M, fontSize: isMobile ? 12 : 14,
                  color: isAI ? "#fff" : "rgba(255,255,255,0.82)",
                  lineHeight: 1.5,
                  boxShadow: isAI ? `0 0 30px ${glow}0.09)` : "none",
                  transition: "background 1.2s ease, border-color 1.2s ease, box-shadow 1.2s ease",
                  wordBreak: "break-word",
                }}>
                  {msg.text}
                  {msg.typing && <span style={{
                    display: "inline-block", width: 2, height: "0.84em",
                    background: ind.color, marginLeft: 2, verticalAlign: "middle",
                    animation: "cursor-blink 0.7s step-end infinite",
                  }}/>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* AI typing dots — LEFT side */}
        <AnimatePresence>
          {showDots && (
            <motion.div
              key="dots"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", justifyContent: "flex-start", flexShrink: 0 }}>
              <div style={{
                padding: "14px 20px",
                background: `${glow}0.10)`, border: `1px solid ${glow}0.22)`,
                borderRadius: "5px 20px 20px 20px",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: ind.color, display: "inline-block",
                    animation: `typing-bounce 0.8s ease ${i * 0.14}s infinite`,
                  }}/>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: 14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 9,
                background: `${glow}0.07)`, border: `1px solid ${glow}0.26)`,
                borderRadius: 10, padding: "12px 22px",
                boxShadow: `0 0 28px ${glow}0.12)`,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke={ind.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p style={{ fontFamily: C.M, fontSize: isMobile ? 11 : 12, fontWeight: 700, color: ind.color }}>
                  {isMobile ? ind.mobileSuccess : ind.success}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── input bar ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 72,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "0 20px",
        display: "flex", alignItems: "center", gap: 12,
        zIndex: 20,
        background: "rgba(6,6,11,0.98)",
        opacity: alpha, transition: "opacity 0.52s ease",
      }}>
        {/* text field */}
        <div style={{
          flex: 1, height: 42,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 22,
          padding: "0 16px",
          display: "flex", alignItems: "center",
          fontFamily: C.M, fontSize: 13,
          color: "rgba(255,255,255,0.82)",
          overflow: "hidden", position: "relative", minWidth: 0,
        }}>
          {inputText ? (
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", flex: 1 }}>
              {inputText}
              <span style={{
                display: "inline-block", width: 2, height: "0.8em",
                background: ind.color, marginLeft: 1, verticalAlign: "middle",
                animation: "cursor-blink 0.65s step-end infinite",
              }}/>
            </span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 12 }}>Nachricht schreiben…</span>
          )}
        </div>
        {/* send button */}
        <motion.div
          animate={sending ? { scale: 0.82, opacity: 0.6 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: inputText ? ind.color : "rgba(255,255,255,0.05)",
            border: `1px solid ${inputText ? "transparent" : "rgba(255,255,255,0.08)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.25s ease, border-color 0.25s ease",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={inputText ? "#000" : "rgba(255,255,255,0.18)"}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "stroke 0.25s ease" }}>
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </motion.div>
      </div>

    </div>
  );
}


function ChatSection() {
  const { isTablet, isMobile } = useBreakpoint();
  const chatItems = ["Sofortige Antworten in Sekunden", "Qualifiziert Leads automatisch", "Bucht Termine direkt im Gespräch", "Integriert in WhatsApp & Website"];
  return (
    <Section id="chat" bg={C.s1}>
      <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1.8fr", gap: isTablet ? 48 : 72, alignItems: "center" }}>
        <div>
          <Reveal delay={0}>
            <Label>KI Chat Assistant</Label>
          </Reveal>
          <div style={{ marginBottom: 20 }}>
            <H2Reveal lines={["Mehr Leads.", "Mehr Gespräche.", "Automatisch."]} delay={0.05} />
          </div>
          <Reveal delay={0.38}>
            <p style={{ fontFamily: C.M, fontSize: 13, color: C.soft, lineHeight: 1.8, margin: "0 0 32px" }}>
              Ihr KI-Assistent antwortet sofort — auf Ihrer Website, WhatsApp und Social Media. Rund um die Uhr, auf Deutsch.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(isMobile ? chatItems.slice(0, 3) : chatItems).map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.acc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: C.M, fontSize: 12, color: C.soft }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <CardReveal delay={0.15}>
          <InViewReset margin="-80px">
            <ChatMockup />
          </InViewReset>
        </CardReveal>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — KI TELEFONASSISTENT
═══════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — KI CALL ASSISTANT
═══════════════════════════════════════════════════════════════════════ */
const WAVE_H = [32,48,72,51,88,62,38,76,55,82,42,68,91,52,72,47,86,57,37,77,62,43,81,57,71,46,67,87,51,37,76,61];

const CALL_CONV = [
  { sp: "ANRUFER" as const, txt: "Guten Tag, ich würde gerne einen Termin vereinbaren — am liebsten diese Woche." },
  { sp: "KI"      as const, txt: "Gerne helfe ich Ihnen! Für welchen Tag hätten Sie denn Interesse?" },
  { sp: "ANRUFER" as const, txt: "Mittwoch oder Donnerstag wäre mir am liebsten, wenn möglich." },
  { sp: "KI"      as const, txt: "Mittwoch um 10:00 Uhr ist noch frei. Soll ich den Termin reservieren?" },
  { sp: "ANRUFER" as const, txt: "Ja bitte, das wäre super!" },
  { sp: "KI"      as const, txt: "Termin Mittwoch 10:00 Uhr gebucht. Eine SMS-Bestätigung kommt gleich." },
];

const CALL_EVENTS = [
  { color: "#00bbfd", rgb: "0,187,253",   d: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8", label: "Sprache erkannt",  sub: "Terminanfrage · 98% Konfidenz" },
  { color: "#34d399", rgb: "52,211,153",   d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",   label: "Kalender geprüft", sub: "Mi. 10:00 Uhr ist verfügbar" },
  { color: "#a78bfa", rgb: "167,139,250",  d: "M20 6 9 17l-5-5",  label: "Termin gebucht",   sub: "Hr. Weber · Mi. 10:00 Uhr" },
  { color: "#fbbf24", rgb: "251,191,36",   d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",  label: "SMS versendet",    sub: '"Ihr Termin am Mi. 10:00..."' },
];

function PhoneMockupInner({ onDone }: { onDone: () => void }) {
  const { isMobile } = useBreakpoint();
  const [phase, setPhase]     = useState<"ringing"|"live"|"done">("ringing");
  const [fading, setFading]   = useState(false);
  const [secs, setSecs]       = useState(0);
  const [lines, setLines]     = useState<typeof CALL_CONV>([]);
  const [evs, setEvs]         = useState<typeof CALL_EVENTS>([]);
  const rid = useRef(0);

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    const id = ++rid.current;
    const gone = () => rid.current !== id;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    setPhase("ringing"); setFading(false); setSecs(0); setLines([]); setEvs([]);

    (async () => {
      await wait(1400); if (gone()) return;
      setPhase("live");

      await wait(700);  if (gone()) return; setLines(p => [...p, CALL_CONV[0]]);
      await wait(500);  if (gone()) return; setEvs(p => [...p, CALL_EVENTS[0]]);
      await wait(900);  if (gone()) return; setLines(p => [...p, CALL_CONV[1]]);
      await wait(1100); if (gone()) return;
        setLines(p => [...p, CALL_CONV[2]]);
        setEvs(p => [...p, CALL_EVENTS[1]]);
      await wait(900);  if (gone()) return; setLines(p => [...p, CALL_CONV[3]]);
      await wait(1000); if (gone()) return; setLines(p => [...p, CALL_CONV[4]]);
      await wait(900);  if (gone()) return;
        setLines(p => [...p, CALL_CONV[5]]);
        setEvs(p => [...p, CALL_EVENTS[2]]);
      await wait(500);  if (gone()) return; setEvs(p => [...p, CALL_EVENTS[3]]);
      await wait(2800); if (gone()) return;
      setPhase("done");
      // smooth fade-out before re-mount
      setFading(true);
      await wait(520);  if (gone()) return;
      onDone();
    })();
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Shared waveform bars ──────────────────────────────────────────
  const waveform = (
    <div style={{ borderBottom: `1px solid ${C.bd}`, padding: "8px 18px", height: 52, display: "flex", alignItems: "center", gap: 3 }}>
      {WAVE_H.map((h, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 2, background: `rgba(0,187,253,${0.3 + (h / 100) * 0.4})`, height: Math.max(h * 0.38, 4), transformOrigin: "center 50%", animation: `wave-bar ${0.45 + (i % 7) * 0.06}s ease ${(i % 9) * 0.05}s infinite alternate` }} />
      ))}
    </div>
  );

  // ── Mobile render: fixed height, opacity-only animations ──────────
  if (isMobile) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        opacity: fading ? 0 : 1, transition: "opacity 0.48s ease",
        height: 430, overflow: "hidden",
      }}>
        {/* call card */}
        <div style={{ background: C.s2, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.bd}`, flexShrink: 0 }}>
          {/* header — min-height keeps it stable in both states */}
          <div style={{ background: C.s1, borderBottom: `1px solid ${C.bd}`, padding: "12px 16px", display: "flex", alignItems: "center", minHeight: 58 }}>
            {phase === "ringing" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", display: "flex", alignItems: "center", justifyContent: "center", animation: "phone-ring 1.2s ease infinite" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div>
                  <p style={{ fontFamily: C.H, fontWeight: 700, fontSize: 12, color: C.text }}>Eingehender Anruf</p>
                  <p style={{ fontFamily: C.M, fontSize: 10, color: "#fbbf24" }}>+49 89 456 789 · klingelt…</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: C.M, fontSize: 11, fontWeight: 600, color: "#34d399" }}>Aktiver Anruf</span>
                <span style={{ marginLeft: "auto", fontFamily: C.M, fontSize: 11, color: C.muted }}>{fmt(secs)}</span>
              </div>
            )}
          </div>
          {/* waveform — always in DOM, opacity-only */}
          <motion.div animate={{ opacity: phase === "live" ? 1 : 0 }} transition={{ duration: 0.45 }} style={{ pointerEvents: "none" }}>
            {waveform}
          </motion.div>
          {/* transcript — fixed height, all lines always in DOM */}
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7, height: 148, overflow: "hidden" }}>
            <p style={{ fontFamily: C.M, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 2, flexShrink: 0 }}>Live-Transkript</p>
            {CALL_CONV.map((ln, i) => (
              <motion.div key={i} animate={{ opacity: lines.length > i ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }} style={{ display: "flex", gap: 7, alignItems: "flex-start", flexShrink: 0 }}>
                <span style={{ fontFamily: C.M, fontSize: 9, fontWeight: 700, color: ln.sp === "KI" ? C.acc : "rgba(255,255,255,0.45)", minWidth: 44, flexShrink: 0, paddingTop: 1 }}>{ln.sp}</span>
                <p style={{ fontFamily: C.M, fontSize: 10, lineHeight: 1.4, color: "rgba(255,255,255,0.75)" }}>{ln.txt}</p>
              </motion.div>
            ))}
          </div>
        </div>
        {/* events — always 4 in DOM, opacity-only */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, flexShrink: 0 }}>
          {CALL_EVENTS.map((ev, i) => (
            <motion.div key={i} animate={{ opacity: evs.length > i ? 1 : 0, scale: evs.length > i ? 1 : 0.94 }} transition={{ duration: 0.36, ease: [0.22,1,0.36,1] }}
              style={{ background: `rgba(${ev.rgb},0.07)`, border: `1px solid rgba(${ev.rgb},0.22)`, borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: `rgba(${ev.rgb},0.15)`, border: `1px solid rgba(${ev.rgb},0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={ev.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={ev.d}/></svg>
              </div>
              <div>
                <p style={{ fontFamily: C.M, fontSize: 10, fontWeight: 700, color: ev.color, marginBottom: 1 }}>{ev.label}</p>
                <p style={{ fontFamily: C.M, fontSize: 9, color: C.muted, lineHeight: 1.3 }}>{ev.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Desktop render: original animated layout ──────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 10,
      opacity: fading ? 0 : 1,
      transition: "opacity 0.48s ease",
    }}>

      {/* ── main call card ── */}
      <div style={{
        background: C.s2, borderRadius: 14, overflow: "hidden",
        border: `1px solid ${C.bd}`,
        boxShadow: "0 40px 80px rgba(0,0,0,.6)",
      }}>

        {/* call header */}
        <div style={{
          background: C.s1, borderBottom: `1px solid ${C.bd}`,
          padding: "14px 18px", display: "flex", alignItems: "center",
        }}>
          {phase === "ringing" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "phone-ring 1.2s ease infinite",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: C.H, fontWeight: 700, fontSize: 13, color: C.text }}>Eingehender Anruf</p>
                <p style={{ fontFamily: C.M, fontSize: 11, color: "#fbbf24" }}>+49 89 456 789 · klingelt…</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%", background: "#34d399",
                display: "inline-block", boxShadow: "0 0 0 3px rgba(52,211,153,0.18)", flexShrink: 0,
              }}/>
              <span style={{ fontFamily: C.M, fontSize: 12, fontWeight: 600, color: "#34d399" }}>Aktiver Anruf</span>
              <span style={{ fontFamily: C.M, fontSize: 12, color: C.muted }}>— +49 89 456 789</span>
              <span style={{ marginLeft: "auto", fontFamily: C.M, fontSize: 12, color: C.muted }}>
                {fmt(secs)}
              </span>
            </div>
          )}
        </div>

        {/* waveform — only when live */}
        {phase === "live" && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }}
            style={{ borderBottom: `1px solid ${C.bd}`, padding: "8px 18px", height: 52, display: "flex", alignItems: "center", gap: 3 }}>
            {WAVE_H.map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 2, background: `rgba(0,187,253,${0.3 + (h / 100) * 0.4})`, height: Math.max(h * 0.38, 4), transformOrigin: "center 50%", animation: `wave-bar ${0.45 + (i % 7) * 0.06}s ease ${(i % 9) * 0.05}s infinite alternate` }} />
            ))}
          </motion.div>
        )}

        {/* transcript */}
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10, minHeight: 140 }}>
          <p style={{
            fontFamily: C.M, fontSize: 9, letterSpacing: "0.14em",
            textTransform: "uppercase", color: C.muted, marginBottom: 2,
          }}>Live-Transkript</p>
          <AnimatePresence>
            {lines.map((ln, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.3 } }}
                transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  fontFamily: C.M, fontSize: 10, fontWeight: 700,
                  color: ln.sp === "KI" ? C.acc : "rgba(255,255,255,0.52)",
                  minWidth: 54, flexShrink: 0, paddingTop: 1,
                  letterSpacing: "0.04em",
                }}>{ln.sp}</span>
                <p style={{
                  fontFamily: C.M, fontSize: 13, lineHeight: 1.58,
                  color: "rgba(255,255,255,0.78)",
                }}>{ln.txt}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── automation events ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <AnimatePresence>
          {evs.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.94, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0,  scale: 1,    filter: "blur(0px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: `rgba(${ev.rgb},0.07)`,
                border: `1px solid rgba(${ev.rgb},0.22)`,
                borderRadius: 10, padding: "13px 15px",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: `rgba(${ev.rgb},0.15)`,
                border: `1px solid rgba(${ev.rgb},0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={ev.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={ev.d}/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: C.M, fontSize: 11, fontWeight: 700, color: ev.color, marginBottom: 2 }}>
                  {ev.label}
                </p>
                <p style={{ fontFamily: C.M, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>
                  {ev.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

function PhoneMockup() {
  const [key, setKey] = useState(0);
  return <PhoneMockupInner key={key} onDone={() => setKey(k => k + 1)} />;
}

function PhoneSection() {
  const { isTablet, isMobile } = useBreakpoint();
  const phoneItems = ["Nimmt alle Anrufe entgegen — 24/7", "Spricht natürliches Deutsch", "Live Sprache-zu-Text Transkription", "Bucht direkt in Ihren Kalender", "Sendet SMS-Bestätigung automatisch", "Übergibt komplexe Fälle ans Team"];
  return (
    <Section id="telefon">
      <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1.4fr 1fr", gap: isTablet ? 48 : 80, alignItems: "start" }}>
        <div style={{ order: isTablet ? 2 : 0 }}>
          <CardReveal delay={0}>
            <InViewReset margin="-80px">
              <PhoneMockup />
            </InViewReset>
          </CardReveal>
        </div>
        <div style={{ order: isTablet ? 1 : 0 }}>
          <Reveal delay={0.12}>
            <Label>KI Telefonassistent</Label>
          </Reveal>
          <div style={{ marginBottom: 20 }}>
            <H2Reveal lines={["Kein Anruf", "bleibt", "unbeantwortet."]} delay={0.16} />
          </div>
          <Reveal delay={0.44}>
            <p style={{ fontFamily: C.M, fontSize: 13, color: C.soft, lineHeight: 1.8, margin: "0 0 32px" }}>
              Ihr KI-Telefonassistent nimmt jeden Anruf an, führt natürliche Gespräche auf Deutsch und bucht Termine direkt in Ihren Kalender — rund um die Uhr.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(isMobile ? phoneItems.slice(0, 3) : phoneItems).map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.acc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: C.M, fontSize: 12, color: C.soft }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — PREMIUM WEBSITES
═══════════════════════════════════════════════════════════════════════ */
function WebsiteMockupInner({ onDone }: { onDone?: () => void }) {
  // Stage 1 (0–1): blank browser appears
  // Stage 2 (1–5): hero section builds — logo → nav → headline → CTA → cards
  // Stage 3 (6–8): conversion — cursor moves → cursor clicks → toast → badge (desktop only)
  const [phase, setPhase]       = useState(0);
  const [clicking, setClicking] = useState(false);
  const rid = useRef(0);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const id = ++rid.current;
    const gone = () => rid.current !== id;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    setPhase(0); setClicking(false);
    (async () => {
      await wait(700);  if (gone()) return; setPhase(1);
      await wait(650);  if (gone()) return; setPhase(2);
      await wait(600);  if (gone()) return; setPhase(3);
      await wait(650);  if (gone()) return; setPhase(4);
      await wait(550);  if (gone()) return; setPhase(5);
      await wait(1000); if (gone()) return; setPhase(6);
      await wait(1200); if (gone()) return; setClicking(true);
      await wait(160);  if (gone()) return; setClicking(false);
      await wait(120);  if (gone()) return; setPhase(7);
      await wait(820);  if (gone()) return; setPhase(8);
      await wait(3000); if (gone()) return; onDone?.();
    })();
  }, [isMobile]);

  const CARDS = [
    { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Beratung" },
    { icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",                                                   label: "Umsetzung" },
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",                                                          label: "Wachstum" },
  ];

  // Desktop: canvas pad 36 + navbar 36 + margin 36 + headline 119 + margin 28 → button center ≈ 264px top, 68px left
  // Mobile:  canvas pad 20 + navbar 28 + margin 20 + headline 63 + margin 16 → button center ≈ 162px top, 26px left
  const cursorTop  = phase >= 6 ? (isMobile ? 162 : 264) : (isMobile ? 24 : 44);
  const cursorLeft = phase >= 6 ? (isMobile ? 26  : 68)  : (isMobile ? 20 : 44);

  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "#08080c",
      boxShadow: [
        "0 70px 160px rgba(0,0,0,0.9)",
        "0 0 0 1px rgba(255,255,255,0.03)",
        "0 0 80px rgba(0,187,253,0.04)",
      ].join(", "),
      maxWidth: isMobile ? 340 : "none",
      margin: isMobile ? "0 auto" : undefined,
    }}>

      {/* ── browser chrome ── */}
      <div style={{
        background: "rgba(255,255,255,0.025)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, opacity: 0.75 }} />
          ))}
        </div>
        <div style={{
          flex: 1, maxWidth: 280, margin: "0 auto",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8, height: 28,
          display: "flex", alignItems: "center", padding: "0 12px", gap: 7,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{ fontFamily: C.M, fontSize: 11, color: "rgba(255,255,255,0.28)" }}>müllergmbh.de</span>
        </div>
      </div>

      {/* ── page canvas ── */}
      <div style={{ position: "relative", background: "#09090b", overflow: "hidden" }}>

        {/* subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />

        <div style={{ padding: isMobile ? "20px 18px 24px" : "36px 40px 44px" }}>

          {/* Navbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 20 : 36 }}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={phase >= 1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <div style={{
                width: isMobile ? 22 : 30, height: isMobile ? 22 : 30, borderRadius: isMobile ? 6 : 8,
                background: C.acc, boxShadow: "0 0 18px rgba(0,187,253,0.55)", flexShrink: 0,
              }} />
              {!isMobile && <div style={{ width: 70, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.2)" }} />}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
              style={{ display: "flex", alignItems: "center", gap: isMobile ? 0 : 28 }}
            >
              {!isMobile && [52,38,46].map((w, i) => (
                <div key={i} style={{ width: w, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} />
              ))}
              <div style={{
                height: isMobile ? 28 : 36, paddingInline: isMobile ? 14 : 22, borderRadius: 9,
                background: C.acc, display: "flex", alignItems: "center",
                boxShadow: "0 0 22px rgba(0,187,253,0.5)",
              }}>
                <span style={{ fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 11 : 13, color: "#000", whiteSpace: "nowrap" }}>
                  Anfragen
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero headline */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.68, ease: [0.22,1,0.36,1] }}
            style={{ marginBottom: isMobile ? 16 : 28 }}
          >
            <div style={{
              fontFamily: C.H, fontWeight: 800,
              fontSize: isMobile ? 20 : 34, lineHeight: 1.16,
              letterSpacing: "-0.04em",
              color: "#fff", marginBottom: isMobile ? 10 : 16,
            }}>
              Ihr Auftritt.<br />
              <span style={{ color: C.acc }}>Ihr Wachstum.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 6, width: "58%", background: "rgba(255,255,255,0.09)", borderRadius: 4 }} />
              <div style={{ height: 6, width: "42%", background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22,1,0.36,1] }}
            style={{ marginBottom: isMobile ? 20 : 40 }}
          >
            <motion.div
              animate={clicking ? { scale: 0.93 } : { scale: 1 }}
              transition={{ duration: 0.13, ease: "easeOut" }}
              style={{ display: "inline-block" }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                height: isMobile ? 36 : 46, paddingInline: isMobile ? 18 : 30, borderRadius: 11,
                background: C.acc,
                boxShadow: "0 0 22px rgba(0,187,253,0.55)",
                transition: "box-shadow 0.45s ease",
              }}>
                <span style={{ fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 12 : 15, color: "#000" }}>
                  Jetzt anfragen
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Service cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: isMobile ? 8 : 14 }}>
            {CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={phase >= 5 ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ duration: 0.6, ease: [0.22,1,0.36,1], delay: i * 0.13 }}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: isMobile ? 10 : 14,
                  padding: isMobile ? "14px 12px 12px" : "22px 18px 20px",
                  display: "flex", flexDirection: "column", gap: isMobile ? 8 : 14,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "rgba(0,187,253,0.09)",
                  border: "1px solid rgba(0,187,253,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={card.icon} />
                  </svg>
                </div>
                <span style={{ fontFamily: C.M, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                  {card.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── cursor — desktop only ── */}
        <motion.div
          animate={clicking ? { scale: 0.78 } : { scale: 1 }}
          transition={{ duration: 0.13, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: cursorTop, left: cursorLeft,
            transition: "top 1.1s cubic-bezier(0.25,0.46,0.45,0.94), left 1.1s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease",
            opacity: phase >= 1 ? 1 : 0,
            pointerEvents: "none", zIndex: 20,
          }}>
          <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
            <path d="M4 2.5L17.5 13H10L14 21.5L11 22.5L7 14L2.5 18.5L4 2.5Z"
              fill="white" stroke="rgba(0,0,0,0.35)" strokeWidth="1.2"/>
          </svg>
        </motion.div>

        {/* ── toast: Neue Anfrage erhalten ── */}
        <AnimatePresence>
          {phase >= 7 && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, x: 48, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.52, ease: [0.22,1,0.36,1] }}
              style={{
                position: "absolute", top: isMobile ? 14 : 22, right: isMobile ? 14 : 22,
                background: "rgba(9,9,14,0.94)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
                borderRadius: isMobile ? 12 : 16,
                padding: isMobile ? "10px 14px" : "16px 20px",
                display: "flex", alignItems: "center", gap: isMobile ? 10 : 14,
                boxShadow: [
                  "0 24px 60px rgba(0,0,0,0.7)",
                  "0 0 0 1px rgba(255,255,255,0.05)",
                  "0 0 24px rgba(0,187,253,0.08)",
                ].join(", "),
                minWidth: isMobile ? 150 : 216,
              }}
            >
              <div style={{
                width: isMobile ? 30 : 40, height: isMobile ? 30 : 40, borderRadius: isMobile ? 8 : 11, flexShrink: 0,
                background: "rgba(0,187,253,0.1)",
                border: "1px solid rgba(0,187,253,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={isMobile ? 13 : 17} height={isMobile ? 13 : 17} viewBox="0 0 24 24" fill="none"
                  stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 11 : 14, color: "#fff", marginBottom: 2 }}>
                  Neue Anfrage
                </p>
                <p style={{ fontFamily: C.M, fontSize: isMobile ? 10 : 11, color: C.muted }}>
                  gerade eben
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── badge: Termin gebucht ── */}
        <AnimatePresence>
          {phase >= 8 && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, ease: [0.22,1,0.36,1] }}
              style={{
                position: "absolute", bottom: isMobile ? 18 : 26, right: isMobile ? 14 : 22,
                background: "rgba(52,211,153,0.09)",
                border: "1px solid rgba(52,211,153,0.32)",
                backdropFilter: "blur(14px)",
                borderRadius: 40,
                padding: isMobile ? "8px 16px" : "11px 24px",
                display: "flex", alignItems: "center", gap: isMobile ? 7 : 10,
                boxShadow: "0 10px 40px rgba(52,211,153,0.15)",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "#34d399", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 12 : 14, color: "#34d399", whiteSpace: "nowrap" }}>
                Termin gebucht
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function WebsiteMockup() {
  const [key, setKey] = useState(0);
  return <WebsiteMockupInner key={key} onDone={() => setKey(k => k + 1)} />;
}

function WebsiteSection() {
  const { isTablet, isMobile } = useBreakpoint();
  const webItems = ["Bis zu 5× mehr Anfragen", "Eingebetteter KI-Chat-Assistent", "Mobile-first & blitzschnell", "SEO-optimiert ab Tag 1"];
  return (
    <Section id="websites" bg={C.s1}>
      <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 1.6fr", gap: isTablet ? 48 : 80, alignItems: "center" }}>
        <div>
          <Reveal delay={0}>
            <Label>Premium Websites</Label>
          </Reveal>
          <div style={{ marginBottom: 20 }}>
            <H2Reveal lines={["Websites", "die verkaufen."]} delay={0.05} />
          </div>
          <Reveal delay={0.36}>
            <p style={{ fontFamily: C.M, fontSize: 13, color: C.soft, lineHeight: 1.8, margin: "0 0 32px" }}>
              Nicht nur schön — sondern gebaut um Anfragen zu generieren. Mit eingebautem KI-Chat und Conversion-Optimierung.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(isMobile ? webItems.slice(0, 3) : webItems).map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.acc} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontFamily: C.M, fontSize: 12, color: C.soft }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <CardReveal delay={0.15}>
          <InViewReset margin="-80px">
            <WebsiteMockup />
          </InViewReset>
        </CardReveal>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — KI MITARBEITER SYSTEM
═══════════════════════════════════════════════════════════════════════ */
const FLOW_MODULES = [
  { label: "Chat",      color: "#00bbfd", rgb: "0,187,253",   status: "Antwortet in Echtzeit",  icon: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" },
  { label: "Telefon",   color: "#a78bfa", rgb: "167,139,250",  status: "Verarbeitet Anruf",      icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" },
  { label: "Kalender",  color: "#34d399", rgb: "52,211,153",   status: "Prüft Verfügbarkeit",   icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "CRM",       color: "#fbbf24", rgb: "251,191,36",   status: "Speichert Lead",         icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "SMS",       color: "#f472b6", rgb: "244,114,182",  status: "Sendet Bestätigung",    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { label: "Dashboard", color: "#fb923c", rgb: "251,146,60",   status: "Wird aktualisiert",     icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const FLOW_RESULTS = [
  { label: "Termin gebucht",      color: "#34d399", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { label: "Lead erfasst",        color: "#00bbfd", icon: "M20 6 9 17l-5-5" },
  { label: "Team benachrichtigt", color: "#a78bfa", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.437L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
];

/* Thin animated arrow connector between flow zones */
function FlowArrow({ active, color = C.acc }: { active: boolean; color?: string }) {
  return (
    <div style={{ flex: "0 0 38px", height: 2, position: "relative", margin: "0 4px", zIndex: 1, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden" }}>
        {active && (
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: "50%", height: "100%",
            background: `linear-gradient(to right, transparent, ${color}cc, transparent)`,
            animation: "flow-right 0.88s ease-in-out infinite",
          }} />
        )}
      </div>
      <div style={{
        position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
        borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
        borderLeft: `6px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        transition: "border-left-color 0.4s ease",
        opacity: active ? 0.7 : 1,
      }} />
    </div>
  );
}

function SystemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  const [phase, setPhase] = useState(0);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!inView) { setPhase(0); return; }
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        setPhase(0);
        await wait(500);  if (cancelled) return; setPhase(1);  // request card appears
        await wait(950);  if (cancelled) return; setPhase(2);  // connector req→core glows
        await wait(950);  if (cancelled) return; setPhase(3);  // AI core lights up
        await wait(800);  if (cancelled) return; setPhase(4);  // Chat
        await wait(380);  if (cancelled) return; setPhase(5);  // Telefon
        await wait(380);  if (cancelled) return; setPhase(6);  // Kalender
        await wait(380);  if (cancelled) return; setPhase(7);  // CRM
        await wait(380);  if (cancelled) return; setPhase(8);  // SMS
        await wait(380);  if (cancelled) return; setPhase(9);  // Dashboard
        await wait(700);  if (cancelled) return; setPhase(10); // result card
        await wait(4800); if (cancelled) return;
      }
    })();
    return () => { cancelled = true; };
  }, [inView]);

  return (
    <Section id="system" bg={C.bg}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 72 }}>
        <Reveal delay={0}><Label>KI Mitarbeiter System</Label></Reveal>
        <H2Reveal center lines={["Eine Anfrage.", "Alles erledigt."]} delay={0.08} />
        <Reveal delay={0.3}>
          <p style={{ fontFamily: C.M, fontSize: 13, color: C.soft, lineHeight: 1.8, maxWidth: 520, margin: "20px auto 0" }}>
            Beobachten Sie, wie eine Kundenanfrage durch das gesamte System fließt — und in Sekunden zu einem gebuchten Termin wird.
          </p>
        </Reveal>
      </div>

      {/* IntersectionObserver anchor (zero height) */}
      <div ref={ref} style={{ height: 0, overflow: "hidden", pointerEvents: "none" }} />

      {/* ── Mobile: vertical stack ── */}
      {isMobile && (
        <div style={{
          background: C.s1, border: `1px solid ${C.bd}`,
          borderRadius: 20, padding: "20px 16px",
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "28px 28px" }} />

          {/* Incoming channels */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", position: "relative", zIndex: 1 }}>
            {([
              { ch: "WhatsApp", color: "#34d399", rgb: "52,211,153" },
              { ch: "Telefon",  color: "#a78bfa", rgb: "167,139,250" },
              { ch: "E-Mail",   color: "#fbbf24", rgb: "251,191,36"  },
            ] as const).map((item, i) => (
              <motion.div key={item.ch}
                initial={{ opacity: 0, y: -6 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.38, ease: [0.22,1,0.36,1], delay: i * 0.1 }}
                style={{
                  background: `rgba(${item.rgb},0.07)`,
                  border: `1px solid rgba(${item.rgb},0.22)`,
                  borderRadius: 8, padding: "6px 10px",
                  fontFamily: C.M, fontSize: 10, color: item.color,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                {item.ch}
              </motion.div>
            ))}
          </div>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 auto", zIndex: 1, position: "relative" }} />

          {/* Request card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
            style={{ background: C.s2, border: "1px solid rgba(0,187,253,0.22)", borderRadius: 12, padding: "14px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", position: "relative", zIndex: 1 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: "rgba(0,187,253,0.1)", border: "1px solid rgba(0,187,253,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
              </div>
              <div>
                <p style={{ fontFamily: C.M, fontSize: 8, color: C.acc, letterSpacing: "0.1em" }}>ANFRAGE</p>
                <p style={{ fontFamily: C.M, fontSize: 9, color: C.muted }}>Website · jetzt</p>
              </div>
            </div>
            <p style={{ fontFamily: C.M, fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>"Ich brauche einen Termin diese Woche"</p>
          </motion.div>

          <div style={{ width: 1, height: 18, background: "rgba(0,187,253,0.3)", margin: "0 auto", zIndex: 1, position: "relative" }} />

          {/* AI Core */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              {[0,1].map(i => (
                <motion.div key={i}
                  initial={{ opacity: 0 }}
                  animate={phase >= 3 ? { opacity: [0, 0.5, 0], scale: [1, 1.8, 2.3] } : {}}
                  transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity, delay: i * 1.1 }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(0,187,253,0.5)", pointerEvents: "none" }} />
              ))}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: phase >= 3 ? "radial-gradient(circle, rgba(0,187,253,0.2) 0%, rgba(0,187,253,0.05) 70%)" : "radial-gradient(circle, rgba(0,187,253,0.07) 0%, transparent 70%)",
                border: `2px solid ${phase >= 3 ? "rgba(0,187,253,0.62)" : "rgba(0,187,253,0.18)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                transition: "background 0.5s ease, border-color 0.5s ease",
                animation: phase >= 3 ? "core-glow 2.4s ease-in-out infinite" : "none",
              }}>
                <span style={{ fontFamily: C.H, fontWeight: 800, fontSize: 12, color: phase >= 3 ? C.acc : "rgba(0,187,253,0.32)", letterSpacing: "0.04em", transition: "color 0.5s ease" }}>KI</span>
                <span style={{ fontFamily: C.M, fontSize: 7, color: phase >= 3 ? "rgba(0,187,253,0.72)" : "rgba(0,187,253,0.18)", letterSpacing: "0.08em", transition: "color 0.5s ease" }}>MITARBEITER</span>
              </div>
            </div>
          </div>

          <div style={{ width: 1, height: 18, background: "rgba(52,211,153,0.3)", margin: "0 auto", zIndex: 1, position: "relative" }} />

          {/* Modules 2×3 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, position: "relative", zIndex: 1 }}>
            {FLOW_MODULES.map((mod, i) => {
              const active = phase >= 4 + i;
              return (
                <motion.div key={mod.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={phase >= 2 ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.38, ease: [0.22,1,0.36,1], delay: i * 0.05 }}
                  style={{ background: active ? `rgba(${mod.rgb},0.09)` : "rgba(255,255,255,0.025)", border: `1px solid ${active ? `rgba(${mod.rgb},0.32)` : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "10px", transition: "background 0.38s ease, border-color 0.38s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: active ? `rgba(${mod.rgb},0.15)` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? `rgba(${mod.rgb},0.3)` : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.38s ease" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={active ? mod.color : "rgba(255,255,255,0.22)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.38s ease" }}><path d={mod.icon}/></svg>
                    </div>
                    <span style={{ fontFamily: C.M, fontSize: 10, fontWeight: 600, color: active ? mod.color : "rgba(255,255,255,0.26)", transition: "color 0.38s ease", flex: 1 }}>{mod.label}</span>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: active ? mod.color : "rgba(255,255,255,0.08)", boxShadow: active ? `0 0 6px ${mod.color}` : "none", transition: "all 0.38s ease" }} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Result — inside mobile card, opacity-only (no layout shift) */}
          <motion.div
            animate={{ opacity: phase >= 10 ? 1 : 0 }}
            transition={{ duration: 0.52, ease: [0.22,1,0.36,1] }}
            style={{
              background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.20)",
              borderRadius: 10, padding: "10px 14px", position: "relative", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap",
            }}
          >
            <p style={{ fontFamily: C.M, fontSize: 9, color: "#34d399", letterSpacing: "0.12em" }}>ABGESCHLOSSEN</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {FLOW_RESULTS.map((r) => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={r.icon}/></svg>
                  <span style={{ fontFamily: C.M, fontSize: 10, color: "rgba(255,255,255,0.72)" }}>{r.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Desktop: original 3-col grid ── */}
      {!isMobile && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          background: C.s1, border: `1px solid ${C.bd}`,
          borderRadius: 20, padding: "36px 28px",
          position: "relative", overflow: "hidden",
        }}>

          {/* subtle dot grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* ── LEFT COLUMN: incoming activity + request card + connector ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", zIndex: 1, gap: 12 }}>

            {/* Floating incoming mini-cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
              {([
                { ch: "WhatsApp", sub: "Neue Anfrage",      color: "#34d399", rgb: "52,211,153",   pulse: 0 },
                { ch: "Telefon",  sub: "Eingehender Anruf", color: "#a78bfa", rgb: "167,139,250",  pulse: 1 },
                { ch: "E-Mail",   sub: "Kundenanfrage",     color: "#fbbf24", rgb: "251,191,36",   pulse: 2 },
              ] as const).map((item, i) => (
                <motion.div key={item.ch}
                  initial={{ opacity: 0, x: -14 }}
                  animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
                  transition={{ duration: 0.44, ease: [0.22,1,0.36,1], delay: 0.08 + i * 0.13 }}
                  style={{
                    background: `rgba(${item.rgb},0.05)`,
                    border: `1px solid rgba(${item.rgb},0.17)`,
                    borderRadius: 9, padding: "7px 10px",
                    display: "flex", alignItems: "center", gap: 8,
                    width: 126,
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: `rgba(${item.rgb},0.12)`,
                    border: `1px solid rgba(${item.rgb},0.22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: C.M, fontSize: 8, color: item.color, letterSpacing: "0.06em", lineHeight: 1 }}>{item.ch}</p>
                    <p style={{ fontFamily: C.M, fontSize: 9, color: "rgba(255,255,255,0.42)", lineHeight: 1.3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</p>
                  </div>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%", background: item.color,
                    display: "inline-block", flexShrink: 0,
                    boxShadow: `0 0 6px ${item.color}`,
                    animation: `typing-bounce 1.8s ease ${item.pulse * 0.45}s infinite`,
                  }} />
                </motion.div>
              ))}
            </div>

            {/* Main request card */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }}
              transition={{ duration: 0.58, ease: [0.22,1,0.36,1] }}
              style={{
                background: C.s2, border: "1px solid rgba(0,187,253,0.22)",
                borderRadius: 14, padding: "18px 16px",
                width: 200, flexShrink: 0,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 28px rgba(0,187,253,0.07)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: "rgba(0,187,253,0.1)", border: "1px solid rgba(0,187,253,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: C.M, fontSize: 9, color: C.acc, letterSpacing: "0.1em" }}>ANFRAGE</p>
                  <p style={{ fontFamily: C.M, fontSize: 10, color: C.muted }}>Website · jetzt</p>
                </div>
              </div>
              <p style={{ fontFamily: C.M, fontSize: 11, color: "rgba(255,255,255,0.72)", lineHeight: 1.62, marginBottom: 10 }}>
                "Ich brauche einen Termin diese Woche"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                <span style={{ fontFamily: C.M, fontSize: 9, color: C.muted }}>wird verarbeitet</span>
              </div>
            </motion.div>
            <FlowArrow active={phase >= 2} color={C.acc} />
          </div>

          {/* ── CENTER COLUMN: AI Core — auto-sized, stays at exact 50% ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 110, zIndex: 1, justifyContent: "center" }}>

            {/* Disc + rings share one fixed-size box so scale() originates from disc center */}
            <div style={{ position: "relative", width: 100, height: 100, overflow: "visible" }}>
              {phase >= 3 && [0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.55, 0], scale: [1, 2.2] }}
                  transition={{ duration: 2.5, ease: "easeOut", repeat: Infinity, delay: i * 0.75 }}
                  style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "1px solid rgba(0,187,253,0.5)", pointerEvents: "none",
                    transformOrigin: "center center",
                  }}
                />
              ))}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: phase >= 3
                  ? "radial-gradient(circle, rgba(0,187,253,0.2) 0%, rgba(0,187,253,0.05) 70%)"
                  : "radial-gradient(circle, rgba(0,187,253,0.07) 0%, transparent 70%)",
                border: `2px solid ${phase >= 3 ? "rgba(0,187,253,0.62)" : "rgba(0,187,253,0.18)"}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                transition: "background 0.5s ease, border-color 0.5s ease",
                animation: phase >= 3 ? "core-glow 2.4s ease-in-out infinite" : "none",
              }}>
                <span style={{ fontFamily: C.H, fontWeight: 800, fontSize: 15, color: phase >= 3 ? C.acc : "rgba(0,187,253,0.32)", letterSpacing: "0.04em", transition: "color 0.5s ease" }}>KI</span>
                <span style={{ fontFamily: C.M, fontSize: 8, color: phase >= 3 ? "rgba(0,187,253,0.72)" : "rgba(0,187,253,0.18)", letterSpacing: "0.08em", transition: "color 0.5s ease" }}>MITARBEITER</span>
              </div>
              {/* Status text — absolute so disc stays at exact center of flex container */}
              <div style={{ position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)", height: 16, whiteSpace: "nowrap" }}>
                <AnimatePresence mode="wait">
                  {phase === 3 && (
                    <motion.p key="a" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{ fontFamily: C.M, fontSize: 10, color: C.acc, whiteSpace: "nowrap" }}>
                      Analysiere…
                    </motion.p>
                  )}
                  {phase >= 4 && phase <= 9 && (
                    <motion.p key="b" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      style={{ fontFamily: C.M, fontSize: 10, color: "#34d399", whiteSpace: "nowrap" }}>
                      Aktiviere Systeme
                    </motion.p>
                  )}
                  {phase >= 10 && (
                    <motion.p key="c" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ fontFamily: C.M, fontSize: 10, color: "#34d399", whiteSpace: "nowrap" }}>
                      ✓ Abgeschlossen
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: connector + module grid, left-aligned ── */}
          <div style={{ display: "flex", alignItems: "center", zIndex: 1 }}>
            <FlowArrow active={phase >= 3} color="#34d399" />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {FLOW_MODULES.map((mod, i) => {
                const active = phase >= 4 + i;
                return (
                  <motion.div key={mod.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={phase >= 2 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.42, ease: [0.22,1,0.36,1], delay: i * 0.055 }}
                    style={{
                      background: active ? `rgba(${mod.rgb},0.09)` : "rgba(255,255,255,0.025)",
                      border: `1px solid ${active ? `rgba(${mod.rgb},0.32)` : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 11, padding: "12px 10px",
                      transition: "background 0.38s ease, border-color 0.38s ease, box-shadow 0.38s ease",
                      boxShadow: active ? `0 0 18px rgba(${mod.rgb},0.12)` : "none",
                      minHeight: 72,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                        background: active ? `rgba(${mod.rgb},0.15)` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? `rgba(${mod.rgb},0.3)` : "rgba(255,255,255,0.07)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.38s ease",
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke={active ? mod.color : "rgba(255,255,255,0.22)"}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transition: "stroke 0.38s ease" }}>
                          <path d={mod.icon}/>
                        </svg>
                      </div>
                      <span style={{
                        fontFamily: C.M, fontSize: 10, fontWeight: 600, flex: 1,
                        color: active ? mod.color : "rgba(255,255,255,0.26)",
                        transition: "color 0.38s ease",
                      }}>{mod.label}</span>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                        background: active ? mod.color : "rgba(255,255,255,0.08)",
                        boxShadow: active ? `0 0 6px ${mod.color}` : "none",
                        transition: "all 0.38s ease",
                      }} />
                    </div>
                    <p style={{
                      fontFamily: C.M, fontSize: 9, lineHeight: 1.4,
                      color: active ? `rgba(${mod.rgb},0.6)` : "transparent",
                      transition: "color 0.38s ease",
                    }}>{mod.status}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>


        </div>
      )}

      {/* ── Result: desktop only — mobile result is inside the mobile card ── */}
      {!isMobile && <AnimatePresence>
        {phase >= 10 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.52, ease: [0.22,1,0.36,1] }}
            style={{
              marginTop: 10,
              background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.20)",
              borderRadius: 12, padding: "14px 22px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 18px rgba(52,211,153,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 28, flexWrap: "wrap",
            }}
          >
            <p style={{ fontFamily: C.M, fontSize: 9, color: "#34d399", letterSpacing: "0.12em" }}>ABGESCHLOSSEN</p>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {FLOW_RESULTS.map((r, i) => (
                <motion.div key={r.label}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.14, duration: 0.3 }}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke={r.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={r.icon}/>
                  </svg>
                  <span style={{ fontFamily: C.M, fontSize: 11, color: "rgba(255,255,255,0.72)", whiteSpace: "nowrap" }}>{r.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>}

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 56 }}>
        <a href="#kontakt"
          onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
          onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
          style={{
            display: "inline-block", fontFamily: C.H, fontWeight: 700, fontSize: 14,
            background: C.acc, color: "#000", padding: "14px 36px", borderRadius: 8,
            boxShadow: "0 0 28px rgba(0,187,253,0.4)", transition: "filter 0.15s",
          }}>Beratung buchen</a>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — ERGEBNISSE
═══════════════════════════════════════════════════════════════════════ */
function CountUp({ to, from = 0, duration = 2200, prefix = "", suffix = "", decimal = false, started }: {
  to: number; from?: number; duration?: number; prefix?: string; suffix?: string; decimal?: boolean; started: boolean;
}) {
  const [val, setVal] = useState(from);
  const raf = useRef(0);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!started) { setVal(from); return; }
    setVal(from);
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = from + (to - from) * eased;
      setVal(decimal ? Math.round(cur * 10) / 10 : Math.round(cur));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [started]);
  const display = decimal ? val.toFixed(1) : val;
  return <>{prefix}{display}{suffix}</>;
}

function ResultsSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-60px" });
  const { isMobile } = useBreakpoint();

  const metrics = [
    { label: "Mehr Leads",     sub: "im Vergleich zum Vorjahr",        color: C.acc,     prefix: "+", suffix: "%",  to: 312, decimal: false },
    { label: "Erreichbarkeit", sub: "alle Anfragen beantwortet",       color: "#a78bfa", prefix: "",  suffix: "%",  to: 98,  decimal: false },
    { label: "Reaktionszeit",  sub: "durchschnittlich pro Antwort",    color: "#34d399", prefix: "",  suffix: "s",  to: 0.4, decimal: true  },
    { label: "Verfügbarkeit",  sub: "365 Tage im Jahr, kein Ausfall",  color: "#fbbf24", special: "24/7" },
  ] as const;

  return (
    <Section id="ergebnisse" bg={C.s1}>
      <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 64 }}>
        <Reveal delay={0}><Label>Ergebnisse</Label></Reveal>
        <H2Reveal center lines={["Zahlen die für sich sprechen."]} delay={0.06} />
      </div>

      <div ref={sectionRef} style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 1,
                    background: C.bd, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.bd}` }}>
        {metrics.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.1}>
            <div style={{ background: C.s1, padding: isMobile ? "28px 16px" : "52px 36px", textAlign: "center", height: "100%", boxSizing: "border-box", minHeight: isMobile ? 148 : "auto" }}>
              <p style={{
                fontFamily: C.H, fontWeight: 800, fontSize: isMobile ? 38 : 56,
                color: m.color, letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 10,
                fontVariantNumeric: "tabular-nums",
                minHeight: isMobile ? "1.1em" : undefined,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {"special" in m ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.7, ease: [0.22,1,0.36,1], delay: i * 0.12 }}
                  >{m.special}</motion.span>
                ) : (
                  <CountUp
                    to={m.to} prefix={m.prefix} suffix={m.suffix}
                    decimal={m.decimal} duration={2200 + i * 100}
                    started={inView}
                  />
                )}
              </p>
              <p style={{ fontFamily: C.H, fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>{m.label}</p>
              <p style={{ fontFamily: C.M, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{m.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 7 — PROZESS
═══════════════════════════════════════════════════════════════════════ */
const PROCESS_STEPS = [
  {
    n: "01", title: "Strategie", duration: "Woche 1",
    status: "Analyse gestartet",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    items: ["Prozesse prüfen", "Ziele definieren", "Systeme erfassen"],
  },
  {
    n: "02", title: "Aufbau", duration: "Woche 2–3",
    status: "KI-System wird gebaut",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    items: ["Chat konfigurieren", "Telefon verbinden", "Kalender integrieren"],
  },
  {
    n: "03", title: "Launch", duration: "Woche 4",
    status: "Livegang vorbereitet",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    items: ["Testing", "Onboarding", "Go-Live"],
  },
  {
    n: "04", title: "Optimierung", duration: "Laufend",
    status: "Laufende Verbesserung",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    items: ["Daten analysieren", "Conversion verbessern", "Automationen erweitern"],
  },
];

function ProcessSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-80px" });
  const [autoStep, setAutoStep] = useState(0);
  const { isMobile } = useBreakpoint();
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const effectiveStep = hoverStep ?? autoStep;

  // Auto-cycle every 1.45s; pauses while hovering
  useEffect(() => {
    if (!inView) { setAutoStep(0); return; }
    if (hoverStep !== null) return;
    const t = setInterval(() => setAutoStep(s => (s + 1) % 4), 1450);
    return () => clearInterval(t);
  }, [inView, hoverStep]);

  return (
    <Section id="prozess" bg={C.bg}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <Reveal delay={0}><Label>Ablauf</Label></Reveal>
        <H2Reveal center lines={["Von Null zum KI-Mitarbeiter", "in 4 Wochen."]} delay={0.08} />
      </div>

      <div ref={sectionRef}>
        {/* ── Progress track ── */}
        <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center", marginBottom: 24 }}>

          {/* Base track */}
          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            transform: "translateY(-50%)", height: 2,
            background: "rgba(255,255,255,0.07)", borderRadius: 1,
          }}>
            {/* Filled progress */}
            <motion.div
              animate={{ width: `${(effectiveStep / 3) * 100}%` }}
              transition={{ duration: 0.52, ease: [0.22,1,0.36,1] }}
              style={{
                position: "absolute", top: 0, left: 0, height: "100%",
                background: `linear-gradient(to right, rgba(0,187,253,0.7), ${C.acc})`,
                borderRadius: 1, overflow: "hidden",
              }}
            >
              {/* Traveling data dots */}
              {[0, 1].map(i => (
                <div key={i} style={{
                  position: "absolute", top: "50%",
                  width: 4, height: 4, borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 0 6px rgba(0,187,253,0.9)",
                  animation: `proc-dot 1.1s linear ${i * 0.55}s infinite`,
                }} />
              ))}
            </motion.div>
          </div>

          {/* Step dots — evenly spaced via flex space-between */}
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            {PROCESS_STEPS.map((_, i) => {
              const completed = effectiveStep > i;
              const active    = effectiveStep === i;
              return (
                <div key={i} style={{ position: "relative" }}>
                  {/* Active pulse ring */}
                  {active && (
                    <motion.div
                      animate={{ opacity: [0.6, 0], scale: [1, 2.2] }}
                      transition={{ duration: 1.7, ease: "easeOut", repeat: Infinity }}
                      style={{
                        position: "absolute", inset: -4, borderRadius: "50%",
                        border: "1px solid rgba(0,187,253,0.55)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: completed || active ? C.acc : "#0c0c10",
                    border: `1.5px solid ${completed || active ? C.acc : "rgba(255,255,255,0.14)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: active
                      ? "0 0 0 4px rgba(0,187,253,0.14), 0 0 22px rgba(0,187,253,0.5)"
                      : completed ? "0 0 10px rgba(0,187,253,0.22)" : "none",
                    transition: "all 0.5s ease",
                    position: "relative", zIndex: 2,
                  }}>
                    {completed ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <span style={{ fontFamily: C.M, fontSize: 10, fontWeight: 700, color: active ? "#000" : "rgba(255,255,255,0.28)" }}>
                        {i + 1}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14 }}>
          {PROCESS_STEPS.map((step, i) => {
            const completed = effectiveStep > i;
            const active    = effectiveStep === i;
            return (
              <div
                key={step.n}
                onMouseEnter={() => setHoverStep(i)}
                onMouseLeave={() => setHoverStep(null)}
                style={{
                  background: active ? C.s1 : C.bg,
                  border: `1px solid ${
                    active    ? "rgba(0,187,253,0.28)" :
                    completed ? "rgba(0,187,253,0.1)" :
                    C.bd
                  }`,
                  borderRadius: 14, padding: "26px 22px",
                  cursor: "default", minHeight: 272,
                  transition: "all 0.45s ease",
                  transform: active ? "translateY(-7px)" : "translateY(0)",
                  boxShadow: active
                    ? "0 22px 56px rgba(0,187,253,0.1), 0 0 0 1px rgba(0,187,253,0.07)"
                    : "none",
                }}
              >
                {/* Top row: step number + duration badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{
                    fontFamily: C.M, fontSize: 10,
                    color: active || completed ? C.acc : C.muted,
                    transition: "color 0.45s ease",
                  }}>{step.n}</span>
                  <span style={{
                    fontFamily: C.M, fontSize: 9, fontWeight: 600,
                    background: active ? C.acc : completed ? "rgba(0,187,253,0.08)" : C.aLow,
                    border: `1px solid ${active ? C.acc : C.aMid}`,
                    color: active ? "#000" : C.acc,
                    borderRadius: 4, padding: "2px 8px",
                    transition: "all 0.45s ease",
                  }}>{step.duration}</span>
                </div>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 11, marginBottom: 16,
                  background: active ? C.acc : completed ? "rgba(0,187,253,0.07)" : C.aLow,
                  border: `1px solid ${active ? C.acc : C.aMid}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: active ? "#000" : C.acc,
                  transition: "all 0.45s ease",
                  boxShadow: active ? "0 0 22px rgba(0,187,253,0.45)" : "none",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: "stroke-width 0.4s ease" }}>
                    <path d={step.icon}/>
                  </svg>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: C.H, fontWeight: 700, fontSize: 17, color: "#fff",
                  letterSpacing: "-0.02em", marginBottom: 10,
                }}>{step.title}</h3>

                {/* Status label */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
                  opacity: active || completed ? 1 : 0,
                  transition: "opacity 0.45s ease",
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%", display: "inline-block", flexShrink: 0,
                    background: active ? C.acc : "#34d399",
                    transition: "background 0.45s ease",
                    boxShadow: active ? `0 0 6px ${C.acc}` : "none",
                  }} />
                  <span style={{
                    fontFamily: C.M, fontSize: 10,
                    color: active ? C.acc : "#34d399",
                    transition: "color 0.45s ease",
                  }}>{step.status}</span>
                </div>

                {/* Checklist items — always rendered, state-controlled styling */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {step.items.map((item, j) => (
                    <div
                      key={item}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        opacity: active || completed ? 1 : 0,
                        transform: active || completed ? "translateX(0)" : "translateX(-6px)",
                        transition: `opacity 0.4s ease ${j * 0.08}s, transform 0.4s ease ${j * 0.08}s`,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke={active ? C.acc : "#34d399"}
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, transition: "stroke 0.4s ease" }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{
                        fontFamily: C.M, fontSize: 11,
                        color: active ? C.soft : "rgba(255,255,255,0.36)",
                        transition: "color 0.4s ease",
                      }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 8 — FINAL CTA
═══════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-60px" });
  const { isMobile } = useBreakpoint();

  return (
    <section ref={sectionRef} id="kontakt" style={{
      position: "relative", overflow: "hidden",
      background: C.bg, borderTop: `1px solid ${C.bd}`,
      padding: isMobile ? "80px 0 72px" : "160px 0 144px",
    }}>

      {/* Slowly drifting dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        animation: "grid-drift 18s ease-in-out infinite",
      }} />

      {/* Moving ambient glow — two orbs drifting independently */}
      <motion.div
        animate={{ x: [-50, 50, -50], y: [-30, 40, -30] }}
        transition={{ duration: 22, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute", top: "15%", left: "22%",
          width: 780, height: 780, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,187,253,0.07) 0%, transparent 55%)",
          filter: "blur(48px)", pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ x: [38, -38, 38], y: [22, -36, 22] }}
        transition={{ duration: 28, ease: "easeInOut", repeat: Infinity, delay: 7 }}
        style={{
          position: "absolute", top: "40%", right: "18%",
          width: 560, height: 560, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,187,253,0.045) 0%, transparent 55%)",
          filter: "blur(60px)", pointerEvents: "none",
        }}
      />

      <div className="ctr" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>

        {/* Label + Headline + light sweep */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 56 }}
        >
          <Label>Jetzt starten</Label>

          <div style={{ position: "relative", display: "inline-block", marginTop: 10 }}>
            {/* Aurora atmospheric glow — soft organic orb drifting behind headline */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "140%", height: "300%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, rgba(0,187,253,0.11) 0%, rgba(0,187,253,0.04) 42%, transparent 68%)",
              filter: "blur(38px)",
              animation: "aurora-breathe 10s ease-in-out infinite",
              pointerEvents: "none",
            }}/>
            {/* Focused bloom behind KI-Mitarbeiter (lower line) */}
            <div style={{
              position: "absolute",
              top: "55%", left: "50%",
              width: "72%", height: "170%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 55%, rgba(0,187,253,0.17) 0%, rgba(0,187,253,0.05) 44%, transparent 70%)",
              filter: "blur(22px)",
              animation: "aurora-bloom 12s ease-in-out infinite",
              animationDelay: "3s",
              pointerEvents: "none",
            }}/>
            <H2Reveal
              lines={["Bereit für Ihren", <span style={{ color: C.acc }}>KI-Mitarbeiter?</span>]}
              center delay={0.1}
              size="clamp(3rem,6vw,6.5rem)"
            />
          </div>
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ marginBottom: 44 }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Soft radial glow — no shape, pure blur */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "200%", height: "340%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(0,187,253,0.16) 0%, rgba(0,187,253,0.05) 40%, transparent 68%)",
              filter: "blur(20px)",
              animation: "cta-glow-bg 3.8s ease-in-out infinite",
              pointerEvents: "none",
            }} />
            <a
              href="mailto:info@afa.agency"
              onMouseEnter={e => {
                e.currentTarget.style.filter = "brightness(1.12)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              style={{
                position: "relative", display: "inline-block",
                fontFamily: C.H, fontWeight: 700, fontSize: isMobile ? 16 : 18,
                background: C.acc, color: "#000",
                padding: isMobile ? "14px 36px" : "18px 68px", borderRadius: 12,
                animation: "cta-glow 3.6s ease-in-out infinite",
                transition: "filter 0.18s ease, transform 0.18s ease",
              }}
            >
              Beratung buchen
            </a>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.38 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap" }}
        >
          {[
            { path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Kostenlos" },
            { path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",   label: "Kein Risiko" },
            { path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",   label: "30 Minuten" },
          ].map(({ path, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={C.acc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={path}/>
              </svg>
              <span style={{ fontFamily: C.M, fontSize: 13, color: C.soft }}>{label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.bd}`,
      background: C.bg, padding: "48px 0",
    }}>
      <div className="ctr" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/afa-logo-cropped.png" alt="AFA"
          style={{ height: 28, width: "auto", objectFit: "contain", opacity: 0.45, maxWidth: 200, display: "block" }} />
        <p style={{ fontFamily: C.M, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          © 2025 AFA — Agentur für Automatisierung
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href="#"
               style={{ fontFamily: C.M, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <main style={{ background: C.bg, minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <PhoneSection />
      <ChatSection />
      <WebsiteSection />
      <SystemSection />
      <ResultsSection />
      <ProcessSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
