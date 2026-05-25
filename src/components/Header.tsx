'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b px-6 md:px-16 py-4"
      style={{
        backgroundColor: 'var(--indigo-surface)',
        borderColor: 'var(--indigo-border)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div
            className="text-2xl font-bold font-montserrat cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: 'var(--indigo-primary)' }}
          >
            ⚡ Express Wash
          </div>
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/admin/login"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--indigo-btn)',
              color: '#fff',
            }}
          >
            Panel Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
