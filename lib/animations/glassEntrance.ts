/**
 * Glass Card Entrance Animation
 * Smooth entrance for glass morphism cards
 * Creates a subtle fade-in with slight upward movement
 */

import { Variants } from 'framer-motion';

export const glassEntranceAnimation: Variants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

export const glassEntranceStagger: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const glassCardHover = {
  y: -2,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  transition: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1],
  },
};
