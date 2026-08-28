export interface NavLeaf {
  id: string;
  label: string;
}

export interface NavNode {
  id: string;
  label: string;
  children?: NavLeaf[];
  /**
   * Whether this section is actually wired to the live site (has real
   * data-fw hooks in its HTML) — see SECTIONS_WITH_LIVE_HOOKS below. Only
   * Hero is true today; the rest save to the draft store but have no way to
   * reach the live page without editing its markup, which is out of scope.
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
    live: false,
    children: [
      { id: 'services.0', label: 'Service 1' },
      { id: 'services.1', label: 'Service 2' },
      { id: 'services.2', label: 'Service 3' },
    ],
  },
  { id: 'testimonials', label: 'Testimonials', live: false },
  { id: 'contact', label: 'Contact', live: false },
  { id: 'footer', label: 'Footer', live: false },
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

// Real anchors on the live Framework Berlin site (framework-berlin.vercel.app)
// that a section maps to, so selecting a field scrolls the embedded live
// preview to roughly the right place. The live site has no distinct anchor
// for "testimonials" or the footer, so those fall back to the nearest
// preceding section that does have one — a real constraint of the site's
// current markup, not something faked here.
const SECTION_ANCHOR: Record<string, string> = {
  hero: 'top',
  services: 'classes',
  testimonials: 'locations',
  contact: 'locations',
  footer: 'contact',
};

export function anchorOf(fieldId: string | null): string | null {
  const section = sectionOf(fieldId);
  if (!section) return null;
  return SECTION_ANCHOR[section] ?? null;
}
