/**
 * This script provides the pattern for updating remaining pages
 * Apply this structure to all pages that haven't been updated yet
 */

// Standard page template to apply:
const PAGE_TEMPLATE = `
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
          
          {/* Your content here */}
        </div>
      </div>
    </PageTransition>
  );
}
`;

export default PAGE_TEMPLATE;

