/**
 * Animations & Micro-interactions
 * Production-grade animation utilities
 * 
 * Note: For full animation support, install @react-spring/web:
 * npm install @react-spring/web
 * 
 * This file provides fallback implementations if @react-spring is not available.
 */

// Fallback animation utilities (works without @react-spring)
import React, { useState, useEffect } from 'react';

interface NumberCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Animated number counter
 * Usage: Animate biological age score from 0 to final value
 */
export function NumberCounter({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
}: NumberCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  const rounded = decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue);
  return <span>{`${prefix}${rounded}${suffix}`}</span>;
}

/**
 * Fade in animation
 */
export function FadeIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Scale animation for cards
 */
export function ScaleIn({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger children animation
 */
export function StaggerContainer({
  children,
  delay = 50,
}: {
  children: React.ReactNode | React.ReactNode[];
  delay?: number;
}) {
  const childrenArray = Array.isArray(children) ? children : [children];
  return (
    <>
      {childrenArray.map((child, index) => (
        <FadeIn key={index} delay={index * delay}>
          {child}
        </FadeIn>
      ))}
    </>
  );
}

