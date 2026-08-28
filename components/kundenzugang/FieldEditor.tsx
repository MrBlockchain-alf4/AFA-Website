'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useContentStore, getAtPath } from '@/lib/kundenzugang-store';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-zinc-100 outline-none transition-colors focus:border-[#00D4FF]/50 focus:bg-white/[0.07] placeholder:text-zinc-600';

function TextField({ path, label, multiline }: { path: string; label: string; multiline?: boolean }) {
  const value = useContentStore((s) => getAtPath(s.content, path));
  const updateField = useContentStore((s) => s.updateField);
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          rows={3}
          className={inputCls}
          value={value}
          onChange={(e) => updateField(path, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={inputCls}
          value={value}
          onChange={(e) => updateField(path, e.target.value)}
        />
      )}
    </div>
  );
}

function TestimonialsEditor() {
  const items = useContentStore((s) => s.content.testimonials);
  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Review {i + 1}
          </div>
          <TextField path={`testimonials.${i}.quote`} label="Quote" multiline />
          <TextField path={`testimonials.${i}.name`} label="Name" />
          <TextField path={`testimonials.${i}.badge`} label="Badge" />
        </div>
      ))}
    </>
  );
}

function ContactEditor() {
  const locations = useContentStore((s) => s.content.contact.locations);
  return (
    <>
      <TextField path="contact.email" label="Email" />
      {locations.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            {locations.length > 1 ? `Location ${i + 1}` : 'Location'}
          </div>
          <TextField path={`contact.locations.${i}.name`} label="Studio Name" />
          <TextField path={`contact.locations.${i}.address`} label="Address" />
          <TextField path={`contact.locations.${i}.hours`} label="Hours" />
        </div>
      ))}
    </>
  );
}

const FIELD_SETS: Record<
  string,
  { path: string; label: string; multiline?: boolean }[] | 'testimonials' | 'contact'
> = {
  'hero.headline': [{ path: 'hero.headline', label: 'Headline', multiline: true }],
  'hero.subtext': [{ path: 'hero.subtext', label: 'Subtext', multiline: true }],
  'hero.buttonText': [{ path: 'hero.buttonText', label: 'Button Text' }],
  'hero.image': [{ path: 'hero.image', label: 'Image URL' }],
  'services.0': [
    { path: 'services.0.title', label: 'Title' },
    { path: 'services.0.desc', label: 'Description', multiline: true },
  ],
  'services.1': [
    { path: 'services.1.title', label: 'Title' },
    { path: 'services.1.desc', label: 'Description', multiline: true },
  ],
  'services.2': [
    { path: 'services.2.title', label: 'Title' },
    { path: 'services.2.desc', label: 'Description', multiline: true },
  ],
  testimonials: 'testimonials',
  contact: 'contact',
  footer: [
    { path: 'footer.tagline', label: 'Tagline' },
    { path: 'footer.copyright', label: 'Copyright' },
  ],
};

export default function FieldEditor() {
  const selectedField = useContentStore((s) => s.selectedField);

  return (
    <div className="px-4 pb-4">
      <AnimatePresence mode="wait">
        {!selectedField ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-1 py-4 text-[12.5px] leading-relaxed text-zinc-600"
          >
            Select a section on the left to edit its content. Changes appear instantly in the preview.
          </motion.p>
        ) : (
          <motion.div
            key={selectedField}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="border-t border-white/10 pt-4"
          >
            {FIELD_SETS[selectedField] === 'testimonials' ? (
              <TestimonialsEditor />
            ) : FIELD_SETS[selectedField] === 'contact' ? (
              <ContactEditor />
            ) : (
              (FIELD_SETS[selectedField] as { path: string; label: string; multiline?: boolean }[])?.map(
                (f) => <TextField key={f.path} path={f.path} label={f.label} multiline={f.multiline} />,
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
