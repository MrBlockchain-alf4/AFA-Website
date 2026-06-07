import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Chivo_Mono } from "next/font/google";
import "./globals.css";
import VoiceflowWidget from "@/components/VoiceflowWidget";

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
  title: "KI-Mitarbeiter für moderne Unternehmen | AFA",
  description:
    "AFA entwickelt autonome KI-Mitarbeiter, die Leads anrufen, Interessenten qualifizieren, Termine buchen und Support übernehmen — rund um die Uhr.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${chivo.variable}`}>
      <body>
        {children}
        <VoiceflowWidget />
      </body>
    </html>
  );
}
