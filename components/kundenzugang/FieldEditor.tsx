'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContentStore, getAtPath } from '@/lib/kundenzugang-store';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-zinc-100 outline-none transition-colors focus:border-[#00D4FF]/50 focus:bg-white/[0.07] placeholder:text-zinc-600';

function TextField({
  path,
  label,
  multiline,
  autoFocus,
}: {
  path: string;
  label: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const value = useContentStore((s) => getAtPath(s.content, path));
  const updateField = useContentStore((s) => s.updateField);
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          autoFocus={autoFocus}
          rows={3}
          className={inputCls}
          value={value}
          onChange={(e) => updateField(path, e.target.value)}
        />
      ) : (
        <input
          autoFocus={autoFocus}
          type="text"
          className={inputCls}
          value={value}
          onChange={(e) => updateField(path, e.target.value)}
        />
      )}
    </div>
  );
}

function HeroImageEditor() {
  const image = useContentStore((s) => s.content.hero.image);
  const posX = useContentStore((s) => s.content.hero.imagePositionX);
  const posY = useContentStore((s) => s.content.hero.imagePositionY);
  const scale = useContentStore((s) => s.content.hero.imageScale);
  const updateField = useContentStore((s) => s.updateField);
  const setHeroImagePosition = useContentStore((s) => s.setHeroImagePosition);
  const setHeroImageScale = useContentStore((s) => s.setHeroImageScale);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const dragging = useRef(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please choose a .jpg, .png, or .webp file.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateField('hero.image', reader.result);
    };
    reader.readAsDataURL(file);
  }

  function positionFromPointer(clientX: number, clientY: number) {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setHeroImagePosition(Math.round(x), Math.round(y));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!image) return;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    positionFromPointer(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    positionFromPointer(e.clientX, e.clientY);
  }
  function onPointerUp(e: React.PointerEvent) {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  return (
    <div className="mb-4">
      <Label>Image</Label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-2 w-full rounded-md border border-white/10 bg-white/5 py-2 text-[12px] font-semibold text-zinc-200 transition-colors hover:border-[#00D4FF]/40 hover:bg-white/[0.07]"
      >
        Upload Image
      </button>
      {uploadError && <p className="mb-2 text-[11px] text-red-400">{uploadError}</p>}

      {image ? (
        <>
          <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative mb-2 aspect-video w-full cursor-crosshair overflow-hidden rounded-md border border-white/10 bg-black"
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: `${posX}% ${posY}%`,
              backgroundSize: `${scale}%`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00D4FF] bg-white/80 shadow"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            />
          </div>
          <p className="mb-3 text-[10.5px] leading-relaxed text-zinc-600">
            Drag inside the image to set the focal point.
          </p>

          <Label>Zoom</Label>
          <input
            type="range"
            min={100}
            max={200}
            value={scale}
            onChange={(e) => setHeroImageScale(Number(e.target.value))}
            className="mb-4 w-full accent-[#00D4FF]"
          />
        </>
      ) : (
        <p className="mb-3 text-[11px] text-zinc-600">No image yet — upload one above.</p>
      )}

      <TextField path="hero.image" label="Or paste an Image URL" />
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
          <TextField path={`testimonials.${i}.quote`} label="Quote" multiline autoFocus={i === 0} />
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
      <TextField path="contact.email" label="Email" autoFocus />
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
  { path: string; label: string; multiline?: boolean }[] | 'testimonials' | 'contact' | 'heroImage'
> = {
  'hero.headline': [{ path: 'hero.headline', label: 'Headline', multiline: true }],
  'hero.subtext': [{ path: 'hero.subtext', label: 'Subtext', multiline: true }],
  'hero.buttonText': [{ path: 'hero.buttonText', label: 'Button Text' }],
  'hero.image': 'heroImage',
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
            ) : FIELD_SETS[selectedField] === 'heroImage' ? (
              <HeroImageEditor />
            ) : (
              (FIELD_SETS[selectedField] as { path: string; label: string; multiline?: boolean }[])?.map(
                (f, i) => (
                  <TextField key={f.path} path={f.path} label={f.label} multiline={f.multiline} autoFocus={i === 0} />
                ),
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
