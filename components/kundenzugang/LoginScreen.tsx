'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/kundenzugang-store';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);

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
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e0c] px-4">
      <motion.form
        onSubmit={handleSubmit}
        key={shake}
        initial={shake ? { x: 0 } : false}
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[380px] rounded-xl border border-white/10 bg-[#111511] p-10"
      >
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#00D4FF]">
          Kundenzugang
        </div>
        <h1 className="mb-2 text-[22px] font-bold text-white">Client Admin</h1>
        <p className="mb-8 text-[13px] text-zinc-500">
          Sign in to edit your Framework Berlin website content.
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
            Username
          </label>
          <input
            autoFocus
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-[14px] text-zinc-100 outline-none transition-colors focus:border-[#00D4FF]/50"
          />
        </div>
        <div className="mb-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-[14px] text-zinc-100 outline-none transition-colors focus:border-[#00D4FF]/50"
          />
        </div>

        {error && (
          <p className="mb-2 text-[12px] text-red-400">Incorrect username or password.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-[#00D4FF] py-3 text-[13px] font-bold text-[#0b0e0c] transition-opacity hover:opacity-90"
        >
          Sign In
        </button>

        <p className="mt-6 text-center text-[11px] text-zinc-700">
          Demo access — framework / afa2026
        </p>
      </motion.form>
    </div>
  );
}
