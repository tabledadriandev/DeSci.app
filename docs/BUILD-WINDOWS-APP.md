# Build Windows .exe - Quick Guide

## 🚀 Build Windows Executable in 3 Steps

### Step 1: Install Dependencies
```bash
cd tabledadrian2.0
npm install
```

This installs Electron and electron-builder automatically.

### Step 2: Build Your App
```bash
npm run build
```

### Step 3: Create Windows Installer
```bash
npm run electron:build:win
```

**That's it!** Your Windows installer will be in the `dist/` folder.

## 📦 What You Get

After building, you'll find in `dist/`:

1. **`Table d'Adrian Wellness Setup x.x.x.exe`**
   - Full installer with setup wizard
   - Users can choose installation location
   - Creates desktop shortcut
   - Can be uninstalled

2. **`Table d'Adrian Wellness-x.x.x-portable.exe`**
   - No installation needed
   - Double-click to run
   - Perfect for USB drives

## 🎯 Distribution

### Option 1: Direct Download
- Upload `.exe` files to your website
- Users download and install
- No app store needed!

### Option 2: GitHub Releases
1. Create a new release on GitHub
2. Upload the `.exe` files
3. Share the release link

### Option 3: Your Website
1. Create a download page
2. Upload `.exe` files
3. Add download buttons

## ⚙️ Customization

### Change App Icon
1. Create a 256x256 PNG icon
2. Convert to ICO: https://icoconvert.com/
3. Save as `build/icon.ico`

### Change App Name
Edit `package.json`:
```json
"build": {
  "productName": "Your App Name"
}
```

## 🐛 Troubleshooting

**Build fails?**
```bash
# Clear and rebuild
rm -rf dist node_modules/.cache
npm install
npm run build
npm run electron:build:win
```

**Icon not showing?**
- Must be `.ico` format
- Minimum 256x256 pixels
- Place in `build/icon.ico`

**App won't start?**
- Make sure `npm run build` completed successfully
- Check that Next.js server can start: `npm start`

## 📝 Full Documentation

See `WINDOWS-APP-GUIDE.md` for complete details.

---

**Ready to build?** Run:
```bash
npm install
npm run build
npm run electron:build:win
```

Your Windows app will be ready in `dist/` folder! 🎉

