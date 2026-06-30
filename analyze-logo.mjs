import sharp from 'sharp';

const { data, info } = await sharp('brand_assets/AFA Final Logo.png')
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

// For each column, sum the alpha values to find gaps (low alpha = gap between letters)
const colAlpha = [];
for (let x = 0; x < width; x++) {
  let sum = 0;
  for (let y = 0; y < height; y++) {
    const idx = (y * width + x) * channels;
    sum += data[idx + 3]; // alpha channel
  }
  colAlpha.push(sum);
}

// Find the maximum alpha to normalise
const maxAlpha = Math.max(...colAlpha);

// Print a rough ASCII map every 10px showing relative density
console.log(`Image: ${width}x${height}, channels: ${channels}`);
console.log('Column alpha density (every 5px):');
for (let x = 0; x < width; x += 5) {
  const pct = Math.round(colAlpha[x] / maxAlpha * 20);
  process.stdout.write(`${x}:${'#'.repeat(pct)}${'_'.repeat(20 - pct)} `);
  if ((x / 5 + 1) % 6 === 0) process.stdout.write('\n');
}
console.log('\n');

// Find columns where alpha drops near zero (gaps between letters)
const threshold = maxAlpha * 0.05;
const gaps = [];
let inGap = false;
let gapStart = 0;
for (let x = 0; x < width; x++) {
  if (colAlpha[x] < threshold && !inGap) {
    inGap = true;
    gapStart = x;
  } else if (colAlpha[x] >= threshold && inGap) {
    inGap = false;
    gaps.push({ start: gapStart, end: x - 1, width: x - gapStart });
  }
}
console.log('Gaps (low-alpha column ranges):', gaps);

// Find first non-zero column and last non-zero column
let firstCol = 0, lastCol = width - 1;
for (let x = 0; x < width; x++) { if (colAlpha[x] > threshold) { firstCol = x; break; } }
for (let x = width - 1; x >= 0; x--) { if (colAlpha[x] > threshold) { lastCol = x; break; } }
console.log(`Content spans columns ${firstCol} to ${lastCol}`);

// Find the largest gap after the first content area — that's the split between mark and wordmark
const significantGaps = gaps.filter(g => g.width >= 3 && g.start > firstCol + 20);
console.log('Significant gaps:', significantGaps);
