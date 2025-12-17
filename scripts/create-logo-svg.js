const fs = require('fs');
const path = require('path');

// Create a simple SVG that references the ICO file
const svgContent = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image href="/logo.ico" width="64" height="64" />
</svg>`;

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);
console.log('Created logo.svg in public folder');

