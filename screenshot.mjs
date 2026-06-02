import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/ghost/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/lib/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

let n = 1;
while (fs.existsSync(path.join(screenshotsDir, `screenshot-${n}${label}.png`))) n++;
const outFile = path.join(screenshotsDir, `screenshot-${n}${label}.png`);

const chromePath = (() => {
  const base = 'C:/Users/ghost/.cache/puppeteer/chrome';
  if (!fs.existsSync(base)) return null;
  for (const ver of fs.readdirSync(base)) {
    const p = `${base}/${ver}/chrome-win64/chrome.exe`; // auto-detected
    if (fs.existsSync(p)) return p;
  }
  return null;
})();

const launchOpts = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
};
if (chromePath) launchOpts.executablePath = chromePath;

const browser = await puppeteer.launch(launchOpts);
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1200));

// Scroll slowly to trigger image loading for all off-screen images
await page.evaluate(async () => {
  const step = 200;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 400));
});

// Wait for all images to finish loading
await page.evaluate(async () => {
  const imgs = Array.from(document.querySelectorAll('img'));
  await Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', resolve);
      img.addEventListener('error', resolve);
    });
  }));
});

// Force-reveal all animated elements via inline styles (bypasses IntersectionObserver entirely)
// This ensures a fully-settled screenshot regardless of scroll position or IO state
await page.evaluate(() => {
  document.querySelectorAll('.r-up, .r-left, .r-right, .r-scale').forEach(el => {
    el.style.cssText += '; opacity: 1 !important; transform: none !important; transition: none !important;';
  });
});

await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outFile, fullPage: true });
await browser.close();

console.log('Saved:', outFile);
