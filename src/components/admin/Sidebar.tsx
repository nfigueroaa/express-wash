'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationsCenter } from '@/components/admin/NotificationsCenter';
import type { UsuarioAdmin } from '@/lib/types';

interface SidebarProps {
  usuario: UsuarioAdmin;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/session', { method: 'DELETE' });
      if (!res.ok) {
        console.error('Logout failed:', res.status);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: '📋 Pedidos', active: true },
    { href: '/admin/estadisticas', label: '📊 Estadísticas', active: false },
  ];

  return (
    <aside
      className="w-[180px] flex-shrink-0 flex flex-col min-h-screen"
      style={{ backgroundColor: '#0d0d1f', borderRight: '1px solid #1a1a2e' }}
    >
      {/* Logo */}
      <div className="p-4 mb-2">
        <div
          className="font-bold text-sm"
          style={{ color: 'var(--indigo-primary)', fontFamily: 'Montserrat, sans-serif' }}
        >
          ⚡ Express Wash
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#555' }}>
          Panel Admin
        </div>
      </div>

      {/* Notifications */}
      <div className="px-2 mb-2">
        <NotificationsCenter userId={usuario.email} />
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isCurrentPage = pathname === item.href;
          const isDisabled = !item.active;

          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-not-allowed"
                style={{ color: '#333' }}
                title="Próximamente"
              >
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
              style={
                isCurrentPage
                  ? { backgroundColor: '#2e3192', color: 'var(--indigo-primary)' }
                  : { color: '#666' }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario y logout */}
      <div className="p-4" style={{ borderTop: '1px solid #1a1a2e' }}>
        <div className="flex items-center gap-2 mb-3">
          {usuario.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.foto}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#2e3192', color: 'var(--indigo-primary)' }}
            >
              {(usuario.nombre || usuario.email)[0].toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <div
              className="text-xs font-medium truncate"
              style={{ color: 'var(--indigo-primary)' }}
              title={usuario.nombre}
            >
              {usuario.nombre}
            </div>
            <div className="text-xs" style={{ color: '#555' }}>
              Admin
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs hover:underline transition-colors"
          style={{ color: '#E91E63' }}
        >
          → Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
