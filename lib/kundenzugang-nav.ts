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

// Each Schedule page is a single small page (address/hours reuse Home's own
// location fields, so they're edited there — see Contact — not duplicated
// here) — kept as one flat leaf with a composite editor, like Team.
const PBERG_SCHEDULE_NAV_TREE: NavNode[] = [LOGO_LEAF, { id: 'schedule.pberg', label: 'Schedule Page', live: true }];
const XBERG_SCHEDULE_NAV_TREE: NavNode[] = [LOGO_LEAF, { id: 'schedule.xberg', label: 'Schedule Page', live: true }];

export const NAV_TREES: Record<PageId, NavNode[]> = {
  home: HOME_NAV_TREE,
  team: TEAM_NAV_TREE,
  physio: PHYSIO_NAV_TREE,
  'pberg-schedule': PBERG_SCHEDULE_NAV_TREE,
  'xberg-schedule': XBERG_SCHEDULE_NAV_TREE,
};

// Elit Juwelier — a single-page site with its own content shape (see
// ElitContent in kundenzugang-store.ts), so it gets its own flat nav tree
// rather than reusing Framework's. Every id is prefixed "elit." so it can't
// collide with Framework's field ids in the shared FIELD_SETS map, and each
// leaf here is a single composite editor (like Physio's own sub-sections)
// rather than further nav-tree nesting.
const ELIT_NAV_TREE: NavNode[] = [
  { id: 'elit.logo', label: 'Logo', live: true },
  { id: 'elit.nav', label: 'Navbar', live: true },
  { id: 'elit.hero', label: 'Goldkauf (Hero)', live: true },
  { id: 'elit.banner', label: 'Trauringe Banner', live: true },
  { id: 'elit.stats', label: 'Stats Bar', live: true },
  { id: 'elit.services', label: 'Services (Leistungen)', live: true },
  { id: 'elit.gallery', label: 'Gallery', live: true },
  { id: 'elit.about', label: 'About', live: true },
  { id: 'elit.contact', label: 'Contact', live: true },
  { id: 'elit.goldankaufInfo', label: 'Goldankauf Info', live: true },
  { id: 'elit.reviews', label: 'Reviews', live: true },
  { id: 'elit.instagram', label: 'Instagram', live: true },
  { id: 'elit.footer', label: 'Footer', live: true },
  { id: 'elit.legal', label: 'Legal (Impressum/Datenschutz)', live: true },
  { id: 'elit.cookie', label: 'Cookie Banner', live: true },
];

