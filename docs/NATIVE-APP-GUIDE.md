# Native App Build Guide - Table d'Adrian

This guide explains how to build native iOS and Android apps from your Next.js web app using Capacitor.

## 🎯 What You'll Get

- ✅ **iOS App** (.ipa file for App Store)
- ✅ **Android App** (.apk/.aab file for Google Play)
- ✅ **Desktop App** (Windows/Mac/Linux using Electron)

## 📱 Option 1: Progressive Web App (PWA) - Easiest

The app is already configured as a PWA! Users can install it directly from their browser.

### How Users Install:

**On Android/Chrome:**
1. Visit your website
2. Browser will show "Add to Home Screen" prompt
3. Tap "Install"
4. App appears on home screen like a native app

**On iOS/Safari:**
1. Visit your website
2. Tap Share button (□↗)
3. Tap "Add to Home Screen"
4. App appears on home screen

**On Desktop (Chrome/Edge):**
1. Visit your website
2. Click install icon in address bar
3. App installs as desktop app

### To Enable PWA Installation:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy to HTTPS** (required for PWA):
   - Deploy to Vercel, Netlify, or any HTTPS host
   - PWA features only work over HTTPS

3. **Test installation:**
   - Open your deployed site
   - Look for install prompt
   - Or use browser menu: "Install App"

## 📲 Option 2: Native iOS/Android Apps with Capacitor

### Prerequisites

- Node.js >= 22.0.0
- iOS: macOS with Xcode (for iOS builds)
- Android: Android Studio installed
- Java JDK 11+ (for Android)

### Step 1: Install Capacitor

```bash
cd tabledadrian2.0
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

When prompted:
- **App name:** Table d'Adrian Wellness
- **App ID:** com.tabledadrian.wellness
- **Web dir:** .next (or out if using static export)

### Step 2: Build Your Next.js App

```bash
# Build for production
npm run build

# If using static export (recommended for Capacitor)
# Add to next.config.js:
# output: 'export'
```

### Step 3: Add Native Platforms

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

### Step 4: Sync Web Assets

```bash
# Copy web build to native projects
npx cap sync
```

### Step 5: Build iOS App

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select your project
# 2. Go to Signing & Capabilities
# 3. Select your development team
# 4. Build and run (⌘R)
# 5. Or Archive for App Store distribution
```

**For App Store:**
1. Product → Archive
2. Distribute App
3. Follow App Store Connect process

### Step 6: Build Android App

```bash
# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Build Bundle(s) / APK(s)
# 2. Generate signed bundle for Google Play
# 3. Or build APK for direct distribution
```

**For Google Play:**
1. Build → Generate Signed Bundle / APK
2. Upload to Google Play Console
3. Follow Play Store submission process

### Step 7: Configure App Icons and Splash Screens

```bash
# Install icon generator
npm install @capacitor/assets --save-dev

# Generate icons and splash screens
npx capacitor-assets generate
```

Place your source icon (1024x1024 PNG) in:
- `resources/icon.png`
- `resources/splash.png` (2732x2732 PNG)

### Step 8: Add Native Plugins (Optional)

```bash
# Camera
npm install @capacitor/camera
npx cap sync

# Push notifications
npm install @capacitor/push-notifications
npx cap sync

# Geolocation
npm install @capacitor/geolocation
npx cap sync

# Device info
npm install @capacitor/device
npx cap sync
```

## 💻 Option 3: Desktop App with Electron

### Step 1: Install Electron

```bash
npm install --save-dev electron electron-builder
npm install --save-dev concurrently wait-on cross-env
```

### Step 2: Create Electron Main Process

Create `electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.ico'),
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../out/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Step 3: Update package.json

Add to `package.json`:

```json
{
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "next build && electron-builder",
    "electron:pack": "next build && electron-builder --dir"
  },
  "build": {
    "appId": "com.tabledadrian.wellness",
    "productName": "Table d'Adrian Wellness",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "electron/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.healthcare-fitness",
      "target": "dmg"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

### Step 4: Build Desktop App

```bash
# Development
npm run electron:dev

# Production build
npm run electron:build
```

Outputs will be in `dist/` folder:
- **Windows:** `.exe` installer
- **macOS:** `.dmg` file
- **Linux:** `.AppImage` file

## 📦 Distribution

### App Store (iOS)

1. **Create App Store Connect account**
2. **Archive in Xcode:**
   - Product → Archive
   - Distribute App → App Store Connect
3. **Submit for review** in App Store Connect

### Google Play (Android)

1. **Create Google Play Console account**
2. **Generate signed bundle:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
3. **Upload to Play Console**
4. **Submit for review**

### Direct Distribution

**iOS (.ipa):**
- Requires Apple Developer account ($99/year)
- Distribute via TestFlight or App Store

**Android (.apk):**
- Can distribute directly
- Upload to website or use APK distribution services

**Desktop:**
- Distribute `.exe`, `.dmg`, or `.AppImage` files
- No app store required

## 🔧 Configuration Files

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabledadrian.wellness',
  appName: 'Table d\'Adrian Wellness',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FAF8F3',
    },
  },
};

export default config;
```

## 🎨 App Icons

Create icons in these sizes:

**iOS:**
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 152x152 (iPad)
- 167x167 (iPad Pro)

**Android:**
- 512x512 (Play Store)
- 192x192 (mdpi)
- 144x144 (hdpi)
- 96x96 (ldpi)
- 384x384 (xxxhdpi)

Use tools like:
- [App Icon Generator](https://www.appicon.co/)
- [IconKitchen](https://icon.kitchen/)

## 📱 Testing

### iOS Simulator
```bash
npx cap open ios
# Select simulator in Xcode
```

### Android Emulator
```bash
npx cap open android
# Start emulator in Android Studio
```

### Physical Devices
- Connect device via USB
- Enable developer mode
- Run from Xcode/Android Studio

## 🚀 Quick Start Commands

```bash
# 1. Build web app
npm run build

# 2. Sync to native
npx cap sync

# 3. Open in IDE
npx cap open ios      # iOS
npx cap open android  # Android

# 4. Build and run
# Use Xcode or Android Studio
```

## 📝 Notes

- **HTTPS Required:** PWA features require HTTPS
- **Service Worker:** Already configured in `/public/sw.js`
- **Manifest:** Already configured in `/public/manifest.json`
- **Icons:** Need to create proper icon files
- **Splash Screens:** Configure in Capacitor config

## 🆘 Troubleshooting

**Build errors:**
- Ensure Node.js version >= 22
- Clear `.next` folder and rebuild
- Run `npx cap sync` after web build

**Native features not working:**
- Check plugin installation
- Verify permissions in native configs
- Test on physical device

**App not installing:**
- Verify HTTPS (required for PWA)
- Check manifest.json is accessible
- Ensure service worker is registered

---

**Need help?** Check Capacitor docs: https://capacitorjs.com/docs

