'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label: string;
  id?: string;
  error?: string;
  as?: 'input' | 'textarea';
}

const FloatingInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, FloatingInputProps>(
  ({ label, id, error, className = '', as = 'input', ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={`uiverse-input-container ${className}`}>
        {as === 'textarea' ? (
          <textarea
            ref={ref as any}
            id={inputId}
            className="uiverse-input-field"
            placeholder=" "
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as any}
            id={inputId}
            className="uiverse-input-field"
            placeholder=" "
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        <label htmlFor={inputId} className="uiverse-input-label">
          {label}
        </label>
        <span className="uiverse-input-highlight"></span>
        {error && (
          <span className="text-sm text-semantic-error mt-1 block">{error}</span>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;

