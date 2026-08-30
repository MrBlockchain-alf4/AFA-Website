'use client';

import { useEffect, useRef } from 'react';
import {
  useContentStore,
  useAuthStore,
  getClientSiteName,
  getClientLiveUrl,
  getClientPageUrl,
  buildLivePreviewPayload,
  type PageId,
} from '@/lib/kundenzugang-store';
import { mapLiveClickToField, getHighlightTarget } from '@/lib/kundenzugang-nav';
import { cn, hexToRgba } from '@/lib/utils';

export default function PreviewPane() {
  const content = useContentStore((s) => s.content);
  const dirty = useContentStore((s) => s.dirty);
  const liveLocationExtras = useContentStore((s) => s.liveLocationExtras);
  const selectedField = useContentStore((s) => s.selectedField);
  const setSelectedField = useContentStore((s) => s.setSelectedField);
  const currentPage = useContentStore((s) => s.currentPage);
  const setCurrentPage = useContentStore((s) => s.setCurrentPage);
  // Read from the live site's own site.pages, not hardcoded — the same
  // admin works for any client's page structure and real page titles.
  const sitePages = useContentStore((s) => s.sitePages);
  const clientId = useAuthStore((s) => s.clientId);
  const siteName = getClientSiteName(clientId);
  // liveUrl is the base origin (used for postMessage targeting/validation,
  // which is the same regardless of page); pageUrl is what's actually
  // loaded in the iframe — the live site is one unified data document
  // (home/team/physio all in the same Supabase row) rendered across three
  // separate HTML pages, so switching pages only changes the iframe src and
  // which nav tree is shown, never which document gets saved to.
  const liveUrl = getClientLiveUrl(clientId);
  const pageUrl = getClientPageUrl(clientId, currentPage, sitePages);
  // AFA's own brand cyan — kundenzugang is AFA's product, not themed per client.
  const accent = '#00D4FF';

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);

  function postToIframe(msg: unknown) {
    if (!liveUrl || !readyRef.current) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(msg, new URL(liveUrl).origin);
  }

  function handlePageChange(page: PageId) {
    if (page === currentPage) return;
    readyRef.current = false;
    setCurrentPage(page);
  }

  // Post the current draft to the live page's postMessage listener
  // (admin/page-loader.js) on every change, so the real iframe reflects
  // edits instantly without waiting for Save. Every page's script listens
  // for the same message and only patches the data-fw elements that exist
  // on its own page, so it's safe to always send the full payload.
  useEffect(() => {
    postToIframe({ type: 'FW_ADMIN_PREVIEW', data: buildLivePreviewPayload(content, liveLocationExtras) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, liveLocationExtras, liveUrl, currentPage]);

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

  if (!liveUrl || !pageUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-950 px-8 text-center">
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
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 p-0.5">
            {sitePages.map((p) => {
              const active = currentPage === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePageChange(p.id)}
                  className={cn(
                    'rounded px-2.5 py-1 text-[11px] font-medium transition-colors',
                    !active && 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300',
                  )}
                  style={active ? { backgroundColor: hexToRgba(accent, 0.15), color: accent } : undefined}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: accent, opacity: dirty ? 1 : 0.5 }}
            />
            <span className="hidden sm:inline">
              {dirty ? 'Unsaved draft, not in Supabase yet' : 'Showing saved data'}
            </span>
          </div>
        </div>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-300 hover:underline"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        key={pageUrl}
        ref={iframeRef}
        src={pageUrl}
        className="w-full flex-1 border-0"
        title={`${siteName} — live preview (${currentPage})`}
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
