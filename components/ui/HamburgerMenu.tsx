'use client';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export default function HamburgerMenu({
  isOpen,
  onClick,
  className = '',
}: HamburgerMenuProps) {
  return (
    <button
      onClick={onClick}
      className={`hamburger-menu ${className}`}
      aria-label="Toggle menu"
      type="button"
    >
      <span className={`hamburger-line ${isOpen ? 'hamburger-open' : ''}`}></span>
      <span className={`hamburger-line ${isOpen ? 'hamburger-open' : ''}`}></span>
      <span className={`hamburger-line ${isOpen ? 'hamburger-open' : ''}`}></span>
    </button>
  );
}

