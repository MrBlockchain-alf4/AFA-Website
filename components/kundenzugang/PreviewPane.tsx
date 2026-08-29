'use client';

import { motion } from 'framer-motion';
import { useContentStore, useAuthStore, getClientSiteName } from '@/lib/kundenzugang-store';
import { sectionOf, indexOf } from '@/lib/kundenzugang-nav';
import { cn } from '@/lib/utils';

const CYAN = '#00D4FF';

function Highlight({
  active,
  className,
  children,
  onClick,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      animate={
        active
          ? { boxShadow: `0 0 0 2px ${CYAN}, 0 0 24px 2px rgba(0,212,255,0.35)` }
          : { boxShadow: '0 0 0 0px rgba(0,212,255,0)' }
      }
      transition={{ duration: 0.25 }}
      className={cn('relative rounded-lg', onClick && 'cursor-pointer', className)}
    >
      {children}
    </motion.div>
  );
}

export default function PreviewPane() {
  const content = useContentStore((s) => s.content);
  const dirty = useContentStore((s) => s.dirty);
  const selectedField = useContentStore((s) => s.selectedField);
  const setSelectedField = useContentStore((s) => s.setSelectedField);
  const section = sectionOf(selectedField);
  const svcIndex = indexOf(selectedField);
  const clientId = useAuthStore((s) => s.clientId);
  const siteName = getClientSiteName(clientId);

  return (
    <div className="flex h-full flex-col bg-[#0b0e0c]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span
            className={cn(
              'h-1.5 w-1.5 flex-shrink-0 rounded-full',
              dirty ? 'bg-[#00D4FF]' : 'bg-emerald-500',
            )}
          />
          <span>{dirty ? 'Unsaved draft — not in Supabase yet' : 'Showing live data'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1100px]">
          {/* HERO */}
          <Highlight active={section === 'hero'} className="m-6 overflow-hidden">
            <div
              className="relative flex min-h-[420px] flex-col items-start justify-center gap-5 rounded-lg bg-cover bg-center px-14 py-20"
              style={{
                backgroundImage: content.hero.image
                  ? `linear-gradient(rgba(10,14,11,0.55),rgba(10,14,11,0.75)), url(${content.hero.image})`
                  : undefined,
                backgroundColor: content.hero.image ? undefined : '#161616',
              }}
            >
              {!content.hero.image && (
                <span className="absolute right-6 top-6 rounded border border-white/10 px-2 py-1 text-[10px] text-zinc-600">
                  No image set
                </span>
              )}
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5fa87a]">
                {siteName}
              </span>
              <h1 className="whitespace-pre-line text-[44px] font-extrabold leading-[1.05] tracking-tight text-white">
                {content.hero.headline}
              </h1>
              <p className="max-w-[440px] text-[15px] leading-relaxed text-zinc-300">
                {content.hero.subtext}
              </p>
              <button className="mt-2 rounded-md bg-[#1a3a2a] px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#14301f]">
                {content.hero.buttonText}
              </button>
            </div>
          </Highlight>

          {/* SERVICES */}
          <div className="m-6">
            <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5fa87a]">
              Services
            </div>
            <div className="grid grid-cols-3 gap-4">
              {content.services.map((svc, i) => (
                <Highlight
                  key={i}
                  active={section === 'services' && (svcIndex === null || svcIndex === i)}
                  onClick={() => setSelectedField(`services.${i}`)}
                >
                  <div className="h-full rounded-lg border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-2 text-[15px] font-bold text-white">{svc.title}</div>
                    <p className="text-[13px] leading-relaxed text-zinc-400">{svc.desc}</p>
                  </div>
                </Highlight>
              ))}
            </div>
          </div>

          {/* TESTIMONIALS */}
          <Highlight
            active={section === 'testimonials'}
            className="m-6"
            onClick={() => setSelectedField('testimonials')}
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5fa87a]">
                Testimonials
              </div>
              <div className="grid grid-cols-2 gap-4">
                {content.testimonials.map((t, i) => (
                  <div key={i} className="rounded-md bg-white/[0.03] p-4">
                    <div className="mb-2 text-[13px] text-[#5fa87a]">★★★★★</div>
                    <p className="mb-3 text-[13px] italic leading-relaxed text-zinc-300">"{t.quote}"</p>
                    <div className="text-[12px] font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-zinc-500">{t.badge}</div>
                  </div>
                ))}
              </div>
            </div>
          </Highlight>

          {/* CONTACT */}
          <Highlight
            active={section === 'contact'}
            className="m-6"
            onClick={() => setSelectedField('contact')}
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-[#5fa87a]">
                <span>Contact</span>
                <span className="font-normal normal-case tracking-normal text-zinc-400">
                  {content.contact.email}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {content.contact.locations.map((loc, i) => (
                  <div key={i} className="rounded-md bg-white/[0.03] p-4 text-[13px] text-zinc-300">
                    <div className="mb-1 text-[13px] font-semibold text-white">{loc.name}</div>
                    <div>{loc.address}</div>
                    <div className="mt-1 text-zinc-500">{loc.hours}</div>
                  </div>
                ))}
              </div>
            </div>
          </Highlight>

          {/* FOOTER */}
          <Highlight
            active={section === 'footer'}
            className="m-6 mb-10"
            onClick={() => setSelectedField('footer')}
          >
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 text-center">
              <p className="mb-2 text-[13px] text-zinc-400">{content.footer.tagline}</p>
              <p className="text-[11px] text-zinc-600">{content.footer.copyright}</p>
            </div>
          </Highlight>
        </div>
      </div>
    </div>
  );
}
