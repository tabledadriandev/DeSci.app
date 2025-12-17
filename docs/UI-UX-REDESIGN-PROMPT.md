# UI/UX Redesign Prompt: Professional, Classy, Animated Wellness App

## Objective
Transform the Table d'Adrian Wellness App into a premium, high-end user experience with sophisticated animations, elegant typography, luxurious textures, and cutting-edge design patterns. The redesign should feel like a luxury wellness platform that rivals the best fintech and health apps in the market.

## Design Philosophy
- **Sophistication**: Every interaction should feel refined and intentional
- **Fluidity**: Animations should be buttery smooth (60fps minimum)
- **Clarity**: Information hierarchy must be crystal clear despite complexity
- **Delight**: Micro-interactions that surprise and engage users
- **Accessibility**: Beautiful but inclusive - WCAG 2.1 AA compliance

## Typography System

### Primary Font Stack
- **Display/Headings**: 
  - Primary: `Inter Variable` or `Satoshi` (geometric, modern)
  - Fallback: `SF Pro Display` (Apple ecosystem)
  - Luxury option: `Clash Display` or `Cabinet Grotesk` for hero sections
  
- **Body Text**:
  - Primary: `Inter Variable` (weights: 300, 400, 500, 600, 700)
  - Monospace: `JetBrains Mono` or `SF Mono` for code/data
  
- **Implementation**:
  - Use `next/font` with variable fonts for optimal performance
  - Implement font-display: swap for instant text rendering
  - Create a comprehensive type scale (12px to 72px)
  - Use optical sizing for better readability at different sizes

### Typography Hierarchy
```css
--font-display: 'Inter Variable', system-ui, sans-serif;
--font-body: 'Inter Variable', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;

--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-7xl: 4.5rem;    /* 72px */
```

## Color Palette

### Primary Colors
- **Accent Primary**: Deep teal/cyan (#0F4C81 → #00D4AA gradient)
  - Use for CTAs, active states, highlights
  - Gradient: `linear-gradient(135deg, #0F4C81 0%, #00D4AA 100%)`
  
- **Background System**:
  - Base: `#FAF8F3` (warm cream)
  - Surface: `#FFFFFF` (pure white)
  - Elevated: `#F5F3F0` (subtle beige)
  - Overlay: `rgba(15, 76, 129, 0.95)` (dark overlay with blur)

- **Text Hierarchy**:
  - Primary: `#1A1A1A` (near black, 95% opacity)
  - Secondary: `#6B6560` (warm gray)
  - Tertiary: `#8B8580` (light gray)
  - Disabled: `#C4C0BC` (very light gray)

### Semantic Colors
- **Success**: `#10B981` (emerald green)
- **Warning**: `#F59E0B` (amber)
- **Error**: `#EF4444` (red)
- **Info**: `#3B82F6` (blue)

### Advanced Color Features
- Implement CSS custom properties with color-mix() for dynamic theming
- Use `oklch()` color space for perceptually uniform gradients
- Add dark mode with smooth transitions
- Implement accent color variations based on user preferences

## Texture & Depth System

### Glassmorphism
- **Frosted Glass Cards**:
  ```css
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(15, 76, 129, 0.1);
  ```

### Subtle Textures
- **Paper Texture Overlay**: Subtle noise/grain pattern (0.5-1% opacity)
- **Gradient Meshes**: Use CSS `radial-gradient` for depth
- **Soft Shadows**: Multi-layer shadows for elevation
  ```css
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.12);
  ```

### Depth Layers
- Layer 0: Base background
- Layer 1: Cards (elevation: 1-4px)
- Layer 2: Modals/Drawers (elevation: 8-16px)
- Layer 3: Tooltips/Popovers (elevation: 24px+)

## Animation System

### Core Principles
- **Easing**: Use custom cubic-bezier curves for natural motion
  - Default: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design)
  - Smooth: `cubic-bezier(0.25, 0.1, 0.25, 1)` (ease-in-out-cubic)
  - Bouncy: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (for playful elements)
  
- **Duration Guidelines**:
  - Micro-interactions: 150-200ms
  - Standard transitions: 250-300ms
  - Complex animations: 400-600ms
  - Page transitions: 300-500ms

### Animation Libraries to Implement

1. **Framer Motion** (Primary)
   - Page transitions with shared element transitions
   - Layout animations for responsive changes
   - Gesture-based interactions (drag, swipe, pinch)
   - AnimatePresence for mount/unmount animations
   - Viewport-based scroll animations

2. **GSAP (GreenSock)** (Advanced)
   - Complex timeline animations
   - ScrollTrigger for scroll-based animations
   - Morphing SVGs
   - Physics-based animations
   - Text reveal effects

3. **React Spring** (Physics-based)
   - Natural spring animations
   - Gesture handling
   - Trail effects for lists
   - Parallax effects

4. **Lottie React** (After Effects)
   - Custom branded animations
   - Loading states
   - Success/error feedback
   - Empty states

### Specific Animation Patterns

#### Page Transitions
```tsx
// Smooth fade + slide transitions between routes
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};
```

#### Card Hover Effects
- Subtle lift (translateY: -4px)
- Shadow expansion
- Border glow on focus
- Smooth scale (1.02x) for interactive cards

#### List Animations
- Stagger children entrance (delay: 50ms per item)
- Smooth reordering on sort/filter
- Virtual scrolling for performance

#### Loading States
- Skeleton screens with shimmer effect
- Progressive image loading with blur-up
- Smooth progress indicators

#### Micro-interactions
- Button press feedback (scale: 0.98)
- Checkbox/radio smooth check animation
- Input focus ring expansion
- Toast notifications slide-in from edge
- Tooltip fade + slide

