'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContentStore, getFieldValue } from '@/lib/kundenzugang-store';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Uploads are stored as base64 data URIs and shipped whole inside the save
// payload (Vercel serverless functions cap request bodies at 4.5MB, and the
// persisted store also has to fit in localStorage) — so every upload gets
// downscaled/re-encoded client-side before it ever reaches state.
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_DATA_URL_BYTES = 3 * 1024 * 1024;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      // Keep PNG (lossless, alpha-safe) for transparent logos/graphics; re-encode
      // everything else as JPEG, which compresses far better for photos.
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl =
        outputType === 'image/jpeg' ? canvas.toDataURL(outputType, JPEG_QUALITY) : canvas.toDataURL(outputType);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read image'));
    };
    img.src = objectUrl;
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-zinc-100 outline-none transition-colors focus:border-[var(--kz-accent)] focus:bg-white/[0.07] placeholder:text-zinc-600';

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
  const value = useContentStore((s) => getFieldValue(s,path));
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

// Universal photo editor: upload/replace/delete + drag-to-set-focal-point +
// zoom slider. Used for every "photo" field on the site (hero, about,
// locations, team, physio hero/specialists, class cards) — every one of
// those images fills a responsive, CSS-sized container via object-fit/
// background-size:cover, so this controls framing (which part is visible,
// how zoomed in) rather than the container's own size, which stays correct
// at every screen size. Not used for the site logo, which is object-fit:
// contain (always shown whole, no crop/focal-point concept) — that keeps
// using the simpler SimpleImageEditor below.
function ImagePositionEditor({
  imagePath,
  posPath,
  label,
}: {
  imagePath: string;
  posPath: string;
  label: string;
}) {
  const image = useContentStore((s) => getFieldValue(s,imagePath));
  const posX = useContentStore((s) => Number(getFieldValue(s,`${posPath}.x`)) || 50);
  const posY = useContentStore((s) => Number(getFieldValue(s,`${posPath}.y`)) || 50);
  const scale = useContentStore((s) => Number(getFieldValue(s,`${posPath}.scale`)) || 100);
  const updateField = useContentStore((s) => s.updateField);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dragging = useRef(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please choose a .jpg, .png, or .webp file.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length > MAX_DATA_URL_BYTES) {
        setUploadError('Image is still too large after compression — please choose a simpler photo.');
        return;
      }
      updateField(imagePath, dataUrl);
      // A new photo's composition rarely matches the old one's focal
      // point/zoom — reset to centered/fit rather than carry over a crop
      // that may now be pointing at the wrong part of the image.
      updateField(`${posPath}.x`, 50);
      updateField(`${posPath}.y`, 50);
      updateField(`${posPath}.scale`, 100);
    } catch {
      setUploadError('Could not process that image — please try a different file.');
    } finally {
      setUploading(false);
    }
  }

  function positionFromPointer(clientX: number, clientY: number) {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    updateField(`${posPath}.x`, Math.round(x));
    updateField(`${posPath}.y`, Math.round(y));
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
      <Label>{label}</Label>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-md border border-white/10 bg-white/5 py-2 text-[12px] font-semibold text-zinc-200 transition-colors hover:border-[var(--kz-accent-40)] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : image ? 'Replace Image' : 'Upload Image'}
        </button>
        {image && (
          <button
            type="button"
            onClick={() => updateField(imagePath, '')}
            className="rounded-md border border-red-500/25 bg-red-500/10 px-3 text-[12px] font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
          >
            Delete Photo
          </button>
        )}
      </div>
      {uploadError && <p className="mb-2 text-[11px] text-red-400">{uploadError}</p>}

      {image ? (
        <>
          <div
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="relative mb-2 aspect-video w-full cursor-crosshair touch-none overflow-hidden rounded-md border border-white/10 bg-black"
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: `${posX}% ${posY}%`,
              backgroundSize: `${scale}%`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--kz-accent)] bg-white/80 shadow"
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
            onChange={(e) => updateField(`${posPath}.scale`, Number(e.target.value))}
            className="mb-4 w-full accent-[var(--kz-accent)]"
          />
        </>
      ) : (
        <p className="mb-3 text-[11px] text-zinc-600">No image yet — upload one above.</p>
      )}

      <TextField path={imagePath} label="Or paste an Image URL" />
    </div>
  );
}

