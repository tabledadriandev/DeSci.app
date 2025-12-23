import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './api/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Health/Wellness Colors
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
        error: {
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
        // Premium Metallic Materials
        metallic: {
          gold: {
            DEFAULT: '#D4AF37',
            light: '#E8C547',
            dark: '#C9A227',
          },
          silver: {
            DEFAULT: '#C0C0C0',
            light: '#E8E8E8',
            dark: '#A8A8A8',
          },
          bronze: {
            DEFAULT: '#CD7F32',
            light: '#E6A847',
            dark: '#B85E1F',
          },
        },
        // Neutrals
        neutral: {
          offWhite: '#F5F3F0',
          deepCharcoal: '#1F2121',
        },
        // Legacy colors for backward compatibility
        secondary: {
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
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        info: '#0ea5e9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Clash Display', 'Inter', 'system-ui', 'sans-serif'], // Premium accents
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'], // Data/numbers
        serif: ['Lora', 'Georgia', 'serif'],
      },
      spacing: {
        xs: '0.5rem',   // 8px
        sm: '0.75rem',  // 12px
        md: '1rem',     // 16px
        lg: '1.5rem',   // 24px
        xl: '2rem',     // 32px
        '2xl': '3rem',  // 48px
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      backgroundImage: {
        'metallic-gold': 'linear-gradient(135deg, #D4AF37 0%, #E8C547 50%, #C9A227 100%)',
        'metallic-silver': 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)',
        'metallic-bronze': 'linear-gradient(135deg, #CD7F32 0%, #E6A847 50%, #B85E1F 100%)',
        'gold-gradient': 'linear-gradient(to right, #D4AF37, #E8C547)',
        'teal-gradient': 'linear-gradient(to right, #1A9B8E, #2CB566)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'metallic-gold': 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.3), 0 4px 15px rgba(212, 175, 55, 0.4)',
        'metallic-silver': 'inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 4px 15px rgba(192, 192, 192, 0.3)',
        'metallic-bronze': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.3), 0 4px 15px rgba(205, 127, 50, 0.3)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.6)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    styled: true,           // Component styles applied
    themes: [
      {
        light: {
          "primary": "#0ea5e9",
          "primary-content": "#f1f5f9",
          "secondary": "#22c55e",
          "secondary-content": "#f0fdf4",
          "accent": "#f59e0b",
          "accent-content": "#fef3c7",
          "neutral": "#1f2937",
          "neutral-content": "#f3f4f6",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",
          "info": "#0ea5e9",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
        dark: {
          "primary": "#0284c7",
          "primary-content": "#f1f5f9",
          "secondary": "#16a34a",
          "secondary-content": "#f0fdf4",
          "accent": "#d97706",
          "accent-content": "#fef3c7",
          "neutral": "#e5e7eb",
          "neutral-content": "#111827",
          "base-100": "#1f2937",
          "base-200": "#111827",
          "base-300": "#0f172a",
          "base-content": "#f3f4f6",
          "info": "#0284c7",
          "success": "#16a34a",
          "warning": "#d97706",
          "error": "#dc2626",
        }
      }
    ],
    darkTheme: "dark",      // Dark mode theme name
    base: true,             // Apply daisyUI base styles
    utils: true,            // Include utility classes
    logs: false,            // Show logs in console (disabled for production)
    themeOrder: ["light", "dark"], // Order of themes
  },
};

export default config;

