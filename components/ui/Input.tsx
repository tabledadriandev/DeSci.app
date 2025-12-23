'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-semibold text-base-content">{label}</span>
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'input input-bordered w-full',
            error && 'input-error',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error" id={`${inputId}-error`} role="alert">
            {error}
          </span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/60" id={`${inputId}-help`}>
            {helperText}
          </span>
        </label>
      )}
    </div>
  );
}

