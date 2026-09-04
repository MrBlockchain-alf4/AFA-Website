import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Shared by every image field: how the photo is framed inside its
// (responsive, container-filling) box — a focal point to pan to and a zoom
// level, matching the pattern Hero's image editor already used before this
// was generalized to every image on the site. Deliberately NOT a free-form
// width/height/x/y box — every image container on the live site is sized by
// CSS Grid/Flexbox for its own responsive layout (the 32-card team masonry,
// the 3-card class grid, etc.), so the image always fills its container via
// object-fit/background-size:cover; this only controls which part of the
// photo is visible and how zoomed in it is, which stays correct at every
// screen size.
export interface ImagePosition {
  x: number; // 0-100, focal point X (CSS background-position / object-position)
  y: number; // 0-100, focal point Y
  scale: number; // 100-200, zoom level
}

export const DEFAULT_IMAGE_POSITION: ImagePosition = { x: 50, y: 50, scale: 100 };

export interface ServiceItem {
  title: string;
  desc: string;
  image: string;
  imagePos: ImagePosition;
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
  imagePos: ImagePosition;
}

export interface PricingTier {
  credits: string;
  name: string;
  amount: string;
  note: string;
  popular: boolean;
}

export type PageId = 'home' | 'team' | 'physio' | 'pberg-schedule' | 'xberg-schedule';

// Offline/pre-fetch fallback only — real page tabs are read from the live
// site's own site.pages (labels sourced from that site's actual nav link
// text, e.g. "PT & Physiotherapy", not a hardcoded translation). Every
// client needs one of these as a seed since loadClient() renders
// synchronously before the live fetch resolves.
const DEFAULT_PAGES: PageManifestItem[] = [
  { id: 'home', label: 'Home', path: '' },
  { id: 'team', label: 'Team', path: 'team.html' },
  { id: 'physio', label: 'PT & Physiotherapy', path: 'physiotherapy.html' },
  { id: 'pberg-schedule', label: 'Pberg Schedule', path: 'pberg-schedule.html' },
  { id: 'xberg-schedule', label: 'Xberg Schedule', path: 'xberg-schedule.html' },
];

export interface TeamMember {
  name: string;
  role: string;
  img: string;
  imgPos: ImagePosition;
  love: string;
  fact: string;
  f3l: string;
  f3: string;
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
  imgPos: ImagePosition;
  bio: string[];
  tags: string[];
}

export interface PhysioContent {
  hero: { eyebrow: string; title: string; desc: string; ctaText: string; image: string; imagePos: ImagePosition };
  intro: { label: string; heading: string; body1: string; body2: string; body3: string };
  process: { label: string; heading: string; steps: PhysioStep[] };
  services: PhysioServiceItem[];
  specialists: PhysioSpecialist[];
  cta: { heading: string; sub: string; btnText: string };
}

export interface ScheduleMetaItem {
  num: string;
  label: string;
}

export interface ScheduleContent {
  eyebrow: string;
  title: string;
  desc: string;
  meta: ScheduleMetaItem[];
  frameLabel: string;
  bsportTitle: string;
  bsportDesc: string;
  bsportBadge: string;
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

export interface PageManifestItem {
  id: PageId;
  label: string;
  path: string;
}

export interface SiteContent {
  site: { logo: string };
  hero: {
    eyebrow: string;
    headline: string;
    subtext: string;
    buttonText: string;
    image: string;
    imagePos: ImagePosition;
  };
  stats: StatItem[];
  services: ServiceItem[];
  classesSection: SectionHeader;
  pricing: PricingTier[];
  pricingSection: { eyebrow: string; heading: string; sub: string; btnText: string };
  about: {
    eyebrow: string;
    heading: string;
    body1: string;
    body2: string;
    image: string;
    imagePos: ImagePosition;
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
  schedule: { pberg: ScheduleContent; xberg: ScheduleContent };
}

// Elit Juwelier is the first client whose site genuinely doesn't fit
// Framework's fitness-studio shape (hero/services/pricing/team/physio) —
// rather than force a 16-photo jewelry gallery or a goldsmith's about/contact
// block into those field names, it gets its own content shape entirely.
// Kept deliberately flat (no top-level "elit" wrapper) since it lives in its
// own `elitContent` store slice, distinct from `content: SiteContent` — see
// the `kind`-branching in loadClient/updateField/save below.
export interface ElitGalleryItem {
  image: string;
  imagePos: ImagePosition;
  caption: string;
  category: 'ring' | 'armband';
}

export interface ElitContent {
  logo: string;
  nav: {
    links: string[]; // Kollektion, Leistungen, Goldankauf, Über Uns, Kontakt
    ctaText: string; // "Termin anfragen"
  };
  hero: {
    eyebrow: string;
    headline: string;
    headlineEm: string;
    subtitle: string;
    desc: string;
    chips: string[];
    primaryBtnText: string;
    secondaryBtnText: string;
    badgeNumber: string;
    badgeText: string;
    image: string;
    imagePos: ImagePosition;
  };
  banner: {
    eyebrow: string;
    headline1: string;
    headline2: string;
    sub: string;
    ctaText: string;
    items: { title: string; desc: string }[]; // 4
  };
  stats: { value: string; label: string }[]; // 4
  services: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    lead: string;
    featuredTitle: string;
    featuredDesc: string;
    featuredList: string[]; // 4
    featuredCtaText: string;
    cards: { title: string; desc: string; linkText: string }[]; // 3
  };
  gallery: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    items: ElitGalleryItem[];
  };
  about: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    body1: string;
    body2: string;
    image: string;
    imagePos: ImagePosition;
    stampNumber: string;
    stampText: string;
    features: { title: string; desc: string }[]; // 4
  };
  contact: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    address: string;
    phone: string;
    whatsapp: string;
    hoursWeekday: string;
    hoursSunday: string;
  };
  goldankaufInfo: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    body1: string;
    body2: string;
    ctaText: string;
    cards: { title: string; desc: string }[]; // 4
  };
  reviews: {
    eyebrow: string;
    heading: string;
    headingEm: string;
    score: string;
    scoreLabel: string;
    scoreSubLabel: string;
    items: { text: string; name: string; source: string }[];
    googleBtnText: string;
  };
  instagram: {
    heading: string;
    sub: string;
    btnText: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    col1Title: string;
    col1Links: string[]; // 4
    col2Title: string;
    col2Links: string[]; // 3
    col3Title: string;
    col3Links: string[]; // 4
    legalLinks: string[]; // 3 (bottom bar)
  };
  legal: {
    impressumHtml: string;
    datenschutzHtml: string;
  };
  cookie: {
    text: string;
    acceptText: string;
    essentialText: string;
  };
}

