import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ServiceItem {
  title: string;
  desc: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  badge: string;
}

export interface SiteContent {
  hero: {
    headline: string;
    subtext: string;
    buttonText: string;
    image: string;
  };
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  contact: {
    address: string;
    phone: string;
    hours: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
}

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: 'High-Intensity.\nLow-Impact.\nAll Results.',
    subtext:
      "Transform your body with Berlin's premier Lagree training — science-backed, results-driven.",
    buttonText: 'Book Your First Class',
    image:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop',
  },
  services: [
    {
      title: 'Lagree Group Classes',
      desc: 'High-intensity, low-impact Megaformer workouts for every level.',
    },
    {
      title: 'Physiotherapy',
      desc: 'Evidence-based 1:1 treatment addressing the root cause, not just symptoms.',
    },
    {
      title: 'Personal Training',
      desc: 'Tailored 1:1 coaching to reach your specific goals faster.',
    },
  ],
  testimonials: [
    {
      quote:
        'The class was well-balanced with clear verbal cues and good flow. The instructor gave individual attention to each participant.',
      name: 'Verified Class Review',
      badge: 'ClassPass',
    },
    {
      quote:
        'The Megaformer is genuinely intense — I was shaking after 20 minutes. The instructor kept the energy up and offered great modifications throughout.',
      name: 'Verified Class Review',
      badge: 'ClassPass',
    },
  ],
  contact: {
    address: 'Christinenstraße 19a, 10119 Berlin',
    phone: 'hello@frameworkberlin.com',
    hours: 'Mon – Thu: 8:00 am – 5:30 pm',
  },
  footer: {
    tagline: 'Teacher-owned studio in Berlin. Lagree training & physiotherapy.',
    copyright: '© 2026 Framework Berlin. All rights reserved.',
  },
};

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (username, password) => {
        const ok = username === 'framework' && password === 'afa2026';
        if (ok) set({ isAuthenticated: true });
        return ok;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'kundenzugang-auth',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

interface ContentState {
  content: SiteContent;
  savedContent: SiteContent;
  selectedField: string | null;
  dirty: boolean;
  setSelectedField: (field: string | null) => void;
  updateField: (path: string, value: string) => void;
  save: () => void;
}

function setAtPath(obj: any, path: string, value: string) {
  const keys = path.split('.');
  const clone = structuredClone(obj);
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k: any = /^\d+$/.test(keys[i]) ? Number(keys[i]) : keys[i];
    cur = cur[k];
  }
  const lastKey: any = /^\d+$/.test(keys[keys.length - 1])
    ? Number(keys[keys.length - 1])
    : keys[keys.length - 1];
  cur[lastKey] = value;
  return clone;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      content: DEFAULT_CONTENT,
      savedContent: DEFAULT_CONTENT,
      selectedField: null,
      dirty: false,
      setSelectedField: (field) => set({ selectedField: field }),
      updateField: (path, value) =>
        set((state) => ({
          content: setAtPath(state.content, path, value),
          dirty: true,
        })),
      save: () => set((state) => ({ savedContent: state.content, dirty: false })),
    }),
    {
      name: 'kundenzugang-content',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ content: state.savedContent, savedContent: state.savedContent }),
      onRehydrateStorage: () => (state) => {
        if (state) state.content = state.savedContent;
      },
    },
  ),
);

export function getAtPath(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => {
    if (o == null) return '';
    const key: any = /^\d+$/.test(k) ? Number(k) : k;
    return o[key];
  }, obj) as unknown as string;
}