function TestimonialsEditor() {
  const items = useContentStore((s) => s.content.testimonials);
  return (
    <>
      <TextField path="testimonialsSection.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="testimonialsSection.heading" label="Section Heading" />
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
      <TextField path="locationsSection.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="locationsSection.heading" label="Section Heading" />
      <TextField path="contact.email" label="Email" />
      {locations.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            {locations.length > 1 ? `Location ${i + 1}` : 'Location'}
          </div>
          <TextField path={`contact.locations.${i}.neighborhood`} label="Neighborhood" />
          <TextField path={`contact.locations.${i}.name`} label="Studio Name" />
          <TextField path={`contact.locations.${i}.address`} label="Address" />
          <TextField path={`contact.locations.${i}.hours`} label="Hours" />
          <ImagePositionEditor
            imagePath={`contact.locations.${i}.image`}
            posPath={`contact.locations.${i}.imagePos`}
            label="Studio Photo"
          />
        </div>
      ))}
    </>
  );
}

function PricingEditor() {
  const tiers = useContentStore((s) => s.content.pricing);
  const updateField = useContentStore((s) => s.updateField);
  return (
    <>
      <TextField path="pricingSection.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="pricingSection.heading" label="Section Heading" />
      <TextField path="pricingSection.sub" label="Section Subtext" multiline />
      <TextField path="pricingSection.btnText" label="Button Text (all cards)" />
      {tiers.map((tier, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Tier {i + 1}
          </div>
          <TextField path={`pricing.${i}.credits`} label="Credits Label" />
          <TextField path={`pricing.${i}.name`} label="Tier Name" />
          <TextField path={`pricing.${i}.amount`} label="Price" />
          <TextField path={`pricing.${i}.note`} label="Note" />
          <label className="mb-4 flex items-center gap-2 text-[12px] text-zinc-300">
            <input
              type="checkbox"
              checked={tier.popular}
              onChange={(e) => updateField(`pricing.${i}.popular`, e.target.checked)}
              className="accent-[var(--kz-accent)]"
            />
            Mark as &quot;Most Popular&quot;
          </label>
        </div>
      ))}
    </>
  );
}

function TeamEditor() {
  const members = useContentStore((s) => s.content.team.members);
  return (
    <>
      <TextField path="team.header.eyebrow" label="Header Eyebrow" autoFocus />
      <TextField path="team.header.title" label="Header Title" multiline />
      <TextField path="team.header.desc" label="Header Description" multiline />
      <TextField path="team.philosophy.heading" label="Philosophy Heading" multiline />
      <TextField path="team.philosophy.body1" label="Philosophy Paragraph 1" multiline />
      <TextField path="team.philosophy.body2" label="Philosophy Paragraph 2" multiline />
      {members.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Team Member {i + 1}
          </div>
          <TextField path={`team.members.${i}.name`} label="Name" />
          <TextField path={`team.members.${i}.role`} label="Role" />
          <ImagePositionEditor
            imagePath={`team.members.${i}.img`}
            posPath={`team.members.${i}.imgPos`}
            label="Photo"
          />
        </div>
      ))}
    </>
  );
}

function ServiceEditor({ index }: { index: number }) {
  return (
    <>
      <TextField path={`services.${index}.title`} label="Title" autoFocus />
      <TextField path={`services.${index}.desc`} label="Description" multiline />
      <ImagePositionEditor
        imagePath={`services.${index}.image`}
        posPath={`services.${index}.imagePos`}
        label="Photo"
      />
    </>
  );
}

