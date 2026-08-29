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

export const NAV_TREE: NavNode[] = [
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
  { id: 'testimonials', label: 'Testimonials', live: true },
  { id: 'contact', label: 'Contact', live: true },
  { id: 'cta', label: 'Call to Action', live: true },
  { id: 'footer', label: 'Footer', live: true },
];

// Given a selected field id like "hero.headline" or "about.stats", return the
// top-level section id ("hero", "about") used to auto-expand its nav parent.
export function sectionOf(fieldId: string | null): string | null {
  if (!fieldId) return null;
  return fieldId.split('.')[0];
}

// ── Bidirectional bridge with the real iframe's data-fw/data-fw-section
// markers (click-to-select + highlight-on-select). Kept in one place so the
// two directions can't drift apart.
const LIVE_PATH_TO_FIELD: Record<string, string> = {
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
  'home.services.1.title': 'services.1',
  'home.services.1.desc': 'services.1',
  'home.services.2.title': 'services.2',
  'home.services.2.desc': 'services.2',
  'home.classes.eyebrow': 'services.header',
  'home.classes.heading': 'services.header',
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
  'home.testimonials_section.eyebrow': 'testimonials',
  'home.testimonials_section.heading': 'testimonials',
  'home.cta.heading': 'cta',
  'home.cta.sub': 'cta',
  'footer.tagline': 'footer',
  'footer.copyright': 'footer',
};

// Section-marker values the live site actually emits as data-fw-section —
// these ARE field ids directly (chosen that way on purpose), unlike
// data-fw paths which need the LIVE_PATH_TO_FIELD translation above.
const KNOWN_SECTION_FIELD_IDS = new Set([
  'testimonials',
  'contact',
  'footer',
  'services.0',
  'services.1',
  'services.2',
]);

// Click inside the iframe → which field to select in the left panel.
// Falls back to data-fw-section for elements with no per-field data-fw hook
// — either because the section is rebuilt in bulk (Testimonials/Contact) or
// because the click landed on chrome around the real field (a service
// card's photo placeholder, the footer logo, the hero overlay sitting on
// top of #hero-bg).
export function mapLiveClickToField(path: string | null, section: string | null): string | null {
  if (path && LIVE_PATH_TO_FIELD[path]) return LIVE_PATH_TO_FIELD[path];
  if (section && KNOWN_SECTION_FIELD_IDS.has(section)) return section;
  return null;
}

const FIELD_TO_LIVE_PATHS: Record<string, string[]> = {
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
  'services.0': ['home.services.0.title', 'home.services.0.desc'],
  'services.1': ['home.services.1.title', 'home.services.1.desc'],
  'services.2': ['home.services.2.title', 'home.services.2.desc'],
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

// Selected field in the left panel → what to highlight inside the iframe.
export function getHighlightTarget(fieldId: string | null): { paths: string[] | null; section: string | null } {
  if (!fieldId) return { paths: null, section: null };
  if (fieldId === 'testimonials' || fieldId === 'contact') return { paths: null, section: fieldId };
  return { paths: FIELD_TO_LIVE_PATHS[fieldId] || null, section: null };
}
