import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/ghost/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/lib/puppeteer/puppeteer.js');

const b = await puppeteer.launch({
  executablePath: (() => {
    const base = 'C:/Users/ghost/.cache/puppeteer/chrome';
    const fs = require('fs');
    const dirs = fs.readdirSync(base);
    for (const d of dirs) {
      const c = `${base}/${d}/chrome-win64/chrome.exe`;
      if (fs.existsSync(c)) return c;
    }
    return `${base}/${dirs[0]}/chrome-win64/chrome.exe`;
  })(),
  args: ['--no-sandbox']
});
const page = await b.newPage();
await page.setViewport({width: 1440, height: 900});
await page.goto('http://localhost:3000/inter-cent/website/index.html', {waitUntil: 'networkidle0'});
await new Promise(r => setTimeout(r, 2000));
const el = await page.$('.earth-globe');
if (el) {
  await el.screenshot({path: 'C:/Users/ghost/OneDrive/Desktop/Claude Web Design/AFA Website/temporary screenshots/globe-crop.png'});
  console.log('Saved globe-crop.png');
} else {
  console.log('Element not found');
}
await b.close();
