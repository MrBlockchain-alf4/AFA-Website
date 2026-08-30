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

export type PageId = 'home' | 'team' | 'physio';

export const PAGES: { id: PageId; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '' },
  { id: 'team', label: 'Team', path: 'team.html' },
  { id: 'physio', label: 'Fisioterapia', path: 'physiotherapy.html' },
];

export interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export interface TeamContent {
  header: { eyebrow: string; title: string; desc: string };
  philosophy: { heading: string; body1: string; body2: string };
  members: TeamMember[];
}

export interface PhysioStep {
  title: string;
  text: string;
}

export interface PhysioServiceItem {
  title: string;
  text: string;
}

export interface PhysioSpecialist {
  name: string;
  title: string;
  img: string;
  bio: string[];
  tags: string[];
}

export interface PhysioContent {
  hero: { eyebrow: string; title: string; desc: string; ctaText: string; image: string };
  intro: { label: string; heading: string; body1: string; body2: string; body3: string };
  process: { label: string; heading: string; steps: PhysioStep[] };
  services: PhysioServiceItem[];
  specialists: PhysioSpecialist[];
  cta: { heading: string; sub: string; btnText: string };
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
  team: TeamContent;
  physio: PhysioContent;
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
      // team.members seeded with a couple of real entries (pulled from the
      // live site 2026-08-30) rather than all 32 — this is only an
      // offline/error fallback, loadClient() overwrites it with the full
      // real roster on every login. mapLiveToContent() falls back per-field
      // per-index, so a shorter seed array is safe.
      team: {
        header: {
          eyebrow: 'Teacher-owned studio · Berlin',
          title: 'The\nTeam',
          desc: 'A collective of Lagree-certified instructors, physiotherapists, and movement specialists — here to push you, guide you, and celebrate every shake.',
        },
        philosophy: {
          heading: 'Teacher-owned.\nMovement-first.',
          body1: 'Framework Berlin was founded by teachers who believe the best fitness experience comes from instructors who practice what they teach. Every member of our team is trained to the highest standard in the Lagree method.',
          body2: 'We are a community of movement specialists dedicated to helping you achieve real, lasting results — safely, efficiently, and with care.',
        },
        members: [
          { name: 'Louise', role: 'Instructor · Front of House', img: 'public/team/louise.png' },
          { name: 'Diya', role: 'Instructor', img: 'public/team/diya.png' },
        ],
      },
      physio: {
        hero: {
          eyebrow: 'Personalized care',
          title: 'PT & Physiotherapy',
          desc: 'Move better. Feel better. Perform better. Evidence-based physiotherapy tailored to your body, your goals, and your life.',
          ctaText: 'Book a Session →',
          image: '',
        },
        intro: {
          label: 'Our approach',
          heading: 'Root cause over symptom relief',
          body1: 'Are you dealing with pain, restrictions, or simply looking to improve your fitness and mobility? At Framework, we offer personalized sessions led by our experienced physiotherapists.',
          body2: 'With a comprehensive medical assessment, our goal is to identify the root cause of your issues rather than simply treating the symptoms. We combine manual therapy, movement re-education, and exercise prescription tailored specifically to your needs.',
          body3: "Whether you're recovering from an injury, managing a chronic condition, or optimizing performance — we work with you at every stage.",
        },
        process: {
          label: 'How it works',
          heading: 'From first session to full recovery',
          steps: [
            { title: 'Initial Assessment', text: 'Comprehensive evaluation of your history, movement patterns, and goals. We map the full picture before suggesting anything.' },
            { title: 'Treatment Plan', text: 'A personalized plan targeting the root cause — combining manual therapy, exercise prescription, and lifestyle guidance.' },
            { title: 'Hands-On Sessions', text: 'Focused 1:1 sessions in our studio, integrating treatment with movement re-education and progressive loading.' },
            { title: 'Ongoing Support', text: 'Regular reassessment and plan adjustments to keep you progressing — all the way to your goal and beyond.' },
          ],
        },
        services: [
          { title: 'Medical Assessment', text: 'A thorough initial evaluation to understand your history, movement patterns, and underlying causes — not just your current complaint.' },
          { title: 'Manual Therapy', text: 'Hands-on treatment to restore mobility, reduce pain, and improve tissue health — tailored to your specific needs.' },
          { title: 'Movement Re-Education', text: 'Correcting faulty movement patterns that cause pain or inefficiency, and building lasting new habits through guided exercise.' },
          { title: 'Injury Rehabilitation', text: 'Structured recovery programs following surgery, sports injuries, or accidents — from acute care through return to full activity.' },
          { title: 'Pregnancy & Postnatal Care', text: 'Specialized treatment for women during and post pregnancy — safe, evidence-based support for every stage of the journey.' },
          { title: 'Performance Optimization', text: 'For athletes and active individuals seeking to train smarter, prevent injury, and reach their peak potential safely.' },
        ],
        specialists: [
          {
            name: 'Lisanne',
            title: 'Physiotherapist',
            img: 'public/team/lisanne.png',
            bio: [
              'Lisanne brings over 6 years of clinical experience to Framework Berlin. She holds a B.Sc. in International Physiotherapy from the Netherlands and has worked in high-performance sports environments and chronic pain clinics.',
              'Her practice is evidence-based and patient-centred — she takes the time to understand your full picture before designing a treatment plan that addresses the root cause, not just the symptoms.',
            ],
            tags: ['6+ years experience', 'B.Sc. International Physio', 'High-performance sports', 'Chronic pain'],
          },
          {
            name: 'Juni',
            title: 'Physiotherapist · Lagree Instructor',
            img: 'public/team/juni.png',
            bio: [
              'Juni is both a qualified physiotherapist and a certified Lagree instructor, giving her an integrated perspective on movement and rehabilitation that few practitioners can offer.',
              'She specializes in treatment for women during and post pregnancy, guiding clients safely through every stage with evidence-based care and genuine empathy.',
            ],
            tags: ['Lagree certified', 'Prenatal care', 'Postnatal rehab', "Women's health"],
          },
          {
            name: 'Margot',
            title: 'Lagree Instructor · Level 1 Certified',
            img: 'public/team/margot.png',
            bio: [
              'Half-French, half-Italian and based in Berlin since 2019, Margot brings a distinctly European energy to every class. Her movement background spans multiple disciplines and her teaching style is both precise and encouraging.',
              "You'll find Margot on the reformer on weekend mornings at both studios — the ideal way to start your week.",
            ],
            tags: ['Level 1 Lagree', 'Weekend mornings', 'Both studios', 'Berlin since 2019'],
          },
          {
            name: 'Celia',
            title: 'Lagree Instructor · Level 2 Certified',
            img: 'public/team/celia.jpg',
            bio: [
              "With a background in dance, Celia brings a sharp eye for alignment and body mechanics to everything she teaches. Two years into Lagree, she's built a reputation for classes that challenge without compromising form.",
              'Her focus on functional strength and alignment makes her sessions ideal for clients who want to move well, not just train hard.',
            ],
            tags: ['Level 2 Lagree', 'Dance background', 'Functional strength', 'Alignment specialist'],
          },
        ],
        cta: {
          heading: 'Ready to start?',
          sub: 'Book a consultation with Lisanne or Juni, or join Margot or Celia on the reformer — take the first step towards moving better.',
          btnText: 'Get in touch →',
        },
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
      team: {
        header: { eyebrow: 'Our Team', title: 'The\nTeam', desc: 'Meet the people behind the business.' },
        philosophy: { heading: 'Our\nPhilosophy', body1: 'Describe what your team believes in.', body2: 'A second paragraph with more detail.' },
        members: [
          { name: 'Team Member One', role: 'Role', img: '' },
          { name: 'Team Member Two', role: 'Role', img: '' },
        ],
      },
      physio: {
        hero: { eyebrow: 'Our Services', title: 'Service Page', desc: 'Describe this service in more detail.', ctaText: 'Book Now →', image: '' },
        intro: { label: 'Our approach', heading: 'How we work', body1: 'First paragraph.', body2: 'Second paragraph.', body3: 'Third paragraph.' },
        process: {
          label: 'How it works',
          heading: 'Our process',
          steps: [
            { title: 'Step One', text: 'Describe the first step.' },
            { title: 'Step Two', text: 'Describe the second step.' },
            { title: 'Step Three', text: 'Describe the third step.' },
            { title: 'Step Four', text: 'Describe the fourth step.' },
          ],
        },
        services: [
          { title: 'Service A', text: 'Describe this service.' },
          { title: 'Service B', text: 'Describe this service.' },
        ],
        specialists: [
          { name: 'Specialist Name', title: 'Title', img: '', bio: ['First bio paragraph.', 'Second bio paragraph.'], tags: ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'] },
        ],
        cta: { heading: 'Ready to start?', sub: 'Get in touch to book your first session.', btnText: 'Get in touch →' },
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
// Image fields need `undefined` (key missing from the live payload — the
// live document predates this field, fall back to seed data) and explicit
// `null` (an admin deliberately cleared the photo) to behave differently.
// A plain `??` treats both the same, which would silently resurrect a
// cleared photo from this file's offline-fallback seed on the next login —
// exactly the "restore from old data" bug this must never do.
function mapNullableImage(liveValue: unknown, fallback: string): string {
  if (liveValue === undefined) return fallback;
  return typeof liveValue === 'string' ? liveValue : '';
}

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
      image: mapNullableImage(h.image, fallback.hero.image),
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
      image: mapNullableImage(about.image, fallback.about.image),
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
            image: mapNullableImage(l.image, fallback.contact.locations[i]?.image ?? ''),
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
    team: mapTeamContent(live?.team, fallback.team),
    physio: mapPhysioContent(live?.physio, fallback.physio),
  };
}

function mapTeamContent(live: any, fallback: TeamContent): TeamContent {
  const header = live?.header ?? {};
  const philosophy = live?.philosophy ?? {};
  const members = Array.isArray(live?.members) ? live.members : null;
  return {
    header: {
      eyebrow: header.eyebrow ?? fallback.header.eyebrow,
      title: header.title ?? fallback.header.title,
      desc: header.desc ?? fallback.header.desc,
    },
    philosophy: {
      heading: philosophy.heading ?? fallback.philosophy.heading,
      body1: philosophy.body_1 ?? fallback.philosophy.body1,
      body2: philosophy.body_2 ?? fallback.philosophy.body2,
    },
    members: members
      ? members.map((m: any, i: number) => ({
          name: m.name ?? fallback.members[i]?.name ?? '',
          role: m.role ?? fallback.members[i]?.role ?? '',
          img: mapNullableImage(m.img, fallback.members[i]?.img ?? ''),
        }))
      : fallback.members,
  };
}

function mapPhysioContent(live: any, fallback: PhysioContent): PhysioContent {
  const hero = live?.hero ?? {};
  const intro = live?.intro ?? {};
  const process = live?.process ?? {};
  const steps = Array.isArray(process.steps) ? process.steps : null;
  const services = Array.isArray(live?.services) ? live.services : null;
  const specialists = Array.isArray(live?.specialists) ? live.specialists : null;
  const cta = live?.cta ?? {};
  return {
    hero: {
      eyebrow: hero.eyebrow ?? fallback.hero.eyebrow,
      title: hero.title ?? fallback.hero.title,
      desc: hero.desc ?? fallback.hero.desc,
      ctaText: hero.cta_text ?? fallback.hero.ctaText,
      image: mapNullableImage(hero.image, fallback.hero.image),
    },
    intro: {
      label: intro.label ?? fallback.intro.label,
      heading: intro.heading ?? fallback.intro.heading,
      body1: intro.body_1 ?? fallback.intro.body1,
      body2: intro.body_2 ?? fallback.intro.body2,
      body3: intro.body_3 ?? fallback.intro.body3,
    },
    process: {
      label: process.label ?? fallback.process.label,
      heading: process.heading ?? fallback.process.heading,
      steps: steps
        ? steps.map((s: any, i: number) => ({
            title: s.title ?? fallback.process.steps[i]?.title ?? '',
            text: s.text ?? fallback.process.steps[i]?.text ?? '',
          }))
        : fallback.process.steps,
    },
    services: services
      ? services.map((s: any, i: number) => ({
          title: s.title ?? fallback.services[i]?.title ?? '',
          text: s.text ?? fallback.services[i]?.text ?? '',
        }))
      : fallback.services,
    specialists: specialists
      ? specialists.map((sp: any, i: number) => ({
          name: sp.name ?? fallback.specialists[i]?.name ?? '',
          title: sp.title ?? fallback.specialists[i]?.title ?? '',
          img: mapNullableImage(sp.img, fallback.specialists[i]?.img ?? ''),
          bio: Array.isArray(sp.bio) ? sp.bio : fallback.specialists[i]?.bio ?? ['', ''],
          tags: Array.isArray(sp.tags) ? sp.tags : fallback.specialists[i]?.tags ?? ['', '', '', ''],
        }))
      : fallback.specialists,
    cta: {
      heading: cta.heading ?? fallback.cta.heading,
      sub: cta.sub ?? fallback.cta.sub,
      btnText: cta.btn_text ?? fallback.cta.btnText,
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
  currentPage: PageId;
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
  setCurrentPage: (page: PageId) => void;
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
      currentPage: 'home' as PageId,
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
        set({ currentClientId: clientId, currentPage: 'home', content: saved, selectedField: null, dirty: false });

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
      setCurrentPage: (page) => set({ currentPage: page, selectedField: null }),
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

          live.team = live.team || {};
          live.team.header = { eyebrow: c.team.header.eyebrow, title: c.team.header.title, desc: c.team.header.desc };
          live.team.philosophy = {
            heading: c.team.philosophy.heading,
            body_1: c.team.philosophy.body1,
            body_2: c.team.philosophy.body2,
          };
          const liveTeamMembers = Array.isArray(live.team.members) ? live.team.members : [];
          live.team.members = c.team.members.map((m, i) => ({
            ...(liveTeamMembers[i] || {}),
            name: m.name,
            role: m.role,
            img: m.img || null,
          }));

          live.physio = live.physio || {};
          live.physio.hero = live.physio.hero || {};
          live.physio.hero.eyebrow = c.physio.hero.eyebrow;
          live.physio.hero.title = c.physio.hero.title;
          live.physio.hero.desc = c.physio.hero.desc;
          live.physio.hero.cta_text = c.physio.hero.ctaText;
          live.physio.hero.image = c.physio.hero.image || null;
          live.physio.intro = {
            label: c.physio.intro.label,
            heading: c.physio.intro.heading,
            body_1: c.physio.intro.body1,
            body_2: c.physio.intro.body2,
            body_3: c.physio.intro.body3,
          };
          live.physio.process = {
            label: c.physio.process.label,
            heading: c.physio.process.heading,
            steps: c.physio.process.steps.map((s) => ({ title: s.title, text: s.text })),
          };
          const livePhysioServices = Array.isArray(live.physio.services) ? live.physio.services : [];
          live.physio.services = c.physio.services.map((s, i) => ({
            ...(livePhysioServices[i] || {}),
            title: s.title,
            text: s.text,
          }));
          const livePhysioSpecialists = Array.isArray(live.physio.specialists) ? live.physio.specialists : [];
          live.physio.specialists = c.physio.specialists.map((sp, i) => ({
            ...(livePhysioSpecialists[i] || {}),
            name: sp.name,
            title: sp.title,
            img: sp.img || null,
            bio: sp.bio,
            tags: sp.tags,
          }));
          live.physio.cta = { heading: c.physio.cta.heading, sub: c.physio.cta.sub, btn_text: c.physio.cta.btnText };

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

// The live site is one unified data document (home/team/physio/footer/site
// all in the same JSON row) rendered across three separate HTML pages —
// this just picks which page's URL the iframe should point at. Save/load
// always hit the same /admin/api/data endpoint regardless of page.
export function getClientPageUrl(clientId: string | null, page: PageId): string | undefined {
  const liveUrl = getClientLiveUrl(clientId);
  if (!liveUrl) return undefined;
  const path = PAGES.find((p) => p.id === page)?.path ?? '';
  return path ? `${liveUrl}/${path}` : liveUrl;
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
    team: {
      header: {
        eyebrow: content.team.header.eyebrow,
        title: content.team.header.title,
        desc: content.team.header.desc,
      },
      philosophy: {
        heading: content.team.philosophy.heading,
        body_1: content.team.philosophy.body1,
        body_2: content.team.philosophy.body2,
      },
      members: content.team.members.map((m) => ({ name: m.name, role: m.role, img: m.img || null })),
    },
    physio: {
      hero: {
        eyebrow: content.physio.hero.eyebrow,
        title: content.physio.hero.title,
        desc: content.physio.hero.desc,
        cta_text: content.physio.hero.ctaText,
        image: content.physio.hero.image || null,
      },
      intro: {
        label: content.physio.intro.label,
        heading: content.physio.intro.heading,
        body_1: content.physio.intro.body1,
        body_2: content.physio.intro.body2,
        body_3: content.physio.intro.body3,
      },
      process: {
        label: content.physio.process.label,
        heading: content.physio.process.heading,
        steps: content.physio.process.steps.map((s) => ({ title: s.title, text: s.text })),
      },
      services: content.physio.services.map((s) => ({ title: s.title, text: s.text })),
      specialists: content.physio.specialists.map((sp) => ({
        name: sp.name,
        title: sp.title,
        img: sp.img || null,
        bio: sp.bio,
        tags: sp.tags,
      })),
      cta: { heading: content.physio.cta.heading, sub: content.physio.cta.sub, btn_text: content.physio.cta.btnText },
    },
  };
}

export function getAtPath(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => {
    if (o == null) return '';
    const key: any = /^\d+$/.test(k) ? Number(k) : k;
    return o[key];
  }, obj) as unknown as string;
}
