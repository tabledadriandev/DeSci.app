const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertIcon() {
  try {
    const inputPath = path.join(__dirname, '../ta_app_icon.PNG');
    const buildDir = path.join(__dirname, '../build');
    const outputPath = path.join(buildDir, 'icon.ico');

    // Create build directory if it doesn't exist
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    if (!fs.existsSync(inputPath)) {
      console.error('Icon file not found:', inputPath);
      process.exit(1);
    }

    console.log('Converting PNG to ICO...');
    
    // Create multiple sizes for ICO (16, 32, 48, 256)
    const sizes = [16, 32, 48, 256];
    const tempFiles = [];

    for (const size of sizes) {
      const tempPath = path.join(buildDir, `icon_${size}.png`);
      await sharp(inputPath)
        .resize(size, size, { 
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(tempPath);
      tempFiles.push(tempPath);
    }

    // Use to-ico to convert PNGs to ICO
    try {
      const toIco = require('to-ico');
      const buffers = tempFiles.map(file => fs.readFileSync(file));
      const icoBuffer = await toIco(buffers);
      fs.writeFileSync(outputPath, icoBuffer);
      
      // Clean up temp files
      tempFiles.forEach(file => fs.unlinkSync(file));
      
      console.log('Icon successfully converted to:', outputPath);
    } catch (err) {
      // Fallback: use 256x256 PNG as icon (Electron accepts PNG)
      console.log('to-ico not available, using 256x256 PNG as icon...');
      const png256 = path.join(buildDir, 'icon_256.png');
      fs.copyFileSync(png256, outputPath);
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      console.log('Icon created (as PNG) at:', outputPath);
    }
    
  } catch (error) {
    console.error('Error converting icon:', error);
    process.exit(1);
  }
}

convertIcon();

