'use client';

import { ReactNode, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: ReactNode;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-accent-primary text-white hover:opacity-90 disabled:opacity-50',
    secondary: 'bg-bg-surface text-text-primary border border-border-light hover:bg-bg-elevated hover:border-border-medium',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
  };

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

  return (
    <motion.button
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative overflow-hidden rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={(e) => {
        if (!props.disabled) {
          createRipple(e);
        }
        if (props.onClick) {
          props.onClick(e);
        }
      }}
      {...props}
    >
      {icon && <span className="z-10">{icon}</span>}
      <span className="z-10">{children}</span>
    </motion.button>
  );
}

