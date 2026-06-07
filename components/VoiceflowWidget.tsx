'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    voiceflowChat: {
      load: (config: Record<string, unknown>) => void;
    };
    VFBookingCalendar: unknown;
  }
}

export default function VoiceflowWidget() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_VF_PROJECT_ID;
    if (!projectId) {
      console.warn('[AFA] NEXT_PUBLIC_VF_PROJECT_ID is not set — Voiceflow widget not loaded.');
      return;
    }

    // Step 1: load the booking calendar extension
    const extScript = document.createElement('script');
    extScript.src = '/booking-calendar-extension.js';
    extScript.onload = () => {
      // Step 2: load the Voiceflow widget only after extension is ready
      const vfScript = document.createElement('script');
      vfScript.src = 'https://cdn.voiceflow.com/widget/latest/voiceflow.js';
      vfScript.type = 'text/javascript';
      vfScript.onload = () => {
        window.voiceflowChat.load({
          verify:    { projectID: projectId },
          url:       'https://general-runtime.voiceflow.com',
          versionID: 'production',
          extensions: [window.VFBookingCalendar],
        });
      };
      document.head.appendChild(vfScript);
    };
    document.head.appendChild(extScript);
  }, []);

  return null;
}
