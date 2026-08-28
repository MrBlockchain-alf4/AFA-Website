import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kundenzugang | AFA',
  robots: { index: false, follow: false },
};

export default function KundenzugangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
