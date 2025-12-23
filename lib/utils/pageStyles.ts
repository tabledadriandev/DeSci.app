/**
 * Consistent page styling utilities
 * 
 * Use these classes across all pages for consistent theming
 */

export const pageStyles = {
  // Page containers
  container: 'min-h-screen bg-base-200',
  content: 'max-w-7xl mx-auto px-4 py-4 md:py-8',
  
  // Headers
  pageTitle: 'text-3xl md:text-4xl font-bold text-base-content mb-2',
  pageDescription: 'text-base-content/70 mb-6 md:mb-8',
  sectionTitle: 'text-2xl font-bold text-base-content mb-4',
  
  // Cards
  card: 'card bg-base-100 shadow-md',
  cardBody: 'card-body',
  cardTitle: 'card-title text-base-content',
  
  // Grids
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  
  // Spacing
  section: 'mb-8 md:mb-12',
  spacing: 'space-y-4 md:space-y-6',
  
  // Text
  textPrimary: 'text-base-content',
  textSecondary: 'text-base-content/70',
  textMuted: 'text-base-content/60',
} as const;

