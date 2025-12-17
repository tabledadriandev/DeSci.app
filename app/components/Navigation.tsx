'use client';

import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMenuContext } from './MenuContext';
import { 
  X, Moon, SunMedium, Menu, Search,
  ClipboardCheck, Gauge, Activity, Stethoscope,
  CheckSquare, Apple, Target, Video, Watch, 
  UtensilsCrossed, Bot, FileText, BookOpen, Trophy,
  Users, ShoppingBag, Coins, Vote,
  ChefHat, Award, Calendar, HeartPulse, Home,
  Sparkles, TrendingUp, Dna, LogOut, User, Settings
} from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

// Grouped menu items for better organization
const menuGroups = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/', icon: Home },
      { title: 'Health Score', href: '/health-score', icon: Gauge },
      { title: 'AI Coach', href: '/coach', icon: Bot },
    ]
  },
  {
    title: 'Health Tracking',
    items: [
      { title: 'Assessment', href: '/health-assessment', icon: ClipboardCheck },
      { title: 'Biomarkers', href: '/biomarkers', icon: Activity },
      { title: 'Symptoms', href: '/symptoms', icon: Stethoscope },
      { title: 'Health', href: '/health', icon: HeartPulse },
      { title: 'Wearables', href: '/wearables', icon: Watch },
    ]
  },
  {
    title: 'Lifestyle',
    items: [
      { title: 'Habits', href: '/habits', icon: CheckSquare },
      { title: 'Nutrition', href: '/nutrition', icon: Apple },
      { title: 'Meals', href: '/meals', icon: UtensilsCrossed },
      { title: 'Recipes', href: '/recipes', icon: BookOpen },
      { title: 'Wellness Plan', href: '/wellness-plan', icon: Target },
    ]
  },
  {
    title: 'Services',
    items: [
      { title: 'Telemedicine', href: '/telemedicine', icon: Video },
      { title: 'Chef Services', href: '/chef-services', icon: ChefHat },
      { title: 'Reports', href: '/health-reports', icon: FileText },
    ]
  },
  {
    title: 'Community & Rewards',
    items: [
      { title: 'Challenges', href: '/challenges', icon: Trophy },
      { title: 'Community', href: '/community', icon: Users },
      { title: 'Events', href: '/events', icon: Calendar },
      { title: 'NFTs', href: '/nfts', icon: Award },
    ]
  },
  {
    title: 'DeSci & Web3',
    items: [
      { title: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
      { title: 'Staking', href: '/staking', icon: Coins },
      { title: 'Governance', href: '/governance', icon: Vote },
    ]
  }
];

const sidebarVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 200,
      staggerChildren: 0.03,
      delayChildren: 0.1
    }
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export default function Navigation() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useMenuContext();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen(!menuOpen);
  }, [menuOpen, setMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchQuery('');
  }, [pathname, setMenuOpen]);

  // Filter menu items based on search
  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Sidebar Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sidebar */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-0 top-0 h-full w-72 bg-bg-surface/95 backdrop-blur-xl z-50 shadow-2xl flex flex-col border-r border-border-light/50"
            >
              {/* Header with branding */}
              <div className="p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                      <Dna className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-text-primary leading-tight">Table d&apos;Adrian</h2>
                      <p className="text-[10px] text-text-tertiary">Longevity & DeSci</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMenu}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-elevated/80 hover:bg-bg-elevated transition-colors"
                  >
                    <X className="w-4 h-4 text-text-secondary" />
                  </motion.button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-bg-elevated/60 border border-border-light/50 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all"
                  />
                </div>
              </div>
              
              {/* Scrollable Nav */}
              <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-thumb-border-light scrollbar-track-transparent">
                {filteredGroups.map((group, groupIndex) => (
                  <motion.div 
                    key={group.title} 
                    variants={itemVariants}
                    className="mb-4"
                  >
                    <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider px-2 mb-1.5">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <motion.div
                            key={item.href}
                            variants={itemVariants}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-200 relative',
                                isActive
                                  ? 'bg-accent-primary text-white font-medium shadow-md shadow-accent-primary/20'
                                  : 'text-text-secondary hover:bg-bg-elevated/80 hover:text-text-primary'
                              )}
                            >
                              <div className={cn(
                                'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                isActive 
                                  ? 'bg-white/20' 
                                  : 'bg-bg-elevated group-hover:bg-accent-primary/10'
                              )}>
                                <item.icon className={cn(
                                  'w-3.5 h-3.5 transition-colors',
                                  isActive ? 'text-white' : 'text-text-secondary group-hover:text-accent-primary'
                                )} />
                              </div>
                              <span className="truncate">{item.title}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </nav>
              
              {/* Footer with user info */}
              <div className="p-3 border-t border-border-light/50 flex-shrink-0 bg-bg-elevated/30">
                {isAuthenticated && user ? (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-surface/50">
                      <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">
                          {user.firstName || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-[10px] text-text-tertiary truncate">
                          {user.authMethod === 'wallet' ? `${user.walletAddress?.slice(0, 6)}...` : user.email}
                        </p>
                      </div>
                      {user.authMethod === 'wallet' && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-primary/10">
                          <Sparkles className="w-2.5 h-2.5 text-accent-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link href="/settings" className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-bg-elevated transition-colors">
                        <Settings className="w-3 h-3" />
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-semantic-error hover:bg-semantic-error/10 transition-colors"
                      >
                        <LogOut className="w-3 h-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 mb-3 rounded-lg bg-accent-primary text-white text-xs font-medium hover:bg-accent-primary/90 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    Sign In / Register
                  </Link>
                )}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <SunMedium className="w-3.5 h-3.5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                  {isAuthenticated && user?.authMethod === 'wallet' && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary">
                    <Sparkles className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Earns $TA</span>
                  </div>
                  )}
                </div>
                <p className="text-[9px] text-text-tertiary text-center">
                  © 2025 Table d&apos;Adrian • v1.0.0
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-surface/95 backdrop-blur-md border-b border-border-light/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleMenu}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated border border-border-light/50 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-4.5 h-4.5 text-text-primary" />
              </motion.button>
              
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-md shadow-accent-primary/20 group-hover:shadow-lg group-hover:shadow-accent-primary/30 transition-shadow">
                  <Dna className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors leading-tight block">
                    Table d&apos;Adrian
                  </span>
                  <span className="text-[9px] text-text-tertiary leading-tight">Longevity & DeSci</span>
                </div>
              </Link>
            </div>

            {/* Right: Theme + Auth */}
            <div className="flex items-center gap-2">
              {mounted && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated border border-border-light/50 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <SunMedium className="w-4.5 h-4.5 text-text-secondary" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-text-secondary" />
                  )}
                </motion.button>
              )}
              {mounted && (
                isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-bg-elevated/80 hover:bg-bg-elevated border border-border-light/50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-accent-primary" />
                      </div>
                      <span className="text-xs font-medium text-text-primary hidden sm:block max-w-[80px] truncate">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </button>
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-bg-surface border border-border-light rounded-xl shadow-lg overflow-hidden z-50"
                        >
                          <div className="p-2 border-b border-border-light">
                            <p className="text-xs font-medium text-text-primary truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] text-text-tertiary truncate">{user.email || user.walletAddress?.slice(0, 12) + '...'}</p>
                          </div>
                          <div className="p-1">
                            <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-bg-elevated rounded-lg transition-colors">
                              <Settings className="w-3.5 h-3.5" />
                              Settings
                            </Link>
                            <button
                              onClick={() => { logout(); setShowUserMenu(false); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              Log out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/auth">
                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      className="text-sm px-4 py-1.5 h-9 rounded-xl shadow-md shadow-accent-primary/20"
                    >
                      Sign In
                    </AnimatedButton>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// Wallet button component
function ConnectedWalletButton() {
  const [WalletButton, setWalletButton] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('./ConnectedWalletButtonInner').then((mod) => {
      setWalletButton(() => mod.default);
    }).catch(() => {});
  }, []);

  if (!WalletButton) {
    return (
      <AnimatedButton
        variant="primary"
        size="sm"
        className="text-sm px-4 py-1.5 h-9 rounded-xl shadow-md shadow-accent-primary/20"
      >
        Connect
      </AnimatedButton>
    );
  }

  return <WalletButton />;
}
