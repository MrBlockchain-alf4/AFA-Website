'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    voiceflow: {
      chat: {
        load: (config: Record<string, unknown>) => void;
      };
    };
    VFBookingCalendar: unknown;
  }
}

// Hardcoded so the widget never silently fails from a missing env var.
// Override via NEXT_PUBLIC_VF_PROJECT_ID if needed.
const VF_PROJECT_ID =
  process.env.NEXT_PUBLIC_VF_PROJECT_ID ?? '6a2030a95716f1fd46819baf';

export default function VoiceflowWidget() {
  useEffect(() => {
    // Guard: only run once, skip SSR
    if (typeof window === 'undefined') return;

    // 1 — Load the AFA booking calendar extension first
    const extScript = document.createElement('script');
    extScript.src = '/booking-calendar-extension.js';

    extScript.onerror = () =>
      console.error('[AFA] Failed to load /booking-calendar-extension.js');

    extScript.onload = () => {
      // 2 — Load Voiceflow widget-next (bundle.mjs)
      const vfScript = document.createElement('script');
      vfScript.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      vfScript.type = 'text/javascript';

      vfScript.onerror = () =>
        console.error('[AFA] Failed to load Voiceflow widget-next bundle');

      vfScript.onload = () => {
        // 3 — Initialise with the extension registered
        try {
          window.voiceflow.chat.load({
            verify:     { projectID: VF_PROJECT_ID },
            url:        'https://general-runtime.voiceflow.com',
            versionID:  'production',
            extensions: [window.VFBookingCalendar],
          });
        } catch (err) {
          console.error('[AFA] window.voiceflow.chat.load failed:', err);
        }
      };

      document.head.appendChild(vfScript);
    };

    document.head.appendChild(extScript);
  }, []);

  return null;
}
