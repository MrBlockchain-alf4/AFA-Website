'use client';

import { useEffect, useRef } from 'react';
import {
  useContentStore,
  useAuthStore,
  getClientSiteName,
  getClientLiveUrl,
  buildLivePreviewPayload,
} from '@/lib/kundenzugang-store';
import { cn } from '@/lib/utils';

export default function PreviewPane() {
  const content = useContentStore((s) => s.content);
  const dirty = useContentStore((s) => s.dirty);
  const liveLocationExtras = useContentStore((s) => s.liveLocationExtras);
  const clientId = useAuthStore((s) => s.clientId);
  const siteName = getClientSiteName(clientId);
  const liveUrl = getClientLiveUrl(clientId);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  // Post the current draft to the live page's postMessage listener
  // (admin/page-loader.js) on every change, so the real iframe reflects
  // edits instantly without waiting for Save.
  useEffect(() => {
    if (!liveUrl || !readyRef.current) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const targetOrigin = new URL(liveUrl).origin;
    win.postMessage(
      { type: 'FW_ADMIN_PREVIEW', data: buildLivePreviewPayload(content, liveLocationExtras) },
      targetOrigin,
    );
  }, [content, liveLocationExtras, liveUrl]);

  // After a successful save, reload the iframe so it re-fetches fresh from
  // Supabase via its own normal GET-on-load path, rather than trusting the
  // draft payload we were just posting.
  const liveSyncStatus = useContentStore((s) => s.liveSyncStatus);
  useEffect(() => {
    if (liveSyncStatus !== 'success' || !iframeRef.current) return;
    readyRef.current = false;
    iframeRef.current.src = iframeRef.current.src;
  }, [liveSyncStatus]);

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
          // Push the current draft immediately once the frame (and its
          // page-loader.js listener) is actually ready to receive it.
          const win = iframeRef.current?.contentWindow;
          if (win) {
            win.postMessage(
              { type: 'FW_ADMIN_PREVIEW', data: buildLivePreviewPayload(content, liveLocationExtras) },
              new URL(liveUrl).origin,
            );
          }
        }}
      />
    </div>
  );
}
