'use client';

import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const socialLinks = [
    { name: 'Instagram', icon: '/icons/instagram-icon.svg', href: 'https://instagram.com/tabledadrian' },
    { name: 'X', icon: '/icons/x_dark.svg', href: 'https://x.com/tabledadrian' },
    { name: 'LinkedIn', icon: '/icons/linkedin.svg', href: 'https://linkedin.com/in/adrian-stefan-badea-82456131b/' },
    { name: 'GitHub', icon: '/icons/github_dark.svg', href: 'https://github.com/tabledadriandev' },
  ];

  return (
    <footer className="border-t border-border-light py-4 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          © 2025 Table d&apos;Adrian
        </p>
        
        <div className="flex items-center gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="w-7 h-7 bg-bg-elevated border border-border-light flex items-center justify-center hover:border-accent-primary/50 transition-colors rounded-md"
            >
              <Image src={social.icon} alt="" width={14} height={14} className="opacity-50" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <Link href="/biomarkers" className="hover:text-accent-primary transition-colors">Biomarkers</Link>
          <Link href="/coach" className="hover:text-accent-primary transition-colors">AI Coach</Link>
          <Link href="/marketplace" className="hover:text-accent-primary transition-colors">Marketplace</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
