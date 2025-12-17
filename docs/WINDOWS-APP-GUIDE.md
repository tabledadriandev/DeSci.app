# Windows Desktop App Guide

This guide explains how to build a Windows executable (.exe) file from your Next.js app using Electron.

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd tabledadrian2.0
npm install
```

This will install:
- `electron` - Electron framework
- `electron-builder` - Build tool for creating installers
- `concurrently` - Run multiple commands
- `wait-on` - Wait for server to be ready

### Step 2: Build Your Next.js App

```bash
npm run build
```

This creates the production build in the `.next` folder.

### Step 3: Build Windows Executable

```bash
# Build Windows installer (.exe)
npm run electron:build:win
```

This will create:
- **Installer:** `dist/Table d'Adrian Wellness Setup x.x.x.exe` (NSIS installer)
- **Portable:** `dist/Table d'Adrian Wellness-x.x.x-portable.exe` (No installation needed)

## 📦 Output Files

After building, you'll find in the `dist/` folder:

1. **Setup Installer** (`Table d'Adrian Wellness Setup x.x.x.exe`)
   - Full installer with setup wizard
   - Users can choose installation directory
   - Creates desktop and start menu shortcuts
   - Can be uninstalled via Windows Settings

2. **Portable Version** (`Table d'Adrian Wellness-x.x.x-portable.exe`)
   - No installation required
   - Double-click to run
   - Can be moved to any folder
   - Perfect for USB drives

## 🎯 Distribution Options

### Option 1: Direct Download
- Upload `.exe` files to your website
- Users download and run
- No code signing needed (but recommended)

### Option 2: Microsoft Store
- Requires Microsoft Partner Center account
- Code signing certificate required
- Follow Microsoft Store submission process

### Option 3: GitHub Releases
- Create a release on GitHub
- Upload `.exe` files as assets
- Users can download from releases page

## 🔧 Development

### Run Electron in Development Mode

```bash
npm run electron:dev
```

This will:
1. Start Next.js dev server (`npm run dev`)
2. Wait for server to be ready
3. Launch Electron window
4. Hot reload enabled

### Test Production Build Locally

```bash
# Build Next.js app
npm run build

# Run Electron with production build
npm run electron
```

## ⚙️ Configuration

### App Icon

Place your Windows icon at:
- `build/icon.ico` (256x256 or larger, ICO format)

You can create an ICO file from PNG:
- Use [ICO Convert](https://icoconvert.com/)
- Or use ImageMagick: `convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`

### App Information

Edit `package.json` → `build` section:
- `appId`: Unique app identifier
- `productName`: App name shown to users
- `publisherName`: Your company/publisher name

### Build Options

Edit `package.json` → `build.win`:
- `target`: Build formats (nsis, portable, etc.)
- `icon`: Path to icon file
- `oneClick`: One-click installer (true/false)

## 🔐 Code Signing (Optional but Recommended)

For trusted distribution, sign your executable:

1. **Get a Code Signing Certificate:**
   - Purchase from DigiCert, Sectigo, etc.
   - Or use self-signed for testing

2. **Configure in package.json:**
```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "your-password"
}
```

3. **Build:**
```bash
npm run electron:build:win
```

## 📝 Build Scripts

- `npm run electron` - Run Electron with production build
- `npm run electron:dev` - Run Electron with dev server
- `npm run electron:build` - Build for current platform
- `npm run electron:build:win` - Build Windows installer
- `npm run electron:build:mac` - Build macOS app
- `npm run electron:build:linux` - Build Linux app
- `npm run electron:pack` - Build without installer (for testing)

## 🐛 Troubleshooting

### Build Fails

1. **Clear cache:**
   ```bash
   rm -rf dist
   rm -rf node_modules/.cache
   npm run build
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be >= 22.0.0
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

### App Won't Start

1. **Check if Next.js build completed:**
   ```bash
   ls .next  # Should exist
   ```

2. **Check Electron main.js:**
   - Verify file paths are correct
   - Check console for errors

### Icon Not Showing

1. **Verify icon format:**
   - Must be `.ico` for Windows
   - Minimum 256x256 pixels
   - Use proper ICO format (not PNG renamed)

2. **Check icon path in package.json:**
   ```json
   "win": {
     "icon": "build/icon.ico"
   }
   ```

## 📱 Features

Your Windows app includes:
- ✅ Native Windows look and feel
- ✅ Desktop and Start Menu shortcuts
- ✅ Offline support (via service worker)
- ✅ Auto-updater ready (can be configured)
- ✅ System tray support (can be added)
- ✅ Windows notifications

## 🎨 Customization

### Window Size
Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,  // Change width
  height: 900,  // Change height
  minWidth: 1200,
  minHeight: 700,
});
```

### App Menu
Edit `electron/main.js` → `createMenu()` function

### Splash Screen
Add splash screen in `electron/main.js` before creating main window

## 📊 File Sizes

Typical build sizes:
- **Installer:** ~150-200 MB (includes all dependencies)
- **Portable:** ~150-200 MB
- **Unpacked:** ~200-300 MB

## 🚀 Deployment Checklist

- [ ] Build Next.js app (`npm run build`)
- [ ] Create app icon (`.ico` file)
- [ ] Update app name/version in `package.json`
- [ ] Build Windows executable (`npm run electron:build:win`)
- [ ] Test installer on clean Windows machine
- [ ] (Optional) Code sign executable
- [ ] Upload to distribution platform
- [ ] Create download page/link

## 📦 Alternative: Portable App

For a truly portable app (no installation), use the portable build:
- Users download `.exe`
- Double-click to run
- No installation needed
- Can run from USB drive

## 🔄 Auto-Updates

To enable auto-updates, configure:
1. Set up update server (GitHub Releases, S3, etc.)
2. Add `electron-updater` package
3. Configure in `electron/main.js`

See Electron Builder docs for details.

---

**Need help?** Check:
- [Electron Docs](https://www.electronjs.org/docs)
- [Electron Builder Docs](https://www.electron.build/)

