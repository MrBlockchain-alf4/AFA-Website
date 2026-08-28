export interface NavLeaf {
  id: string;
  label: string;
}

export interface NavNode {
  id: string;
  label: string;
  children?: NavLeaf[];
}

export const NAV_TREE: NavNode[] = [
  {
    id: 'hero',
    label: 'Hero',
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
    children: [
      { id: 'services.0', label: 'Service 1' },
      { id: 'services.1', label: 'Service 2' },
      { id: 'services.2', label: 'Service 3' },
    ],
  },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
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