## Component Library Enhancements

### Advanced Components to Implement

1. **Data Visualization**
   - Recharts with custom styling
   - D3.js for complex charts
   - Animated progress rings
   - Interactive heatmaps

2. **Form Components**
   - Floating labels with smooth transitions
   - Real-time validation with animated feedback
   - Multi-step forms with progress indicators
   - Auto-save with visual confirmation

3. **Navigation**
   - Sticky header with blur effect on scroll
   - Smooth sidebar slide-in/out
   - Breadcrumb with animated separators
   - Tab navigation with sliding indicator

4. **Data Tables**
   - Sortable columns with animated arrows
   - Row hover effects
   - Pagination with smooth transitions
   - Virtual scrolling for large datasets

5. **Modals & Overlays**
   - Backdrop blur
   - Scale + fade entrance
   - Draggable modals
   - Nested modal support

6. **Notifications**
   - Toast system with stack management
   - Progress bars for action feedback
   - Action buttons in notifications
   - Dismiss animations

## Advanced Features

### Performance Optimizations
- **Code Splitting**: Route-based and component-based
- **Image Optimization**: Next.js Image with blur placeholders
- **Font Optimization**: Variable fonts, subsetting, preloading
- **Animation Performance**: 
  - Use `transform` and `opacity` only (GPU-accelerated)
  - `will-change` for elements that will animate
  - `requestAnimationFrame` for custom animations
  - Reduce motion for accessibility

### Accessibility Enhancements
- **Reduced Motion**: Respect `prefers-reduced-motion`
- **Focus Management**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and live regions
- **Color Contrast**: WCAG AA compliance (4.5:1 minimum)

### Responsive Design
- **Mobile-First**: Design for mobile, enhance for desktop
- **Breakpoints**:
  - Mobile: 320px - 640px
  - Tablet: 641px - 1024px
  - Desktop: 1025px - 1440px
  - Large Desktop: 1441px+
- **Touch Targets**: Minimum 44x44px
- **Gesture Support**: Swipe, pinch, drag

### Advanced Interactions

1. **Scroll Animations**
   - Parallax effects (subtle, not overwhelming)
   - Reveal animations on scroll
   - Sticky sections with smooth transitions
   - Progress indicators for long content

2. **Drag & Drop**
   - Reorderable lists
   - Drag-to-upload
   - Card dragging in kanban views

3. **Gestures**
   - Swipe to dismiss
   - Pull to refresh
   - Pinch to zoom (images)
   - Long press for context menus

4. **Hover States**
   - Rich hover previews
   - Tooltip on hover
   - Image zoom on hover
   - Card flip animations

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up variable font system
- [ ] Implement color system with CSS custom properties
- [ ] Create base animation utilities
- [ ] Set up Framer Motion configuration
- [ ] Implement glassmorphism utilities

### Phase 2: Core Components
- [ ] Redesign buttons with animations
- [ ] Create animated card components
- [ ] Implement form components with floating labels
- [ ] Build navigation with smooth transitions
- [ ] Create loading states and skeletons

### Phase 3: Page-Level Animations
- [ ] Implement page transition system
- [ ] Add scroll-triggered animations
- [ ] Create shared element transitions
- [ ] Implement parallax effects (subtle)

### Phase 4: Advanced Features
- [ ] Add gesture support
- [ ] Implement drag & drop
- [ ] Create advanced data visualizations
- [ ] Add micro-interactions throughout
- [ ] Implement dark mode

### Phase 5: Polish
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile optimization
- [ ] Animation refinement

## Technical Stack Recommendations

### Animation Libraries
- **Framer Motion**: `^11.0.0` (primary)
- **GSAP**: `^3.12.0` (advanced animations)
- **React Spring**: `^9.7.0` (physics-based)
- **Lottie React**: `^2.4.0` (After Effects)

### UI Libraries
- **Radix UI**: Headless components (accessibility)
- **Headless UI**: Unstyled, accessible components
- **React Aria**: Adobe's accessibility library

### Styling
- **Tailwind CSS**: `^3.4.0` (utility-first)
- **CSS Modules**: For component-specific styles
- **PostCSS**: For advanced CSS features

### Fonts
- **next/font**: Built-in font optimization
- **Variable Fonts**: For performance and flexibility

## Design Tokens

Create a comprehensive design token system:

```typescript
export const tokens = {
  colors: {
    primary: { /* ... */ },
    semantic: { /* ... */ },
    neutral: { /* ... */ }
  },
  typography: {
    fontFamily: { /* ... */ },
    fontSize: { /* ... */ },
    fontWeight: { /* ... */ },
    lineHeight: { /* ... */ }
  },
  spacing: {
    scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  shadows: {
    sm: '/* ... */',
    md: '/* ... */',
    lg: '/* ... */',
    xl: '/* ... */'
  },
  animations: {
    duration: { /* ... */ },
    easing: { /* ... */ }
  }
};
```

## Success Metrics

- **Performance**: Lighthouse score > 90
- **Animation**: 60fps on mid-range devices
- **Accessibility**: WCAG 2.1 AA compliance
- **User Feedback**: "Feels premium and polished"
- **Load Time**: First Contentful Paint < 1.5s

## Final Notes

- Every animation should have a purpose
- Performance is paramount - optimize ruthlessly
- Test on real devices, not just browsers
- Gather user feedback and iterate
- Maintain consistency across all interactions
- Document all design decisions

---

**This prompt should guide a comprehensive UI/UX overhaul that transforms the app into a premium, world-class wellness platform.**

