// One-time fix: bake EXIF rotation into pixel data and strip the tag.
// Run: npm install sharp && node scripts/fix-image-rotation.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '../assets/images/billboards');

async function fixRotation(filePath) {
  const input = sharp(filePath);
  const meta = await input.metadata();

  if (!meta.orientation || meta.orientation === 1) {
    console.log(`SKIP  ${path.basename(filePath)} (orientation: ${meta.orientation ?? 'none'})`);
    return;
  }

  console.log(`FIX   ${path.basename(filePath)} (orientation: ${meta.orientation})`);

  const rotated = await input
    .rotate()
    .withMetadata({ orientation: 1 })
    .toBuffer();

  fs.writeFileSync(filePath, rotated);
}

async function main() {
  const files = fs.readdirSync(DIR)
    .filter(f => /\.(jpe?g)$/i.test(f))
    .map(f => path.join(DIR, f));

  console.log(`Found ${files.length} JPEG files in ${DIR}\n`);

  for (const file of files) {
    await fixRotation(file);
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
