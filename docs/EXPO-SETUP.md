# Expo Go Setup Guide

This guide shows you how to connect your app with Expo Go for mobile testing.

## 🚀 Quick Start

### Step 1: Install Expo CLI

```bash
npm install -g expo-cli
# OR
npm install -g @expo/cli
```

### Step 2: Install Dependencies

```bash
cd tabledadrian2.0
npm install expo expo-router react-native react-native-web
npm install @react-navigation/native @react-navigation/stack
npm install expo-status-bar expo-splash-screen
npm install @walletconnect/react-native-dapp wagmi viem
```

### Step 3: Install Expo Go App

**On your phone:**
- **iOS:** Download "Expo Go" from App Store
- **Android:** Download "Expo Go" from Google Play Store

### Step 4: Start Expo Development Server

```bash
npx expo start
```

This will:
- Start the Metro bundler
- Show a QR code in terminal
- Open Expo DevTools in browser

### Step 5: Connect with Expo Go

**Option A: Scan QR Code**
1. Open Expo Go app on your phone
2. Scan the QR code from terminal
3. App loads on your phone!

**Option B: Use Tunnel (for testing on different network)**
```bash
npx expo start --tunnel
```

**Option C: Use LAN (same WiFi network)**
```bash
npx expo start --lan
```

## 📱 Project Structure

Create this structure for Expo:

```
tabledadrian2.0/
├── app/              # Expo Router app directory
│   ├── _layout.tsx   # Root layout
│   ├── index.tsx     # Home screen
│   ├── (tabs)/       # Tab navigation
│   └── ...
├── assets/           # Images, fonts, etc.
├── components/       # React Native components
├── lib/              # Shared utilities
└── app.json          # Expo config
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

### Connect to Your Backend

Your Expo app can connect to your Next.js API:

```typescript
// In your Expo app
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// For local testing, use your computer's IP:
// EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

## 🎯 Development Workflow

### Start Development

```bash
# Terminal 1: Start Next.js backend
npm run dev

# Terminal 2: Start Expo
npx expo start
```

### Test on Device

1. Make sure phone and computer are on same WiFi
2. Scan QR code with Expo Go
3. Changes hot-reload automatically!

### Debug

- Shake device to open developer menu
- Or press `j` in terminal to open debugger
- Press `r` to reload app

## 📦 Building for Production

### Development Build (TestFlight/Internal Testing)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

### Production Build

```bash
eas build --platform all --profile production
```

## 🔗 Connect to Your API

### Local Development

1. **Find your computer's IP:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Update .env:**
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
   ```

3. **Start Next.js with network access:**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

### Production

Use your deployed URL:
```env
EXPO_PUBLIC_API_URL=https://your-domain.com
```

## 🎨 Create Mobile App Structure

See `EXPO-APP-STRUCTURE.md` for complete mobile app setup.

## 🐛 Troubleshooting

### Can't Connect to Backend

1. **Check firewall** - Allow port 3000
2. **Use tunnel mode:**
   ```bash
   npx expo start --tunnel
   ```
3. **Check API URL** - Must be accessible from phone

### QR Code Not Working

1. **Use tunnel:**
   ```bash
   npx expo start --tunnel
   ```
2. **Or type URL manually** in Expo Go app

### App Won't Load

1. **Clear cache:**
   ```bash
   npx expo start -c
   ```
2. **Restart Metro:**
   - Press `r` in terminal
   - Or close and restart `expo start`

## 📱 Features Available in Expo Go

- ✅ React Native components
- ✅ Navigation
- ✅ API calls
- ✅ Web3 wallet connections (with plugins)
- ✅ Camera (with expo-camera)
- ✅ Location (with expo-location)
- ✅ Notifications (with expo-notifications)

## 🚀 Next Steps

1. Create mobile app screens (see `EXPO-APP-STRUCTURE.md`)
2. Connect to your Next.js API
3. Test with Expo Go
4. Build production app when ready

---

**Ready to start?** Run:
```bash
npx expo start
```

Then scan the QR code with Expo Go! 📱

