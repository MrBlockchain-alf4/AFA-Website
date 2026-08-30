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
  neighborhood: string;
  name: string;
  address: string;
  hours: string;
  image: string;
}

export interface PricingTier {
  credits: string;
  name: string;
  amount: string;
  note: string;
  popular: boolean;
}

export interface StatItem {
  /** Full display string, e.g. "50 min" or "32+" — edited as free text. */
  value: string;
  label: string;
}

export interface SectionHeader {
  eyebrow: string;
  heading: string;
}

export interface SiteContent {
  hero: {
    eyebrow: string;
    headline: string;
    subtext: string;
    buttonText: string;
    image: string;
    /** Focal point as a percentage (CSS background-position), 0-100. */
    imagePositionX: number;
    imagePositionY: number;
    /** Zoom as a percentage (CSS background-size), 100 = fit, up to 200. */
    imageScale: number;
  };
  stats: StatItem[];
  services: ServiceItem[];
  classesSection: SectionHeader;
  pricing: PricingTier[];
  pricingSection: { eyebrow: string; heading: string; sub: string };
  about: {
    eyebrow: string;
    heading: string;
    body1: string;
    body2: string;
    image: string;
    stats: StatItem[];
    chips: string[];
  };
  testimonials: TestimonialItem[];
  testimonialsSection: SectionHeader;
  contact: {
    email: string;
    locations: LocationItem[];
  };
  locationsSection: SectionHeader;
  cta: {
    heading: string;
    sub: string;
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
  /** The real, deployed site this client's admin panel previews and edits. */
  liveUrl?: string;
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
    liveUrl: 'https://framework-berlin.vercel.app',
    // Pulled directly from the live site (https://framework-berlin.vercel.app),
    // verified via curl on 2026-08-29 — not invented. The hero image is
    // genuinely empty on the live site right now (shows an "Insert Photo"
    // placeholder), so it's left blank here too rather than filled with a
    // stock photo.
    content: {
      hero: {
        eyebrow: 'Lagree · Megaformer · Berlin',
        headline: 'High-Intensity.\nLow-Impact.\nAll Results.',
        subtext:
          "Transform your body with Berlin's premier Lagree training — science-backed, results-driven.",
        buttonText: 'Book Your First Class',
        image: '',
        imagePositionX: 50,
        imagePositionY: 50,
        imageScale: 100,
      },
      stats: [
        { value: '2', label: 'Studio Locations' },
        { value: '50 min', label: 'Full-Body Sessions' },
        { value: '32+', label: 'Team Members' },
        { value: '24h', label: 'Afterburn Effect' },
      ],
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
      classesSection: { eyebrow: 'What We Offer', heading: 'Our Classes' },
      // Pulled directly from the live site's /admin/api/data on 2026-08-30 —
      // verified via curl, not invented.
      pricing: [
        { credits: '2 Credits', name: 'First Timer', amount: '€35', note: '€17.50 per class', popular: false },
        { credits: '1 Credit', name: 'Drop In', amount: '€35', note: '€35 per class', popular: false },
        { credits: '5 Credits', name: '5 Classes', amount: '€160', note: '€32 per class', popular: false },
        { credits: '10 Credits', name: '10 Classes', amount: '€290', note: '€29 per class', popular: true },
        { credits: '20 Credits', name: '20 Classes', amount: '€520', note: '€26 per class', popular: false },
      ],
      pricingSection: {
        eyebrow: 'Credit Packs',
        heading: 'Membership Options',
        sub: 'Same pricing at both Berlin studio locations. Credits valid at P-Berg & Kreuzberg.',
      },
      about: {
        eyebrow: 'The Lagree Method',
        heading: 'What is\nFramework?',
        body1:
          'Framework is a boutique fitness studio offering a unique blend of Lagree™ training and active physiotherapy. Lagree is a highly intensive full-body muscle endurance workout performed on the Megaformer™ — a revolutionary machine designed to challenge every muscle group simultaneously.',
        body2:
          "The method focuses on slow-twitch muscle fibers, building lean muscle mass and core strength while staying low-impact on your joints. You'll feel the burn during — and for up to 24 hours after — every session.",
        image: '',
        stats: [
          { value: '2', label: 'Berlin Studios' },
          { value: '32+', label: 'Expert Trainers' },
        ],
        chips: ['Megaformer™', 'Low Impact', 'Science-backed', 'Berlin'],
      },
      testimonialsSection: { eyebrow: 'Community', heading: 'What Our Members Say' },
      locationsSection: { eyebrow: 'Where to Find Us', heading: 'Our Studios' },
      cta: {
        heading: 'Ready to Transform\nYour Body?',
        sub: 'Join our community of strong, empowered people across Berlin. Your first class is just one step away.',
      },
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
          {
            neighborhood: 'Prenzlauer Berg',
            name: 'P-Berg Studio',
            address: 'Christinenstraße 19a, 10119 Berlin',
            hours: 'Mon – Thu: 8:00 am – 5:30 pm',
            image: '/framework-berlin/website/public/studio/pberg.png',
          },
          {
            neighborhood: 'Kreuzberg',
            name: 'Kreuzberg Studio',
            address: 'Oranienstraße 185, 10999 Berlin',
            hours: 'Mon – Thu: 8:00 am – 5:30 pm',
            image: '/framework-berlin/website/public/studio/xberg.png',
          },
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
        eyebrow: 'Your Eyebrow Text',
        headline: 'Welcome to\nYour Website.',
        subtext: 'This is placeholder content — edit any section from the panel on the left.',
        buttonText: 'Get Started',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop',
        imagePositionX: 50,
        imagePositionY: 50,
        imageScale: 100,
      },
      stats: [
        { value: '1', label: 'Stat One' },
        { value: '2', label: 'Stat Two' },
        { value: '3', label: 'Stat Three' },
        { value: '4', label: 'Stat Four' },
      ],
      services: [
        { title: 'Service One', desc: 'Describe your first core service here.' },
        { title: 'Service Two', desc: 'Describe your second core service here.' },
        { title: 'Service Three', desc: 'Describe your third core service here.' },
      ],
      classesSection: { eyebrow: 'What We Offer', heading: 'Our Services' },
      pricing: [
        { credits: '1 Credit', name: 'Starter', amount: '€35', note: 'per class', popular: false },
        { credits: '5 Credits', name: 'Basic Pack', amount: '€150', note: '€30 per class', popular: false },
        { credits: '10 Credits', name: 'Pro Pack', amount: '€280', note: '€28 per class', popular: true },
      ],
      pricingSection: { eyebrow: 'Pricing', heading: 'Membership Options', sub: 'Choose the plan that fits you best.' },
      about: {
        eyebrow: 'About Us',
        heading: 'Who We\nAre',
        body1: 'Describe your business here — what you do and who you do it for.',
        body2: 'A second paragraph with more detail about your story or approach.',
        image: '',
        stats: [
          { value: '1', label: 'About Stat One' },
          { value: '2', label: 'About Stat Two' },
        ],
        chips: ['Tag One', 'Tag Two', 'Tag Three', 'Tag Four'],
      },
      testimonials: [
        { quote: 'Placeholder review text goes here.', name: 'Customer Name', badge: 'Google' },
      ],
      testimonialsSection: { eyebrow: 'Community', heading: 'What Our Customers Say' },
      contact: {
        email: 'hello@yourcompany.com',
        locations: [
          { neighborhood: 'Downtown', name: 'Main Location', address: 'Your Street 1, 12345 City', hours: 'Mon – Fri: 9:00 – 18:00', image: '' },
        ],
      },
      locationsSection: { eyebrow: 'Where to Find Us', heading: 'Our Location' },
      cta: {
        heading: 'Ready to\nGet Started?',
        sub: 'Join us today — your first step is just one click away.',
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

// Inverse of the merge logic in save() — turns the live site's real JSON
// shape back into our SiteContent shape. contact.email has no live-side
// field (nothing on the page has a data-fw hook for it — it's hardcoded in
// the footer's mailto link), so it falls back to the seed value.
function mapStatArray(live: any, fallback: StatItem[]): StatItem[] {
  if (!Array.isArray(live)) return fallback;
  return live.map((s: any, i: number) => ({
    value: s?.value ?? fallback[i]?.value ?? '',
    label: s?.label ?? fallback[i]?.label ?? '',
  }));
}

function mapSectionHeader(live: any, fallback: SectionHeader): SectionHeader {
  return { eyebrow: live?.eyebrow ?? fallback.eyebrow, heading: live?.heading ?? fallback.heading };
}

function mapLiveToContent(live: any, fallback: SiteContent): SiteContent {
  const h = live?.home?.hero ?? {};
  const stats = Array.isArray(live?.home?.stats) ? live.home.stats : null;
  const services = Array.isArray(live?.home?.services) ? live.home.services : null;
  const pricing = Array.isArray(live?.home?.pricing) ? live.home.pricing : null;
  const about = live?.home?.about ?? {};
  const testimonials = Array.isArray(live?.home?.testimonials) ? live.home.testimonials : null;
  const locations = Array.isArray(live?.home?.locations) ? live.home.locations : null;
  const cta = live?.home?.cta ?? {};
  const footer = live?.footer ?? {};
  return {
    hero: {
      eyebrow: h.eyebrow ?? fallback.hero.eyebrow,
      headline: h.headline ?? fallback.hero.headline,
      subtext: h.sub ?? fallback.hero.subtext,
      buttonText: h.cta_text ?? fallback.hero.buttonText,
      image: h.image ?? fallback.hero.image,
      imagePositionX: h.image_position?.x ?? fallback.hero.imagePositionX,
      imagePositionY: h.image_position?.y ?? fallback.hero.imagePositionY,
      imageScale: h.image_position?.scale ?? fallback.hero.imageScale,
    },
    stats: mapStatArray(stats, fallback.stats),
    services: services
      ? services.map((s: any) => ({ title: s.title ?? '', desc: s.desc ?? '' }))
      : fallback.services,
    classesSection: mapSectionHeader(live?.home?.classes, fallback.classesSection),
    pricing: pricing
      ? pricing.map((p: any, i: number) => ({
          credits: p.credits ?? fallback.pricing[i]?.credits ?? '',
          name: p.name ?? fallback.pricing[i]?.name ?? '',
          amount: p.amount ?? fallback.pricing[i]?.amount ?? '',
          note: p.note ?? fallback.pricing[i]?.note ?? '',
          popular: !!p.popular,
        }))
      : fallback.pricing,
    pricingSection: {
      eyebrow: live?.home?.pricing_section?.eyebrow ?? fallback.pricingSection.eyebrow,
      heading: live?.home?.pricing_section?.heading ?? fallback.pricingSection.heading,
      sub: live?.home?.pricing_section?.sub ?? fallback.pricingSection.sub,
    },
    about: {
      eyebrow: about.eyebrow ?? fallback.about.eyebrow,
      heading: about.heading ?? fallback.about.heading,
      body1: about.body_1 ?? fallback.about.body1,
      body2: about.body_2 ?? fallback.about.body2,
      image: about.image ?? fallback.about.image,
      stats: mapStatArray(about.stats, fallback.about.stats),
      chips: Array.isArray(about.chips) ? about.chips : fallback.about.chips,
    },
    testimonials: testimonials
      ? testimonials.map((t: any) => ({ quote: t.quote ?? '', name: t.name ?? '', badge: t.badge ?? '' }))
      : fallback.testimonials,
    testimonialsSection: mapSectionHeader(live?.home?.testimonials_section, fallback.testimonialsSection),
    contact: {
      email: fallback.contact.email,
      locations: locations
        ? locations.map((l: any, i: number) => ({
            neighborhood: l.neighborhood ?? fallback.contact.locations[i]?.neighborhood ?? '',
            name: l.name ?? '',
            address: l.address ?? '',
            hours: l.hours ?? '',
            image: l.image ?? fallback.contact.locations[i]?.image ?? '',
          }))
        : fallback.contact.locations,
    },
    locationsSection: mapSectionHeader(live?.home?.locations_section, fallback.locationsSection),
    cta: {
      heading: cta.heading ?? fallback.cta.heading,
      sub: cta.sub ?? fallback.cta.sub,
    },
    footer: {
      tagline: footer.tagline ?? fallback.footer.tagline,
      copyright: footer.copyright ?? fallback.footer.copyright,
    },
  };
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

export type LiveSyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'unsupported';

interface ContentState {
  currentClientId: string | null;
  content: SiteContent;
  savedContentByClient: Record<string, SiteContent>;
  selectedField: string | null;
  dirty: boolean;
  liveSyncStatus: LiveSyncStatus;
  liveSyncMessage: string | null;
  /**
   * Fields the live site tracks per-location (currently just img_position)
   * that our schema doesn't carry — kept only so the postMessage preview
   * payload can include them and avoid rendering "undefined" in the iframe.
   * Never edited, just passed through.
   */
  liveLocationExtras: Record<string, unknown>[];
  loadClient: (clientId: string) => Promise<void>;
  setSelectedField: (field: string | null) => void;
  updateField: (path: string, value: string | boolean) => void;
  setHeroImagePosition: (x: number, y: number) => void;
  setHeroImageScale: (scale: number) => void;
  save: () => Promise<void>;
}

function setAtPath(obj: any, path: string, value: string | boolean) {
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
      liveSyncStatus: 'idle' as LiveSyncStatus,
      liveSyncMessage: null as string | null,
      liveLocationExtras: [] as Record<string, unknown>[],
      loadClient: async (clientId) => {
        const client = CLIENTS.find((c) => c.username === clientId);
        if (!client) return;
        const saved = get().savedContentByClient[clientId] ?? client.content;
        set({ currentClientId: clientId, content: saved, selectedField: null, dirty: false });

        // Refresh from the real live data so the preview reflects whatever
        // was actually saved last (from any session, any device) — not a
        // possibly-stale local cache or the hardcoded seed.
        if (!client.liveUrl) return;
        try {
          const res = await fetch(`${client.liveUrl}/admin/api/data`);
          if (!res.ok) return;
          const live = await res.json();
          const mapped = mapLiveToContent(live, client.content);
          const extras = Array.isArray(live?.home?.locations) ? live.home.locations : [];
          set((state) =>
            state.currentClientId === clientId
              ? {
                  content: mapped,
                  savedContentByClient: { ...state.savedContentByClient, [clientId]: mapped },
                  dirty: false,
                  liveLocationExtras: extras,
                }
              : state,
          );
        } catch {
          // Offline or the live endpoint is down — keep the local/seed
          // content already set above rather than blocking login on it.
        }
      },
      setSelectedField: (field) => set({ selectedField: field }),
      updateField: (path, value) =>
        set((state) => ({
          content: setAtPath(state.content, path, value),
          dirty: true,
        })),
      setHeroImagePosition: (x, y) =>
        set((state) => ({
          content: {
            ...state.content,
            hero: { ...state.content.hero, imagePositionX: x, imagePositionY: y },
          },
          dirty: true,
        })),
      setHeroImageScale: (scale) =>
        set((state) => ({
          content: { ...state.content, hero: { ...state.content.hero, imageScale: scale } },
          dirty: true,
        })),
      save: async () => {
        const state = get();
        if (!state.currentClientId) return;
        set({
          savedContentByClient: {
            ...state.savedContentByClient,
            [state.currentClientId]: state.content,
          },
          dirty: false,
        });

        const liveUrl = getClientLiveUrl(state.currentClientId);
        if (!liveUrl) {
          set({ liveSyncStatus: 'unsupported', liveSyncMessage: null });
          return;
        }

        set({ liveSyncStatus: 'syncing', liveSyncMessage: null });
        try {
          const dataUrl = `${liveUrl}/admin/api/data`;
          const getRes = await fetch(dataUrl);
          if (!getRes.ok) throw new Error(`Could not read live data (HTTP ${getRes.status})`);
          const live = await getRes.json();
          const c = state.content;

          live.home = live.home || {};
          live.home.hero = live.home.hero || {};
          live.home.hero.eyebrow = c.hero.eyebrow;
          live.home.hero.headline = c.hero.headline;
          live.home.hero.sub = c.hero.subtext;
          live.home.hero.cta_text = c.hero.buttonText;
          live.home.hero.image = c.hero.image || null;
          live.home.hero.image_position = {
            x: c.hero.imagePositionX,
            y: c.hero.imagePositionY,
            scale: c.hero.imageScale,
          };

          live.home.stats = c.stats.map((s) => ({ value: s.value, label: s.label }));

          // home.services didn't exist before this integration — matches
          // the data-fw="home.services.N.title/desc" hooks added to the
          // three class cards.
          live.home.services = c.services.map((s) => ({ title: s.title, desc: s.desc }));
          live.home.classes = { eyebrow: c.classesSection.eyebrow, heading: c.classesSection.heading };

          live.home.pricing = c.pricing.map((p) => ({
            credits: p.credits,
            name: p.name,
            amount: p.amount,
            note: p.note,
            popular: p.popular,
          }));
          live.home.pricing_section = {
            eyebrow: c.pricingSection.eyebrow,
            heading: c.pricingSection.heading,
            sub: c.pricingSection.sub,
          };

          live.home.about = live.home.about || {};
          live.home.about.eyebrow = c.about.eyebrow;
          live.home.about.heading = c.about.heading;
          live.home.about.body_1 = c.about.body1;
          live.home.about.body_2 = c.about.body2;
          live.home.about.image = c.about.image || null;
          live.home.about.stats = c.about.stats.map((s) => ({ value: s.value, label: s.label }));
          live.home.about.chips = c.about.chips;

          // home.testimonials already existed and was already the real
          // content — this just overwrites it with the edited version.
          live.home.testimonials = c.testimonials.map((t) => ({
            quote: t.quote,
            name: t.name,
            badge: t.badge,
          }));
          live.home.testimonials_section = {
            eyebrow: c.testimonialsSection.eyebrow,
            heading: c.testimonialsSection.heading,
          };

          // home.locations already existed too (id="fw-locations-root").
          // Spread the live copy first so img_position (not tracked in our
          // schema) survives, then overwrite every field we do track.
          const liveLocations = Array.isArray(live.home.locations) ? live.home.locations : [];
          live.home.locations = c.contact.locations.map((loc, i) => ({
            ...(liveLocations[i] || {}),
            neighborhood: loc.neighborhood,
            name: loc.name,
            address: loc.address,
            hours: loc.hours,
            image: loc.image || null,
          }));
          live.home.locations_section = {
            eyebrow: c.locationsSection.eyebrow,
            heading: c.locationsSection.heading,
          };

          live.home.cta = { heading: c.cta.heading, sub: c.cta.sub };

          live.footer = live.footer || {};
          live.footer.tagline = c.footer.tagline;
          live.footer.copyright = c.footer.copyright;

          const postRes = await fetch(dataUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(live),
          });
          const postJson = await postRes.json().catch(() => ({}) as any);
          if (postRes.ok && postJson.ok) {
            set({ liveSyncStatus: 'success', liveSyncMessage: 'Pushed to the live site.' });
          } else {
            set({
              liveSyncStatus: 'error',
              liveSyncMessage: postJson.error || `Live save failed (HTTP ${postRes.status}).`,
            });
          }
        } catch (err) {
          set({ liveSyncStatus: 'error', liveSyncMessage: String(err) });
        }
      },
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

export function getClientLiveUrl(clientId: string | null): string | undefined {
  return CLIENTS.find((c) => c.username === clientId)?.liveUrl;
}

// Builds the partial payload posted to the live iframe's page-loader.js
// listener. Deliberately partial (only home.* + footer) — applyData() on the
// receiving end only patches keys that exist, so omitting site/team/physio
// leaves those untouched (they aren't tracked in SiteContent yet).
// locationExtras carries neighborhood/image/img_position from the live
// fetch so the iframe doesn't render "undefined" for fields our schema
// doesn't track.
export function buildLivePreviewPayload(content: SiteContent, locationExtras: Record<string, unknown>[]) {
  return {
    home: {
      hero: {
        eyebrow: content.hero.eyebrow,
        headline: content.hero.headline,
        sub: content.hero.subtext,
        cta_text: content.hero.buttonText,
        image: content.hero.image || null,
        image_position: {
          x: content.hero.imagePositionX,
          y: content.hero.imagePositionY,
          scale: content.hero.imageScale,
        },
      },
      stats: content.stats.map((s) => ({ value: s.value, label: s.label })),
      services: content.services.map((s) => ({ title: s.title, desc: s.desc })),
      classes: { eyebrow: content.classesSection.eyebrow, heading: content.classesSection.heading },
      pricing: content.pricing.map((p) => ({
        credits: p.credits,
        name: p.name,
        amount: p.amount,
        note: p.note,
        popular: p.popular,
      })),
      pricing_section: {
        eyebrow: content.pricingSection.eyebrow,
        heading: content.pricingSection.heading,
        sub: content.pricingSection.sub,
      },
      about: {
        eyebrow: content.about.eyebrow,
        heading: content.about.heading,
        body_1: content.about.body1,
        body_2: content.about.body2,
        image: content.about.image || null,
        stats: content.about.stats.map((s) => ({ value: s.value, label: s.label })),
        chips: content.about.chips,
      },
      testimonials: content.testimonials.map((t) => ({ quote: t.quote, name: t.name, badge: t.badge })),
      testimonials_section: {
        eyebrow: content.testimonialsSection.eyebrow,
        heading: content.testimonialsSection.heading,
      },
      locations: content.contact.locations.map((loc, i) => ({
        ...(locationExtras[i] || {}),
        neighborhood: loc.neighborhood,
        name: loc.name,
        address: loc.address,
        hours: loc.hours,
        image: loc.image || null,
      })),
      locations_section: { eyebrow: content.locationsSection.eyebrow, heading: content.locationsSection.heading },
      cta: { heading: content.cta.heading, sub: content.cta.sub },
    },
    footer: { tagline: content.footer.tagline, copyright: content.footer.copyright },
  };
}

export function getAtPath(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => {
    if (o == null) return '';
    const key: any = /^\d+$/.test(k) ? Number(k) : k;
    return o[key];
  }, obj) as unknown as string;
}
