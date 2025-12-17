'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface UiverseButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  width?: string;
  height?: string;
}

export default function UiverseButton({
  children,
  icon: Icon,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  width,
  height,
}: UiverseButtonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`uiverse-button ${className}`}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      <span className="uiverse-label">{children}</span>
      {Icon && <Icon className="uiverse-svg-icon" />}
    </button>
  );
}