function PhysioHeroEditor() {
  return (
    <>
      <TextField path="physio.hero.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="physio.hero.title" label="Title" multiline />
      <TextField path="physio.hero.desc" label="Description" multiline />
      <TextField path="physio.hero.ctaText" label="Button Text" />
      <ImagePositionEditor imagePath="physio.hero.image" posPath="physio.hero.imagePos" label="Hero Image" />
    </>
  );
}

function PhysioIntroEditor() {
  return (
    <>
      <TextField path="physio.intro.label" label="Label" autoFocus />
      <TextField path="physio.intro.heading" label="Heading" multiline />
      <TextField path="physio.intro.body1" label="Paragraph 1" multiline />
      <TextField path="physio.intro.body2" label="Paragraph 2" multiline />
      <TextField path="physio.intro.body3" label="Paragraph 3" multiline />
    </>
  );
}

function PhysioProcessEditor() {
  const steps = useContentStore((s) => s.content.physio.process.steps);
  return (
    <>
      <TextField path="physio.process.label" label="Label" autoFocus />
      <TextField path="physio.process.heading" label="Heading" multiline />
      {steps.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Step {i + 1}
          </div>
          <TextField path={`physio.process.steps.${i}.title`} label="Title" />
          <TextField path={`physio.process.steps.${i}.text`} label="Text" multiline />
        </div>
      ))}
    </>
  );
}

function PhysioServicesEditor() {
  const services = useContentStore((s) => s.content.physio.services);
  return (
    <>
      {services.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Service {i + 1}
          </div>
          <TextField path={`physio.services.${i}.title`} label="Title" autoFocus={i === 0} />
          <TextField path={`physio.services.${i}.text`} label="Text" multiline />
        </div>
      ))}
    </>
  );
}

function PhysioSpecialistsEditor() {
  const specialists = useContentStore((s) => s.content.physio.specialists);
  return (
    <>
      {specialists.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Specialist {i + 1}
          </div>
          <TextField path={`physio.specialists.${i}.name`} label="Name" autoFocus={i === 0} />
          <TextField path={`physio.specialists.${i}.title`} label="Title" />
          <ImagePositionEditor
            imagePath={`physio.specialists.${i}.img`}
            posPath={`physio.specialists.${i}.imgPos`}
            label="Photo"
          />
          <TextField path={`physio.specialists.${i}.bio.0`} label="Bio Paragraph 1" multiline />
          <TextField path={`physio.specialists.${i}.bio.1`} label="Bio Paragraph 2" multiline />
          <ChipListEditor basePath={`physio.specialists.${i}.tags`} count={4} />
        </div>
      ))}
    </>
  );
}

function PhysioCtaEditor() {
  return (
    <>
      <TextField path="physio.cta.heading" label="Heading" multiline autoFocus />
      <TextField path="physio.cta.sub" label="Subtext" multiline />
      <TextField path="physio.cta.btnText" label="Button Text" />
    </>
  );
}

function StatListEditor({ basePath, count }: { basePath: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Stat {i + 1}
          </div>
          <TextField path={`${basePath}.${i}.value`} label="Value" autoFocus={i === 0} />
          <TextField path={`${basePath}.${i}.label`} label="Label" />
        </div>
      ))}
    </>
  );
}

function ChipListEditor({ basePath, count }: { basePath: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TextField key={i} path={`${basePath}.${i}`} label={`Tag ${i + 1}`} autoFocus={i === 0} />
      ))}
    </>
  );
}