export interface Client {
  username: string;
  password: string;
  siteName: string;
  /** The real, deployed site this client's admin panel previews and edits. */
  liveUrl?: string;
  /**
   * Which content shape/save pipeline this client uses. Defaults to
   * 'framework' when omitted (both existing clients predate this field) —
   * only 'elit' branches to elitContent/mapElitLiveToContent/elit save path.
   */
  kind?: 'framework' | 'elit';
  content?: SiteContent;
  elitContent?: ElitContent;
  /** Offline fallback for the page-tab manifest — see DEFAULT_PAGES. */
  defaultPages: PageManifestItem[];
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
    defaultPages: DEFAULT_PAGES,
    // Pulled directly from the live site (https://framework-berlin.vercel.app),
    // verified via curl on 2026-08-29 — not invented. The hero image is
    // genuinely empty on the live site right now (shows an "Insert Photo"
    // placeholder), so it's left blank here too rather than filled with a
    // stock photo.
    content: {
      site: { logo: '/public/images/Framework_White_Transparent.png' },
      hero: {
        eyebrow: 'Lagree · Megaformer · Berlin',
        headline: 'High-Intensity.\nLow-Impact.\nAll Results.',
        subtext:
          "Transform your body with Berlin's premier Lagree training — science-backed, results-driven.",
        buttonText: 'Book Your First Class',
        image: '',
        imagePos: DEFAULT_IMAGE_POSITION,
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
          image: '',
          imagePos: DEFAULT_IMAGE_POSITION,
        },
        {
          title: 'Personal Training',
          desc: 'One-on-one sessions tailored precisely to your fitness level and personal goals. Expert coaching for accelerated, lasting results on your schedule.',
          image: '',
          imagePos: DEFAULT_IMAGE_POSITION,
        },
        {
          title: 'Physiotherapy',
          desc: 'Active physiotherapy for injury recovery and movement optimization. Qualified professionals provide personalized care to keep you moving freely and pain-free.',
          image: '',
          imagePos: DEFAULT_IMAGE_POSITION,
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
        btnText: 'Book Now',
      },
      about: {
        eyebrow: 'The Lagree Method',
        heading: 'What is\nFramework?',
        body1:
          'Framework is a boutique fitness studio offering a unique blend of Lagree™ training and active physiotherapy. Lagree is a highly intensive full-body muscle endurance workout performed on the Megaformer™ — a revolutionary machine designed to challenge every muscle group simultaneously.',
        body2:
          "The method focuses on slow-twitch muscle fibers, building lean muscle mass and core strength while staying low-impact on your joints. You'll feel the burn during — and for up to 24 hours after — every session.",
        image: '',
        imagePos: DEFAULT_IMAGE_POSITION,
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
            imagePos: DEFAULT_IMAGE_POSITION,
          },
          {
            neighborhood: 'Kreuzberg',
            name: 'Kreuzberg Studio',
            address: 'Oranienstraße 185, 10999 Berlin',
            hours: 'Mon – Thu: 8:00 am – 5:30 pm',
            image: '/framework-berlin/website/public/studio/xberg.png',
            imagePos: DEFAULT_IMAGE_POSITION,
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
          { name: 'Louise', role: 'Instructor · Front of House', img: 'public/team/louise.png', imgPos: DEFAULT_IMAGE_POSITION, love: '', fact: '', f3l: '', f3: '' },
          { name: 'Diya', role: 'Instructor', img: 'public/team/diya.png', imgPos: DEFAULT_IMAGE_POSITION, love: '', fact: '', f3l: '', f3: '' },
        ],
      },
      physio: {
        hero: {
          eyebrow: 'Personalized care',
          title: 'PT & Physiotherapy',
          desc: 'Move better. Feel better. Perform better. Evidence-based physiotherapy tailored to your body, your goals, and your life.',
          ctaText: 'Book a Session →',
          image: '',
          imagePos: DEFAULT_IMAGE_POSITION,
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
            imgPos: DEFAULT_IMAGE_POSITION,
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
            imgPos: DEFAULT_IMAGE_POSITION,
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
            imgPos: DEFAULT_IMAGE_POSITION,
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
            imgPos: DEFAULT_IMAGE_POSITION,
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
      // Pulled directly from pberg-schedule.html / xberg-schedule.html as
      // generated — these pages have no live booking system wired in yet
      // (bsport isn't connected), just a clearly-labeled placeholder panel.
      schedule: {
        pberg: {
          eyebrow: 'Prenzlauer Berg Studio · Berlin',
          title: 'Class\nSchedule',
          desc: 'Browse upcoming Lagree and Physiotherapy sessions at our Prenzlauer Berg studio, check live availability, and reserve your spot instantly.',
          meta: [
            { num: 'Live', label: 'Real-time schedule' },
            { num: 'Instant', label: 'Booking confirmation' },
            { num: 'bsport', label: 'Booking platform' },
          ],
          frameLabel: 'Live Booking Widget — Prenzlauer Berg',
          bsportTitle: 'Your live schedule appears here',
          bsportDesc: 'Real-time class times, spots remaining, and instant booking for the Prenzlauer Berg studio — embedded directly on your site, right in this space.',
          bsportBadge: 'Ready for bsport integration',
        },
        xberg: {
          eyebrow: 'Kreuzberg Studio · Berlin',
          title: 'Class\nSchedule',
          desc: 'Browse upcoming Lagree and Physiotherapy sessions at our Kreuzberg studio, check live availability, and reserve your spot instantly.',
          meta: [
            { num: 'Live', label: 'Real-time schedule' },
            { num: 'Instant', label: 'Booking confirmation' },
            { num: 'bsport', label: 'Booking platform' },
          ],
          frameLabel: 'Live Booking Widget — Kreuzberg',
          bsportTitle: 'Your live schedule appears here',
          bsportDesc: 'Real-time class times, spots remaining, and instant booking for the Kreuzberg studio — embedded directly on your site, right in this space.',
          bsportBadge: 'Ready for bsport integration',
        },
      },
    },
  },
  {
    username: 'demo',
    password: 'demo2026',
    siteName: 'Demo Client',
    defaultPages: [{ id: 'home', label: 'Home', path: '' }],
    content: {
      site: { logo: '' },
      hero: {
        eyebrow: 'Your Eyebrow Text',
        headline: 'Welcome to\nYour Website.',
        subtext: 'This is placeholder content — edit any section from the panel on the left.',
        buttonText: 'Get Started',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop',
        imagePos: DEFAULT_IMAGE_POSITION,
      },
      stats: [
        { value: '1', label: 'Stat One' },
        { value: '2', label: 'Stat Two' },
        { value: '3', label: 'Stat Three' },
        { value: '4', label: 'Stat Four' },
      ],
      services: [
        { title: 'Service One', desc: 'Describe your first core service here.', image: '', imagePos: DEFAULT_IMAGE_POSITION },
        { title: 'Service Two', desc: 'Describe your second core service here.', image: '', imagePos: DEFAULT_IMAGE_POSITION },
        { title: 'Service Three', desc: 'Describe your third core service here.', image: '', imagePos: DEFAULT_IMAGE_POSITION },
      ],
      classesSection: { eyebrow: 'What We Offer', heading: 'Our Services' },
      pricing: [
        { credits: '1 Credit', name: 'Starter', amount: '€35', note: 'per class', popular: false },
        { credits: '5 Credits', name: 'Basic Pack', amount: '€150', note: '€30 per class', popular: false },
        { credits: '10 Credits', name: 'Pro Pack', amount: '€280', note: '€28 per class', popular: true },
      ],
      pricingSection: { eyebrow: 'Pricing', heading: 'Membership Options', sub: 'Choose the plan that fits you best.', btnText: 'Book Now' },
      about: {
        eyebrow: 'About Us',
        heading: 'Who We\nAre',
        body1: 'Describe your business here — what you do and who you do it for.',
        body2: 'A second paragraph with more detail about your story or approach.',
        image: '',
        imagePos: DEFAULT_IMAGE_POSITION,
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
          { neighborhood: 'Downtown', name: 'Main Location', address: 'Your Street 1, 12345 City', hours: 'Mon – Fri: 9:00 – 18:00', image: '', imagePos: DEFAULT_IMAGE_POSITION },
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
          { name: 'Team Member One', role: 'Role', img: '', imgPos: DEFAULT_IMAGE_POSITION, love: '', fact: '', f3l: '', f3: '' },
          { name: 'Team Member Two', role: 'Role', img: '', imgPos: DEFAULT_IMAGE_POSITION, love: '', fact: '', f3l: '', f3: '' },
        ],
      },
      physio: {
        hero: {
          eyebrow: 'Our Services',
          title: 'Service Page',
          desc: 'Describe this service in more detail.',
          ctaText: 'Book Now →',
          image: '',
          imagePos: DEFAULT_IMAGE_POSITION,
        },
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
          {
            name: 'Specialist Name',
            title: 'Title',
            img: '',
            imgPos: DEFAULT_IMAGE_POSITION,
            bio: ['First bio paragraph.', 'Second bio paragraph.'],
            tags: ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'],
          },
        ],
        cta: { heading: 'Ready to start?', sub: 'Get in touch to book your first session.', btnText: 'Get in touch →' },
      },
      schedule: {
        pberg: {
          eyebrow: 'Location One · City',
          title: 'Class\nSchedule',
          desc: 'Describe what visitors can browse and book on this page.',
          meta: [
            { num: 'Live', label: 'Real-time schedule' },
            { num: 'Instant', label: 'Booking confirmation' },
            { num: 'bsport', label: 'Booking platform' },
          ],
          frameLabel: 'Live Booking Widget — Location One',
          bsportTitle: 'Your live schedule appears here',
          bsportDesc: 'Describe the live booking system that will appear in this space.',
          bsportBadge: 'Ready for integration',
        },
        xberg: {
          eyebrow: 'Location Two · City',
          title: 'Class\nSchedule',
          desc: 'Describe what visitors can browse and book on this page.',
          meta: [
            { num: 'Live', label: 'Real-time schedule' },
            { num: 'Instant', label: 'Booking confirmation' },
            { num: 'bsport', label: 'Booking platform' },
          ],
          frameLabel: 'Live Booking Widget — Location Two',
          bsportTitle: 'Your live schedule appears here',
          bsportDesc: 'Describe the live booking system that will appear in this space.',
          bsportBadge: 'Ready for integration',
        },
      },
    },
  },
  {
    username: 'elit',
    password: 'elit2026',
    siteName: 'Elit Juwelier',
    liveUrl: 'https://www.elitjuwelier.de',
    kind: 'elit',
    defaultPages: [{ id: 'home', label: 'Home', path: '' }],
    // Pulled directly from elit-juwelier/website/index.html's real current
    // copy (2026-08-30) — not invented, matches what's actually live.
    elitContent: {
      logo: 'public/images/elit-logo-transparent.png',
      nav: {
        links: ['Kollektion', 'Leistungen', 'Goldankauf', 'Über Uns', 'Kontakt'],
        ctaText: 'Termin anfragen',
      },
      hero: {
        eyebrow: 'Seit 2001 · 25 Jahre Erfahrung',
        headline: 'Gold',
        headlineEm: 'kauf',
        subtitle: 'Wir kaufen Ihr Gold zu fairen Tagespreisen',
        desc: 'Bringen Sie Ihr Altgold einfach vorbei — wir bewerten es kostenlos, zahlen faire Tagespreise ohne versteckte Gebühren und Sie erhalten Ihr Geld sofort und sicher in bar. Kein Termin nötig.',
        chips: ['585er & 750er Gold', 'Faire Tagespreise', 'Sofortauszahlung', 'Kein Termin nötig'],
        primaryBtnText: 'Termin anfragen →',
        secondaryBtnText: 'Kollektion ansehen',
        badgeNumber: '25',
        badgeText: 'Jahre\nErfahrung',
        image: 'public/images/elit-hero-goldbarren.jpg',
        imagePos: DEFAULT_IMAGE_POSITION,
      },
      banner: {
        eyebrow: 'Für Ihren großen Moment',
        headline1: 'Trauringe &',
        headline2: 'Verlobungsringe',
        sub: 'Handgefertigte Eheringe und Verlobungsringe in Gold, Weißgold und Rosegold.',
        ctaText: 'Kollektion ansehen →',
        items: [
          { title: 'Individuelle Anfertigung', desc: 'Nach Ihren Wünschen gefertigt' },
          { title: '585er & 750er Gold', desc: 'Gelbgold, Weißgold oder Rosegold' },
          { title: 'Echte Diamanten', desc: 'Diamanten, Labdiamanten oder Zirkonia' },
          { title: '25 Jahre Erfahrung', desc: 'Persönliche Beratung seit 2001' },
        ],
      },
      stats: [
        { value: '27+', label: 'Jahre Erfahrung' },
        { value: '5★', label: 'Google Bewertung' },
        { value: '∞', label: 'Einzigartige Designs' },
        { value: '100%', label: 'Persönliche Beratung' },
      ],
      services: {
        eyebrow: 'Unsere Leistungen',
        heading: 'Alles für Ihren',
        headingEm: 'besonderen Moment',
        lead: 'Von der Verlobung bis zur Goldene Hochzeit — wir begleiten Sie mit Leidenschaft und Fachkenntnis.',
        featuredTitle: 'Goldankauf',
        featuredDesc: 'Wir kaufen Ihr Altgold, Schmuckstücke, Münzen und Zahngold zu fairen Tagespreisen. Sofortige Auszahlung, keine versteckten Gebühren. Bringen Sie Ihren Schmuck direkt zu uns — wir bewerten kostenlos und unverbindlich.',
        featuredList: [
          'Goldschmuck, Ketten, Ringe, Armbänder',
          'Goldmünzen & Barren',
          'Zahngold & Dentalschmuck',
          'Sofortauszahlung in Bar',
        ],
        featuredCtaText: 'Jetzt bewerten lassen →',
        cards: [
          { title: 'Trauringe & Eheringe', desc: 'Wählen Sie aus hunderten Designs oder lassen Sie Ihren Traumring individuell anfertigen. In Gelbgold, Weißgold oder Rosegold — mit oder ohne Steine.', linkText: 'Kollektion ansehen →' },
          { title: 'Verlobungsringe', desc: 'Der perfekte Ring für den größten Moment. Mit echten Diamanten, Labdiamanten oder Zirkonia-Steinen — jeder Ring wird mit Liebe ausgewählt oder gefertigt.', linkText: 'Beratungstermin →' },
          { title: 'Schmuck & Accessoires', desc: 'Halsketten, Armbänder, Ohrringe und mehr — eine kuratierte Auswahl hochwertiger Goldschmuckstücke für jeden Anlass und Stil.', linkText: 'Kollektion ansehen →' },
        ],
      },
      gallery: {
        eyebrow: 'Unsere Kollektion',
        heading: 'Handverlesene',
        headingEm: 'Schmuckstücke',
        items: [
          { image: 'public/images/elit-1.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Ringe mit Steinen', category: 'ring' },
          { image: 'public/images/elit-2.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-3.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-4.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-5.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Ring-Set', category: 'ring' },
          { image: 'public/images/elit-6.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-7.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-8.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-9.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Ringe mit Steinen', category: 'ring' },
          { image: 'public/images/elit-10.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Gold-Bandringe', category: 'ring' },
          { image: 'public/images/elit-11.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-12.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldring', category: 'ring' },
          { image: 'public/images/elit-13.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldarmband', category: 'armband' },
          { image: 'public/images/elit-14.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldarmband', category: 'armband' },
          { image: 'public/images/elit-15.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldarmband', category: 'armband' },
          { image: 'public/images/elit-16.png', imagePos: DEFAULT_IMAGE_POSITION, caption: 'Goldkette Armbänder', category: 'armband' },
        ],
      },
      about: {
        eyebrow: 'Über Elit Juwelier',
        heading: '25 Jahre Leidenschaft',
        headingEm: 'für Goldschmuck',
        body1: 'Seit 2001 sind wir Ihr vertrauensvoller Juwelier in Hagen. Was als kleine Familienwerkstatt begann, ist heute ein etabliertes Fachgeschäft mit tiefer Leidenschaft für hochwertigen Goldschmuck.',
        body2: 'Unser Anspruch ist einfach: Jeder Kunde verdient persönliche Aufmerksamkeit und ehrliche Beratung — ob beim Kauf Ihres Traumrings oder beim Verkauf von Altgold. Faire Preise, kein Druck, kein Stress.',
        image: 'public/images/elit-10.png',
        imagePos: DEFAULT_IMAGE_POSITION,
        stampNumber: '25',
        stampText: 'Jahre\nTradition',
        features: [
          { title: 'Individuelle Anfertigung', desc: 'Nach Ihren Wünschen gefertigt' },
          { title: 'Faire Goldpreise', desc: 'Tagesaktuelle Ankaufspreise' },
          { title: 'Zertifizierte Qualität', desc: 'Geprüfte Goldlegierungen' },
          { title: 'Persönliche Beratung', desc: 'Kein Online-Shop, echte Menschen' },
        ],
      },
      contact: {
        eyebrow: 'Kontakt & Öffnungszeiten',
        heading: 'Wir freuen uns',
        headingEm: 'auf Sie',
        address: 'Elberfelder Str. 22\n58095 Hagen, NRW',
        phone: '02331 / 5936841',
        whatsapp: '0174 / 9155488',
        hoursWeekday: '10:00 – 19:00 Uhr',
        hoursSunday: 'Geschlossen',
      },
      goldankaufInfo: {
        eyebrow: 'Goldankauf',
        heading: 'Ihr Altgold ist',
        headingEm: 'mehr wert',
        body1: 'Haben Sie alten Schmuck, Goldmünzen oder Zahngold? Wir bezahlen faire, tagesaktuelle Preise — sofort in Bar, ohne Wartezeit. Bringen Sie Ihr Gold einfach vorbei, wir bewerten kostenlos und ohne Verpflichtung.',
        body2: 'Als langjähriger Familienbetrieb wissen wir: Vertrauen ist alles. Deshalb sind unsere Ankaufspreise stets transparent und nachvollziehbar.',
        ctaText: 'Gold bewerten lassen →',
        cards: [
          { title: 'Goldschmuck', desc: 'Ringe, Ketten, Armbänder, Ohrringe — alle Legierungen von 333er bis 999er Gold.' },
          { title: 'Goldmünzen & Barren', desc: 'Krugerrand, Maple Leaf, Wiener Philharmoniker und andere Anlagemünzen.' },
          { title: 'Zahngold', desc: 'Zahnkronen, Brücken und andere zahntechnische Goldlegierungen.' },
          { title: 'Sofortauszahlung', desc: 'Kein Warten, keine Überweisungen — Barzahlung direkt bei der Bewertung.' },
        ],
      },
      reviews: {
        eyebrow: 'Kundenstimmen',
        heading: 'Was unsere Kunden',
        headingEm: 'über uns sagen',
        score: '5,0',
        scoreLabel: 'Google Bewertung',
        scoreSubLabel: 'Basierend auf echten Kundenbewertungen',
        googleBtnText: 'Alle Bewertungen auf Google ansehen',
        items: [
          { text: 'Ich bin sehr zufrieden mit meinem Besuch. Der Ankauf verlief fair, transparent und professionell. Absolut empfehlenswert!', name: 'GmK Yoktur', source: 'Google Rezension' },
          { text: 'Super nette Beratung und eine angenehme Atmosphäre. Ich fühle mich immer sehr wohl und gut beraten.', name: 'Saranda Hax', source: 'Google Rezension' },
          { text: 'Sehr nett, macht sehr gute Preise und ist sehr freundlich. Ich würde es definitiv weiterempfehlen.', name: 'Vivian Vogelgesang', source: 'Google Rezension' },
          { text: 'Sehr nett und kompetent. Rundum zufrieden mit dem Service und den Preisen.', name: 'Cetric Schmidt', source: 'Google Rezension' },
          { text: 'Sehr nettes und freundliches Personal. Für mich war es eine sehr angenehme Erfahrung. Gerne wieder!', name: 'Emily Schurna', source: 'Google Rezension' },
          { text: 'Ich war inzwischen schon mehrfach bei Elit Juwelier und bin jedes Mal aufs Neue begeistert. Top Qualität, faire Preise!', name: 'Amin El Hankouri', source: 'Google Rezension' },
          { text: 'Absolut empfehlenswert! Der Service ist erstklassig und die Auswahl wirklich beeindruckend. Ich komme gerne wieder.', name: 'Vanessa Drysch', source: 'Google Rezension' },
          { text: 'Super Laden und sehr nette Beratung! Genau das richtige Stück gefunden.', name: 'Max', source: 'Google Rezension' },
          { text: 'Genialer Service – Super Eigentümer. Man merkt, dass hier mit Herzblut gearbeitet wird.', name: 'Salvatore Cofone', source: 'Google Rezension' },
          { text: 'Gerne! Sehr empfehlenswerter Juwelier mit ausgezeichnetem Kundenservice und toller Auswahl.', name: 'Jose da Silva', source: 'Google Rezension' },
          { text: 'Top Beratung, Top Kundenservice. Man fühlt sich von Anfang an gut aufgehoben.', name: 'Elias Damerow', source: 'Google Rezension' },
          { text: 'Super Laden, Super Service, Super Preise – mehr muss man nicht sagen!', name: 'Sinan', source: 'Google Rezension' },
          { text: 'Ganz herzlichen Dank für den netten Service ❤️❤️ – wirklich sehr empfehlenswert!', name: 'Basilika Mehlich', source: 'Google Rezension' },
          { text: 'Sehr gute Beratung, sehr nette Menschen. Man fühlt sich herzlich willkommen.', name: 'Erduan Huseni', source: 'Google Rezension' },
          { text: 'Sehr schöner Laden mit einer großen Auswahl. Die Beratung war sehr kompetent und freundlich.', name: 'Marilene da Silva', source: 'Google Rezension' },
          { text: 'Sehr nettes und zuvorkommendes Personal. Wir kommen gerne wieder und empfehlen den Laden weiter.', name: 'Bubi', source: 'Google Rezension' },
          { text: 'Super Service, vor allem eine sehr ausführliche Erklärung zu jedem Stück. Sehr professionell!', name: 'Ali Erdogan', source: 'Google Rezension' },
          { text: 'Top Beratung, Top Auswahl – immer zuvorkommend und sehr angenehm.', name: 'Mike Da Silva', source: 'Google Rezension' },
          { text: 'Sehr gute Beratung, sehr nette Menschen. Wenn Gold kaufen dann bei Elit ❤️', name: 'Sherry Bherry', source: 'Google Rezension' },
          { text: 'Waren heute mit unserer Tochter da und haben ihr Ohrlöcher stechen lassen. Sehr professionell und einfühlsam – danke!', name: 'Ahmet Schulze', source: 'Google Rezension' },
          { text: 'Top – Beratung super, nett und kompetent. Genau so stellt man sich einen Juwelier vor.', name: 'Christian H', source: 'Google Rezension' },
          { text: 'Super freundliches Personal, faire Preise und top Beratung – alles was man sich wünscht!', name: 'M E', source: 'Google Rezension' },
        ],
      },
      instagram: {
        heading: 'Verpassen Sie keine neuen Produkte mehr — besuchen Sie uns auf Instagram!',
        sub: 'Neue Kollektionen, exklusive Stücke und besondere Momente — täglich auf Instagram.',
        btnText: 'Besuchen Sie unser Instagram →',
      },
      footer: {
        tagline: 'Ihr Juwelier für Trauringe, Verlobungsringe und Goldankauf in Hagen. 25 Jahre Erfahrung, persönliche Beratung, faire Preise.',
        copyright: '© 2026 Elit Juwelier Hagen. Alle Rechte vorbehalten.',
        col1Title: 'Leistungen',
        col1Links: ['Goldankauf', 'Trauringe', 'Verlobungsringe', 'Schmuck & Accessoires'],
        col2Title: 'Kollektion',
        col2Links: ['Ringe', 'Armbänder', 'Alle Stücke'],
        col3Title: 'Info',
        col3Links: ['Über Uns', 'Kontakt', 'Impressum', 'Datenschutz'],
        legalLinks: ['Impressum', 'Datenschutz', 'Cookie-Einstellungen'],
      },
      legal: {
        impressumHtml:
          '<h4>Angaben gemäß § 5 TMG</h4><p><strong>Elit Juwelier</strong><br>Elberfelder Str. 22<br>58095 Hagen<br>Deutschland</p><h4>Kontakt</h4><p>Telefon: 02331 / 5936841<br>WhatsApp: 0174 / 9155488</p><h4>Umsatzsteuer-ID</h4><p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: auf Anfrage erhältlich.</p><h4>Streitschlichtung</h4><p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p><h4>Haftung für Inhalte</h4><p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p><h4>Urheberrecht</h4><p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>',
        datenschutzHtml:
          '<h4>1. Verantwortlicher</h4><p>Elit Juwelier, Elberfelder Str. 22, 58095 Hagen. Telefon: 02331 / 5936841.</p><h4>2. Erhebung und Verarbeitung personenbezogener Daten</h4><p>Diese Website erhebt keine personenbezogenen Daten aktiv. Es werden keine Analyse- oder Tracking-Tools eingesetzt. Keine Cookies werden ohne Ihre Einwilligung gesetzt.</p><h4>3. Lokale Speicherung (localStorage)</h4><p>Wir speichern Ihre Cookie-Einwilligung ausschließlich lokal in Ihrem Browser (localStorage). Diese Daten verlassen Ihr Gerät nicht und werden nicht an uns übertragen.</p><h4>4. Google Fonts (externe Schriftarten)</h4><p>Diese Website verwendet Schriftarten von Google Fonts, einem Dienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Beim Laden der Schriftarten wird Ihre IP-Adresse an Google übertragen. Dies geschieht nur mit Ihrer ausdrücklichen Einwilligung. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Datenschutzerklärung Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</p><h4>5. Google Maps</h4><p>Zur Darstellung unseres Standorts nutzen wir Google Maps, einen Dienst der Google Ireland Limited. Das Einbetten der Karte überträgt Ihre IP-Adresse an Google. Dies geschieht nur nach Ihrer Einwilligung durch Klick auf „Karte aktivieren". Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO.</p><h4>6. Ihre Rechte</h4><p>Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Zur Ausübung dieser Rechte wenden Sie sich an: 02331 / 5936841.</p><h4>7. Widerruf der Einwilligung / Cookie-Einstellungen</h4><p>Sie können Ihre Einwilligung jederzeit widerrufen. Klicken Sie dazu auf „Cookie-Einstellungen" im Footer.</p><h4>8. Beschwerderecht</h4><p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig für NRW: Landesbeauftragte für Datenschutz und Informationsfreiheit NRW, <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener">www.ldi.nrw.de</a>.</p>',
      },
      cookie: {
        text: 'Wir nutzen externe Dienste (Google Maps & Google Fonts). Diese übertragen Daten an Google. Mit „Alle akzeptieren" stimmen Sie zu.',
        acceptText: 'Alle akzeptieren',
        essentialText: 'Nur Notwendige',
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

// Every image field's live path stores its focal point/zoom alongside it as
// image_position: {x,y,scale} — same convention hero.image_position already
// used before this was generalized to every image on the site.
function mapImagePos(live: any, fallback: ImagePosition): ImagePosition {
  return {
    x: typeof live?.x === 'number' ? live.x : fallback.x,
    y: typeof live?.y === 'number' ? live.y : fallback.y,
    scale: typeof live?.scale === 'number' ? live.scale : fallback.scale,
  };
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
    site: { logo: mapNullableImage(live?.site?.logo, fallback.site.logo) },
    hero: {
      eyebrow: h.eyebrow ?? fallback.hero.eyebrow,
      headline: h.headline ?? fallback.hero.headline,
      subtext: h.sub ?? fallback.hero.subtext,
      buttonText: h.cta_text ?? fallback.hero.buttonText,
      image: mapNullableImage(h.image, fallback.hero.image),
      imagePos: mapImagePos(h.image_position, fallback.hero.imagePos),
    },
    stats: mapStatArray(stats, fallback.stats),
    services: services
      ? services.map((s: any, i: number) => ({
          title: s.title ?? '',
          desc: s.desc ?? '',
          image: mapNullableImage(s.image, fallback.services[i]?.image ?? ''),
          imagePos: mapImagePos(s.image_position, fallback.services[i]?.imagePos ?? DEFAULT_IMAGE_POSITION),
        }))
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
      btnText: live?.home?.pricing_section?.btn_text ?? fallback.pricingSection.btnText,
    },
    about: {
      eyebrow: about.eyebrow ?? fallback.about.eyebrow,
      heading: about.heading ?? fallback.about.heading,
      body1: about.body_1 ?? fallback.about.body1,
      body2: about.body_2 ?? fallback.about.body2,
      image: mapNullableImage(about.image, fallback.about.image),
      imagePos: mapImagePos(about.image_position, fallback.about.imagePos),
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
            imagePos: mapImagePos(l.image_position, fallback.contact.locations[i]?.imagePos ?? DEFAULT_IMAGE_POSITION),
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
    schedule: mapScheduleContent(live?.schedule, fallback.schedule),
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
          imgPos: mapImagePos(m.img_position, fallback.members[i]?.imgPos ?? DEFAULT_IMAGE_POSITION),
          love: m.love ?? fallback.members[i]?.love ?? '',
          fact: m.fact ?? fallback.members[i]?.fact ?? '',
          f3l: m.f3l ?? fallback.members[i]?.f3l ?? '',
          f3: m.f3 ?? fallback.members[i]?.f3 ?? '',
        }))
      : fallback.members,
  };
}

