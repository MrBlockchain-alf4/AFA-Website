'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/kundenzugang-store';

/* ─── Design tokens — mirrored from app/page.tsx so this screen feels
   like a native part of afa-ai.com, not a separate design. ────────── */
const C = {
  bg: '#09090b',
  s1: '#0f0f11',
  s2: '#141418',
  bd: 'rgba(255,255,255,0.07)',
  bd2: 'rgba(255,255,255,0.12)',
  text: '#f4f4f5',
  muted: '#71717a',
  soft: '#a1a1aa',
  acc: '#00bbfd',
  accDark: '#0092c7',
  H: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
  M: 'var(--font-chivo,"Chivo Mono",monospace)',
};

const ease = [0.16, 1, 0.3, 1];

function Field({
  label,
  type,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          fontFamily: C.M,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.muted,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: C.s2,
          border: `1px solid ${focused ? C.acc : C.bd}`,
          borderRadius: 8,
          padding: '13px 14px',
          fontFamily: C.M,
          fontSize: 14,
          color: C.text,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(0,187,253,0.12), 0 0 24px rgba(0,187,253,0.10)' : 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);
  const [hover, setHover] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(username, password);
    if (!ok) {
      setError(true);
      setShake((n) => n + 1);
      setPassword('');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontFamily: C.M,
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 18 }}
        animate={
          shake
            ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
            : { opacity: 1, y: 0 }
        }
        transition={shake ? { duration: 0.4 } : { duration: 0.55, ease }}
        style={{
          width: '100%',
          maxWidth: 380,
          background: C.s1,
          border: `1px solid ${C.bd}`,
          borderRadius: 20,
          padding: '40px 32px',
          boxSizing: 'border-box',
          boxShadow: '0 24px 70px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,187,253,0.03)',
        }}
      >
        <p
          style={{
            fontFamily: C.M,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: C.muted,
            marginBottom: 14,
          }}
        >
          Admin Bereich
        </p>
        <h1
          style={{
            fontFamily: C.H,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontSize: 32,
            lineHeight: 1.1,
            color: '#fff',
            margin: '0 0 12px',
          }}
        >
          Kundenzugang
        </h1>
        <p
          style={{
            fontFamily: C.M,
            fontSize: 13,
            lineHeight: 1.65,
            color: C.soft,
            margin: '0 0 32px',
          }}
        >
          Melden Sie sich an, um Ihre Website zu bearbeiten.
        </p>

        <Field label="Benutzername" type="text" value={username} onChange={setUsername} autoFocus />
        <Field label="Passwort" type="password" value={password} onChange={setPassword} />

        {error && (
          <p style={{ fontFamily: C.M, fontSize: 12, color: '#f87171', margin: '0 0 8px' }}>
            Benutzername oder Passwort ist falsch.
          </p>
        )}

        <button
          type="submit"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            width: '100%',
            fontFamily: C.H,
            fontWeight: 700,
            fontSize: 13,
            background: hover ? C.accDark : C.acc,
            color: '#000',
            padding: '14px 22px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
            transform: hover ? 'translateY(-1px)' : 'translateY(0)',
            boxShadow: hover ? '0 8px 24px rgba(0,187,253,0.25)' : '0 4px 14px rgba(0,187,253,0.12)',
            marginTop: 10,
          }}
        >
          Anmelden
        </button>
      </motion.form>
    </div>
  );
}