function SimpleImageEditor({ path, label }: { path: string; label: string }) {
  const image = useContentStore((s) => getFieldValue(s,path));
  const updateField = useContentStore((s) => s.updateField);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Please choose a .jpg, .png, or .webp file.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length > MAX_DATA_URL_BYTES) {
        setUploadError('Image is still too large after compression — please choose a simpler photo.');
        return;
      }
      updateField(path, dataUrl);
    } catch {
      setUploadError('Could not process that image — please try a different file.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-md border border-white/10 bg-white/5 py-2 text-[12px] font-semibold text-zinc-200 transition-colors hover:border-[var(--kz-accent-40)] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : image ? 'Replace Image' : 'Upload Image'}
        </button>
        {image && (
          <button
            type="button"
            onClick={() => updateField(path, '')}
            className="rounded-md border border-red-500/25 bg-red-500/10 px-3 text-[12px] font-semibold text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
          >
            Delete Photo
          </button>
        )}
      </div>
      {uploadError && <p className="mb-2 text-[11px] text-red-400">{uploadError}</p>}
      {image ? (
        <div
          className="mb-2 aspect-video w-full overflow-hidden rounded-md border border-white/10 bg-black"
          style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ) : (
        <p className="mb-3 text-[11px] text-zinc-600">No image yet — upload one above.</p>
      )}
      <TextField path={path} label="Or paste an Image URL" />
    </div>
  );
}

// ── Elit Juwelier ────────────────────────────────────────────────────────
// A single-page jewelry site with its own content shape (ElitContent) —
// these editors read/write via the "elit."-prefixed paths that
// getFieldValue/updateField route to the elitContent store slice, built
// entirely from the same generic TextField/ImagePositionEditor/
// ChipListEditor/SimpleImageEditor primitives used above.
function ElitHeroEditor() {
  return (
    <>
      <TextField path="elit.hero.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="elit.hero.headline" label="Headline" />
      <TextField path="elit.hero.headlineEm" label="Headline (emphasized word)" />
      <TextField path="elit.hero.subtitle" label="Subtitle" multiline />
      <TextField path="elit.hero.desc" label="Description" multiline />
      <ChipListEditor basePath="elit.hero.chips" count={4} />
      <TextField path="elit.hero.primaryBtnText" label="Primary Button Text" />
      <TextField path="elit.hero.secondaryBtnText" label="Secondary Button Text" />
      <TextField path="elit.hero.badgeNumber" label="Badge Number" />
      <TextField path="elit.hero.badgeText" label="Badge Text" multiline />
      <ImagePositionEditor imagePath="elit.hero.image" posPath="elit.hero.imagePos" label="Hero Image" />
    </>
  );
}

function ElitGalleryEditor() {
  const items = useContentStore((s) => s.elitContent.gallery.items);
  return (
    <>
      <TextField path="elit.gallery.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="elit.gallery.heading" label="Section Heading" />
      <TextField path="elit.gallery.headingEm" label="Section Heading (emphasized word)" />
      {items.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Photo {i + 1}
          </div>
          <ImagePositionEditor
            imagePath={`elit.gallery.items.${i}.image`}
            posPath={`elit.gallery.items.${i}.imagePos`}
            label="Photo"
          />
          <TextField path={`elit.gallery.items.${i}.caption`} label="Caption" />
        </div>
      ))}
    </>
  );
}

function ElitNavEditor() {
  const links = useContentStore((s) => s.elitContent.nav.links);
  return (
    <>
      {links.map((_, i) => (
        <TextField key={i} path={`elit.nav.links.${i}`} label={`Nav Link ${i + 1}`} autoFocus={i === 0} />
      ))}
      <TextField path="elit.nav.ctaText" label="Nav Button Text" />
    </>
  );
}

function ElitBannerEditor() {
  const items = useContentStore((s) => s.elitContent.banner.items);
  return (
    <>
      <TextField path="elit.banner.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="elit.banner.headline1" label="Headline Line 1" />
      <TextField path="elit.banner.headline2" label="Headline Line 2" />
      <TextField path="elit.banner.sub" label="Subtext" multiline />
      <TextField path="elit.banner.ctaText" label="Button Text" />
      {items.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Item {i + 1}
          </div>
          <TextField path={`elit.banner.items.${i}.title`} label="Title" />
          <TextField path={`elit.banner.items.${i}.desc`} label="Description" />
        </div>
      ))}
    </>
  );
}

