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

export interface LocationItem {
  name: string;
  address: string;
  hours: string;
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
    email: string;
    locations: LocationItem[];
  };
  footer: {
    tagline: string;
    copyright: string;
  };
}

export interface Client {
  username: string;
  password: string;
  siteName: string;
  content: SiteContent;
}

// Hardcoded multi-client roster. Adding a new client means adding an entry
// here — no schema change needed elsewhere, since every panel reads through
// useContentStore rather than touching CLIENTS directly.
export const CLIENTS: Client[] = [
  {
    username: 'framework',
    password: 'afa2026',
    siteName: 'Framework Berlin',
    // Pulled directly from the live site (https://framework-berlin.vercel.app),
    // verified via curl on 2026-08-29 — not invented. The hero image is
    // genuinely empty on the live site right now (shows an "Insert Photo"
    // placeholder), so it's left blank here too rather than filled with a
    // stock photo.
    content: {
      hero: {
        headline: 'High-Intensity.\nLow-Impact.\nAll Results.',
        subtext:
          "Transform your body with Berlin's premier Lagree training — science-backed, results-driven.",
        buttonText: 'Book Your First Class',
        image: '',
      },
      services: [
        {
          title: 'Group Lagree',
          desc: 'High-intensity, low-impact full-body workouts on the Megaformer™. Perfect for building lean muscle, core strength, and endurance alongside a motivated community.',
        },
        {
          title: 'Personal Training',
          desc: 'One-on-one sessions tailored precisely to your fitness level and personal goals. Expert coaching for accelerated, lasting results on your schedule.',
        },
        {
          title: 'Physiotherapy',
          desc: 'Active physiotherapy for injury recovery and movement optimization. Qualified professionals provide personalized care to keep you moving freely and pain-free.',
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
            'The instructor was welcoming and patient. The class was challenging but I never felt lost thanks to clear instructions.',
          name: 'Verified Class Review',
          badge: 'ClassPass',
        },
        {
          quote:
            'A cozy, spa-like studio with high-quality Lagree equipment. Instructors are supportive and focused on safety and proper technique.',
          name: 'Verified Class Review',
          badge: 'ClassPass',
        },
        {
          quote:
            'The Megaformer is genuinely intense — I was shaking after 20 minutes. The instructor kept the energy up and offered great modifications for my knee throughout.',
          name: 'Verified Class Review',
          badge: 'ClassPass',
        },
        {
          quote:
            'Intimate studio, small class sizes, instructors who are genuinely invested. Feels premium but not intimidating. Already booked my next session.',
          name: 'Verified Class Review',
          badge: 'ClassPass',
        },
      ],
      contact: {
        email: 'hello@frameworkberlin.com',
        locations: [
          { name: 'P-Berg Studio', address: 'Christinenstraße 19a, 10119 Berlin', hours: 'Mon – Thu: 8:00 am – 5:30 pm' },
          { name: 'Kreuzberg Studio', address: 'Oranienstraße 185, 10999 Berlin', hours: 'Mon – Thu: 8:00 am – 5:30 pm' },
        ],
      },
      footer: {
        tagline: 'Premium Lagree & Physiotherapy Studio in Berlin',
        copyright: '© 2026 Framework Berlin. All rights reserved.',
      },
    },
  },
  {
    username: 'demo',
    password: 'demo2026',
    siteName: 'Demo Client',
    content: {
      hero: {
        headline: 'Welcome to\nYour Website.',
        subtext: 'This is placeholder content — edit any section from the panel on the left.',
        buttonText: 'Get Started',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop',
      },
      services: [
        { title: 'Service One', desc: 'Describe your first core service here.' },
        { title: 'Service Two', desc: 'Describe your second core service here.' },
        { title: 'Service Three', desc: 'Describe your third core service here.' },
      ],
      testimonials: [
        { quote: 'Placeholder review text goes here.', name: 'Customer Name', badge: 'Google' },
      ],
      contact: {
        email: 'hello@yourcompany.com',
        locations: [{ name: 'Main Location', address: 'Your Street 1, 12345 City', hours: 'Mon – Fri: 9:00 – 18:00' }],
      },
      footer: {
        tagline: 'Your tagline goes here.',
        copyright: '© 2026 Demo Client. All rights reserved.',
      },
    },
  },
];

function findClient(username: string, password: string): Client | undefined {
  return CLIENTS.find((c) => c.username === username && c.password === password);
}

interface AuthState {
  isAuthenticated: boolean;
  clientId: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      clientId: null,
      login: (username, password) => {
        const client = findClient(username, password);
        if (client) {
          set({ isAuthenticated: true, clientId: client.username });
          useContentStore.getState().loadClient(client.username);
        }
        return !!client;
      },
      logout: () => set({ isAuthenticated: false, clientId: null }),
    }),
    {
      name: 'kundenzugang-auth',
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state.clientId) {
          useContentStore.getState().loadClient(state.clientId);
        }
      },
    },
  ),
);

interface ContentState {
  currentClientId: string | null;
  content: SiteContent;
  savedContentByClient: Record<string, SiteContent>;
  selectedField: string | null;
  dirty: boolean;
  loadClient: (clientId: string) => void;
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
      currentClientId: null,
      content: CLIENTS[0].content,
      savedContentByClient: {},
      selectedField: null,
      dirty: false,
      loadClient: (clientId) => {
        const client = CLIENTS.find((c) => c.username === clientId);
        if (!client) return;
        const saved = get().savedContentByClient[clientId] ?? client.content;
        set({ currentClientId: clientId, content: saved, selectedField: null, dirty: false });
      },
      setSelectedField: (field) => set({ selectedField: field }),
      updateField: (path, value) =>
        set((state) => ({
          content: setAtPath(state.content, path, value),
          dirty: true,
        })),
      save: () =>
        set((state) => {
          if (!state.currentClientId) return state;
          return {
            savedContentByClient: {
              ...state.savedContentByClient,
              [state.currentClientId]: state.content,
            },
            dirty: false,
          };
        }),
    }),
    {
      name: 'kundenzugang-content',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ savedContentByClient: state.savedContentByClient }),
    },
  ),
);

export function getClientSiteName(clientId: string | null): string {
  return CLIENTS.find((c) => c.username === clientId)?.siteName ?? '';
}

export function getAtPath(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => {
    if (o == null) return '';
    const key: any = /^\d+$/.test(k) ? Number(k) : k;
    return o[key];
  }, obj) as unknown as string;
}
