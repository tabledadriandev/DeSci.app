'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  className = '',
}: ToggleSwitchProps) {
  return (
    <div className={`toggle-wrapper ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div className="toggle inline-block">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
        />
        <div className="toggle-button"></div>
        <div className="toggle-label">{checked ? 'ON' : 'OFF'}</div>
      </div>
    </div>
  );
}