function ElitServicesEditor() {
  const cards = useContentStore((s) => s.elitContent.services.cards);
  const featuredList = useContentStore((s) => s.elitContent.services.featuredList);
  return (
    <>
      <TextField path="elit.services.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="elit.services.heading" label="Section Heading" />
      <TextField path="elit.services.headingEm" label="Section Heading (emphasized word)" />
      <TextField path="elit.services.lead" label="Section Lead" multiline />
      <div className="mb-4 rounded-md border border-white/10 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Featured Card (Goldankauf)
        </div>
        <TextField path="elit.services.featuredTitle" label="Title" />
        <TextField path="elit.services.featuredDesc" label="Description" multiline />
        {featuredList.map((_, i) => (
          <TextField key={i} path={`elit.services.featuredList.${i}`} label={`List Item ${i + 1}`} />
        ))}
        <TextField path="elit.services.featuredCtaText" label="Button Text" />
      </div>
      {cards.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Card {i + 1}
          </div>
          <TextField path={`elit.services.cards.${i}.title`} label="Title" />
          <TextField path={`elit.services.cards.${i}.desc`} label="Description" multiline />
          <TextField path={`elit.services.cards.${i}.linkText`} label="Link Text" />
        </div>
      ))}
    </>
  );
}

function ElitAboutEditor() {
  return (
    <>
      <TextField path="elit.about.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="elit.about.heading" label="Heading" />
      <TextField path="elit.about.headingEm" label="Heading (emphasized word)" />
      <TextField path="elit.about.body1" label="Paragraph 1" multiline />
      <TextField path="elit.about.body2" label="Paragraph 2" multiline />
      <ImagePositionEditor imagePath="elit.about.image" posPath="elit.about.imagePos" label="Image" />
      <TextField path="elit.about.stampNumber" label="Stamp Number" />
      <TextField path="elit.about.stampText" label="Stamp Text" multiline />
    </>
  );
}

// A separate leaf from About even though the seed content is analogous in
// tone — the live site renders them as two distinct <section> elements
// (.about and .contact), so combining them into one field group meant
// clicking anywhere in Contact would highlight/scroll to About's elements
// too (its own eyebrow/heading came first in the highlight list), jumping
// the preview away from what was actually clicked.
function ElitContactEditor() {
  return (
    <>
      <TextField path="elit.contact.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="elit.contact.heading" label="Heading" />
      <TextField path="elit.contact.headingEm" label="Heading (emphasized word)" />
      <TextField path="elit.contact.address" label="Address" multiline />
      <TextField path="elit.contact.phone" label="Phone" />
      <TextField path="elit.contact.whatsapp" label="WhatsApp" />
      <TextField path="elit.contact.hoursWeekday" label="Hours (Mon–Sat)" />
      <TextField path="elit.contact.hoursSunday" label="Hours (Sunday)" />
    </>
  );
}

function ElitGoldankaufInfoEditor() {
  const cards = useContentStore((s) => s.elitContent.goldankaufInfo.cards);
  return (
    <>
      <TextField path="elit.goldankaufInfo.eyebrow" label="Eyebrow" autoFocus />
      <TextField path="elit.goldankaufInfo.heading" label="Heading" />
      <TextField path="elit.goldankaufInfo.headingEm" label="Heading (emphasized word)" />
      <TextField path="elit.goldankaufInfo.body1" label="Paragraph 1" multiline />
      <TextField path="elit.goldankaufInfo.body2" label="Paragraph 2" multiline />
      <TextField path="elit.goldankaufInfo.ctaText" label="Button Text" />
      {cards.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Card {i + 1}
          </div>
          <TextField path={`elit.goldankaufInfo.cards.${i}.title`} label="Title" />
          <TextField path={`elit.goldankaufInfo.cards.${i}.desc`} label="Description" multiline />
        </div>
      ))}
    </>
  );
}

