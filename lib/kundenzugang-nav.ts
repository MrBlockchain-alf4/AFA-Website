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
   * hook or an id-based rebuild in page-loader.js. All five are true now
   * (Services + Footer via new data-fw hooks; Testimonials + Contact were
   * already wired via #car-track/#fw-locations-root, just unreachable until
   * /admin/api/data existed).
   */
  live: boolean;
}

export const NAV_TREE: NavNode[] = [
  {
    id: 'hero',
    label: 'Hero',
    live: true,
    children: [
      { id: 'hero.headline', label: 'Headline' },
      { id: 'hero.subtext', label: 'Subtext' },
      { id: 'hero.buttonText', label: 'Button Text' },
      { id: 'hero.image', label: 'Image' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    live: true,
    children: [
      { id: 'services.0', label: 'Service 1' },
      { id: 'services.1', label: 'Service 2' },
      { id: 'services.2', label: 'Service 3' },
    ],
  },
  { id: 'testimonials', label: 'Testimonials', live: true },
  { id: 'contact', label: 'Contact', live: true },
  { id: 'footer', label: 'Footer', live: true },
];

// Given a selected field id like "hero.headline" or "services.1", return the
// top-level section id ("hero", "services") used to drive the preview highlight.
export function sectionOf(fieldId: string | null): string | null {
  if (!fieldId) return null;
  return fieldId.split('.')[0];
}

// For "services.1" → 1. For non-indexed sections → null.
export function indexOf(fieldId: string | null): number | null {
  if (!fieldId) return null;
  const parts = fieldId.split('.');
  if (parts.length < 2) return null;
  const n = Number(parts[1]);
  return Number.isNaN(n) ? null : n;
}

// ── Bidirectional bridge with the real iframe's data-fw/data-fw-section
// markers (click-to-select + highlight-on-select). Kept in one place so the
// two directions can't drift apart.
const LIVE_PATH_TO_FIELD: Record<string, string> = {
  'home.hero.headline': 'hero.headline',
  'home.hero.sub': 'hero.subtext',
  'home.hero.cta_text': 'hero.buttonText',
  'home.hero.image': 'hero.image',
  'home.services.0.title': 'services.0',
  'home.services.0.desc': 'services.0',
  'home.services.1.title': 'services.1',
  'home.services.1.desc': 'services.1',
  'home.services.2.title': 'services.2',
  'home.services.2.desc': 'services.2',
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
  'hero.headline': ['home.hero.headline'],
  'hero.subtext': ['home.hero.sub'],
  'hero.buttonText': ['home.hero.cta_text'],
  'hero.image': ['home.hero.image'],
  'services.0': ['home.services.0.title', 'home.services.0.desc'],
  'services.1': ['home.services.1.title', 'home.services.1.desc'],
  'services.2': ['home.services.2.title', 'home.services.2.desc'],
  footer: ['footer.tagline', 'footer.copyright'],
};

// Selected field in the left panel → what to highlight inside the iframe.
export function getHighlightTarget(fieldId: string | null): { paths: string[] | null; section: string | null } {
  if (!fieldId) return { paths: null, section: null };
  if (fieldId === 'testimonials' || fieldId === 'contact') return { paths: null, section: fieldId };
  return { paths: FIELD_TO_LIVE_PATHS[fieldId] || null, section: null };
}
