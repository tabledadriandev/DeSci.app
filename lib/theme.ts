/**
 * Theme Configuration
 * Centralized theme constants and component style presets
 */

export const theme = {
  colors: {
    dark: {
      background: '#0f0f0f',
      surface: '#1a1a1a',
      surfaceElevated: '#252525',
      border: '#2a2a2a',
      text: {
        primary: '#ffffff',
        secondary: '#a0a0a0',
        tertiary: '#6b6b6b',
      },
      accent: {
        purple: '#a855f7',
        pink: '#ec4899',
        blue: '#3b82f6',
      },
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Unbounded', 'Clash Display', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
} as const;

export type Theme = typeof theme;
