'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { fadeInUp, cardHover } from '@/lib/animations/variants';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  return (
    <div className={cn('premium-card', className)} onClick={onClick}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{ duration: 0.3, delay, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={hover ? cardHover : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}

