/**
 * Metallic Shine Animation
 * For achievement badges and premium elements
 * Creates a pulsing glow effect on gold/silver/bronze elements
 */

import { Variants } from 'framer-motion';

export const metallicShineAnimation: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(212, 175, 55, 0.3)',
      '0 0 40px rgba(212, 175, 55, 0.6)',
      '0 0 20px rgba(212, 175, 55, 0.3)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const metallicShineGold: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(212, 175, 55, 0.3)',
      '0 0 40px rgba(212, 175, 55, 0.6)',
      '0 0 20px rgba(212, 175, 55, 0.3)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const metallicShineSilver: Variants = {
  animate: {
    boxShadow: [
      '0 0 15px rgba(192, 192, 192, 0.3)',
      '0 0 30px rgba(192, 192, 192, 0.5)',
      '0 0 15px rgba(192, 192, 192, 0.3)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const metallicShineBronze: Variants = {
  animate: {
    boxShadow: [
      '0 0 15px rgba(205, 127, 50, 0.3)',
      '0 0 30px rgba(205, 127, 50, 0.5)',
      '0 0 15px rgba(205, 127, 50, 0.3)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
