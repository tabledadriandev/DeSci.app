import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-disabled': 'var(--text-disabled)',
        'text-inverse': 'var(--text-inverse)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'semantic-success': 'var(--semantic-success)',
        'semantic-warning': 'var(--semantic-warning)',
        'semantic-error': 'var(--semantic-error)',
        'semantic-info': 'var(--semantic-info)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',
        'border-blue': 'var(--border-blue)',
        /* Nuanced Pale Blue Palette */
        'blue-ice': 'var(--blue-ice)',         /* backgrounds, subtle fills */
        'blue-frost': 'var(--blue-frost)',     /* card hover, highlights */
        'blue-mist': 'var(--blue-mist)',       /* input bg, soft containers */
        'blue-powder': 'var(--blue-powder)',   /* focus borders, light badges */
        'blue-sky': 'var(--blue-sky)',         /* primary buttons, active */
        'blue-cloud': 'var(--blue-cloud)',     /* info badges, secondary */
        'blue-azure': 'var(--blue-azure)',     /* hover states, emphasis */
        'blue-ocean': 'var(--blue-ocean)',     /* active/pressed, links */
        'blue-steel': 'var(--blue-steel)',     /* dark mode primary, strong */
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter Tight', 'Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'Space Grotesk', 'Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      backgroundImage: {
        'bio-gradient': 'var(--bio-gradient)',
        'crypto-gradient': 'var(--crypto-gradient)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glass': '0 8px 32px 0 rgba(10, 14, 39, 0.1)',
        'glass-lg': '0 12px 40px 0 rgba(10, 14, 39, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'gradient-flow': 'gradient-flow 20s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glow: {
          'from': { boxShadow: '0 0 5px -5px var(--accent-primary)' },
          'to': { boxShadow: '0 0 20px 5px var(--accent-primary)' },
        },
      },
      transitionTimingFunction: {
        'in-out': 'var(--ease-in-out)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
