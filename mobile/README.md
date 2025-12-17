# Mobile App with Expo

This is the mobile app directory for Table d'Adrian Wellness.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Start Expo

```bash
npx expo start
```

### 3. Connect with Expo Go

1. Install Expo Go app on your phone
2. Scan the QR code from terminal
3. App loads on your phone!

## 📱 Development

### Start Development Server

```bash
# From project root
npm run expo:start

# Or with tunnel (for different networks)
npm run expo:start:tunnel
```

### Connect to Backend

Update `.env` in mobile directory:
```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
```

Find your IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

## 🏗️ Project Structure

```
mobile/
├── app/              # Expo Router pages
├── components/       # React Native components
├── lib/              # Utilities (API, wallet, etc.)
├── assets/           # Images, fonts
└── app.json          # Expo configuration
```

## 📦 Building

### Development Build
```bash
eas build --platform ios --profile development
```

### Production Build
```bash
eas build --platform all --profile production
```

## 🔗 Backend Connection

The mobile app connects to your Next.js backend API.

Make sure your Next.js server is running:
```bash
# In project root
npm run dev
```

Then update API URL in mobile app to your computer's IP address.

---

See `../EXPO-SETUP.md` for complete setup guide!

