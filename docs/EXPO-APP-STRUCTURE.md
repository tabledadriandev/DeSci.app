# Expo App Structure

This guide shows how to structure your mobile app to work with your Next.js backend.

## 📁 Directory Structure

```
tabledadrian2.0/
├── mobile/                    # Expo app directory
│   ├── app/                   # Expo Router pages
│   │   ├── _layout.tsx        # Root layout
│   │   ├── index.tsx          # Home screen
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── _layout.tsx
│   │   │   ├── health.tsx
│   │   │   ├── meals.tsx
│   │   │   ├── coach.tsx
│   │   │   └── profile.tsx
│   │   └── wallet/           # Wallet screens
│   │       ├── connect.tsx
│   │       └── dashboard.tsx
│   ├── components/            # React Native components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client
│   │   ├── wallet.ts         # Wallet connection
│   │   └── storage.ts        # AsyncStorage
│   ├── assets/                # Images, fonts
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   ├── app.json              # Expo config
│   └── package.json          # Mobile dependencies
```

## 🎯 Key Files

### 1. Root Layout (`mobile/app/_layout.tsx`)

```typescript
import { Stack } from 'expo-router';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wallet';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. API Client (`mobile/lib/api.ts`)

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async get(endpoint: string, token?: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.json();
  }

  async post(endpoint: string, data: any, token?: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}

export const api = new ApiClient();
```

### 3. Wallet Connection (`mobile/lib/wallet.ts`)

```typescript
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

const projectId = process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
```

### 4. Home Screen (`mobile/app/index.tsx`)

```typescript
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAccount } from 'wagmi';
import { Link } from 'expo-router';
import Button from '../components/Button';

export default function HomeScreen() {
  const { address, isConnected } = useAccount();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Table d'Adrian Wellness</Text>
        {isConnected ? (
          <Text style={styles.address}>{address?.slice(0, 10)}...</Text>
        ) : (
          <Link href="/wallet/connect" asChild>
            <Button title="Connect Wallet" />
          </Link>
        )}
      </View>

      <View style={styles.grid}>
        <Link href="/(tabs)/health" asChild>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Tracking</Text>
          </View>
        </Link>
        <Link href="/(tabs)/meals" asChild>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meal Plans</Text>
          </View>
        </Link>
        <Link href="/(tabs)/coach" asChild>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Coach</Text>
          </View>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  card: {
    width: '48%',
    margin: '1%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## 🚀 Quick Setup Commands

```bash
# Create mobile directory structure
mkdir -p mobile/app mobile/components mobile/lib mobile/assets

# Install Expo
cd mobile
npx create-expo-app@latest . --template blank-typescript

# Install dependencies
npm install expo-router @react-navigation/native
npm install wagmi viem @tanstack/react-query
npm install @walletconnect/react-native-dapp
```

## 📱 Connect to Your Backend

### Update API URL

In `mobile/lib/api.ts`, set your backend URL:

```typescript
// For local development (use your computer's IP)
const API_URL = 'http://192.168.1.100:3000';

// For production
const API_URL = 'https://your-domain.com';
```

### Test Connection

```typescript
// In your mobile app
import { api } from '../lib/api';

// Test API call
const healthData = await api.get('/api/health?address=0x...');
```

## 🎨 Styling

Use React Native StyleSheet or styled-components:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
  },
  // ... more styles
});
```

## 🔗 Navigation

Expo Router handles navigation automatically:

```typescript
import { Link } from 'expo-router';

// Navigate to screen
<Link href="/health">Go to Health</Link>

// Or use router
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/health');
```

## 📦 Building

### Development Build (TestFlight/Internal)

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

### Production Build

```bash
eas build --platform all --profile production
```

---

**Next:** Follow `EXPO-SETUP.md` to get started with Expo Go!

