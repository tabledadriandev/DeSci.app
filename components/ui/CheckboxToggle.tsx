'use client';

import { useId } from 'react';

interface CheckboxToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function CheckboxToggle({
  checked,
  onChange,
  className = '',
}: CheckboxToggleProps) {
  const id = useId();
  return (
    <div className={`reject-checkbox ${className}`}>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id}>
          <div className="tick_mark"></div>
        </label>
      </div>
    </div>
  );
}

