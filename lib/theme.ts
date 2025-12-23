/**
 * Custom Theme Configuration for Table d'Adrian
 * 
 * This file exports theme configuration that can be used
 * across the application for consistent theming.
 */

export const customTheme = {
  light: {
    primary: '#0ea5e9',           // Science blue
    secondary: '#22c55e',          // Growth green
    accent: '#f59e0b',             // Caution amber
    error: '#ef4444',              // Alert red
    warning: '#f59e0b',            // Warning amber
    success: '#22c55e',            // Success green
    info: '#0ea5e9',               // Info blue
    'base-100': '#ffffff',         // Base white
    'base-200': '#f9fafb',         // Light gray
    'base-300': '#f3f4f6',         // Gray
  },
  dark: {
    primary: '#0284c7',
    secondary: '#16a34a',
    accent: '#d97706',
    error: '#dc2626',
    warning: '#d97706',
    success: '#16a34a',
    info: '#0284c7',
    'base-100': '#1f2937',         // Dark gray
    'base-200': '#111827',         // Darker gray
    'base-300': '#0f172a',         // Very dark
  }
} as const;

