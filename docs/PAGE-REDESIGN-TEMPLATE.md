# Page Redesign Template

This template shows how to apply the new professional UI/UX design to any page in the wellness app.

## Standard Page Structure

```tsx
'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';

export default function YourPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
              Page Title
            </h1>
            <p className="text-text-secondary text-lg">
              Page description
            </p>
          </motion.div>

          {/* Content Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <motion.div key={item.id} variants={staggerItem}>
                <AnimatedCard hover delay={index * 0.05}>
                  {/* Card content */}
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
```

## Key Components to Use

1. **PageTransition** - Wraps the entire page for smooth transitions
2. **AnimatedCard** - For all card-based content
3. **AnimatedButton** - For all buttons
4. **motion.div** - For custom animations
5. **fadeInUp, staggerContainer, staggerItem** - Animation variants

## Design Patterns

- Use `gradient-text` class for main headings
- Use `premium-card` or `glass-card` classes for containers
- Use `input-premium` class for form inputs
- Use semantic color classes: `text-semantic-success`, `text-semantic-error`, etc.
- Always wrap content in responsive containers: `max-w-7xl mx-auto`
- Use responsive padding: `p-4 md:p-8`

## Animation Best Practices

- Stagger list items with `delay={index * 0.05}`
- Use `staggerContainer` and `staggerItem` for grids
- Keep animations subtle and purposeful
- Respect `prefers-reduced-motion`

