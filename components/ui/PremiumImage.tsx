'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/**
 * Premium Image Sources Configuration
 * 
 * For production, replace Unsplash URLs with:
 * - Adobe Stock: https://stock.adobe.com/
 * - Shutterstock: https://www.shutterstock.com/
 * - Getty Images: https://www.gettyimages.com/
 * 
 * For illustrations:
 * - Figma Community: https://www.figma.com/community
 * - Affinity Designer assets
 * - Lottie animations: https://lottiefiles.com/
 */

// High-quality Unsplash images curated for longevity/health themes
export const PREMIUM_IMAGES = {
  // Health & Wellness
  wellness: {
    meditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=90',
    nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=90',
    fitness: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=90',
    sleep: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=1200&q=90',
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=90',
  },
  // Science & Research
  science: {
    lab: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&q=90',
    microscope: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=90',
    dna: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1200&q=90',
    research: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=90',
  },
  // Food & Nutrition
  food: {
    healthy: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=90',
    vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=90',
    smoothie: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1200&q=90',
    cooking: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=90',
  },
  // Technology & Data
  tech: {
    dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90',
    wearable: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1200&q=90',
    data: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90',
  },
  // Abstract & Backgrounds
  abstract: {
    gradient1: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=90',
    gradient2: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=90',
    minimal: 'https://images.unsplash.com/photo-1533628635777-112b2239b1c7?w=1200&q=90',
  },
  // Placeholder for user avatars
  avatars: {
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=90',
  },
};

interface PremiumImageProps {
  src?: string;
  alt: string;
  category?: keyof typeof PREMIUM_IMAGES;
  variant?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  overlay?: boolean;
  overlayColor?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  hover?: 'zoom' | 'lift' | 'glow' | 'none';
}

export default function PremiumImage({
  src,
  alt,
  category,
  variant,
  width,
  height,
  fill = false,
  priority = false,
  className,
  containerClassName,
  overlay = false,
  overlayColor = 'from-black/60 via-black/20 to-transparent',
  rounded = 'lg',
  hover = 'none',
}: PremiumImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Determine image source
  let imageSrc = src;
  if (!imageSrc && category && variant) {
    const categoryImages = PREMIUM_IMAGES[category] as Record<string, string>;
    imageSrc = categoryImages?.[variant] || PREMIUM_IMAGES.abstract.minimal;
  }
  if (!imageSrc) {
    imageSrc = PREMIUM_IMAGES.abstract.minimal;
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const hoverClasses = {
    zoom: 'group-hover:scale-110',
    lift: '',
    glow: '',
    none: '',
  };

  const containerHoverClasses = {
    zoom: '',
    lift: 'hover:-translate-y-1 hover:shadow-xl',
    glow: 'hover:shadow-lg hover:shadow-accent-primary/20',
    none: '',
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-bg-elevated flex items-center justify-center',
          roundedClasses[rounded],
          fill ? 'absolute inset-0' : '',
          containerClassName
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-text-tertiary text-sm">Image unavailable</div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden group',
        roundedClasses[rounded],
        containerHoverClasses[hover],
        'transition-all duration-500 ease-out',
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className={cn(
          'absolute inset-0 bg-bg-elevated animate-pulse',
          roundedClasses[rounded]
        )} />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={cn(
          'object-cover transition-transform duration-700 ease-out',
          hoverClasses[hover],
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        sizes={fill ? '100vw' : undefined}
      />

      {/* Gradient overlay */}
      {overlay && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t pointer-events-none',
          overlayColor
        )} />
      )}
    </motion.div>
  );
}

// Hero section with premium image background
interface HeroImageProps {
  category?: keyof typeof PREMIUM_IMAGES;
  variant?: string;
  src?: string;
  children: React.ReactNode;
  height?: string;
  overlayOpacity?: number;
}

export function HeroImage({
  category = 'wellness',
  variant = 'nature',
  src,
  children,
  height = 'h-[400px]',
  overlayOpacity = 0.6,
}: HeroImageProps) {
  let imageSrc = src;
  if (!imageSrc && category && variant) {
    const categoryImages = PREMIUM_IMAGES[category] as Record<string, string>;
    imageSrc = categoryImages?.[variant];
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-2xl', height)}>
      <PremiumImage
        src={imageSrc}
        alt="Hero background"
        fill
        priority
        className="object-cover"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 md:px-12 max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

// Card with premium image
interface ImageCardProps {
  src?: string;
  category?: keyof typeof PREMIUM_IMAGES;
  variant?: string;
  title: string;
  description?: string;
  badge?: string;
  onClick?: () => void;
}

export function ImageCard({
  src,
  category,
  variant,
  title,
  description,
  badge,
  onClick,
}: ImageCardProps) {
  return (
    <motion.div
      className="glass-card overflow-hidden cursor-pointer group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <PremiumImage
          src={src}
          category={category}
          variant={variant}
          alt={title}
          fill
          hover="zoom"
          overlay
          overlayColor="from-black/50 via-transparent to-transparent"
        />
        {badge && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-800">
            {badge}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-accent-primary transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Avatar with premium fallback
interface PremiumAvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
}

const avatarSizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-lg',
};

export function PremiumAvatar({
  src,
  alt,
  size = 'md',
  fallbackInitials,
}: PremiumAvatarProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-accent-primary/20 flex items-center justify-center font-semibold text-accent-primary',
          avatarSizes[size]
        )}
      >
        {fallbackInitials || alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', avatarSizes[size])}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

