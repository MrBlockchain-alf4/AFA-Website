import puppeteer from 'C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const b = await puppeteer.launch({
  executablePath: 'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
  args: ['--no-sandbox']
});
const p = await b.newPage();
await p.setViewport({width: 1440, height: 900});
await p.goto('http://localhost:3000/inter-cent/website/index.html', {waitUntil: 'networkidle0'});
await new Promise(r => setTimeout(r, 2000));
const el = await p.$('.earth-globe');
if (el) {
  await el.screenshot({path: 'C:/Users/ghost/OneDrive/Desktop/Claude Web Design/AFA Website/temporary screenshots/globe-close.png'});
  console.log('Saved globe-close.png');
} else {
  console.log('Element not found');
}
await b.close();
