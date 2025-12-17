# Batch Page Update Instructions

All remaining pages should follow this pattern. Here's a quick reference for updating them:

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
          {/* Header */}
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

          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Your content here */}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
```

## Key Changes to Apply

1. **Wrap with PageTransition** - All pages
2. **Use AnimatedCard** - Replace all card/box divs
3. **Use AnimatedButton** - Replace all buttons
4. **Add motion animations** - Use fadeInUp, staggerContainer, staggerItem
5. **Update classes** - Use new design system classes
6. **Add gradient-text** - For main headings
7. **Use input-premium** - For all form inputs

## Remaining Pages to Update

- [ ] achievements/page.tsx
- [ ] biomarkers/page.tsx
- [ ] camera-analysis/page.tsx
- [ ] challenges/page.tsx
- [ ] chef-services/page.tsx
- [ ] clans/page.tsx
- [ ] coach/page.tsx
- [ ] events/page.tsx
- [ ] fasting/page.tsx
- [ ] groceries/page.tsx
- [ ] habits/page.tsx
- [ ] health/page.tsx
- [ ] health-assessment/page.tsx
- [ ] health-reports/page.tsx
- [ ] health-score/page.tsx
- [ ] meals/page.tsx
- [ ] messages/page.tsx
- [ ] microbiome/page.tsx
- [ ] nfts/page.tsx
- [ ] nutrition/page.tsx
- [ ] recipes/page.tsx
- [ ] symptoms/page.tsx
- [ ] telemedicine/page.tsx
- [ ] test-kits/page.tsx
- [ ] wellness-plan/page.tsx
- [ ] And all sub-pages...

