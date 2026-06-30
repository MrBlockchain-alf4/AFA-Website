'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [cookieVisible,    setCookieVisible]    = useState(false);
  const [settingsOpen,     setSettingsOpen]     = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('afaCookieConsent');
    if (!saved) setCookieVisible(true);
  }, []);

  function closeCookieBannerWithAnimation(status: string, analytics: boolean) {
    localStorage.setItem(
      'afaCookieConsent',
      JSON.stringify({ status, analytics, timestamp: new Date().toISOString() }),
    );

    const banner = document.querySelector<HTMLElement>('[data-cookie-banner="true"]');

    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      setCookieVisible(false);
      setSettingsOpen(false);
    };

    if (banner && typeof banner.animate === 'function') {
      banner.style.pointerEvents = 'none';
      const anim = banner.animate(
        [
          { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0px)' },
          { opacity: '0', transform: 'translateY(24px) scale(0.97)', filter: 'blur(5px)' },
        ],
        { duration: 800, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
      );
      anim.onfinish = hide;
      window.setTimeout(hide, 1000);
    } else {
      hide();
    }
  }

  if (!cookieVisible) return null;

  const H = 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)';
  const M = 'var(--font-chivo,"Chivo Mono",monospace)';

  return (
    <div
      data-cookie-banner="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(9,9,11,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 24px 20px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,187,253,0.08)',
      }}
    >
      <div style={{ maxWidth: '75rem', margin: '0 auto' }}>

        {/* ── Main row ── */}
        <div data-cookie-topbar="true" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: 14, color: '#f4f4f5', marginBottom: 5 }}>
              Cookies & Datenschutz
            </p>
            <p style={{ fontFamily: M, fontSize: 12, color: '#71717a', lineHeight: 1.65 }}>
              Wir verwenden Cookies für essenzielle Funktionen und optionale Analysen. Du kannst selbst entscheiden, welche Cookies du zulassen möchtest.{' '}
              <a href="/datenschutz" style={{ color: '#00bbfd', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Datenschutzerklärung
              </a>
            </p>
          </div>

          {/* Buttons */}
          <div
            data-cookie-actions="true"
            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <button
              type="button"
              onClick={() => setSettingsOpen(v => !v)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#a1a1aa',
                fontFamily: M,
                fontSize: 12,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#f4f4f5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
              {settingsOpen ? 'Schließen' : 'Einstellungen'}
            </button>
            <button
              type="button"
              onClick={() => closeCookieBannerWithAnimation('essential', false)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#a1a1aa',
                fontFamily: M,
                fontSize: 12,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#f4f4f5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
              Nur notwendige
            </button>
            <button
              type="button"
              onClick={() => closeCookieBannerWithAnimation('all', true)}
              style={{
                background: '#00bbfd',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                color: '#000',
                fontFamily: H,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              Alle akzeptieren
            </button>
          </div>
        </div>

        {/* ── Settings panel ── */}
        {settingsOpen && (
          <div
            data-cookie-settings="true"
            style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: 13, color: '#f4f4f5' }}>
              Cookie-Einstellungen
            </p>

            {/* Notwendige */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: H, fontSize: 13, fontWeight: 600, color: '#f4f4f5', marginBottom: 2 }}>Notwendige Cookies</p>
                <p style={{ fontFamily: M, fontSize: 11, color: '#71717a' }}>Für die Grundfunktionen der Website. Immer aktiv.</p>
              </div>
              <div style={{
                background: '#00bbfd', borderRadius: 20, width: 42, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                padding: '0 3px', flexShrink: 0,
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000' }} />
              </div>
            </div>

            {/* Analyse */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: H, fontSize: 13, fontWeight: 600, color: '#f4f4f5', marginBottom: 2 }}>Analyse & Komfort</p>
                <p style={{ fontFamily: M, fontSize: 11, color: '#71717a' }}>Für Nutzungsanalysen und verbesserte Benutzererfahrung.</p>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsEnabled(v => !v)}
                style={{
                  background: analyticsEnabled ? '#00bbfd' : 'rgba(255,255,255,0.08)',
                  borderRadius: 20, width: 42, height: 24, border: 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: analyticsEnabled ? 'flex-end' : 'flex-start',
                  padding: '0 3px', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: analyticsEnabled ? '#000' : '#71717a', transition: 'background 0.2s' }} />
              </button>
            </div>

            {/* Settings buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => closeCookieBannerWithAnimation('custom', analyticsEnabled)}
                style={{
                  background: '#00bbfd', border: 'none', borderRadius: 8,
                  padding: '9px 22px', color: '#000', fontFamily: H, fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                Auswahl speichern
              </button>
              <button
                type="button"
                onClick={() => closeCookieBannerWithAnimation('all', true)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  padding: '9px 22px', color: '#a1a1aa', fontFamily: M, fontSize: 12,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#f4f4f5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
