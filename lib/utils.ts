import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tailwind's arbitrary-value opacity syntax (bg-[...]/15) can't resolve a
// runtime CSS value, so accent-themed elements (driven by each client's own
// live site.accent) use inline styles built from this instead.
function hexToRgbTuple(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return `rgba(0, 212, 255, ${alpha})`;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// A client's accent can be light (cyan) or dark (Framework's forest green)
// — solid-fill buttons/badges need to pick readable text accordingly rather
// than assuming dark text always works.
export function getContrastText(hex: string): string {
  const rgb = hexToRgbTuple(hex);
  if (!rgb) return '#09090b';
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#09090b' : '#ffffff';
}
