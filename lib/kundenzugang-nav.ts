import type { PageId } from './kundenzugang-store';

export interface NavLeaf {
  id: string;
  label: string;
}

export interface NavNode {
  id: string;
  label: string;
  children?: NavLeaf[];
  /**
   * Whether this section is wired to the live site — either via a data-fw
   * hook or an id-based rebuild in page-loader.js.
   */
  live: boolean;
}

// Shared across every page — the logo appears in every page's navbar (and
// footer), all driven by the same site.logo field.
const LOGO_LEAF: NavNode = { id: 'logo', label: 'Logo', live: true };

const HOME_NAV_TREE: NavNode[] = [
  LOGO_LEAF,
  {
    id: 'hero',
    label: 'Hero',
    live: true,
    children: [
      { id: 'hero.eyebrow', label: 'Eyebrow' },
      { id: 'hero.headline', label: 'Headline' },
      { id: 'hero.subtext', label: 'Subtext' },
      { id: 'hero.buttonText', label: 'Button Text' },
      { id: 'hero.image', label: 'Image' },
    ],
  },
  { id: 'stats', label: 'Stats Bar', live: true },
  {
    id: 'services',
    label: 'Services',
    live: true,
    children: [
      { id: 'services.header', label: 'Section Header' },
      { id: 'services.0', label: 'Service 1' },
      { id: 'services.1', label: 'Service 2' },
      { id: 'services.2', label: 'Service 3' },
    ],
  },
  {
    id: 'about',
    label: 'About',
    live: true,
    children: [
      { id: 'about.eyebrow', label: 'Eyebrow' },
      { id: 'about.heading', label: 'Heading' },
      { id: 'about.body1', label: 'Paragraph 1' },
      { id: 'about.body2', label: 'Paragraph 2' },
      { id: 'about.image', label: 'Image' },
      { id: 'about.stats', label: 'Stats' },
      { id: 'about.chips', label: 'Tags' },
    ],
  },
  { id: 'pricing', label: 'Membership Pricing', live: true },
  { id: 'testimonials', label: 'Testimonials', live: true },
  { id: 'contact', label: 'Contact', live: true },
  { id: 'cta', label: 'Call to Action', live: true },
  { id: 'footer', label: 'Footer', live: true },
];

// Team lives on its own page (team.html) as one long repeating grid of 32+
// member cards — kept as a single flat leaf (like Testimonials/Contact) with
// its own scrollable editor, rather than a nav entry per member.
const TEAM_NAV_TREE: NavNode[] = [LOGO_LEAF, { id: 'team', label: 'Team', live: true }];

// Physiotherapy also lives on its own page, but has genuinely distinct
// sub-sections (unlike Team's uniform cards), so it gets real nav children —
// same shape as Home's Hero/Services/About.
const PHYSIO_NAV_TREE: NavNode[] = [
  LOGO_LEAF,
  {
    id: 'physio',
    label: 'PT & Physiotherapy',
    live: true,
    children: [
      { id: 'physio.hero', label: 'Hero' },
      { id: 'physio.intro', label: 'Intro' },
      { id: 'physio.process', label: 'Process' },
      { id: 'physio.services', label: 'Services' },
      { id: 'physio.specialists', label: 'Specialists' },
      { id: 'physio.cta', label: 'Call to Action' },
    ],
  },
];

export const NAV_TREES: Record<PageId, NavNode[]> = {
  home: HOME_NAV_TREE,
  team: TEAM_NAV_TREE,
  physio: PHYSIO_NAV_TREE,
};

// Given a selected field id like "hero.headline" or "physio.intro", return
// the top-level section id ("hero", "physio") used to auto-expand its nav
// parent.
export function sectionOf(fieldId: string | null): string | null {
  if (!fieldId) return null;
  return fieldId.split('.')[0];
}

