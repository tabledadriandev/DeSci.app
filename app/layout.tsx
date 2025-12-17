import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import AppLayout from './components/AppLayout';

export const metadata: Metadata = {
  title: "Table d'Adrian | Longevity & DeSci",
  description: "Quantify your healthspan with advanced biomarker tracking, AI-driven longevity protocols, and decentralized science rewards.",
  manifest: '/manifest.json',
  keywords: ['longevity', 'DeSci', 'health tracking', 'biomarkers', 'healthspan', 'decentralized science'],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className='font-sans' suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0e27" data-theme-dark="#0a0e27" />
        <meta name="theme-color" content="#f5f7fa" data-theme-light="#f5f7fa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }} suppressHydrationWarning>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
