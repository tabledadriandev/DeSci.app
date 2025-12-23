/**
 * Token Sparkle Animation
 * For token earning notifications
 * Creates a sparkle effect that floats upward
 */

import { Variants } from 'framer-motion';

export const tokenSparkleAnimation: Variants = {
  initial: {
    opacity: 0,
    y: 0,
    scale: 0.8,
  },
  animate: {
    opacity: [0, 1, 1, 0],
    y: -40,
    scale: [0.8, 1.2, 1, 0.8],
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -60,
    scale: 0.6,
    transition: {
      duration: 0.3,
    },
  },
};

export const tokenSparkleWithRotation: Variants = {
  initial: {
    opacity: 0,
    y: 0,
    scale: 0.8,
    rotate: 0,
  },
  animate: {
    opacity: [0, 1, 1, 0],
    y: -40,
    scale: [0.8, 1.2, 1, 0.8],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -60,
    scale: 0.6,
    rotate: 360,
    transition: {
      duration: 0.3,
    },
  },
};