// ── Bidirectional bridge with the real iframe's data-fw/data-fw-section
// markers (click-to-select + highlight-on-select). Kept in one place so the
// two directions can't drift apart.
const LIVE_PATH_TO_FIELD: Record<string, string> = {
  'site.logo': 'logo',
  'home.hero.eyebrow': 'hero.eyebrow',
  'home.hero.headline': 'hero.headline',
  'home.hero.sub': 'hero.subtext',
  'home.hero.cta_text': 'hero.buttonText',
  'home.hero.image': 'hero.image',
  'home.stats.0.value': 'stats',
  'home.stats.0.label': 'stats',
  'home.stats.1.value': 'stats',
  'home.stats.1.label': 'stats',
  'home.stats.2.value': 'stats',
  'home.stats.2.label': 'stats',
  'home.stats.3.value': 'stats',
  'home.stats.3.label': 'stats',
  'home.services.0.title': 'services.0',
  'home.services.0.desc': 'services.0',
  'home.services.0.image': 'services.0',
  'home.services.1.title': 'services.1',
  'home.services.1.desc': 'services.1',
  'home.services.1.image': 'services.1',
  'home.services.2.title': 'services.2',
  'home.services.2.desc': 'services.2',
  'home.services.2.image': 'services.2',
  'home.classes.eyebrow': 'services.header',
  'home.classes.heading': 'services.header',
  'home.pricing_section.eyebrow': 'pricing',
  'home.pricing_section.heading': 'pricing',
  'home.pricing_section.sub': 'pricing',
  'home.pricing_section.btn_text': 'pricing',
  'home.pricing.0.credits': 'pricing', 'home.pricing.0.name': 'pricing', 'home.pricing.0.amount': 'pricing', 'home.pricing.0.note': 'pricing',
  'home.pricing.1.credits': 'pricing', 'home.pricing.1.name': 'pricing', 'home.pricing.1.amount': 'pricing', 'home.pricing.1.note': 'pricing',
  'home.pricing.2.credits': 'pricing', 'home.pricing.2.name': 'pricing', 'home.pricing.2.amount': 'pricing', 'home.pricing.2.note': 'pricing',
  'home.pricing.3.credits': 'pricing', 'home.pricing.3.name': 'pricing', 'home.pricing.3.amount': 'pricing', 'home.pricing.3.note': 'pricing',
  'home.pricing.4.credits': 'pricing', 'home.pricing.4.name': 'pricing', 'home.pricing.4.amount': 'pricing', 'home.pricing.4.note': 'pricing',
  'home.about.eyebrow': 'about.eyebrow',
  'home.about.heading': 'about.heading',
  'home.about.body_1': 'about.body1',
  'home.about.body_2': 'about.body2',
  'home.about.image': 'about.image',
  'home.about.stats.0.value': 'about.stats',
  'home.about.stats.0.label': 'about.stats',
  'home.about.stats.1.value': 'about.stats',
  'home.about.stats.1.label': 'about.stats',
  'home.about.chips.0': 'about.chips',
  'home.about.chips.1': 'about.chips',
  'home.about.chips.2': 'about.chips',
  'home.about.chips.3': 'about.chips',
  'home.locations_section.eyebrow': 'contact',
  'home.locations_section.heading': 'contact',
  'home.locations.0.neighborhood': 'contact', 'home.locations.0.name': 'contact',
  'home.locations.0.address': 'contact', 'home.locations.0.hours': 'contact', 'home.locations.0.image': 'contact',
  'home.locations.1.neighborhood': 'contact', 'home.locations.1.name': 'contact',
  'home.locations.1.address': 'contact', 'home.locations.1.hours': 'contact', 'home.locations.1.image': 'contact',
  'home.testimonials_section.eyebrow': 'testimonials',
  'home.testimonials_section.heading': 'testimonials',
  'home.cta.heading': 'cta',
  'home.cta.sub': 'cta',
  'footer.tagline': 'footer',
  'footer.copyright': 'footer',
};

// Path-prefix fallback for the Team/Physio pages — Team's 32+ members and
// Physio's services/specialists arrays are open-ended, so listing every
// exact "team.members.7.name"-style path by hand doesn't scale. Any live
// path starting with one of these prefixes maps to the field on the right,
// checked only after an exact LIVE_PATH_TO_FIELD match fails.
const PREFIX_TO_FIELD: [prefix: string, field: string][] = [
  ['team.', 'team'],
  ['physio.hero.', 'physio.hero'],
  ['physio.intro.', 'physio.intro'],
  ['physio.process.', 'physio.process'],
  ['physio.services.', 'physio.services'],
  ['physio.specialists.', 'physio.specialists'],
  ['physio.cta.', 'physio.cta'],
];

