const fs = require('fs');
const path = require('path');

// Simple script to convert PNG to ICO using sharp if available, otherwise use a basic approach
async function convertToIco() {
  try {
    // Try to use sharp for conversion
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.log('Sharp not available, installing...');
      const { execSync } = require('child_process');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
      sharp = require('sharp');
    }

    const inputPath = path.join(__dirname, '../public/tabledadrianlogo.PNG');
    const outputPath = path.join(__dirname, '../public/icon.ico');

    if (!fs.existsSync(inputPath)) {
      console.error('Logo file not found:', inputPath);
      process.exit(1);
    }

    // Convert PNG to ICO (ICO is just a container, we'll create multiple sizes)
    const sizes = [16, 32, 48, 64, 128, 256];
    
    // For ICO, we need to create a multi-resolution ICO file
    // Sharp doesn't directly support ICO, so we'll create a PNG and rename it
    // Or create a proper ICO using a library
    
    // Create 256x256 version first (most common)
    await sharp(inputPath)
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(outputPath.replace('.ico', '_256.png'));

    // For now, let's create a simple ICO by converting to PNG first
    // Then we'll use a proper ICO converter
    console.log('Converting PNG to ICO...');
    
    // Use sharp to create multiple sizes and combine into ICO
    // Since sharp doesn't support ICO directly, we'll create a 256x256 PNG
    // and use it as a temporary solution, or use an online converter
    
    // For Electron, we can use PNG as icon too
    await sharp(inputPath)
      .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outputPath.replace('.ico', '_temp.png'));

    console.log('Created temporary PNG. For proper ICO conversion, please use an online tool or ImageMagick.');
    console.log('Temporary file created at:', outputPath.replace('.ico', '_temp.png'));
    
    // Copy the PNG as ICO for now (some systems accept PNG as ICO)
    fs.copyFileSync(outputPath.replace('.ico', '_temp.png'), outputPath);
    console.log('Icon file created at:', outputPath);
    
  } catch (error) {
    console.error('Error converting to ICO:', error);
    process.exit(1);
  }
}

convertToIco();