function ElitReviewsEditor() {
  const items = useContentStore((s) => s.elitContent.reviews.items);
  return (
    <>
      <TextField path="elit.reviews.eyebrow" label="Section Eyebrow" autoFocus />
      <TextField path="elit.reviews.heading" label="Section Heading" />
      <TextField path="elit.reviews.headingEm" label="Section Heading (emphasized word)" />
      <TextField path="elit.reviews.score" label="Score (e.g. 5,0)" />
      <TextField path="elit.reviews.scoreLabel" label="Score Label" />
      <TextField path="elit.reviews.scoreSubLabel" label="Score Sub-label" />
      <TextField path="elit.reviews.googleBtnText" label="Google Button Text" />
      {items.map((_, i) => (
        <div key={i} className="mb-4 rounded-md border border-white/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Review {i + 1}
          </div>
          <TextField path={`elit.reviews.items.${i}.text`} label="Quote" multiline />
          <TextField path={`elit.reviews.items.${i}.name`} label="Name" />
          <TextField path={`elit.reviews.items.${i}.source`} label="Source" />
        </div>
      ))}
    </>
  );
}

function ElitInstagramEditor() {
  return (
    <>
      <TextField path="elit.instagram.heading" label="Heading" multiline autoFocus />
      <TextField path="elit.instagram.sub" label="Subtext" multiline />
      <TextField path="elit.instagram.btnText" label="Button Text" />
    </>
  );
}

function ElitFooterEditor() {
  const col1 = useContentStore((s) => s.elitContent.footer.col1Links);
  const col2 = useContentStore((s) => s.elitContent.footer.col2Links);
  const col3 = useContentStore((s) => s.elitContent.footer.col3Links);
  const legalLinks = useContentStore((s) => s.elitContent.footer.legalLinks);
  return (
    <>
      <TextField path="elit.footer.tagline" label="Tagline" multiline autoFocus />
      <TextField path="elit.footer.copyright" label="Copyright" />
      <div className="mb-4 rounded-md border border-white/10 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Column 1
        </div>
        <TextField path="elit.footer.col1Title" label="Column Title" />
        {col1.map((_, i) => (
          <TextField key={i} path={`elit.footer.col1Links.${i}`} label={`Link ${i + 1}`} />
        ))}
      </div>
      <div className="mb-4 rounded-md border border-white/10 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Column 2
        </div>
        <TextField path="elit.footer.col2Title" label="Column Title" />
        {col2.map((_, i) => (
          <TextField key={i} path={`elit.footer.col2Links.${i}`} label={`Link ${i + 1}`} />
        ))}
      </div>
      <div className="mb-4 rounded-md border border-white/10 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Column 3
        </div>
        <TextField path="elit.footer.col3Title" label="Column Title" />
        {col3.map((_, i) => (
          <TextField key={i} path={`elit.footer.col3Links.${i}`} label={`Link ${i + 1}`} />
        ))}
      </div>
      <div className="mb-4 rounded-md border border-white/10 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
          Bottom Legal Links
        </div>
        {legalLinks.map((_, i) => (
          <TextField key={i} path={`elit.footer.legalLinks.${i}`} label={`Link ${i + 1}`} />
        ))}
      </div>
    </>
  );
}

function ElitLegalEditor() {
  return (
    <>
      <TextField path="elit.legal.impressumHtml" label="Impressum (HTML)" multiline autoFocus />
      <TextField path="elit.legal.datenschutzHtml" label="Datenschutz (HTML)" multiline />
    </>
  );
}

function ElitCookieEditor() {
  return (
    <>
      <TextField path="elit.cookie.text" label="Banner Text" multiline autoFocus />
      <TextField path="elit.cookie.acceptText" label="Accept Button Text" />
      <TextField path="elit.cookie.essentialText" label="Essential-Only Button Text" />
    </>
  );
}

type FieldSet = { path: string; label: string; multiline?: boolean }[] | { component: React.ReactNode };

