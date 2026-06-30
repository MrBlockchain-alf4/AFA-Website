import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/ghost/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/lib/puppeteer/puppeteer.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const chromePath = (() => {
  const base = 'C:/Users/ghost/.cache/puppeteer/chrome';
  if (!fs.existsSync(base)) return null;
  for (const ver of fs.readdirSync(base)) {
    const p = `${base}/${ver}/chrome-win64/chrome.exe`;
    if (fs.existsSync(p)) return p;
  }
  return null;
})();

const width  = parseInt(process.argv[2] || '390');
const label  = process.argv[3] || `mobile-${width}`;
const url    = process.argv[4] || 'http://localhost:3000';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ...(chromePath ? { executablePath: chromePath } : {}),
});
const page = await browser.newPage();
await page.setViewport({ width, height: 844, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

let n = 1;
while (fs.existsSync(path.join(screenshotsDir, `screenshot-${n}-${label}.png`))) n++;
const outFile = path.join(screenshotsDir, `screenshot-${n}-${label}.png`);

await page.screenshot({ path: outFile, fullPage: true });
await browser.close();
console.log('Saved:', outFile);
