'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  autoComplete?: string;
  className?: string;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  success,
  helperText,
  disabled = false,
  min,
  max,
  step,
  rows = 3,
  autoComplete,
  className = '',
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputId = `field-${name}`;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = success && !hasError && value;

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-text-primary"
      >
        {label}
        {required && <span className="text-semantic-error ml-1">*</span>}
      </label>

      <div className="relative">
        <InputComponent
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          rows={type === 'textarea' ? rows : undefined}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3
            border-2 rounded-xl
            bg-white
            text-text-primary
            placeholder:text-text-tertiary
            transition-all duration-200
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-semantic-error focus:border-semantic-error focus:ring-2 focus:ring-semantic-error/20'
                : hasSuccess
                ? 'border-semantic-success focus:border-semantic-success focus:ring-2 focus:ring-semantic-success/20'
                : focused
                ? 'border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Status Icons */}
        <AnimatePresence>
          {(hasError || hasSuccess) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {hasError ? (
                  <AlertCircle className="w-5 h-5 text-semantic-error" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-semantic-success" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Text / Error Message */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-xs">
              {error ? (
                <span className="text-semantic-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </span>
              ) : (
                <span className="text-text-secondary">{helperText}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

