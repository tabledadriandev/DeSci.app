/**
 * Design Tokens for Table d'Adrian Wellness App
 * Professional, classy, animated design system
 */

export const designTokens = {
  colors: {
    primary: {
      50: '#E6F2F8',
      100: '#CCE5F1',
      200: '#99CB E3',
      300: '#66B1D5',
      400: '#3397C7',
      500: '#0F4C81', // Main accent
      600: '#0C3D67',
      700: '#092E4D',
      800: '#061F33',
      900: '#031019',
    },
    accent: {
      teal: '#00D4AA',
      cyan: '#00B8D4',
      gradient: 'linear-gradient(135deg, #0F4C81 0%, #00D4AA 100%)',
    },
    background: {
      base: '#FAF8F3',
      surface: '#FFFFFF',
      elevated: '#F5F3F0',
      overlay: 'rgba(15, 76, 129, 0.95)',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6560',
      tertiary: '#8B8580',
      disabled: '#C4C0BC',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    fontFamily: {
      display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      body: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
    glass: '0 8px 32px 0 rgba(15, 76, 129, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      slower: '600ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type DesignTokens = typeof designTokens;

