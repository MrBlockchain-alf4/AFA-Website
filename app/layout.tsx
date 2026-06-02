import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Chivo_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const chivo = Chivo_Mono({
  subsets: ["latin"],
  variable: "--font-chivo",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AFA | KI-Mitarbeiter für moderne Unternehmen",
  description:
    "AFA entwickelt autonome KI-Mitarbeiter, die Leads anrufen, Interessenten qualifizieren, Termine buchen und Support übernehmen — rund um die Uhr.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${chivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
