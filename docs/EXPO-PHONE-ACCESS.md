# Accessing Wellness App from Your Phone

## Option 1: Using Local Network (LAN)

1. Make sure your phone and computer are on the same WiFi network
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Find your computer's local IP address:
   - Windows: Run `ipconfig` and look for IPv4 Address
   - Example: `192.168.1.100`
4. On your phone, open a browser and go to:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   Example: `http://192.168.1.100:3000`

## Option 2: Using Expo Tunnel (Recommended)

1. Install ngrok (if not already installed):
   ```bash
   npm install -g ngrok
   ```

2. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
5. Open that URL on your phone's browser

## Option 3: Using Expo Web (For React Native conversion)

If you want to convert this to a React Native app with Expo:

1. Start Expo:
   ```bash
   npm run expo:start
   ```

2. Scan the QR code with Expo Go app on your phone
3. Or use tunnel mode:
   ```bash
   npm run expo:tunnel
   ```

## Current Setup

- **Next.js Dev Server**: Port 3000
- **Expo**: Installed and configured
- **App Config**: `app.config.js` and `app.json`

## Notes

- The current app is a Next.js web application
- To use Expo Go on your phone, you'd need to convert it to React Native
- For now, use Option 1 or 2 to access the web app from your phone

