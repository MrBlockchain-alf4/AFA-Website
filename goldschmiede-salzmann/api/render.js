// Vercel native serverless function. Serves `/` — see the rewrite in
// vercel.json. Reads the static template from ../templates/index.html
// (moved out of website/ so Vercel's static file serving doesn't shadow
// this rewrite — a static file always wins over a rewrite if both exist
// at the same path) and bakes the current photo fields (logo, about) into
// it from Supabase before responding, so the very first byte a visitor
// receives already has the correct photo — no flash of an old baked-in
// image while client-side JS catches up.
//
// Deliberately scoped to photo fields only. Everything else (text content,
// chatbot) is still patched client-side by admin/page-loader.js exactly as
// before — that path only ever showed a stale value for a split second on
// text, never drew a complaint, and re-implementing it here would multiply
// the risk of this function for no real benefit.
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLIENT_ID = 'goldschmiede-salzmann';
const TABLE = 'website_data';

const TEMPLATE_PATH = path.join(__dirname, '../templates/index.html');

async function supabaseGet() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?client_id=eq.${CLIENT_ID}&select=data`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.length ? rows[0].data : null;
  } catch (_) {
    return null;
  }
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function focalStyle(pos) {
  if (!pos) return '';
  const x = typeof pos.x === 'number' ? pos.x : 50;
  const y = typeof pos.y === 'number' ? pos.y : 50;
  const scale = typeof pos.scale === 'number' ? pos.scale : 100;
  return `object-position:${x}% ${y}%;${scale !== 100 ? `transform:scale(${scale / 100});` : ''}`;
}

// Replaces src="..." on every <img data-fw="KEY" ...> tag matching this
// exact key (there can be more than one, e.g. the logo appears in both nav
// and footer), and merges in a focal-point/zoom style if one is set —
// mirrors what admin/page-loader.js's patchImage()/applyImgFocalPoint() do
// client-side, just baked directly into the response instead.
function patchImg(html, key, src, pos) {
  if (src == null) return html;
  const k = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tagRe = new RegExp(`<img\\b[^>]*\\bdata-fw="${k}"[^>]*>`, 'g');
  return html.replace(tagRe, (tag) => {
    let out = /\ssrc="[^"]*"/.test(tag)
      ? tag.replace(/\ssrc="[^"]*"/, ` src="${escapeAttr(src)}"`)
      : tag.replace(/\/?>$/, ` src="${escapeAttr(src)}"$&`);
    const style = focalStyle(pos);
    if (style) {
      out = /\sstyle="/.test(out)
        ? out.replace(/\sstyle="([^"]*)"/, (_m, existing) => ` style="${existing}${style}"`)
        : out.replace(/\/?>$/, ` style="${style}"$&`);
    }
    return out;
  });
}

module.exports = async (req, res) => {
  let html;
  try {
    html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch (err) {
    res.status(500).send('Template read failed: ' + String(err));
    return;
  }

  // Any failure here (a malformed Supabase row, an unexpected shape) falls
  // back to serving the template unpatched rather than a 500 — the site
  // stays up showing whatever's baked in, exactly the pre-existing
  // behavior, instead of going down over a photo-patching bug.
  try {
    const data = await supabaseGet();
    if (data && data.salzmann) {
      const S = data.salzmann;
      html = patchImg(html, 'salzmann.site.logo', S.site && S.site.logo);
      html = patchImg(html, 'salzmann.hero.image', S.hero && S.hero.image, S.hero && S.hero.image_position);
      html = patchImg(html, 'salzmann.about.image', S.about && S.about.image, S.about && S.about.image_position);
    }
  } catch (_) {
    /* fall through and serve the unpatched template below */
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(html);
};
