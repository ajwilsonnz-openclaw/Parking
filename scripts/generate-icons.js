// Generate PWA icons for Millennium Village Parking
// Run: node scripts/generate-icons.js  (sharp installed with --no-save)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(OUT_DIR, { recursive: true });

const BRAND = '#0066ff';
const BRAND_DARK = '#0052cc';
const BRAND_LIGHT = '#3b82f6';

function iconSvg(size, maskable = false) {
  // For maskable: full-bleed background, glyph scaled to safe zone (~80% of canvas).
  // For regular: rounded-square card with subtle gradient on transparent canvas.
  const pad = maskable ? size * 0.22 : size * 0.08;
  const radius = maskable ? 0 : size * 0.18;
  const glyphSize = size - pad * 2;

  const bg = maskable
    ? `<rect width="${size}" height="${size}" fill="url(#g)"/>`
    : `<rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>`;

  const pinSVG = `
    <g transform="translate(${pad}, ${pad}) scale(${glyphSize / 100})">
      <path
        d="M50 8 C26 8 8 26 8 50 C8 74 50 96 50 96 C50 96 92 74 92 50 C92 26 74 8 50 8 Z"
        fill="rgba(255,255,255,0.18)"
      />
      <circle cx="50" cy="48" r="26" fill="#ffffff"/>
      <text
        x="50" y="62"
        font-family="Sora, Inter, Arial, sans-serif"
        font-weight="800"
        font-size="38"
        fill="${BRAND}"
        text-anchor="middle">P</text>
    </g>
  `;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND_LIGHT}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>
  ${bg}
  ${pinSVG}
</svg>`.trim();
}

function ogImageSvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1120"/>
      <stop offset="100%" stop-color="#0b1730"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND_LIGHT}"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="100" r="280" fill="url(#accent)" opacity="0.18"/>
  <circle cx="150" cy="560" r="220" fill="${BRAND}" opacity="0.10"/>
  <g transform="translate(80, 190)">
    <rect width="250" height="250" rx="55" fill="url(#accent)"/>
    <g transform="translate(35, 20) scale(1.8)">
      <path d="M50 8 C26 8 8 26 8 50 C8 74 50 96 50 96 C50 96 92 74 92 50 C92 26 74 8 50 8 Z" fill="rgba(255,255,255,0.25)"/>
      <circle cx="50" cy="48" r="26" fill="#ffffff"/>
      <text x="50" y="62" font-family="Sora, Inter, Arial" font-weight="800" font-size="38" fill="${BRAND}" text-anchor="middle">P</text>
    </g>
  </g>
  <text x="380" y="290" font-family="Sora, Inter, Arial" font-weight="800" font-size="78" fill="#ffffff">Millennium Village</text>
  <text x="380" y="370" font-family="Inter, Arial" font-weight="600" font-size="52" fill="${BRAND_LIGHT}">Parking</text>
  <text x="380" y="440" font-family="Inter, Arial" font-weight="400" font-size="30" fill="rgba(255,255,255,0.7)">Visitor &amp; resident car park booking</text>
</svg>`.trim();
}

async function main() {
  // Regular icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(iconSvg(size, false))).png().toFile(path.join(OUT_DIR, `icon-${size}.png`));
  }
  // Maskable icons
  for (const size of [192, 512]) {
    await sharp(Buffer.from(iconSvg(size, true))).png().toFile(path.join(OUT_DIR, `icon-maskable-${size}.png`));
  }
  // Apple touch icon (180x180, opaque bg, no transparency)
  await sharp({
    create: { width: 180, height: 180, channels: 3, background: BRAND },
  })
    .composite([{ input: Buffer.from(iconSvg(180, true)), top: 0, left: 0 }])
    .png()
    .toFile(path.join(OUT_DIR, 'apple-touch-icon.png'));

  // Favicon (32x32 PNG; Chrome/modern browsers accept this fine)
  await sharp(Buffer.from(iconSvg(64, true))).resize(32, 32).png().toFile(path.join(OUT_DIR, 'favicon-32.png'));

  // OG image
  await sharp(Buffer.from(ogImageSvg())).png().toFile(path.join(OUT_DIR, 'og-image.png'));

  console.log('Icons written to', OUT_DIR);
  fs.readdirSync(OUT_DIR).forEach((f) => console.log(' -', f));
}

main().catch((e) => { console.error(e); process.exit(1); });