// Client-scoped nav tree lookup — Framework's clients (kind omitted/
// 'framework') keep using NAV_TREES[page] exactly as before; Elit always
// gets its one flat tree regardless of `page` (it only ever has 'home').
export function getNavTreeFor(clientKind: 'framework' | 'elit' | undefined, page: PageId): NavNode[] {
  if (clientKind === 'elit') return ELIT_NAV_TREE;
  return NAV_TREES[page];
}

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
  // Schedule pages — small, fixed-shape blocks, exact paths like elit.nav.
  'schedule.pberg.eyebrow': 'schedule.pberg',
  'schedule.pberg.title': 'schedule.pberg',
  'schedule.pberg.desc': 'schedule.pberg',
  'schedule.pberg.meta.0.num': 'schedule.pberg', 'schedule.pberg.meta.0.label': 'schedule.pberg',
  'schedule.pberg.meta.1.num': 'schedule.pberg', 'schedule.pberg.meta.1.label': 'schedule.pberg',
  'schedule.pberg.meta.2.num': 'schedule.pberg', 'schedule.pberg.meta.2.label': 'schedule.pberg',
  'schedule.pberg.frame_label': 'schedule.pberg',
  'schedule.pberg.bsport_title': 'schedule.pberg',
  'schedule.pberg.bsport_desc': 'schedule.pberg',
  'schedule.pberg.bsport_badge': 'schedule.pberg',
  'schedule.xberg.eyebrow': 'schedule.xberg',
  'schedule.xberg.title': 'schedule.xberg',
  'schedule.xberg.desc': 'schedule.xberg',
  'schedule.xberg.meta.0.num': 'schedule.xberg', 'schedule.xberg.meta.0.label': 'schedule.xberg',
  'schedule.xberg.meta.1.num': 'schedule.xberg', 'schedule.xberg.meta.1.label': 'schedule.xberg',
  'schedule.xberg.meta.2.num': 'schedule.xberg', 'schedule.xberg.meta.2.label': 'schedule.xberg',
  'schedule.xberg.frame_label': 'schedule.xberg',
  'schedule.xberg.bsport_title': 'schedule.xberg',
  'schedule.xberg.bsport_desc': 'schedule.xberg',
  'schedule.xberg.bsport_badge': 'schedule.xberg',
  // Elit Juwelier — every field has its own exact data-fw path (no bulk
  // rebuild like Team/Locations), so this is a flat 1:1 list rather than a
  // prefix match, except gallery items which use PREFIX_TO_FIELD below.
  'elit.site.logo': 'elit.logo',
  'elit.hero.eyebrow': 'elit.hero',
  'elit.hero.headline': 'elit.hero',
  'elit.hero.headline_em': 'elit.hero',
  'elit.hero.subtitle': 'elit.hero',
  'elit.hero.desc': 'elit.hero',
  'elit.hero.chips.0': 'elit.hero', 'elit.hero.chips.1': 'elit.hero',
  'elit.hero.chips.2': 'elit.hero', 'elit.hero.chips.3': 'elit.hero',
  'elit.hero.primary_btn_text': 'elit.hero',
  'elit.hero.secondary_btn_text': 'elit.hero',
  'elit.hero.badge_number': 'elit.hero',
  'elit.hero.badge_text': 'elit.hero',
  'elit.hero.image': 'elit.hero',
  'elit.gallery.eyebrow': 'elit.gallery',
  'elit.gallery.heading': 'elit.gallery',
  'elit.gallery.heading_em': 'elit.gallery',
  'elit.about.eyebrow': 'elit.about',
  'elit.about.heading': 'elit.about',
  'elit.about.heading_em': 'elit.about',
  'elit.about.body_1': 'elit.about',
  'elit.about.body_2': 'elit.about',
  'elit.about.image': 'elit.about',
  'elit.about.stamp_number': 'elit.about',
  'elit.about.stamp_text': 'elit.about',
  'elit.about.features.0.title': 'elit.about', 'elit.about.features.0.desc': 'elit.about',
  'elit.about.features.1.title': 'elit.about', 'elit.about.features.1.desc': 'elit.about',
  'elit.about.features.2.title': 'elit.about', 'elit.about.features.2.desc': 'elit.about',
  'elit.about.features.3.title': 'elit.about', 'elit.about.features.3.desc': 'elit.about',
  'elit.contact.eyebrow': 'elit.contact',
  'elit.contact.heading': 'elit.contact',
  'elit.contact.heading_em': 'elit.contact',
  'elit.contact.address': 'elit.contact',
  'elit.contact.phone': 'elit.contact',
  'elit.contact.whatsapp': 'elit.contact',
  'elit.contact.hours_weekday': 'elit.contact',
  'elit.contact.hours_sunday': 'elit.contact',
  'elit.nav.cta_text': 'elit.nav',
  'elit.banner.eyebrow': 'elit.banner',
  'elit.banner.headline_1': 'elit.banner',
  'elit.banner.headline_2': 'elit.banner',
  'elit.banner.sub': 'elit.banner',
  'elit.banner.cta_text': 'elit.banner',
  'elit.services.eyebrow': 'elit.services',
  'elit.services.heading': 'elit.services',
  'elit.services.heading_em': 'elit.services',
  'elit.services.lead': 'elit.services',
  'elit.services.featured_title': 'elit.services',
  'elit.services.featured_desc': 'elit.services',
  'elit.services.featured_cta_text': 'elit.services',
  'elit.goldankauf_info.eyebrow': 'elit.goldankaufInfo',
  'elit.goldankauf_info.heading': 'elit.goldankaufInfo',
  'elit.goldankauf_info.heading_em': 'elit.goldankaufInfo',
  'elit.goldankauf_info.body_1': 'elit.goldankaufInfo',
  'elit.goldankauf_info.body_2': 'elit.goldankaufInfo',
  'elit.goldankauf_info.cta_text': 'elit.goldankaufInfo',
  'elit.reviews.eyebrow': 'elit.reviews',
  'elit.reviews.heading': 'elit.reviews',
  'elit.reviews.heading_em': 'elit.reviews',
  'elit.reviews.score': 'elit.reviews',
  'elit.reviews.score_label': 'elit.reviews',
  'elit.reviews.score_sub_label': 'elit.reviews',
  'elit.reviews.google_btn_text': 'elit.reviews',
  'elit.instagram.heading': 'elit.instagram',
  'elit.instagram.sub': 'elit.instagram',
  'elit.instagram.btn_text': 'elit.instagram',
  'elit.footer.tagline': 'elit.footer',
  'elit.footer.copyright': 'elit.footer',
  'elit.footer.col1_title': 'elit.footer',
  'elit.footer.col2_title': 'elit.footer',
  'elit.footer.col3_title': 'elit.footer',
  'elit.legal.impressum_html': 'elit.legal',
  'elit.legal.datenschutz_html': 'elit.legal',
  'elit.cookie.text': 'elit.cookie',
  'elit.cookie.accept_text': 'elit.cookie',
  'elit.cookie.essential_text': 'elit.cookie',
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
  // Elit's 16-photo gallery is open-ended like Team's members — prefix
  // match instead of listing every "elit.gallery.items.N.image"-style path.
  ['elit.gallery.items.', 'elit.gallery'],
  // Same reasoning for every other open-ended array field on Elit's site.
  ['elit.nav.links.', 'elit.nav'],
  ['elit.banner.items.', 'elit.banner'],
  ['elit.stats.', 'elit.stats'],
  ['elit.services.featured_list.', 'elit.services'],
  ['elit.services.cards.', 'elit.services'],
  ['elit.goldankauf_info.cards.', 'elit.goldankaufInfo'],
  ['elit.reviews.items.', 'elit.reviews'],
  ['elit.footer.col1_links.', 'elit.footer'],
  ['elit.footer.col2_links.', 'elit.footer'],
  ['elit.footer.col3_links.', 'elit.footer'],
  ['elit.footer.legal_links.', 'elit.footer'],
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
  'schedule.pberg',
  'schedule.xberg',
  'physio.hero',
  'physio.intro',
  'physio.process',
  'physio.services',
  'physio.specialists',
  'physio.cta',
  'elit.logo',
  'elit.nav',
  'elit.hero',
  'elit.banner',
  'elit.stats',
  'elit.services',
  'elit.gallery',
  'elit.about',
  'elit.contact',
  'elit.goldankaufInfo',
  'elit.reviews',
  'elit.instagram',
  'elit.footer',
  'elit.legal',
  'elit.cookie',
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
  'schedule.pberg': [
    'schedule.pberg.eyebrow', 'schedule.pberg.title', 'schedule.pberg.desc',
    'schedule.pberg.meta.0.num', 'schedule.pberg.meta.0.label',
    'schedule.pberg.meta.1.num', 'schedule.pberg.meta.1.label',
    'schedule.pberg.meta.2.num', 'schedule.pberg.meta.2.label',
    'schedule.pberg.frame_label', 'schedule.pberg.bsport_title',
    'schedule.pberg.bsport_desc', 'schedule.pberg.bsport_badge',
  ],
  'schedule.xberg': [
    'schedule.xberg.eyebrow', 'schedule.xberg.title', 'schedule.xberg.desc',
    'schedule.xberg.meta.0.num', 'schedule.xberg.meta.0.label',
    'schedule.xberg.meta.1.num', 'schedule.xberg.meta.1.label',
    'schedule.xberg.meta.2.num', 'schedule.xberg.meta.2.label',
    'schedule.xberg.frame_label', 'schedule.xberg.bsport_title',
    'schedule.xberg.bsport_desc', 'schedule.xberg.bsport_badge',
  ],
  // Elit Juwelier — exact per-element paths, same convention as Framework's
  // Hero/About above (not section-based): the hero section alone is
  // min-height:100vh, so a single outline around the whole thing would be
  // effectively invisible — highlighting each real element instead gives
  // the same precise, visible selection feedback Framework has.
  'elit.logo': ['elit.site.logo'],
  'elit.hero': [
    'elit.hero.eyebrow', 'elit.hero.headline', 'elit.hero.headline_em', 'elit.hero.subtitle', 'elit.hero.desc',
    'elit.hero.chips.0', 'elit.hero.chips.1', 'elit.hero.chips.2', 'elit.hero.chips.3',
    'elit.hero.primary_btn_text', 'elit.hero.secondary_btn_text',
    'elit.hero.badge_number', 'elit.hero.badge_text', 'elit.hero.image',
  ],
  'elit.about': [
    'elit.about.eyebrow', 'elit.about.heading', 'elit.about.heading_em', 'elit.about.body_1', 'elit.about.body_2',
    'elit.about.image', 'elit.about.stamp_number', 'elit.about.stamp_text',
    'elit.about.features.0.title', 'elit.about.features.0.desc',
    'elit.about.features.1.title', 'elit.about.features.1.desc',
    'elit.about.features.2.title', 'elit.about.features.2.desc',
    'elit.about.features.3.title', 'elit.about.features.3.desc',
  ],
  'elit.contact': [
    'elit.contact.eyebrow', 'elit.contact.heading', 'elit.contact.heading_em',
    'elit.contact.address', 'elit.contact.phone', 'elit.contact.whatsapp',
    'elit.contact.hours_weekday', 'elit.contact.hours_sunday',
  ],
  // Nav/Banner/Instagram/Legal/Cookie are small, fixed-shape blocks — exact
  // paths, same as Hero/About above.
  'elit.nav': ['elit.nav.links.0', 'elit.nav.links.1', 'elit.nav.links.2', 'elit.nav.links.3', 'elit.nav.links.4', 'elit.nav.cta_text'],
  'elit.banner': [
    'elit.banner.eyebrow', 'elit.banner.headline_1', 'elit.banner.headline_2', 'elit.banner.sub', 'elit.banner.cta_text',
    'elit.banner.items.0.title', 'elit.banner.items.0.desc', 'elit.banner.items.1.title', 'elit.banner.items.1.desc',
    'elit.banner.items.2.title', 'elit.banner.items.2.desc', 'elit.banner.items.3.title', 'elit.banner.items.3.desc',
  ],
  'elit.instagram': ['elit.instagram.heading', 'elit.instagram.sub', 'elit.instagram.btn_text'],
  'elit.legal': ['elit.legal.impressum_html', 'elit.legal.datenschutz_html'],
  'elit.cookie': ['elit.cookie.text', 'elit.cookie.accept_text', 'elit.cookie.essential_text'],
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
  // Gallery/Stats/Services/Goldankauf-Info/Reviews/Footer stay section-based
  // — either genuinely open-ended lists (Gallery's 16 photos, Reviews' 22
  // testimonials) or compact-enough sections (Stats bar, Footer) that a
  // whole-section outline reads fine, unlike the min-height:100vh Hero.
  'elit.gallery',
  'elit.stats',
  'elit.services',
  'elit.goldankaufInfo',
  'elit.reviews',
  'elit.footer',
]);

// Selected field in the left panel → what to highlight inside the iframe.
export function getHighlightTarget(fieldId: string | null): { paths: string[] | null; section: string | null } {
  if (!fieldId) return { paths: null, section: null };
  if (SECTION_HIGHLIGHT_FIELDS.has(fieldId)) return { paths: null, section: fieldId };
  return { paths: FIELD_TO_LIVE_PATHS[fieldId] || null, section: null };
}
