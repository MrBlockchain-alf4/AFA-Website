'use client';
import { useState, useEffect } from 'react';

type ConsentStatus = 'all' | 'essential' | 'custom';

interface Consent {
  status: ConsentStatus;
  analytics: boolean;
  timestamp: string;
}

export default function CookieBanner() {
  const [visible,     setVisible]     = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics,   setAnalytics]   = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afaCookieConsent');
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function save(status: ConsentStatus, analyticsVal: boolean) {
    const consent: Consent = { status, analytics: analyticsVal, timestamp: new Date().toISOString() };
    try { localStorage.setItem('afaCookieConsent', JSON.stringify(consent)); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  const H = 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)';
  const M = 'var(--font-chivo,"Chivo Mono",monospace)';

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'rgba(9,9,11,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '18px 24px 20px',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,187,253,0.08)',
    }}>
      <div style={{ maxWidth: '75rem', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ fontFamily: H, fontWeight: 700, fontSize: 14, color: '#f4f4f5', marginBottom: 5 }}>
              Cookies & Datenschutz
            </p>
            <p style={{ fontFamily: M, fontSize: 12, color: '#71717a', lineHeight: 1.65 }}>
              Wir verwenden Cookies für essenzielle Funktionen und optionale Analysen.{' '}
              <a href="/datenschutz" style={{ color: '#00bbfd', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                Datenschutzerklärung
              </a>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowDetails(v => !v)}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                padding: '8px 16px', color: '#a1a1aa', fontFamily: M, fontSize: 12,
                cursor: 'pointer', transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#f4f4f5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
              {showDetails ? 'Schließen' : 'Einstellungen'}
            </button>
            <button
              onClick={() => save('essential', false)}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                padding: '8px 16px', color: '#a1a1aa', fontFamily: M, fontSize: 12,
                cursor: 'pointer', transition: 'border-color .15s, color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)'; e.currentTarget.style.color = '#f4f4f5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
            >
              Nur notwendige
            </button>
            <button
              onClick={() => save('all', true)}
              style={{
                background: '#00bbfd', border: 'none', borderRadius: 8,
                padding: '8px 20px', color: '#000', fontFamily: H, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'filter .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              Alle akzeptieren
            </button>
          </div>
        </div>

        {/* Details panel */}
        {showDetails && (
          <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Notwendige — always on */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontFamily: H, fontSize: 13, fontWeight: 600, color: '#f4f4f5', marginBottom: 2 }}>Notwendige Cookies</p>
                <p style={{ fontFamily: M, fontSize: 11, color: '#71717a' }}>Für die Grundfunktionen der Website erforderlich. Immer aktiv.</p>
              </div>
              <div style={{
                background: '#00bbfd', borderRadius: 20, width: 42, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 3px', flexShrink: 0,
              }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000' }} />
              </div>
            </div>
            {/* Analyse — toggleable */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontFamily: H, fontSize: 13, fontWeight: 600, color: '#f4f4f5', marginBottom: 2 }}>Analyse & Komfort</p>
                <p style={{ fontFamily: M, fontSize: 11, color: '#71717a' }}>Für Nutzungsanalysen und verbesserte Benutzererfahrung.</p>
              </div>
              <button
                onClick={() => setAnalytics(v => !v)}
                style={{
                  background: analytics ? '#00bbfd' : 'rgba(255,255,255,0.08)',
                  borderRadius: 20, width: 42, height: 24, border: 'none',
                  display: 'flex', alignItems: 'center',
                  justifyContent: analytics ? 'flex-end' : 'flex-start',
                  padding: '0 3px', cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: analytics ? '#000' : '#71717a',
                  transition: 'background 0.2s',
                }} />
              </button>
            </div>
            <button
              onClick={() => save('custom', analytics)}
              style={{
                alignSelf: 'flex-start', marginTop: 4,
                background: '#00bbfd', border: 'none', borderRadius: 8,
                padding: '9px 22px', color: '#000', fontFamily: H, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', transition: 'filter .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              Auswahl speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
