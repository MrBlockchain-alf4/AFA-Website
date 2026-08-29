'use client';

import { useEffect, useRef } from 'react';
import {
  useContentStore,
  useAuthStore,
  getClientSiteName,
  getClientLiveUrl,
  buildLivePreviewPayload,
} from '@/lib/kundenzugang-store';
import { mapLiveClickToField, getHighlightTarget } from '@/lib/kundenzugang-nav';
import { cn } from '@/lib/utils';

export default function PreviewPane() {
  const content = useContentStore((s) => s.content);
  const dirty = useContentStore((s) => s.dirty);
  const liveLocationExtras = useContentStore((s) => s.liveLocationExtras);
  const selectedField = useContentStore((s) => s.selectedField);
  const setSelectedField = useContentStore((s) => s.setSelectedField);
  const clientId = useAuthStore((s) => s.clientId);
  const siteName = getClientSiteName(clientId);
  const liveUrl = getClientLiveUrl(clientId);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  function postToIframe(msg: unknown) {
    if (!liveUrl || !readyRef.current) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(msg, new URL(liveUrl).origin);
  }

  // Post the current draft to the live page's postMessage listener
  // (admin/page-loader.js) on every change, so the real iframe reflects
  // edits instantly without waiting for Save.
  useEffect(() => {
    postToIframe({ type: 'FW_ADMIN_PREVIEW', data: buildLivePreviewPayload(content, liveLocationExtras) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, liveLocationExtras, liveUrl]);

  // Tell the iframe which element(s) to outline whenever the selected field
  // changes — from a nav-tree click OR a click inside the iframe itself.
  useEffect(() => {
    const { paths, section } = getHighlightTarget(selectedField);
    postToIframe({ type: 'FW_ADMIN_HIGHLIGHT', paths, section });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField, liveUrl]);

  // After a successful save, reload the iframe so it re-fetches fresh from
  // Supabase via its own normal GET-on-load path, rather than trusting the
  // draft payload we were just posting.
  const liveSyncStatus = useContentStore((s) => s.liveSyncStatus);
  useEffect(() => {
    if (liveSyncStatus !== 'success' || !iframeRef.current) return;
    readyRef.current = false;
    iframeRef.current.src = iframeRef.current.src;
  }, [liveSyncStatus]);

  // Figma-style click-to-edit: a click inside the iframe on a data-fw(-section)
  // element posts its path back here; map it to a field id and select it.
  useEffect(() => {
    if (!liveUrl) return;
    const targetOrigin = new URL(liveUrl).origin;
    function onMessage(event: MessageEvent) {
      if (event.origin !== targetOrigin) return;
      const msg = event.data;
      if (!msg || msg.type !== 'FW_ADMIN_SELECT') return;
      const fieldId = mapLiveClickToField(msg.path ?? null, msg.section ?? null);
      if (fieldId) setSelectedField(fieldId);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [liveUrl, setSelectedField]);

  if (!liveUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0e0c] px-8 text-center">
        <div className="max-w-sm">
          <p className="mb-2 text-[13px] font-semibold text-zinc-300">No live site connected</p>
          <p className="text-[12px] leading-relaxed text-zinc-600">
            {siteName || 'This client'} doesn't have a deployed URL configured, so there's nothing real
            to preview — no placeholder is shown instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0b0e0c]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span
            className={cn(
              'h-1.5 w-1.5 flex-shrink-0 rounded-full',
              dirty ? 'bg-[#00D4FF]' : 'bg-emerald-500',
            )}
          />
          <span>
            {dirty ? 'Live preview — unsaved draft, not in Supabase yet' : 'Live preview — showing saved data'}
          </span>
        </div>
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-300 hover:underline"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        key={liveUrl}
        ref={iframeRef}
        src={liveUrl}
        className="w-full flex-1 border-0"
        title={`${siteName} — live preview`}
        onLoad={() => {
          readyRef.current = true;
          postToIframe({ type: 'FW_ADMIN_PREVIEW', data: buildLivePreviewPayload(content, liveLocationExtras) });
          const { paths, section } = getHighlightTarget(selectedField);
          postToIframe({ type: 'FW_ADMIN_HIGHLIGHT', paths, section });
        }}
      />
    </div>
  );
}
