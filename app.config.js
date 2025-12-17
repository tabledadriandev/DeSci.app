module.exports = {
  expo: {
    name: "Table d'Adrian Wellness",
    slug: "tabledadrian-wellness",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FAF8F3"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tabledadrian.wellness",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FAF8F3"
      },
      package: "com.tabledadrian.wellness",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [],
    scheme: "tabledadrian",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
      walletConnectProjectId: process.env.EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};

