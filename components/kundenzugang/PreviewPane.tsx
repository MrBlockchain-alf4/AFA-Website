'use client';

import { useContentStore, useAuthStore, getClientSiteName, getClientLiveUrl } from '@/lib/kundenzugang-store';
import { anchorOf } from '@/lib/kundenzugang-nav';

export default function PreviewPane() {
  const selectedField = useContentStore((s) => s.selectedField);
  const clientId = useAuthStore((s) => s.clientId);
  const siteName = getClientSiteName(clientId);
  const liveUrl = getClientLiveUrl(clientId);
  const anchor = anchorOf(selectedField);

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

  const src = anchor ? `${liveUrl}#${anchor}` : liveUrl;

  return (
    <div className="flex h-full flex-col bg-[#0b0e0c]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
          <span>Live preview — {liveUrl.replace('https://', '')}</span>
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
        src={src}
        className="w-full flex-1 border-0"
        title={`${siteName} — live preview`}
      />
    </div>
  );
}