// Section-marker values the live site actually emits as data-fw-section —
// these ARE field ids directly (chosen that way on purpose), unlike
// data-fw paths which need the LIVE_PATH_TO_FIELD translation above.
const KNOWN_SECTION_FIELD_IDS = new Set([
  'pricing',
  'testimonials',
  'contact',
  'footer',
  'services.0',
  'services.1',
  'services.2',
  'team',
  'physio.hero',
  'physio.intro',
  'physio.process',
  'physio.services',
  'physio.specialists',
  'physio.cta',
]);

// Click inside the iframe → which field to select in the left panel.
// Falls back to data-fw-section for elements with no per-field data-fw hook
// — either because the section is rebuilt in bulk (Testimonials/Contact) or
// because the click landed on chrome around the real field (a service
// card's photo placeholder, the footer logo, the hero overlay sitting on
// top of #hero-bg).
export function mapLiveClickToField(path: string | null, section: string | null): string | null {
  if (path && LIVE_PATH_TO_FIELD[path]) return LIVE_PATH_TO_FIELD[path];
  if (path) {
    const hit = PREFIX_TO_FIELD.find(([prefix]) => path.startsWith(prefix));
    if (hit) return hit[1];
  }
  if (section && KNOWN_SECTION_FIELD_IDS.has(section)) return section;
  return null;
}

const FIELD_TO_LIVE_PATHS: Record<string, string[]> = {
  logo: ['site.logo'],
  'hero.eyebrow': ['home.hero.eyebrow'],
  'hero.headline': ['home.hero.headline'],
  'hero.subtext': ['home.hero.sub'],
  'hero.buttonText': ['home.hero.cta_text'],
  'hero.image': ['home.hero.image'],
  stats: [
    'home.stats.0.value', 'home.stats.0.label',
    'home.stats.1.value', 'home.stats.1.label',
    'home.stats.2.value', 'home.stats.2.label',
    'home.stats.3.value', 'home.stats.3.label',
  ],
  'services.0': ['home.services.0.title', 'home.services.0.desc', 'home.services.0.image'],
  'services.1': ['home.services.1.title', 'home.services.1.desc', 'home.services.1.image'],
  'services.2': ['home.services.2.title', 'home.services.2.desc', 'home.services.2.image'],
  'services.header': ['home.classes.eyebrow', 'home.classes.heading'],
  'about.eyebrow': ['home.about.eyebrow'],
  'about.heading': ['home.about.heading'],
  'about.body1': ['home.about.body_1'],
  'about.body2': ['home.about.body_2'],
  'about.image': ['home.about.image'],
  'about.stats': [
    'home.about.stats.0.value', 'home.about.stats.0.label',
    'home.about.stats.1.value', 'home.about.stats.1.label',
  ],
  'about.chips': ['home.about.chips.0', 'home.about.chips.1', 'home.about.chips.2', 'home.about.chips.3'],
  cta: ['home.cta.heading', 'home.cta.sub'],
  footer: ['footer.tagline', 'footer.copyright'],
};

// Field ids that highlight by section (data-fw-section) rather than by a
// fixed list of exact data-fw paths — used for bulk/repeating sections
// (Testimonials, Contact, Pricing) and every Team/Physio section, whose
// member/card counts are open-ended.
const SECTION_HIGHLIGHT_FIELDS = new Set([
  'testimonials',
  'contact',
  'pricing',
  'team',
  'physio.hero',
  'physio.intro',
  'physio.process',
  'physio.services',
  'physio.specialists',
  'physio.cta',
]);

// Selected field in the left panel → what to highlight inside the iframe.
export function getHighlightTarget(fieldId: string | null): { paths: string[] | null; section: string | null } {
  if (!fieldId) return { paths: null, section: null };
  if (SECTION_HIGHLIGHT_FIELDS.has(fieldId)) return { paths: null, section: fieldId };
  return { paths: FIELD_TO_LIVE_PATHS[fieldId] || null, section: null };
}