const FIELD_SETS: Record<string, FieldSet> = {
  logo: { component: <SimpleImageEditor path="site.logo" label="Site Logo" /> },
  'hero.eyebrow': [{ path: 'hero.eyebrow', label: 'Eyebrow' }],
  'hero.headline': [{ path: 'hero.headline', label: 'Headline', multiline: true }],
  'hero.subtext': [{ path: 'hero.subtext', label: 'Subtext', multiline: true }],
  'hero.buttonText': [{ path: 'hero.buttonText', label: 'Button Text' }],
  'hero.image': { component: <ImagePositionEditor imagePath="hero.image" posPath="hero.imagePos" label="Image" /> },
  stats: { component: <StatListEditor basePath="stats" count={4} /> },
  'services.header': [
    { path: 'classesSection.eyebrow', label: 'Section Eyebrow' },
    { path: 'classesSection.heading', label: 'Section Heading' },
  ],
  'services.0': { component: <ServiceEditor index={0} /> },
  'services.1': { component: <ServiceEditor index={1} /> },
  'services.2': { component: <ServiceEditor index={2} /> },
  'about.eyebrow': [{ path: 'about.eyebrow', label: 'Eyebrow' }],
  'about.heading': [{ path: 'about.heading', label: 'Heading', multiline: true }],
  'about.body1': [{ path: 'about.body1', label: 'Paragraph 1', multiline: true }],
  'about.body2': [{ path: 'about.body2', label: 'Paragraph 2', multiline: true }],
  'about.image': { component: <ImagePositionEditor imagePath="about.image" posPath="about.imagePos" label="Image" /> },
  'about.stats': { component: <StatListEditor basePath="about.stats" count={2} /> },
  'about.chips': { component: <ChipListEditor basePath="about.chips" count={4} /> },
  pricing: { component: <PricingEditor /> },
  testimonials: { component: <TestimonialsEditor /> },
  contact: { component: <ContactEditor /> },
  cta: [
    { path: 'cta.heading', label: 'Heading', multiline: true },
    { path: 'cta.sub', label: 'Subtext', multiline: true },
  ],
  footer: [
    { path: 'footer.tagline', label: 'Tagline' },
    { path: 'footer.copyright', label: 'Copyright' },
  ],
  team: { component: <TeamEditor /> },
  'physio.hero': { component: <PhysioHeroEditor /> },
  'physio.intro': { component: <PhysioIntroEditor /> },
  'physio.process': { component: <PhysioProcessEditor /> },
  'physio.services': { component: <PhysioServicesEditor /> },
  'physio.specialists': { component: <PhysioSpecialistsEditor /> },
  'physio.cta': { component: <PhysioCtaEditor /> },
  'elit.logo': { component: <SimpleImageEditor path="elit.logo" label="Site Logo" /> },
  'elit.nav': { component: <ElitNavEditor /> },
  'elit.hero': { component: <ElitHeroEditor /> },
  'elit.banner': { component: <ElitBannerEditor /> },
  'elit.stats': { component: <StatListEditor basePath="elit.stats" count={4} /> },
  'elit.services': { component: <ElitServicesEditor /> },
  'elit.gallery': { component: <ElitGalleryEditor /> },
  'elit.about': { component: <ElitAboutEditor /> },
  'elit.contact': { component: <ElitContactEditor /> },
  'elit.goldankaufInfo': { component: <ElitGoldankaufInfoEditor /> },
  'elit.reviews': { component: <ElitReviewsEditor /> },
  'elit.instagram': { component: <ElitInstagramEditor /> },
  'elit.footer': { component: <ElitFooterEditor /> },
  'elit.legal': { component: <ElitLegalEditor /> },
  'elit.cookie': { component: <ElitCookieEditor /> },
};

export default function FieldEditor() {
  const selectedField = useContentStore((s) => s.selectedField);
  const fieldSet = selectedField ? FIELD_SETS[selectedField] : null;

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
            {fieldSet && 'component' in fieldSet
              ? fieldSet.component
              : (fieldSet as { path: string; label: string; multiline?: boolean }[] | null)?.map((f, i) => (
                  <TextField key={f.path} path={f.path} label={f.label} multiline={f.multiline} autoFocus={i === 0} />
                ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