function mapScheduleItemContent(live: any, fallback: ScheduleContent): ScheduleContent {
  const meta = Array.isArray(live?.meta) ? live.meta : null;
  return {
    eyebrow: live?.eyebrow ?? fallback.eyebrow,
    title: live?.title ?? fallback.title,
    desc: live?.desc ?? fallback.desc,
    meta: meta
      ? meta.map((m: any, i: number) => ({
          num: m.num ?? fallback.meta[i]?.num ?? '',
          label: m.label ?? fallback.meta[i]?.label ?? '',
        }))
      : fallback.meta,
    frameLabel: live?.frame_label ?? fallback.frameLabel,
    bsportTitle: live?.bsport_title ?? fallback.bsportTitle,
    bsportDesc: live?.bsport_desc ?? fallback.bsportDesc,
    bsportBadge: live?.bsport_badge ?? fallback.bsportBadge,
  };
}

function mapScheduleContent(
  live: any,
  fallback: { pberg: ScheduleContent; xberg: ScheduleContent }
): { pberg: ScheduleContent; xberg: ScheduleContent } {
  return {
    pberg: mapScheduleItemContent(live?.pberg, fallback.pberg),
    xberg: mapScheduleItemContent(live?.xberg, fallback.xberg),
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
      imagePos: mapImagePos(hero.image_position, fallback.hero.imagePos),
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
          imgPos: mapImagePos(sp.img_position, fallback.specialists[i]?.imgPos ?? DEFAULT_IMAGE_POSITION),
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

// Elit's live document nests everything under a single top-level "elit" key
// (its Supabase row is a separate client_id from Framework's, but the two
// live-JSON shapes are otherwise unrelated, so this key just matches the
// `data-fw="elit.hero.headline"`-style paths used in elit-juwelier's HTML).
function mapElitLiveToContent(live: any, fallback: ElitContent): ElitContent {
  const root = live?.elit ?? {};
  const nav = root.nav ?? {};
  const hero = root.hero ?? {};
  const banner = root.banner ?? {};
  const bannerItems = Array.isArray(banner.items) ? banner.items : null;
  const stats = Array.isArray(root.stats) ? root.stats : null;
  const services = root.services ?? {};
  const serviceCards = Array.isArray(services.cards) ? services.cards : null;
  const gallery = root.gallery ?? {};
  const items = Array.isArray(gallery.items) ? gallery.items : null;
  const about = root.about ?? {};
  const contact = root.contact ?? {};
  const goldankaufInfo = root.goldankauf_info ?? {};
  const goldankaufCards = Array.isArray(goldankaufInfo.cards) ? goldankaufInfo.cards : null;
  const reviews = root.reviews ?? {};
  const reviewItems = Array.isArray(reviews.items) ? reviews.items : null;
  const instagram = root.instagram ?? {};
  const footer = root.footer ?? {};
  const legal = root.legal ?? {};
  const cookie = root.cookie ?? {};
  return {
    logo: mapNullableImage(root.site?.logo, fallback.logo),
    nav: {
      links: Array.isArray(nav.links) ? nav.links : fallback.nav.links,
      ctaText: nav.cta_text ?? fallback.nav.ctaText,
    },
    hero: {
      eyebrow: hero.eyebrow ?? fallback.hero.eyebrow,
      headline: hero.headline ?? fallback.hero.headline,
      headlineEm: hero.headline_em ?? fallback.hero.headlineEm,
      subtitle: hero.subtitle ?? fallback.hero.subtitle,
      desc: hero.desc ?? fallback.hero.desc,
      chips: Array.isArray(hero.chips) ? hero.chips : fallback.hero.chips,
      primaryBtnText: hero.primary_btn_text ?? fallback.hero.primaryBtnText,
      secondaryBtnText: hero.secondary_btn_text ?? fallback.hero.secondaryBtnText,
      badgeNumber: hero.badge_number ?? fallback.hero.badgeNumber,
      badgeText: hero.badge_text ?? fallback.hero.badgeText,
      image: mapNullableImage(hero.image, fallback.hero.image),
      imagePos: mapImagePos(hero.image_position, fallback.hero.imagePos),
    },
    banner: {
      eyebrow: banner.eyebrow ?? fallback.banner.eyebrow,
      headline1: banner.headline_1 ?? fallback.banner.headline1,
      headline2: banner.headline_2 ?? fallback.banner.headline2,
      sub: banner.sub ?? fallback.banner.sub,
      ctaText: banner.cta_text ?? fallback.banner.ctaText,
      items: bannerItems
        ? bannerItems.map((it: any, i: number) => ({
            title: it.title ?? fallback.banner.items[i]?.title ?? '',
            desc: it.desc ?? fallback.banner.items[i]?.desc ?? '',
          }))
        : fallback.banner.items,
    },
    stats: stats
      ? stats.map((s: any, i: number) => ({
          value: s.value ?? fallback.stats[i]?.value ?? '',
          label: s.label ?? fallback.stats[i]?.label ?? '',
        }))
      : fallback.stats,
    services: {
      eyebrow: services.eyebrow ?? fallback.services.eyebrow,
      heading: services.heading ?? fallback.services.heading,
      headingEm: services.heading_em ?? fallback.services.headingEm,
      lead: services.lead ?? fallback.services.lead,
      featuredTitle: services.featured_title ?? fallback.services.featuredTitle,
      featuredDesc: services.featured_desc ?? fallback.services.featuredDesc,
      featuredList: Array.isArray(services.featured_list) ? services.featured_list : fallback.services.featuredList,
      featuredCtaText: services.featured_cta_text ?? fallback.services.featuredCtaText,
      cards: serviceCards
        ? serviceCards.map((s: any, i: number) => ({
            title: s.title ?? fallback.services.cards[i]?.title ?? '',
            desc: s.desc ?? fallback.services.cards[i]?.desc ?? '',
            linkText: s.link_text ?? fallback.services.cards[i]?.linkText ?? '',
          }))
        : fallback.services.cards,
    },
    gallery: {
      eyebrow: gallery.eyebrow ?? fallback.gallery.eyebrow,
      heading: gallery.heading ?? fallback.gallery.heading,
      headingEm: gallery.heading_em ?? fallback.gallery.headingEm,
      items: items
        ? items.map((it: any, i: number) => ({
            image: mapNullableImage(it.image, fallback.gallery.items[i]?.image ?? ''),
            imagePos: mapImagePos(it.image_position, fallback.gallery.items[i]?.imagePos ?? DEFAULT_IMAGE_POSITION),
            caption: it.caption ?? fallback.gallery.items[i]?.caption ?? '',
            category: it.category === 'armband' ? 'armband' : 'ring',
          }))
        : fallback.gallery.items,
    },
    about: {
      eyebrow: about.eyebrow ?? fallback.about.eyebrow,
      heading: about.heading ?? fallback.about.heading,
      headingEm: about.heading_em ?? fallback.about.headingEm,
      body1: about.body_1 ?? fallback.about.body1,
      body2: about.body_2 ?? fallback.about.body2,
      image: mapNullableImage(about.image, fallback.about.image),
      imagePos: mapImagePos(about.image_position, fallback.about.imagePos),
      stampNumber: about.stamp_number ?? fallback.about.stampNumber,
      stampText: about.stamp_text ?? fallback.about.stampText,
      features: Array.isArray(about.features)
        ? about.features.map((f: any, i: number) => ({
            title: f.title ?? fallback.about.features[i]?.title ?? '',
            desc: f.desc ?? fallback.about.features[i]?.desc ?? '',
          }))
        : fallback.about.features,
    },
    contact: {
      eyebrow: contact.eyebrow ?? fallback.contact.eyebrow,
      heading: contact.heading ?? fallback.contact.heading,
      headingEm: contact.heading_em ?? fallback.contact.headingEm,
      address: contact.address ?? fallback.contact.address,
      phone: contact.phone ?? fallback.contact.phone,
      whatsapp: contact.whatsapp ?? fallback.contact.whatsapp,
      hoursWeekday: contact.hours_weekday ?? fallback.contact.hoursWeekday,
      hoursSunday: contact.hours_sunday ?? fallback.contact.hoursSunday,
    },
    goldankaufInfo: {
      eyebrow: goldankaufInfo.eyebrow ?? fallback.goldankaufInfo.eyebrow,
      heading: goldankaufInfo.heading ?? fallback.goldankaufInfo.heading,
      headingEm: goldankaufInfo.heading_em ?? fallback.goldankaufInfo.headingEm,
      body1: goldankaufInfo.body_1 ?? fallback.goldankaufInfo.body1,
      body2: goldankaufInfo.body_2 ?? fallback.goldankaufInfo.body2,
      ctaText: goldankaufInfo.cta_text ?? fallback.goldankaufInfo.ctaText,
      cards: goldankaufCards
        ? goldankaufCards.map((c: any, i: number) => ({
            title: c.title ?? fallback.goldankaufInfo.cards[i]?.title ?? '',
            desc: c.desc ?? fallback.goldankaufInfo.cards[i]?.desc ?? '',
          }))
        : fallback.goldankaufInfo.cards,
    },
    reviews: {
      eyebrow: reviews.eyebrow ?? fallback.reviews.eyebrow,
      heading: reviews.heading ?? fallback.reviews.heading,
      headingEm: reviews.heading_em ?? fallback.reviews.headingEm,
      score: reviews.score ?? fallback.reviews.score,
      scoreLabel: reviews.score_label ?? fallback.reviews.scoreLabel,
      scoreSubLabel: reviews.score_sub_label ?? fallback.reviews.scoreSubLabel,
      googleBtnText: reviews.google_btn_text ?? fallback.reviews.googleBtnText,
      items: reviewItems
        ? reviewItems.map((r: any, i: number) => ({
            text: r.text ?? fallback.reviews.items[i]?.text ?? '',
            name: r.name ?? fallback.reviews.items[i]?.name ?? '',
            source: r.source ?? fallback.reviews.items[i]?.source ?? '',
          }))
        : fallback.reviews.items,
    },
    instagram: {
      heading: instagram.heading ?? fallback.instagram.heading,
      sub: instagram.sub ?? fallback.instagram.sub,
      btnText: instagram.btn_text ?? fallback.instagram.btnText,
    },
    footer: {
      tagline: footer.tagline ?? fallback.footer.tagline,
      copyright: footer.copyright ?? fallback.footer.copyright,
      col1Title: footer.col1_title ?? fallback.footer.col1Title,
      col1Links: Array.isArray(footer.col1_links) ? footer.col1_links : fallback.footer.col1Links,
      col2Title: footer.col2_title ?? fallback.footer.col2Title,
      col2Links: Array.isArray(footer.col2_links) ? footer.col2_links : fallback.footer.col2Links,
      col3Title: footer.col3_title ?? fallback.footer.col3Title,
      col3Links: Array.isArray(footer.col3_links) ? footer.col3_links : fallback.footer.col3Links,
      legalLinks: Array.isArray(footer.legal_links) ? footer.legal_links : fallback.footer.legalLinks,
    },
    legal: {
      impressumHtml: legal.impressum_html ?? fallback.legal.impressumHtml,
      datenschutzHtml: legal.datenschutz_html ?? fallback.legal.datenschutzHtml,
    },
    cookie: {
      text: cookie.text ?? fallback.cookie.text,
      acceptText: cookie.accept_text ?? fallback.cookie.acceptText,
      essentialText: cookie.essential_text ?? fallback.cookie.essentialText,
    },
  };
}

// Serializes an ElitContent draft into the live document shape Elit's
// page-loader.js expects (mirrors mapElitLiveToContent's field-name
// convention in reverse) — shared by save() (full live doc merge) and
// buildElitLivePreviewPayload (partial postMessage payload).
function buildElitLiveSection(c: ElitContent) {
  return {
    site: { logo: c.logo || null },
    nav: { links: c.nav.links, cta_text: c.nav.ctaText },
    hero: {
      eyebrow: c.hero.eyebrow,
      headline: c.hero.headline,
      headline_em: c.hero.headlineEm,
      subtitle: c.hero.subtitle,
      desc: c.hero.desc,
      chips: c.hero.chips,
      primary_btn_text: c.hero.primaryBtnText,
      secondary_btn_text: c.hero.secondaryBtnText,
      badge_number: c.hero.badgeNumber,
      badge_text: c.hero.badgeText,
      image: c.hero.image || null,
      image_position: { ...c.hero.imagePos },
    },
    banner: {
      eyebrow: c.banner.eyebrow,
      headline_1: c.banner.headline1,
      headline_2: c.banner.headline2,
      sub: c.banner.sub,
      cta_text: c.banner.ctaText,
      items: c.banner.items.map((it) => ({ title: it.title, desc: it.desc })),
    },
    stats: c.stats.map((s) => ({ value: s.value, label: s.label })),
    services: {
      eyebrow: c.services.eyebrow,
      heading: c.services.heading,
      heading_em: c.services.headingEm,
      lead: c.services.lead,
      featured_title: c.services.featuredTitle,
      featured_desc: c.services.featuredDesc,
      featured_list: c.services.featuredList,
      featured_cta_text: c.services.featuredCtaText,
      cards: c.services.cards.map((s) => ({ title: s.title, desc: s.desc, link_text: s.linkText })),
    },
    gallery: {
      eyebrow: c.gallery.eyebrow,
      heading: c.gallery.heading,
      heading_em: c.gallery.headingEm,
      items: c.gallery.items.map((it) => ({
        image: it.image || null,
        image_position: { ...it.imagePos },
        caption: it.caption,
        category: it.category,
      })),
    },
    about: {
      eyebrow: c.about.eyebrow,
      heading: c.about.heading,
      heading_em: c.about.headingEm,
      body_1: c.about.body1,
      body_2: c.about.body2,
      image: c.about.image || null,
      image_position: { ...c.about.imagePos },
      stamp_number: c.about.stampNumber,
      stamp_text: c.about.stampText,
      features: c.about.features.map((f) => ({ title: f.title, desc: f.desc })),
    },
    contact: {
      eyebrow: c.contact.eyebrow,
      heading: c.contact.heading,
      heading_em: c.contact.headingEm,
      address: c.contact.address,
      phone: c.contact.phone,
      whatsapp: c.contact.whatsapp,
      hours_weekday: c.contact.hoursWeekday,
      hours_sunday: c.contact.hoursSunday,
    },
    goldankauf_info: {
      eyebrow: c.goldankaufInfo.eyebrow,
      heading: c.goldankaufInfo.heading,
      heading_em: c.goldankaufInfo.headingEm,
      body_1: c.goldankaufInfo.body1,
      body_2: c.goldankaufInfo.body2,
      cta_text: c.goldankaufInfo.ctaText,
      cards: c.goldankaufInfo.cards.map((card) => ({ title: card.title, desc: card.desc })),
    },
    reviews: {
      eyebrow: c.reviews.eyebrow,
      heading: c.reviews.heading,
      heading_em: c.reviews.headingEm,
      score: c.reviews.score,
      score_label: c.reviews.scoreLabel,
      score_sub_label: c.reviews.scoreSubLabel,
      google_btn_text: c.reviews.googleBtnText,
      items: c.reviews.items.map((r) => ({ text: r.text, name: r.name, source: r.source })),
    },
    instagram: { heading: c.instagram.heading, sub: c.instagram.sub, btn_text: c.instagram.btnText },
    footer: {
      tagline: c.footer.tagline,
      copyright: c.footer.copyright,
      col1_title: c.footer.col1Title,
      col1_links: c.footer.col1Links,
      col2_title: c.footer.col2Title,
      col2_links: c.footer.col2Links,
      col3_title: c.footer.col3Title,
      col3_links: c.footer.col3Links,
      legal_links: c.footer.legalLinks,
    },
    legal: { impressum_html: c.legal.impressumHtml, datenschutz_html: c.legal.datenschutzHtml },
    cookie: { text: c.cookie.text, accept_text: c.cookie.acceptText, essential_text: c.cookie.essentialText },
  };
}

export function buildElitLivePreviewPayload(content: ElitContent) {
  return { elit: buildElitLiveSection(content) };
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
  /**
   * Elit's content lives in a fully separate slice rather than widening
   * `content` to a union — Framework's SiteContent shape and every existing
   * accessor of `s.content.*` stays completely untouched. `updateField`
   * routes to this slice for any path starting with "elit." (prefix
   * stripped before traversal — see setAtPath call sites below).
   */
  elitContent: ElitContent;
  savedElitContentByClient: Record<string, ElitContent>;
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
  /**
   * Read-only admin metadata (not part of SiteContent, never sent through
   * updateField/save) — the real page-tab manifest and brand accent color,
   * read straight from the live site's own site.pages/site.accent so the
   * same admin code works for any client without hardcoding their pages
   * or theme.
   */
  sitePages: PageManifestItem[];
  siteAccent: string | null;
  loadClient: (clientId: string) => Promise<void>;
  setCurrentPage: (page: PageId) => void;
  setSelectedField: (field: string | null) => void;
  updateField: (path: string, value: string | boolean | number) => void;
  save: () => Promise<void>;
  revertLastSave: () => Promise<void>;
}

function setAtPath(obj: any, path: string, value: string | boolean | number) {
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
      content: CLIENTS[0].content!,
      savedContentByClient: {},
      elitContent: CLIENTS.find((c) => c.kind === 'elit')!.elitContent!,
      savedElitContentByClient: {},
      selectedField: null,
      dirty: false,
      liveSyncStatus: 'idle' as LiveSyncStatus,
      liveSyncMessage: null as string | null,
      liveLocationExtras: [] as Record<string, unknown>[],
      sitePages: CLIENTS[0].defaultPages,
      siteAccent: null as string | null,
      loadClient: async (clientId) => {
        const client = CLIENTS.find((c) => c.username === clientId);
        if (!client) return;

        if (client.kind === 'elit') {
          const savedElit = get().savedElitContentByClient[clientId] ?? client.elitContent!;
          set({
            currentClientId: clientId,
            currentPage: 'home',
            elitContent: savedElit,
            selectedField: null,
            dirty: false,
            sitePages: client.defaultPages,
            siteAccent: null,
          });
          if (!client.liveUrl) return;
          try {
            const res = await fetch(`${client.liveUrl}/admin/api/data`);
            if (!res.ok) return;
            const live = await res.json();
            const mapped = mapElitLiveToContent(live, client.elitContent!);
            set((state) =>
              state.currentClientId === clientId
                ? {
                    elitContent: mapped,
                    savedElitContentByClient: { ...state.savedElitContentByClient, [clientId]: mapped },
                    dirty: false,
                  }
                : state,
            );
          } catch {
            // Offline or the live endpoint is down — keep the seed content.
          }
          return;
        }

        const saved = get().savedContentByClient[clientId] ?? client.content!;
        set({
          currentClientId: clientId,
          currentPage: 'home',
          content: saved,
          selectedField: null,
          dirty: false,
          sitePages: client.defaultPages,
          siteAccent: null,
        });

        // Refresh from the real live data so the preview reflects whatever
        // was actually saved last (from any session, any device) — not a
        // possibly-stale local cache or the hardcoded seed.
        if (!client.liveUrl) return;
        try {
          const res = await fetch(`${client.liveUrl}/admin/api/data`);
          if (!res.ok) return;
          const live = await res.json();
          const mapped = mapLiveToContent(live, client.content!);
          const extras = Array.isArray(live?.home?.locations) ? live.home.locations : [];
          const pages = Array.isArray(live?.site?.pages) && live.site.pages.length
            ? live.site.pages
            : client.defaultPages;
          const accent = typeof live?.site?.accent === 'string' ? live.site.accent : null;
          set((state) =>
            state.currentClientId === clientId
              ? {
                  content: mapped,
                  savedContentByClient: { ...state.savedContentByClient, [clientId]: mapped },
                  dirty: false,
                  liveLocationExtras: extras,
                  sitePages: pages,
                  siteAccent: accent,
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
        path.startsWith('elit.')
          ? set((state) => ({
              elitContent: setAtPath(state.elitContent, path.slice('elit.'.length), value),
              dirty: true,
            }))
          : set((state) => ({
              content: setAtPath(state.content, path, value),
              dirty: true,
            })),
      save: async () => {
        const state = get();
        if (!state.currentClientId) return;

        const client = CLIENTS.find((c) => c.username === state.currentClientId);
        if (client?.kind === 'elit') {
          set({
            savedElitContentByClient: {
              ...state.savedElitContentByClient,
              [state.currentClientId]: state.elitContent,
            },
            dirty: false,
          });
          const elitLiveUrl = getClientLiveUrl(state.currentClientId);
          if (!elitLiveUrl) {
            set({ liveSyncStatus: 'unsupported', liveSyncMessage: null });
            return;
          }
          set({ liveSyncStatus: 'syncing', liveSyncMessage: null });
          try {
            const dataUrl = `${elitLiveUrl}/admin/api/data`;
            const getRes = await fetch(dataUrl);
            if (!getRes.ok) throw new Error(`Could not read live data (HTTP ${getRes.status})`);
            const live = await getRes.json();
            live.elit = buildElitLiveSection(state.elitContent);
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
          return;
        }

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

          live.site = live.site || {};
          live.site.logo = c.site.logo || null;

          live.home = live.home || {};
          live.home.hero = live.home.hero || {};
          live.home.hero.eyebrow = c.hero.eyebrow;
          live.home.hero.headline = c.hero.headline;
          live.home.hero.sub = c.hero.subtext;
          live.home.hero.cta_text = c.hero.buttonText;
          live.home.hero.image = c.hero.image || null;
          live.home.hero.image_position = { ...c.hero.imagePos };

          live.home.stats = c.stats.map((s) => ({ value: s.value, label: s.label }));

          // home.services didn't exist before this integration — matches
          // the data-fw="home.services.N.title/desc/image" hooks added to
          // the three class cards.
          live.home.services = c.services.map((s) => ({
            title: s.title,
            desc: s.desc,
            image: s.image || null,
            image_position: { ...s.imagePos },
          }));
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
            btn_text: c.pricingSection.btnText,
          };

          live.home.about = live.home.about || {};
          live.home.about.eyebrow = c.about.eyebrow;
          live.home.about.heading = c.about.heading;
          live.home.about.body_1 = c.about.body1;
          live.home.about.body_2 = c.about.body2;
          live.home.about.image = c.about.image || null;
          live.home.about.image_position = { ...c.about.imagePos };
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
          // Spread the live copy first so any untracked field survives,
          // then overwrite every field we do track (image_position now
          // included).
          const liveLocations = Array.isArray(live.home.locations) ? live.home.locations : [];
          live.home.locations = c.contact.locations.map((loc, i) => ({
            ...(liveLocations[i] || {}),
            neighborhood: loc.neighborhood,
            name: loc.name,
            address: loc.address,
            hours: loc.hours,
            image: loc.image || null,
            image_position: { ...loc.imagePos },
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
            img_position: { ...m.imgPos },
            love: m.love || null,
            fact: m.fact || null,
            f3l: m.f3l || null,
            f3: m.f3 || null,
          }));

          live.physio = live.physio || {};
          live.physio.hero = live.physio.hero || {};
          live.physio.hero.eyebrow = c.physio.hero.eyebrow;
          live.physio.hero.title = c.physio.hero.title;
          live.physio.hero.desc = c.physio.hero.desc;
          live.physio.hero.cta_text = c.physio.hero.ctaText;
          live.physio.hero.image = c.physio.hero.image || null;
          live.physio.hero.image_position = { ...c.physio.hero.imagePos };
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
            img_position: { ...sp.imgPos },
            bio: sp.bio,
            tags: sp.tags,
          }));
          live.physio.cta = { heading: c.physio.cta.heading, sub: c.physio.cta.sub, btn_text: c.physio.cta.btnText };

          live.schedule = live.schedule || {};
          live.schedule.pberg = buildScheduleItemPayload(c.schedule.pberg);
          live.schedule.xberg = buildScheduleItemPayload(c.schedule.xberg);

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

      revertLastSave: async () => {
        const state = get();
        if (!state.currentClientId) return;
        const client = CLIENTS.find((c) => c.username === state.currentClientId);
        const liveUrl = getClientLiveUrl(state.currentClientId);
        if (!client || !liveUrl) {
          set({ liveSyncStatus: 'unsupported', liveSyncMessage: null });
          return;
        }

        set({ liveSyncStatus: 'syncing', liveSyncMessage: null });
        try {
          const res = await fetch(`${liveUrl}/admin/api/data?action=revert`, { method: 'POST' });
          const json = await res.json().catch(() => ({}) as any);
          if (!res.ok || !json.ok) {
            set({
              liveSyncStatus: 'error',
              liveSyncMessage: json.error || `Revert failed (HTTP ${res.status}).`,
            });
            return;
          }
          const live = json.data;
          const clientId = state.currentClientId;

          if (client.kind === 'elit') {
            const mapped = mapElitLiveToContent(live, client.elitContent!);
            set((s) =>
              s.currentClientId === clientId
                ? {
                    elitContent: mapped,
                    savedElitContentByClient: { ...s.savedElitContentByClient, [clientId]: mapped },
                    dirty: false,
                    liveSyncStatus: 'success',
                    liveSyncMessage: 'Reverted to the previous save.',
                  }
                : s,
            );
            return;
          }

          const mapped = mapLiveToContent(live, client.content!);
          const extras = Array.isArray(live?.home?.locations) ? live.home.locations : [];
          const pages = Array.isArray(live?.site?.pages) && live.site.pages.length
            ? live.site.pages
            : client.defaultPages;
          const accent = typeof live?.site?.accent === 'string' ? live.site.accent : null;
          set((s) =>
            s.currentClientId === clientId
              ? {
                  content: mapped,
                  savedContentByClient: { ...s.savedContentByClient, [clientId]: mapped },
                  dirty: false,
                  liveLocationExtras: extras,
                  sitePages: pages,
                  siteAccent: accent,
                  liveSyncStatus: 'success',
                  liveSyncMessage: 'Reverted to the previous save.',
                }
              : s,
          );
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

export function getClientKind(clientId: string | null): 'framework' | 'elit' | undefined {
  return CLIENTS.find((c) => c.username === clientId)?.kind;
}

export function getClientLiveUrl(clientId: string | null): string | undefined {
  return CLIENTS.find((c) => c.username === clientId)?.liveUrl;
}

// The live site is one unified data document (home/team/physio/footer/site
// all in the same JSON row) rendered across three separate HTML pages —
// this just picks which page's URL the iframe should point at. Save/load
// always hit the same /admin/api/data endpoint regardless of page.
export function getClientPageUrl(
  clientId: string | null,
  page: PageId,
  pages: PageManifestItem[],
): string | undefined {
  const liveUrl = getClientLiveUrl(clientId);
  if (!liveUrl) return undefined;
  const path = pages.find((p) => p.id === page)?.path ?? '';
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
    // Unlike hero/about/etc, the logo has no placeholder overlay to fall
    // back on, and applyData()'s generic patch loop skips null/undefined —
    // so a deleted logo has to be sent as a real empty string, not
    // coalesced to null, or the stale <img> src would never actually clear.
    site: { logo: content.site.logo },
    home: {
      hero: {
        eyebrow: content.hero.eyebrow,
        headline: content.hero.headline,
        sub: content.hero.subtext,
        cta_text: content.hero.buttonText,
        image: content.hero.image || null,
        image_position: { ...content.hero.imagePos },
      },
      stats: content.stats.map((s) => ({ value: s.value, label: s.label })),
      services: content.services.map((s) => ({
        title: s.title,
        desc: s.desc,
        image: s.image || null,
        image_position: { ...s.imagePos },
      })),
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
        btn_text: content.pricingSection.btnText,
      },
      about: {
        eyebrow: content.about.eyebrow,
        heading: content.about.heading,
        body_1: content.about.body1,
        body_2: content.about.body2,
        image: content.about.image || null,
        image_position: { ...content.about.imagePos },
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
        image_position: { ...loc.imagePos },
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
      members: content.team.members.map((m) => ({
        name: m.name,
        role: m.role,
        img: m.img || null,
        img_position: { ...m.imgPos },
        love: m.love || null,
        fact: m.fact || null,
        f3l: m.f3l || null,
        f3: m.f3 || null,
      })),
    },
    physio: {
      hero: {
        eyebrow: content.physio.hero.eyebrow,
        title: content.physio.hero.title,
        desc: content.physio.hero.desc,
        cta_text: content.physio.hero.ctaText,
        image: content.physio.hero.image || null,
        image_position: { ...content.physio.hero.imagePos },
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
        img_position: { ...sp.imgPos },
        bio: sp.bio,
        tags: sp.tags,
      })),
      cta: { heading: content.physio.cta.heading, sub: content.physio.cta.sub, btn_text: content.physio.cta.btnText },
    },
    schedule: {
      pberg: buildScheduleItemPayload(content.schedule.pberg),
      xberg: buildScheduleItemPayload(content.schedule.xberg),
    },
  };
}

function buildScheduleItemPayload(s: ScheduleContent) {
  return {
    eyebrow: s.eyebrow,
    title: s.title,
    desc: s.desc,
    meta: s.meta.map((m) => ({ num: m.num, label: m.label })),
    frame_label: s.frameLabel,
    bsport_title: s.bsportTitle,
    bsport_desc: s.bsportDesc,
    bsport_badge: s.bsportBadge,
  };
}

export function getAtPath(obj: any, path: string): string {
  return path.split('.').reduce((o, k) => {
    if (o == null) return '';
    const key: any = /^\d+$/.test(k) ? Number(k) : k;
    return o[key];
  }, obj) as unknown as string;
}

// Used by FieldEditor.tsx's generic primitives (TextField/ImagePositionEditor/
// SimpleImageEditor) so the same components work for both content slices —
// any path starting with "elit." reads from elitContent (prefix stripped),
// everything else reads from content exactly as before.
export function getFieldValue(state: { content: SiteContent; elitContent: ElitContent }, path: string): string {
  return path.startsWith('elit.')
    ? getAtPath(state.elitContent, path.slice('elit.'.length))
    : getAtPath(state.content, path);
}
