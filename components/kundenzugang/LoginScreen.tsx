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
  H: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
  M: 'var(--font-chivo,"Chivo Mono",monospace)',
};

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
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontFamily: C.M,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
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
          padding: '12px 14px',
          fontFamily: C.M,
          fontSize: 14,
          color: C.text,
          outline: 'none',
          transition: 'border-color 0.15s',
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
        key={shake}
        initial={shake ? { x: 0 } : false}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 380,
          background: C.s1,
          border: `1px solid ${C.bd}`,
          borderRadius: 20,
          padding: '40px 32px',
          boxSizing: 'border-box',
        }}
      >
        <p
          style={{
            fontFamily: C.M,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.acc,
            marginBottom: 12,
          }}
        >
          Client Admin
        </p>
        <h1
          style={{
            fontFamily: C.H,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            fontSize: 30,
            lineHeight: 1.1,
            color: '#fff',
            margin: '0 0 10px',
          }}
        >
          Kundenzugang
        </h1>
        <p
          style={{
            fontFamily: C.M,
            fontSize: 13,
            lineHeight: 1.6,
            color: C.soft,
            margin: '0 0 28px',
          }}
        >
          Sign in to edit your Framework Berlin website content.
        </p>

        <Field label="Username" type="text" value={username} onChange={setUsername} autoFocus />
        <Field label="Password" type="password" value={password} onChange={setPassword} />

        {error && (
          <p style={{ fontFamily: C.M, fontSize: 12, color: '#f87171', margin: '0 0 8px' }}>
            Incorrect username or password.
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
            background: C.acc,
            color: '#000',
            padding: '13px 22px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            filter: hover ? 'brightness(1.1)' : 'brightness(1)',
            transition: 'filter 0.15s',
            marginTop: 8,
          }}
        >
          Sign In
        </button>

        <p
          style={{
            fontFamily: C.M,
            fontSize: 11,
            color: C.muted,
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 0,
          }}
        >
          Demo: framework / afa2026
        </p>
      </motion.form>
    </div>
  );
}
