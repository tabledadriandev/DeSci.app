/**
 * Premium Design Tokens & Design System
 * Glass Morphism + Metallic Materials
 * Production-Grade UI/UX Implementation
 * WCAG AAA Compliant
 */

// Health/Wellness Colors
export const colors = {
  // PRIMARY - Health Optimization (Teal)
  primary: {
    DEFAULT: '#1A9B8E', // Primary Teal
    50: '#E6F7F5',
    100: '#CCEFEB',
    200: '#99DFD7',
    300: '#66CFC3',
    400: '#33BFAF',
    500: '#1A9B8E',
    600: '#147C72',
    700: '#0F5D56',
    800: '#0A3E3A',
    900: '#051F1D',
  },
  
  // SUCCESS - Good Metrics (Green)
  success: {
    DEFAULT: '#2CB566', // Success Green
    50: '#E6F8ED',
    100: '#CCF1DB',
    200: '#99E3B7',
    300: '#66D593',
    400: '#33C76F',
    500: '#2CB566',
    600: '#239152',
    700: '#1A6D3E',
    800: '#11482A',
    900: '#082415',
  },
  
  // WARNING - Attention Needed (Amber)
  warning: {
    DEFAULT: '#E6A347', // Warning Amber
    50: '#FCF4E6',
    100: '#F9E9CD',
    200: '#F3D39B',
    300: '#EDBD69',
    400: '#E7A737',
    500: '#E6A347',
    600: '#B88238',
    700: '#8A622A',
    800: '#5C411C',
    900: '#2E210E',
  },
  
  // ALERT - Urgent Action (Red)
  alert: {
    DEFAULT: '#D94557', // Alert Red
    50: '#F9E6E9',
    100: '#F3CDD3',
    200: '#E79BA7',
    300: '#DB697B',
    400: '#CF374F',
    500: '#D94557',
    600: '#AE3746',
    700: '#832934',
    800: '#581C23',
    900: '#2D0E11',
  },
  
  // PREMIUM METALLIC MATERIALS
  metallic: {
    // Gold (Ranking #1)
    gold: {
      DEFAULT: '#D4AF37', // Brushed metal gold
      light: '#E8C547',
      dark: '#C9A227',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #E8C547 50%, #C9A227 100%)',
    },
    // Silver (Ranking #2)
    silver: {
      DEFAULT: '#C0C0C0', // Polished metal silver
      light: '#E8E8E8',
      dark: '#A8A8A8',
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)',
    },
    // Bronze (Ranking #3-5)
    bronze: {
      DEFAULT: '#CD7F32', // Darker metal bronze
      light: '#E6A847',
      dark: '#B85E1F',
      gradient: 'linear-gradient(135deg, #CD7F32 0%, #E6A847 50%, #B85E1F 100%)',
    },
  },
  
  // NEUTRALS
  neutrals: {
    offWhite: '#F5F3F0', // Background
    deepCharcoal: '#1F2121', // Text
    glassWhite: 'rgba(255, 255, 255, 0.1)', // Frosted effect
  },
  
  // LEGACY - Keep for backward compatibility
  growth: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  science: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  caution: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b',
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },
  
  alert: {
    50: '#fee2e2',
    100: '#fecaca',
    200: '#fca5a5',
    300: '#f87171',
    400: '#ef4444',
    500: '#dc2626',
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#450a0a',
  },
  
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

// Premium Typography Scale
export const typography = {
  // Display/Headings (Inter or Unbounded)
  'display-large': {
    fontSize: '3.5rem', // 56px
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: '-0.01em', // Tight, premium
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Main page titles, major achievements',
  },
  
  'h1': {
    fontSize: '2.5rem', // 40px
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Page titles',
  },
  'h2': {
    fontSize: '1.875rem', // 30px
    lineHeight: 1.4,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Section titles',
  },
  'h3': {
    fontSize: '1.5rem', // 24px
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Subsection titles, card titles',
  },
  'h4': {
    fontSize: '1.25rem', // 20px
    lineHeight: 1.5,
    fontWeight: 600,
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Minor headings, form labels',
  },
  
  // Body Text (Inter)
  'body-large': {
    fontSize: '1.125rem', // 18px
    lineHeight: 1.6,
    fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Long-form content, articles',
  },
  'body-regular': {
    fontSize: '1rem', // 16px
    lineHeight: 1.6,
    fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Default body text',
  },
  'body-small': {
    fontSize: '0.875rem', // 14px - comfortable reading
    lineHeight: 1.5,
    fontWeight: 400,
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Secondary information',
  },
  
  // Data/Numbers (IBM Plex Mono)
  'data-large': {
    fontSize: '2rem', // 32px
    lineHeight: 1.2,
    fontWeight: 600, // Bold for emphasis
    letterSpacing: '0.05em', // Spaced out, technical
    fontFamily: '"IBM Plex Mono", monospace',
    usage: 'Large metric values',
  },
  'data-medium': {
    fontSize: '1.5rem', // 24px
    lineHeight: 1.3,
    fontWeight: 600,
    letterSpacing: '0.05em',
    fontFamily: '"IBM Plex Mono", monospace',
    usage: 'Medium metric values',
  },
  'data-small': {
    fontSize: '1rem', // 16px
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: '0.05em',
    fontFamily: '"IBM Plex Mono", monospace',
    usage: 'Small metric values',
  },
  
  // Premium Accents (Unbounded or Clash Display)
  'accent-large': {
    fontSize: '2.5rem', // 40px
    lineHeight: 1.2,
    fontWeight: 700, // Bold, statement
    letterSpacing: '-0.01em',
    fontFamily: '"Unbounded", "Clash Display", Inter, system-ui, sans-serif',
    usage: 'Premium headings, token amounts',
  },
  'accent-medium': {
    fontSize: '1.875rem', // 30px
    lineHeight: 1.3,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    fontFamily: '"Unbounded", "Clash Display", Inter, system-ui, sans-serif',
    usage: 'Premium subheadings',
  },
  
  // Caption
  'caption': {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
    fontWeight: 500,
    fontFamily: 'Inter, system-ui, sans-serif',
    usage: 'Annotations, timestamps, source attributions',
  },
} as const;

// Font families
export const fontStack = {
  primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  display: '"Unbounded", "Clash Display", Inter, system-ui, sans-serif', // Premium accents
  mono: '"IBM Plex Mono", "JetBrains Mono", "Courier New", monospace', // Data/numbers
  serif: '"Lora", Georgia, serif', // For medical/scientific credibility
} as const;

// Breakpoints (Mobile-First)
export const breakpoints = {
  xs: '320px',   // Small phones
  sm: '640px',   // Phones
  md: '768px',   // Tablets
  lg: '1024px',  // Desktops
  xl: '1280px',  // Large desktops
  '2xl': '1536px', // Ultra-wide
} as const;

// Premium Spacing Scale
export const spacing = {
  0: '0',
  xs: '0.5rem',   // 8px - tight, inline
  sm: '0.75rem',  // 12px - small gaps
  md: '1rem',     // 16px - default, comfortable
  lg: '1.5rem',   // 24px - section breaks
  xl: '2rem',     // 32px - major breaks
  '2xl': '3rem',  // 48px - hero sections
  // Legacy numeric scale for backward compatibility
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
