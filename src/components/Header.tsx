'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header
      className="sticky top-0 z-50 border-b px-6 md:px-16 py-3"
      style={{
        backgroundColor: 'var(--indigo-surface)',
        borderColor: 'var(--indigo-border)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🧺</span>
          <div className="flex flex-col leading-tight">
            <span
              className="text-lg font-bold font-montserrat"
              style={{ color: 'var(--indigo-primary)' }}
            >
              Express Wash
            </span>
            <span className="text-[10px] text-gray-400 hidden sm:block">Lavandería a domicilio</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-3">
          {/* Ancla a FAQ solo visible en home */}
          {isHome && (
            <a
              href="#faq"
              className="hidden sm:block text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--indigo-primary)' }}
            >
              Preguntas
            </a>
          )}

          <ThemeToggle />

          <Link
            href="/admin"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--indigo-btn)',
              color: 'var(--indigo-surface)',
            }}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
