'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import Footer from './Footer';
import { MenuProvider, useMenuContext } from './MenuContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { menuOpen } = useMenuContext();
  
  useKeyboardShortcuts();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your wellness dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main
        className="flex-1"
        style={{
          marginLeft: menuOpen ? '280px' : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MenuProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </ToastProvider>
      </ThemeProvider>
    </MenuProvider>
  );
}
