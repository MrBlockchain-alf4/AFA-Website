'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NavTree from './NavTree';
import FieldEditor from './FieldEditor';
import PreviewPane from './PreviewPane';
import { useAuthStore, useContentStore, getClientSiteName } from '@/lib/kundenzugang-store';
import { hexToRgba, getContrastText } from '@/lib/utils';

const accentCssVars = (accent: string) =>
  ({ '--kz-accent': accent, '--kz-accent-40': hexToRgba(accent, 0.4) }) as React.CSSProperties;

export default function AdminShell() {
  const logout = useAuthStore((s) => s.logout);
  const clientId = useAuthStore((s) => s.clientId);
  const dirty = useContentStore((s) => s.dirty);
  const save = useContentStore((s) => s.save);
  const liveSyncStatus = useContentStore((s) => s.liveSyncStatus);
  const liveSyncMessage = useContentStore((s) => s.liveSyncMessage);
  const siteName = getClientSiteName(clientId);
  // Kundenzugang is AFA's own product, not the client's site — it keeps
  // AFA's cyan brand color regardless of which client is logged in, rather
  // than reskinning per client.
  const accent = '#00D4FF';

  function handleSave() {
    save();
  }

  useEffect(() => {
    if (liveSyncStatus === 'idle' || liveSyncStatus === 'syncing') return;
    const t = setTimeout(() => {
      useContentStore.setState({ liveSyncStatus: 'idle', liveSyncMessage: null });
    }, 4500);
    return () => clearTimeout(t);
  }, [liveSyncStatus]);

  const toastVisible = liveSyncStatus !== 'idle';
  const toastText =
    liveSyncStatus === 'syncing'
      ? 'Draft saved — pushing Hero to the live site…'
      : liveSyncStatus === 'success'
        ? `Draft saved — ${liveSyncMessage}`
        : liveSyncStatus === 'error'
          ? `Draft saved. Live sync failed: ${liveSyncMessage}`
          : liveSyncStatus === 'unsupported'
            ? 'Draft saved (no live site connected for this client).'
            : '';
  const toastIsError = liveSyncStatus === 'error';

  return (
    <div
      className="flex h-screen flex-col bg-zinc-950 text-zinc-100"
      style={accentCssVars(accent)}
    >
      {/* TOPBAR */}
      <div className="flex h-13 flex-shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            Kundenzugang
          </span>
          <span className="text-[11px] text-zinc-600">/ {siteName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-600">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
          <button
            onClick={logout}
            className="rounded-md border border-white/10 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT 20% */}
        <aside className="flex w-1/5 min-w-[240px] flex-col border-r border-white/10">
          <div className="flex-1 overflow-y-auto">
            <NavTree />
            <FieldEditor />
          </div>
          <div className="flex-shrink-0 border-t border-white/10 p-4">
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="w-full rounded-md py-2.5 text-[13px] font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:opacity-90"
              style={{ backgroundColor: accent, color: getContrastText(accent) }}
            >
              Save Changes
            </button>
          </div>
        </aside>

        {/* RIGHT 80% */}
        <main className="w-4/5 flex-1">
          <PreviewPane />
        </main>
      </div>

      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 max-w-[90vw] -translate-x-1/2 rounded-md px-5 py-2.5 text-center text-[12px] font-bold shadow-lg"
            style={
              toastIsError
                ? { backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#ffffff' }
                : { backgroundColor: accent, color: getContrastText(accent) }
            }
          >
            {toastText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
