'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-40">
      {/* Brand */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          ℜ Table d'Adrian
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="flex-none gap-2 hidden md:flex">
        <Link href="/" className="btn btn-ghost">Dashboard</Link>
        <Link href="/biomarkers" className="btn btn-ghost">Tests</Link>
        <Link href="/biological-age" className="btn btn-ghost">Biological Age</Link>
        <Link href="/coach" className="btn btn-ghost">Coach</Link>
        <Link href="/credentials" className="btn btn-ghost">Credentials</Link>

        {/* Theme Toggle */}
        {mounted && (
          <button
            className="btn btn-square btn-ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* User Dropdown */}
        <div className="dropdown dropdown-end">
          <button className="btn btn-circle btn-ghost" aria-label="User menu">
            <div className="avatar">
              <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-sm font-bold">U</span>
              </div>
            </div>
          </button>
          <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a href="/settings">Account Settings</a>
            </li>
            <li>
              <a href="/privacy">Privacy & Security</a>
            </li>
            <li>
              <a href="/help">Help & Support</a>
            </li>
            <li>
              <a href="/logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-base-100 z-30 md:hidden">
          <div className="p-4 space-y-2">
            <Link
              href="/"
              className="btn btn-block btn-ghost justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/biomarkers"
              className="btn btn-block btn-ghost justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tests
            </Link>
            <Link
              href="/biological-age"
              className="btn btn-block btn-ghost justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Biological Age
            </Link>
            <Link
              href="/coach"
              className="btn btn-block btn-ghost justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Coach
            </Link>
            <Link
              href="/credentials"
              className="btn btn-block btn-ghost justify-start"
              onClick={() => setMobileMenuOpen(false)}
            >
              Credentials
            </Link>
            <hr className="my-2" />
            {mounted && (
              <button
                className="btn btn-block btn-ghost justify-start"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

