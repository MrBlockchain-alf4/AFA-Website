import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { promises as fs } from 'fs';

const src = 'brand_assets/LOGO FAVICON.png';
const CANVAS  = 512;
const TARGET  = Math.round(CANVAS * 0.65); // 65% of canvas = 333px

// Step 1: trim transparent edges to get actual letter bounds
const trimmed = await sharp(src)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
  .toBuffer();

const { width: tw, height: th } = await sharp(trimmed).metadata();
console.log(`After trim: ${tw}x${th}`);

// Step 2: scale trimmed content to fit inside TARGET×TARGET (contain, no stretch)
const scaled = await sharp(trimmed)
  .resize(TARGET, TARGET, {
    fit: 'contain',
    position: 'center',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toBuffer();

// Step 3: extend to full CANVAS×CANVAS with centered placement
const master = await sharp(scaled)
  .extend({
    top:    Math.floor((CANVAS - TARGET) / 2),
    bottom: Math.ceil((CANVAS - TARGET) / 2),
    left:   Math.floor((CANVAS - TARGET) / 2),
    right:  Math.ceil((CANVAS - TARGET) / 2),
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await fs.writeFile('public/favicon-512x512.png', master);
console.log('favicon-512x512.png');

// Step 4: scale master down to each favicon size with contain
const sizes = [16, 32, 48, 180];
for (const size of sizes) {
  await sharp(master)
    .resize(size, size, {
      fit: 'contain',
      position: 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(`public/favicon-${size}x${size}.png`);
  console.log(`favicon-${size}x${size}.png`);
}

// Step 5: generate multi-size .ico (16, 32, 48)
const icoBuffer = await pngToIco([
  'public/favicon-16x16.png',
  'public/favicon-32x32.png',
  'public/favicon-48x48.png',
]);
await fs.writeFile('public/favicon.ico', icoBuffer);
console.log('favicon.ico');

// Copies
await fs.copyFile('public/favicon-180x180.png', 'public/apple-touch-icon.png');
await fs.copyFile('public/favicon-32x32.png', 'public/favicon.png');
console.log('Done');
