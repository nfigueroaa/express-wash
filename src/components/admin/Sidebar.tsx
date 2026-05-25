'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import type { UsuarioAdmin } from '@/lib/types';

interface SidebarProps {
  usuario: UsuarioAdmin;
}

export default function Sidebar({ usuario }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Llamar DELETE /api/auth/session
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });

      // Redirigir a /admin/login
      router.push('/admin/login');

      // Refrescar la página
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { label: 'Pedidos', href: '/admin/pedidos', active: true },
    { label: 'Estadísticas', href: '/admin/estadisticas', active: false },
  ];

  const userInitial = usuario.email.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-30`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-2xl font-bold text-blue-600">Ed Wash</div>
          <p className="text-sm text-gray-500 mt-1">Panel de administración</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
              onClick={(e) => !item.active && e.preventDefault()}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {usuario.email}
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
